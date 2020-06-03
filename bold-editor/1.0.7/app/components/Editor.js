import React from 'react';
import FilesafeEmbed from "filesafe-embed";
import {EditorKit, EditorKitDelegate} from "sn-editor-kit";

// Not used directly here, but required to be imported so that it is included in dist file.
// Note that filesafe-embed also imports filesafe-js, but conditionally, so its not included in its own dist files.
import Filesafe from "filesafe-js";

export default class Editor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.configureEditorKit();
    this.configureEditor();
  }

  configureEditorKit() {
    let delegate = new EditorKitDelegate({
      insertRawText: (rawText) => {
        this.redactor.insertion.insertHtml(rawText);
      },
      preprocessElement: (element) => {
        // Convert inserting element to format Redactor wants.
        // This will wrap img elements, for example, in a figure element.
        // We also want to copy over attributes
        let cleaned = this.redactor.cleaner.input(element.outerHTML);
        let newElement = $R.dom(cleaned).nodes[0];


        for(let attribute of element.attributes) {
          newElement.setAttribute(attribute.nodeName, attribute.nodeValue);
        }

        if(newElement.tagName != element.tagName) {
          // In this case, our element was wrapped in some other element.
          // For example, if element.tagName is 'img', it will be wrapped in a 'figure' element.
          // If it's 'video', it will not be wrapped at all
          newElement.setAttribute("ghost", true);
          newElement.removeAttribute("fscollapsable");
        }

        return newElement;
      },
      insertElement: (element, inVicinityOfElement, insertionType) => {
        // When inserting elements via dom manipulation, it doesnt update the source code view.
        // So when you insert this element, open the code view, and close it, the element will be gone.
        // The only way it works is if we use the proper redactor.insertion API, but I haven't found a good
        // way to use that API for inserting text at a given position. There is 'insertToOffset', but
        // where offset is the index of the plaintext, but I haven't found a way to map the adjacentTo
        // element to a plaintext offset. So for now this bug will persist.

        // insertionType can be either 'afterend' or 'child'

        if(inVicinityOfElement) {
          if(insertionType == "afterend") {
            inVicinityOfElement.insertAdjacentElement('afterend', element);
          } else if(insertionType == "child") {
            // inVicinityOfElement.appendChild(element) doesn't work for some reason when inserting videos.
            inVicinityOfElement.after(element);
          }
        } else {
          this.redactor.insertion.insertHtml(element.outerHTML);
        }
      },
      getElementsBySelector: (selector) => {
        return this.redactor.editor.getElement().find(selector).nodes;
      },
      getCurrentLineText: () => {
        // Returns the node where the cursor currently is. Typically a paragraph if no formatter, otherwise the closest formatted element
        let node = this.redactor.selection.getCurrent();
        return node.textContent;
      },
      getPreviousLineText: () => {
        let currentElement = this.redactor.selection.getElement();
        let previousSibling = currentElement.previousSibling;
        return previousSibling && previousSibling.textContent;
      },
      replaceText: ({regex, replacement, previousLine}) => {
        let marker = this.redactor.marker.insert('start');
        let node;
        if(previousLine) {
          node = this.redactor.selection.getElement().previousSibling;
        } else {
          node = marker.previousSibling;
        }

        // If we're searching the previous line, previousSibling may sometimes be null
        if(!node) {
          return;
        }

        let nodeText = node.textContent;
        // Remove our match from this element by replacing with empty string.
        // We'll add in our actual replacement as a new element
        nodeText = nodeText.replace(/&nbsp;/, ' ');
        nodeText = nodeText.replace(regex, '').replace(/\s$/, '').trim();
        if(nodeText.length == 0) {
          node.remove();
        } else {
          node.textContent = nodeText;
        }

        this.redactor.insertion.insertHtml(replacement, 'start');
        this.redactor.selection.restoreMarkers();
      },
      onReceiveNote: (note) => {

      },
      clearUndoHistory: () => {
        $R('#editor', 'module.buffer.clear');
      },
      setEditorRawText: (rawText) => {
        let cleaned = this.redactor.cleaner.input(rawText);
        $R('#editor', 'source.setCode', cleaned);
      }
    });

    this.editorKit = new EditorKit({
      delegate: delegate,
      mode: 'html',
      supportsFilesafe: true,
      // Redactor has its own debouncing, so we'll set ours to 0
      coallesedSavingDelay: 0
    })
  }

  async configureEditor() {
    // We need to set this as a window variable so that the filesafe plugin can interact with this object
    // passing it as an opt for some reason strips any functions off the objects
    let filesafeInstance = await this.editorKit.getFilesafe();
    window.filesafe_params = {embed: FilesafeEmbed, client: filesafeInstance};
    this.redactor = $R('#editor', {
      styles: true,
      toolbarFixed: true,
      tabAsSpaces: 2, // currently the only way tab works is if you use spaces. Traditional doesnt work
      tabKey: true,
      buttonsAdd: ['filesafe'],
      buttons: [
        'bold', 'italic', 'underline', 'deleted', 'format', 'fontsize', 'fontfamily',
        'fontcolor', 'filesafe', 'link', 'lists', 'alignment',
        'line', 'redo', 'undo', 'indent', 'outdent', 'textdirection', 'html'],
      plugins: ['filesafe', 'fontsize', 'fontfamily', 'fontcolor', 'alignment', 'table', 'inlinestyle', 'textdirection'],
      fontfamily: ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Monospace'],
      callbacks: {
        changed: (html) => {
          // I think it's already cleaned so we don't need to do this.
          // let cleaned = this.redactor.cleaner.output(html);
          this.editorKit.onEditorValueChanged(html);
        },
        pasted: (nodes) => {
          this.editorKit.onEditorPaste();
        },
        image: {
          resized: (image) => {
            // Don't need to do anything, as it changes the underlying html which triggers save event
          }
        }
      },
      imageEditable: false,
      imageCaption: false,
      imageLink: false,
      imageResizable: true,
      imageUpload: (formData, files, event) => {
        this.onEditorFilesDrop(files);
      }
    });

    this.redactor.editor.getElement().on('keyup.textsearcher', (event) => {
      let key = event.which;
      this.editorKit.onEditorKeyUp({
        key,
        isSpace: key == this.redactor.keycodes.SPACE,
        isEnter: key == this.redactor.keycodes.ENTER
      });
    });

    // "Set the focus to the editor layer to the end of the content."
    // Doesn't seem to currently work, focuses at the beginning.
    this.redactor.editor.endFocus();
  }

  onEditorFilesDrop(files) {
    if(!this.editorKit.canUploadFiles()) {
      // Open filesafe modal
      this.redactor.plugin.filesafe.open();
      return;
    }
    for(let file of files) {
      // Observers will handle successful upload
      this.editorKit.uploadJSFileObject(file).then((descriptor) => {
        if(!descriptor || !descriptor.uuid) {
          // alert("File failed to upload. Please try again");
        }
      })
    }
  }

  render() {
    return (
      <div key="editor" className={"sn-component " + this.state.platform}>
      </div>
    )
  }
}
