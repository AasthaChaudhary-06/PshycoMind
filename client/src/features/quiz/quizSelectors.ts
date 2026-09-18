import { createSelector } from '@reduxjs/toolkit'

export const selectQuiz = (state) => state.quiz.currentQuiz
export const selectQuizAnswers = (state) => state.quiz.answers
export const selectQuizResult = (state) => state.quiz.result
export const selectQuizStatus = (state) => state.quiz.status

export const selectAnsweredCount = createSelector(
  selectQuizAnswers,
  (answers) => Object.keys(answers).length,
)
