import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastUpdatedAt: null,
  isTracking: false,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markUpdated: (state) => {
      state.lastUpdatedAt = new Date().toISOString();
    },
    setTracking: (state, action) => {
      state.isTracking = action.payload;
    },
  },
});

export const { markUpdated, setTracking } = progressSlice.actions;
export default progressSlice.reducer;
