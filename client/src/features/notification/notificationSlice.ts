import { createSlice, nanoid } from '@reduxjs/toolkit';

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

const initialState = {
  items: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const { message, type = NOTIFICATION_TYPES.INFO, title } = action.payload;
      state.items.push({
        id: action.payload.id || nanoid(),
        message,
        type,
        title,
        createdAt: new Date().toISOString(),
      });
    },
    dismissNotification: (state, action) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { showNotification, dismissNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
