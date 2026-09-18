import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeNoteId: null,
  editorDraft: '',
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action) => {
      state.activeNoteId = action.payload;
    },
    setEditorDraft: (state, action) => {
      state.editorDraft = action.payload;
    },
    resetNotes: () => initialState,
  },
});

export const { setActiveNote, setEditorDraft, resetNotes } = notesSlice.actions;
export default notesSlice.reducer;
