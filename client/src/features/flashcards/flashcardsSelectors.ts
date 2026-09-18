import { createSelector } from '@reduxjs/toolkit'

export const selectFlashcards = (state) => state.flashcards.flashcards
export const selectCurrentIndex = (state) => state.flashcards.currentIndex
export const selectIsFlipped = (state) => state.flashcards.isFlipped

export const selectCurrentCard = createSelector(
  selectFlashcards,
  selectCurrentIndex,
  (cards, index) => cards[index] ?? null,
)

export const selectWeakCount = createSelector(selectFlashcards, (cards) =>
  cards.filter((card) => card.strength === 'weak').length,
)
