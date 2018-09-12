import { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import analytics from './analytics';
import appState from './flux/app-state';
import filterNotes from './utils/filter-notes';

export class NoteToolbarContainer extends Component {
  static propTypes = {
    closeNote: PropTypes.func.isRequired,
    deleteNoteForever: PropTypes.func.isRequired,
    noteBucket: PropTypes.object.isRequired,
    noteRevisions: PropTypes.func.isRequired,
    restoreNote: PropTypes.func.isRequired,
    setIsViewingRevisions: PropTypes.func.isRequired,
    shareNote: PropTypes.func.isRequired,
    stateForFilterNotes: PropTypes.object.isRequired,
    toggleNoteInfo: PropTypes.func.isRequired,
    toolbar: PropTypes.element.isRequired,
    trashNote: PropTypes.func.isRequired,
  };

  // Gets the index of the note located before the currently selected one
  getPreviousNoteIndex = note => {
    const filteredNotes = filterNotes(this.props.stateForFilterNotes);

    const noteIndex = function(filteredNote) {
      return note.id === filteredNote.id;
    };

    return Math.max(filteredNotes.findIndex(noteIndex) - 1, 0);
  };

  onTrashNote = note => {
    const { noteBucket } = this.props;
    const previousIndex = this.getPreviousNoteIndex(note);
    this.props.trashNote({ noteBucket, note, previousIndex });
    analytics.tracks.recordEvent('editor_note_deleted');
  };

  onDeleteNoteForever = note => {
    const { noteBucket } = this.props;
    const previousIndex = this.getPreviousNoteIndex(note);
    this.props.deleteNoteForever({ noteBucket, note, previousIndex });
  };

  onRestoreNote = note => {
    const { noteBucket } = this.props;
    const previousIndex = this.getPreviousNoteIndex(note);
    this.props.restoreNote({ noteBucket, note, previousIndex });
    analytics.tracks.recordEvent('editor_note_restored');
  };

  onShowRevisions = note => {
    const { noteBucket } = this.props;
    this.props.noteRevisions({ noteBucket, note });
    analytics.tracks.recordEvent('editor_versions_accessed');
  };

  render() {
    const { toolbar } = this.props;
    const handlers = {
      onCloseNote: this.props.closeNote,
      onDeleteNoteForever: this.onDeleteNoteForever,
      onRestoreNote: this.onRestoreNote,
      onShowNoteInfo: this.props.toggleNoteInfo,
      onShowRevisions: this.onShowRevisions,
      onShareNote: this.props.shareNote,
      onTrashNote: this.onTrashNote,
      setIsViewingRevisions: this.props.setIsViewingRevisions,
    };

    return cloneElement(toolbar, handlers);
  }
}

const mapStateToProps = ({ appState: state }) => ({
  stateForFilterNotes: {
    filter: state.filter,
    notes: state.notes,
    showTrash: state.showTrash,
    tag: state.tag,
  },
});

const {
  closeNote,
  deleteNoteForever,
  noteRevisions,
  restoreNote,
  setIsViewingRevisions,
  showDialog,
  toggleNoteInfo,
  trashNote,
} = appState.actionCreators;

const mapDispatchToProps = dispatch => ({
  closeNote: () => dispatch(closeNote()),
  deleteNoteForever: args => dispatch(deleteNoteForever(args)),
  noteRevisions: args => dispatch(noteRevisions(args)),
  restoreNote: args => dispatch(restoreNote(args)),
  setIsViewingRevisions: isViewingRevisions => {
    dispatch(setIsViewingRevisions({ isViewingRevisions }));
  },
  shareNote: () =>
    dispatch(
      showDialog({
        dialog: { type: 'Share', modal: true },
      })
    ),
  toggleNoteInfo: () => dispatch(toggleNoteInfo()),
  trashNote: args => dispatch(trashNote(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(
  NoteToolbarContainer
);