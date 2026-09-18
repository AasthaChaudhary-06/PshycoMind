import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import themeReducer from '../features/theme/themeSlice'
import notificationReducer from '../features/notification/notificationSlice'
import uiReducer from '../features/ui/uiSlice'
import documentReducer from '../features/documents/documentSlice'
import chatReducer from '../features/chat/chatSlice'
import quizReducer from '../features/quiz/quizSlice'
import notesReducer from '../features/notes/notesSlice'
import flashcardsReducer from '../features/flashcards/flashcardsSlice'
import progressReducer from '../features/progress/progressSlice'

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  notification: notificationReducer,
  ui: uiReducer,
  documents: documentReducer,
  chat: chatReducer,
  quiz: quizReducer,
  notes: notesReducer,
  flashcards: flashcardsReducer,
  progress: progressReducer,
})
