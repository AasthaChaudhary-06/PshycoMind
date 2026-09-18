import { createAsyncThunk } from '@reduxjs/toolkit';
import documentAPI from '@/services/documentAPI';
import { handleThunkError } from '@/utils/error';
import { queryClient } from '@/services/queryClient';

const transform = ({ data }) => data.data;

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async ({ formData, onUploadProgress }: any, { rejectWithValue }: any) => {
    try {
      const result = await documentAPI.upload(formData, onUploadProgress);
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: any, { rejectWithValue }: any) => {
    try {
      await documentAPI.remove(id);
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      return id;
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'documents/favorite',
  async ({ id, isFavorite }: any, { rejectWithValue }: any) => {
    try {
      const result = isFavorite
        ? await documentAPI.unfavorite(id)
        : await documentAPI.favorite(id);
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      return transform(result);
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);
