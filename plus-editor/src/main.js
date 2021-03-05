document.addEventListener('DOMContentLoaded', function () {
  let componentRelay;
  let workingNote, clientData;
  let lastValue, lastUUID;
  let ignoreTextChange = false;
  let newNoteLoad = true,
    didToggleFullScreen = false;

  const blockString = [
    'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd',
    'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr',
    'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul',
  ].join(', ');

  function loadComponentRelay() {
    const initialPermissions = [
      {
        name: 'stream-context-item'
      }
    ];

    componentRelay = new ComponentRelay({
      initialPermissions,
      targetWindow: window,
      onReady: () => {
        const platform = componentRelay.platform;
        if (platform) {
          document.body.classList.add(platform);
        }
      }
    });

    componentRelay.streamContextItem((note) => {
      onReceivedNote(note);
    });
  }

  function strip(html) {
    const tmp = document.implementation.createHTMLDocument('New').body;
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function truncateString(string, limit = 90) {
    if (string.length <= limit) {
      return string;
    } else {
      return string.substring(0, limit) + '...';
    }
  }

  function save() {
    if (workingNote) {
      // Be sure to capture this object as a variable, as workingNote may be
      // reassigned in `streamContextItem`, so by the time you modify it in
      // the presave block, it may not be the same object anymore, so the
      // presave values will not be applied to the right object, and it will
      // save incorrectly.
      const note = workingNote;

      componentRelay.saveItemWithPresave(note, () => {
        lastValue = $('#summernote').summernote('code');
        note.clientData = clientData;

        note.content.text = lastValue;
        note.content.preview_plain = truncateString(strip(lastValue));
        note.content.preview_html = null;
      });
    }
  }

  function onReceivedNote(note) {
    if (note.uuid !== lastUUID) {
      // Note changed, reset last values
      lastValue = null;
      newNoteLoad = true;
      lastUUID = note.uuid;
    }

    workingNote = note;

    // Only update UI on non-metadata updates.
    if (note.isMetadataUpdate) {
      return;
    }

    clientData = note.clientData;
    let newText = filterXSS(note.content.text);

    if (newText == lastValue) {
      return;
    }

    const summernote = $('#summernote');
    if (summernote) {
      ignoreTextChange = true;
      const isHtml = /<[a-z][\s\S]*>/i.test(newText);

      if (!didToggleFullScreen) {
        $('#summernote').summernote('fullscreen.toggle');
        didToggleFullScreen = true;
      }

      if (newNoteLoad && !isHtml) {
        newText = textToHTML(newText);
      }

      summernote.summernote('code', newText);

      if (newNoteLoad) {
        // Clears history but keeps note contents. Note that this line will
        // trigger a summernote.change event, so be sure to do this inside a
        // `ignoreTextChange` block.
        $('#summernote').summernote('commit');
        newNoteLoad = false;
      }

      ignoreTextChange = false;
    }
  }

  function loadEditor() {
    $('#summernote').summernote({
      height: 500, // set editor height
      minHeight: null, // set minimum height of editor
      maxHeight: null, // set maximum height of editor
      focus: true, // set focus to editable area after initializing summernote
      tabDisable: true, // set tab interaction to note only
      showDomainOnlyForAutolink: false, // set autolink to preserve whole link
      toolbar: [
        // [groupName, [list of button]]
        ['para', ['style']],
        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fontsize', ['fontsize', 'fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['insert', ['table', 'link', 'hr', 'picture', 'video']],
        ['misc', ['codeview', 'help']]
      ],
      fontNames: [
        'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New',
        'Helvetica Neue', 'Helvetica', 'Impact', 'Lucida Grande', 'Monospace',
        'Roboto', 'system-ui', 'Tahoma', 'Times New Roman', 'Verdana'
      ],
      callbacks: {
        onInit: function () {},
        onImageUpload: function () {
          alert('Until we can encrypt image files, uploads are not currently '
            + 'supported. We recommend using the Image button in the toolbar '
            + 'and copying an image URL instead.');
        }
      },
      codeviewFilter: true
    });

    // summernote.change
    $('#summernote').on('summernote.change', function () {
      // Add RTL support when block-level elements are detect onchange.
      document.querySelectorAll(blockString)
        .forEach(element => element.setAttribute('dir', 'auto'));

      if (!ignoreTextChange) {
        save();
      }
    });

    $('textarea.note-codable').on('input', () => {
      save();
    });
  }

  loadEditor();
  loadComponentRelay();

  function textToHTML(text) {
    return ((text || '') + '')
      .replace(/\t/g, '    ')
      .replace(/\r\n|\r|\n/g, '<br />');
  }
});
