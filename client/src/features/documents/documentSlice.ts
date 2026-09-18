import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentDocument: null,
  highlights: [],
  bookmarks: [],
  uploadStatus: 'idle',
  uploadProgress: 0,
  error: null,
}

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload
    },
    setUploadStatus: (state, action) => {
      state.uploadStatus = action.payload
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    addHighlight: (state, action) => {
      state.highlights.push(action.payload)
    },
    removeHighlight: (state, action) => {
      state.highlights = state.highlights.filter(
        (h) => h.id !== action.payload,
      )
    },
    addBookmark: (state, action) => {
      if (!state.bookmarks.includes(action.payload)) {
        state.bookmarks.push(action.payload)
      }
    },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(
        (b) => b !== action.payload,
      )
    },
  },
})

export const {
  setCurrentDocument,
  setUploadStatus,
  setUploadProgress,
  addHighlight,
  removeHighlight,
  addBookmark,
  removeBookmark,
} = documentSlice.actions
export default documentSlice.reducer
