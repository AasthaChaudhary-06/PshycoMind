import { createAsyncThunk } from '@reduxjs/toolkit';
import quizAPI from '@/services/quizAPI';
import { handleThunkError } from '@/utils/error';

const transform = ({ data }) => data.data;

export const generateQuiz = createAsyncThunk(
  'quiz/generate',
  async (payload: any, { rejectWithValue }: any) => {
    try {
      const result = await quizAPI.generate(payload);
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const submitQuiz = createAsyncThunk(
  'quiz/submit',
  async ({ id, answers, startedAt }: any, { rejectWithValue }: any) => {
    try {
      const result = await quizAPI.submit(id, { answers, startedAt });
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);
