import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: false,
  activeView: null,
  isUploadModalOpen: false,
  isSearchOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setActiveView: (state, action) => {
      state.activeView = action.payload
    },
    setUploadModalOpen: (state, action) => {
      state.isUploadModalOpen = action.payload
    },
    setSearchOpen: (state, action) => {
      state.isSearchOpen = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveView,
  setUploadModalOpen,
  setSearchOpen,
} = uiSlice.actions
export default uiSlice.reducer
