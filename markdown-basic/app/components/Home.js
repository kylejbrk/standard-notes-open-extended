import React from 'react';
import ComponentManager from 'sn-components-api';
const MarkdownIt = require('markdown-it');

const EditMode = 0;
const SplitMode = 1;
const PreviewMode = 2;

export default class Home extends React.Component {

  constructor(props) {
    super(props);

    this.modes = [
      {mode: EditMode, label: "Edit", css: "edit"},
      {mode: SplitMode, label: "Split", css: "split"},
      {mode: PreviewMode, label: "Preview", css: "preview"},
    ];

    this.state = {mode: this.modes[0]};
  }

  componentDidMount() {
    this.simpleMarkdown = document.getElementById("simple-markdown");
    this.editor = document.getElementById("editor");
    this.preview = document.getElementById("preview");

    this.configureMarkdown();
    this.connectToBridge();
    this.updatePreviewText();
    this.addChangeListener();

    this.configureResizer();
    this.addTabHandler();

    this.scrollTriggers = {};
    this.scrollHandlers = [
      {el: this.editor, handler: this.scrollHandler(this.editor, this.preview)},
      {el: this.preview, handler: this.scrollHandler(this.preview, this.editor)}
    ];
  }

  componentWillUpdate(nextProps, nextState) {
    var prevMode = this.state.mode.mode;
    var nextMode = nextState.mode.mode;

    // If we changed to Split mode we add the scroll listeners
    if(prevMode !== nextMode) {
      if(nextMode === SplitMode) {
        this.addScrollListeners();
      } else {
        this.removeScrollListeners();
      }
    }
  }

  setModeFromModeValue(value) {
    for(var mode of this.modes) {
      if(mode.mode == value) {
        this.setState({mode: mode});
        return;
      }
    }
  }

  changeMode(mode) {
    this.setState({mode: mode});
    if(this.note) {
      this.componentManager.setComponentDataValueForKey("mode", mode.mode);
    }
  }

  configureMarkdown() {
    var markdownitOptions = {
        // automatically render raw links as anchors.
        linkify: true
    };

    this.markdown = MarkdownIt(markdownitOptions)
      .use(require('markdown-it-footnote'))
      .use(require('markdown-it-task-lists'))
      .use(require('markdown-it-highlightjs'));

      // Remember old renderer, if overriden, or proxy to default renderer
      var defaultRender = this.markdown.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      this.markdown.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        // If you are sure other plugins can't add `target` - drop check below
        var aIndex = tokens[idx].attrIndex('target');

        if (aIndex < 0) {
          tokens[idx].attrPush(['target', '_blank']); // add new attribute
        } else {
          tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
        }

        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
      };
  }

  connectToBridge() {
    var permissions = [
      {
        name: "stream-context-item"
      }
    ]

    this.componentManager = new ComponentManager(permissions, () => {
      var savedMode = this.componentManager.componentDataValueForKey("mode");
      if(savedMode) {
        this.setModeFromModeValue(savedMode);
      }

      this.setState({platform: this.componentManager.platform});
    });

    // this.componentManager.loggingEnabled = true;

    this.componentManager.streamContextItem((note) => {
      this.note = note;

       // Only update UI on non-metadata updates.
      if(note.isMetadataUpdate) {
        return;
      }

      this.editor.value = note.content.text;
      this.preview.innerHTML = this.markdown.render(note.content.text);
    });

  }

  truncateString(string, limit = 80) {
    if(!string) {
      return null;
    }
    if(string.length <= limit) {
      return string;
    } else {
      return string.substring(0, limit) + "...";
    }
  }

  updatePreviewText() {
    var text = this.editor.value || "";
    this.preview.innerHTML = this.markdown.render(text);
    return text;
  }

  addChangeListener() {
    document.getElementById("editor").addEventListener("input", (event) => {
      if(this.note) {
        // Be sure to capture this object as a variable, as this.note may be reassigned in `streamContextItem`, so by the time
        // you modify it in the presave block, it may not be the same object anymore, so the presave values will not be applied to
        // the right object, and it will save incorrectly.
        let note = this.note;

        this.componentManager.saveItemWithPresave(note, () => {
          note.content.text = this.updatePreviewText();
          note.content.preview_plain = this.truncateString(this.preview.textContent || this.preview.innerText);
          note.content.preview_html = null;
        });
      }
    })
  }

  addScrollListeners() {
    this.scrollHandlers.forEach(({el, handler}) => el.addEventListener('scroll', handler));
  }

  removeScrollListeners() {
    this.scrollHandlers.forEach(({el, handler}) => el.removeEventListener('scroll', handler));
  }

  scrollHandler = (source, destination) => {
    var frameRequested;

    return (event) => {
      // Avoid the cascading effect by not handling the event if it was triggered initially by this element
      if(this.scrollTriggers[source] === true) {
        this.scrollTriggers[source] = false;
        return;
      }
      this.scrollTriggers[source] = true;

      // Only request the animation frame once until it gets processed
      if(frameRequested) {
        return;
      }
      frameRequested = true;

      window.requestAnimationFrame(() => {
        var target = event.target
        var height = target.scrollHeight - target.clientHeight;
        var ratio = parseFloat(target.scrollTop) / height;
        var move = (destination.scrollHeight - destination.clientHeight) * ratio;
        destination.scrollTop = move;

        frameRequested = false;
      });
    }
  }

  removeSelection() {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  }

  configureResizer() {
    var pressed = false;
    var startWidth = this.editor.offsetWidth;
    var startX;
    var lastDownX;

    var columnResizer = document.getElementById("column-resizer");
    var resizerWidth = columnResizer.offsetWidth;

    var safetyOffset = 15;

    columnResizer.addEventListener("mousedown", (event) => {
      pressed = true;
      lastDownX = event.clientX;
      columnResizer.classList.add("dragging");
      this.editor.classList.add("no-selection");
    })

    document.addEventListener("mousemove", (event) => {
      if(!pressed) {
        return;
      }

      var x = event.clientX;
      if(x < resizerWidth/2 + safetyOffset) {
        x = resizerWidth/2 + safetyOffset;
      } else if(x > this.simpleMarkdown.offsetWidth - resizerWidth - safetyOffset) {
        x = this.simpleMarkdown.offsetWidth - resizerWidth - safetyOffset;
      }

      var colLeft = x - resizerWidth/2;
      columnResizer.style.left = colLeft + "px";
      this.editor.style.width = (colLeft - safetyOffset) + "px";

      this.removeSelection();
    })

    document.addEventListener("mouseup", (event) => {
      if(pressed) {
        pressed = false;
        columnResizer.classList.remove("dragging");
        this.editor.classList.remove("no-selection");
      }
    })
  }

  addTabHandler() {
    // Tab handler
    this.editor.addEventListener('keydown', function(event){
      if (!event.shiftKey && event.which == 9) {
        event.preventDefault();

        // Using document.execCommand gives us undo support
        if(!document.execCommand("insertText", false, "\t")) {
          // document.execCommand works great on Chrome/Safari but not Firefox
          var start = this.selectionStart;
          var end = this.selectionEnd;
          var spaces = "    ";

           // Insert 4 spaces
          this.value = this.value.substring(0, start)
            + spaces + this.value.substring(end);

          // Place cursor 4 spaces away from where
          // the tab key was pressed
          this.selectionStart = this.selectionEnd = start + 4;
        }
      }
    });
  }


    render() {
      return (
        <div id="simple-markdown" className={"sn-component " + this.state.platform}>
          <div id="header">
            <div className="segmented-buttons-container sk-segmented-buttons">
              <div className="buttons">
                {this.modes.map(mode =>
                  <div onClick={() => this.changeMode(mode)} className={"sk-button button " + (this.state.mode == mode ? "selected info" : "sk-secondary-contrast")}>
                    <div className="sk-label">
                      {mode.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div id="editor-container" className={this.state.mode.css}>
            <textarea dir="auto" id="editor" className={this.state.mode.css}></textarea>
            <div id="column-resizer" className={this.state.mode.css}></div>
            <div id="preview" className={this.state.mode.css}></div>
          </div>
        </div>
      )
    }

}
