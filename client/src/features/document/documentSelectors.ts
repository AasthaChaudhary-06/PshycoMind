export const selectCurrentDocument = (state) => state.documents.currentDocument;
export const selectDocumentFilters = (state) => state.documents.selectedFilters;
export const selectDocumentSorting = (state) => ({
  sortBy: state.documents.sortBy,
  sortOrder: state.documents.sortOrder,
});
