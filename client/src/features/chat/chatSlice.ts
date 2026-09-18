import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeChatId: null,
  isStreaming: false,
  sidebarOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    setStreaming: (state, action) => {
      state.isStreaming = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    resetChatState: () => initialState,
  },
});

export const { setActiveChat, setStreaming, toggleSidebar, resetChatState } = chatSlice.actions;
export default chatSlice.reducer;
