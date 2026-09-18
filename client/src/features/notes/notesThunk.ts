import { createAsyncThunk } from '@reduxjs/toolkit';
import notesAPI from '@/services/notesAPI';
import { handleThunkError } from '@/utils/error';

const transform = ({ data }) => data.data;

export const createNote = createAsyncThunk('notes/create', async (payload: any) => {
  const result = await notesAPI.create(payload);
  return transform(result);
});

export const updateNote = createAsyncThunk('notes/update', async ({ id, payload }: any) => {
  const result = await notesAPI.update(id, payload);
  return transform(result);
});

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id: any, { rejectWithValue }: any) => {
    try {
      await notesAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const generateSummary = createAsyncThunk(
  'notes/generateSummary',
  async (payload: any, { rejectWithValue }: any) => {
    try {
      const result = await notesAPI.generateSummary(payload);
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);
