import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '@/features/auth/authSlice';
import documentReducer from '@/features/document/documentSlice';
import chatReducer from '@/features/chat/chatSlice';
import quizReducer from '@/features/quiz/quizSlice';
import notesReducer from '@/features/notes/notesSlice';
import progressReducer from '@/features/progress/progressSlice';
import themeReducer from '@/features/theme/themeSlice';
import notificationReducer from '@/features/notification/notificationSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  documents: documentReducer,
  chat: chatReducer,
  quiz: quizReducer,
  notes: notesReducer,
  progress: progressReducer,
  theme: themeReducer,
  notification: notificationReducer,
});

const persistConfig = {
  key: 'physiomind-root',
  version: 1,
  storage,
  whitelist: ['auth', 'theme'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);
