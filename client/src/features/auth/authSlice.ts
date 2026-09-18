import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user || state.user;
      state.accessToken = accessToken || state.accessToken;
      state.refreshToken = refreshToken || state.refreshToken;
      state.isAuthenticated = Boolean(state.accessToken || state.refreshToken);
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logoutSuccess: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSession,
  setCredentials,
  setUser,
  setLoading,
  setError,
  clearError,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
