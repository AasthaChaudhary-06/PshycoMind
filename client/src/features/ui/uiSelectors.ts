import { createSelector } from '@reduxjs/toolkit'

export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectUploadModalOpen = (state) => state.ui.isUploadModalOpen
export const selectSearchOpen = (state) => state.ui.isSearchOpen
export const selectActiveView = (state) => state.ui.activeView

export const selectSidebarState = createSelector(
  selectSidebarOpen,
  (isOpen) => ({ isOpen }),
)
