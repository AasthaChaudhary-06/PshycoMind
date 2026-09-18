import { createAsyncThunk } from '@reduxjs/toolkit';
import chatAPI from '@/services/chatAPI';
import { handleThunkError } from '@/utils/error';

const transform = ({ data }) => data.data;

export const createChat = createAsyncThunk('chat/create', async (payload: any) => {
  const result = await chatAPI.create(payload);
  return transform(result);
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (payload: any) => {
  const result = await chatAPI.sendMessage(payload.chatId, {
    content: payload.content,
    documentId: payload.documentId,
  });
  return transform(result);
});

export const renameChat = createAsyncThunk('chat/rename', async ({ id, title }: any) => {
  const result = await chatAPI.rename(id, title);
  return transform(result);
});

export const deleteChat = createAsyncThunk(
  'chat/delete',
  async (id: any, { rejectWithValue }: any) => {
    try {
      await chatAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(handleThunkError(err));
    }
  },
);
