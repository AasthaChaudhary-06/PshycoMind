import { createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '@/services/authAPI';
import { handleThunkError } from '@/utils/error';
import { setSession, logoutSuccess } from './authSlice';

const transform = ({ data }) => data.data;

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: any, { dispatch, rejectWithValue }: any) => {
    try {
      const result = await authAPI.register(payload);
      dispatch(setSession(transform(result)));
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: any, { dispatch, rejectWithValue }: any) => {
    try {
      const result = await authAPI.login(payload);
      dispatch(setSession(transform(result)));
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const result = await authAPI.me();
    return transform(result);
  } catch (err) {
    return rejectWithValue(handleThunkError(err));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload: any) => {
  const result = await authAPI.updateProfile(payload);
  return transform(result);
});

export const changePassword = createAsyncThunk('auth/changePassword', async (payload: any) => {
  const result = await authAPI.changePassword(payload);
  return transform(result);
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await authAPI.logout();
  } finally {
    dispatch(logoutSuccess());
  }
});
