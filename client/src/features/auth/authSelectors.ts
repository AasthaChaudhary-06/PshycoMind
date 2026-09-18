export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectRole = (state) => state.auth.user?.role || null;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsFaculty = (state) =>
  state.auth.user?.role === 'faculty' || state.auth.user?.role === 'admin';
