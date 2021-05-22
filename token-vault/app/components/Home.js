import React from 'react';
import update from 'immutability-helper';
import EditEntry from '@Components/EditEntry';
import ViewEntries from '@Components/ViewEntries';
import ConfirmDialog from '@Components/ConfirmDialog';
import DataErrorAlert from '@Components/DataErrorAlert';
import EditorKit from '@standardnotes/editor-kit';

const initialState = {
  text: '',
  entries: [],
  parseError: false,
  editMode: false,
  editEntry: null,
  confirmRemove: false,
  displayCopy: false,
  canEdit: true
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.configureEditorKit();
    this.state = initialState;
  }

  configureEditorKit() {
    const delegate = {
      setEditorRawText: text => {
        let parseError = false;
        let entries = [];

        if (text) {
          try {
            entries = JSON.parse(text);
          } catch (e) {
            // Couldn't parse the content
            parseError = true;
            this.setState({
              parseError: true
            });
          }
        }

        this.setState({
          ...initialState,
          text,
          parseError,
          entries
        });
      },
      generateCustomPreview: text => {
        let entries = [];
        try {
          entries = JSON.parse(text);
        } finally {
          // eslint-disable-next-line no-unsafe-finally
          return {
            html: `<div><strong>${entries.length}</strong> TokenVault Entries </div>`,
            plain: `${entries.length} TokenVault Entries`,
          };
        }
      },
      clearUndoHistory: () => {},
      getElementsBySelector: () => [],
      onNoteLockToggle: (isLocked) => {
        this.setState({
          canEdit: !isLocked
        });
      }
    };

    this.editorKit = new EditorKit(delegate,
      {
        mode: 'json',
        supportsFileSafe: false
      }
    );
  }

  saveNote(entries) {
    this.editorKit.onEditorValueChanged(JSON.stringify(entries, null, 2));
  }

  // Entry operations
  addEntry = entry => {
    this.setState(state => {
      const entries = state.entries.concat([entry]);
      this.saveNote(entries);

      return {
        editMode: false,
        editEntry: null,
        entries
      };
    });
  };

  editEntry = ({ id, entry }) => {
    this.setState(state => {
      const entries = update(state.entries, { [id]: { $set: entry } });
      this.saveNote(entries);

      return {
        editMode: false,
        editEntry: null,
        entries
      };
    });
  };

  removeEntry = id => {
    this.setState(state => {
      const entries = update(state.entries, { $splice: [[id, 1]] });
      this.saveNote(entries);

      return {
        confirmRemove: false,
        editEntry: null,
        entries
      };
    });
  };

  // Event Handlers
  onAddNew = () => {
    if (!this.state.canEdit) {
      return;
    }
    this.setState({
      editMode: true,
      editEntry: null
    });
  };

  onEdit = id => {
    if (!this.state.canEdit) {
      return;
    }
    this.setState(state => ({
      editMode: true,
      editEntry: {
        id,
        entry: state.entries[id]
      }
    }));
  };

  onCancel = () => {
    this.setState({
      confirmRemove: false,
      editMode: false,
      editEntry: null
    });
  };

  onRemove = id => {
    if (!this.state.canEdit) {
      return;
    }
    this.setState(state => ({
      confirmRemove: true,
      editEntry: {
        id,
        entry: state.entries[id]
      }
    }));
  };

  onSave = ({ id, entry }) => {
    // If there's no ID it's a new note
    if (id != null) {
      this.editEntry({ id, entry });
    } else {
      this.addEntry(entry);
    }
  };

  onCopyToken = () => {
    this.setState({
      displayCopy: true
    });
    if (this.clearTooltipTimer) {
      clearTimeout(this.clearTooltipTimer);
    }

    this.clearTooltipTimer = setTimeout(() => {
      this.setState({
        displayCopy: false
      });
    }, 2000);
  };

  render() {
    const editEntry = this.state.editEntry || {};
    const { canEdit, displayCopy, parseError, editMode, entries, confirmRemove } = this.state;

    return (
      <div className="sn-component">
        <div
          className={`auth-copy-notification ${
            displayCopy ? 'visible' : 'hidden'
          }`}
        >
          <div className="sk-panel">
            <div className="sk-font-small sk-bold">
              Copied token to clipboard.
            </div>
          </div>
        </div>
        {parseError && <DataErrorAlert />}
        <div id="header" className={!canEdit ? 'hidden' : '' }>
          <div className="sk-button-group">
            <div onClick={this.onAddNew} className="sk-button info" aria-disabled={!canEdit}>
              <div className="sk-label">Add New</div>
            </div>
          </div>
        </div>

        <div id="content">
          {editMode ? (
            <EditEntry
              id={editEntry.id}
              entry={editEntry.entry}
              onSave={this.onSave}
              onCancel={this.onCancel}
            />
          ) : (
            <ViewEntries
              entries={entries}
              onEdit={this.onEdit}
              onRemove={this.onRemove}
              onCopyToken={this.onCopyToken}
              canEdit={canEdit}
            />
          )}
          {confirmRemove && (
            <ConfirmDialog
              title={`Remove ${editEntry.entry.service}`}
              message="Are you sure you want to remove this entry?"
              onConfirm={() => this.removeEntry(editEntry.id)}
              onCancel={this.onCancel}
            />
          )}
        </div>
      </div>
    );
  }
}
