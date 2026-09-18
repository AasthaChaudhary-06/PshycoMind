import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeQuizId: null,
  activeQuiz: null,
  currentAnswers: {},
  quizResults: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setActiveQuiz: (state, action) => {
      state.activeQuiz = action.payload;
      state.activeQuizId = action.payload?._id ?? null;
      state.currentAnswers = {};
      state.quizResults = null;
    },
    setAnswer: (state, action) => {
      state.currentAnswers[action.payload.questionIndex] = action.payload.answer;
    },
    setResults: (state, action) => {
      state.quizResults = action.payload;
    },
    resetQuiz: () => initialState,
  },
});

export const { setActiveQuiz, setAnswer, setResults, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
