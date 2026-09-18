import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentDocument: null,
  selectedFilters: {
    subject: '',
    favorite: '',
    period: '',
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
    setFilter: (state, action) => {
      state.selectedFilters = { ...state.selectedFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.selectedFilters = initialState.selectedFilters;
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy ?? state.sortBy;
      state.sortOrder = action.payload.sortOrder ?? state.sortOrder;
    },
  },
});

export const {
  setCurrentDocument,
  clearCurrentDocument,
  setFilter,
  clearFilters,
  setSorting,
} = documentSlice.actions;

export default documentSlice.reducer;
