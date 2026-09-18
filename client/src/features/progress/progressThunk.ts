import { createAsyncThunk } from '@reduxjs/toolkit';
import analyticsAPI from '@/services/analyticsAPI';
import { handleThunkError } from '@/utils/error';
import { queryClient } from '@/services/queryClient';

const transform = ({ data }) => data.data;

export const fetchDashboard = createAsyncThunk(
  'progress/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      return transform(await analyticsAPI.getDashboard());
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const trackReading = createAsyncThunk(
  'progress/trackReading',
  async (payload, { rejectWithValue }) => {
    try {
      await analyticsAPI.trackReading(payload);
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      return payload;
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const trackReadingTime = createAsyncThunk(
  'progress/trackTime',
  async (payload, { rejectWithValue }) => {
    try {
      await analyticsAPI.trackTime(payload);
      return payload;
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const trackQuizAttempt = createAsyncThunk(
  'progress/trackQuiz',
  async (_, { rejectWithValue }) => {
    try {
      await analyticsAPI.trackQuiz();
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);
