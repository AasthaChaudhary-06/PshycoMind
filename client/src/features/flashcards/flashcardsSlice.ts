import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  flashcards: [],
  currentIndex: 0,
  isFlipped: false,
  status: 'idle',
  error: null,
}

const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    setFlashcards: (state, action) => {
      state.flashcards = action.payload
      state.currentIndex = 0
    },
    nextCard: (state) => {
      if (state.currentIndex < state.flashcards.length - 1) {
        state.currentIndex += 1
        state.isFlipped = false
      }
    },
    prevCard: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1
        state.isFlipped = false
      }
    },
    flipCard: (state) => {
      state.isFlipped = !state.isFlipped
    },
    markWeak: (state, action) => {
      const card = state.flashcards[action.payload]
      if (card) card.strength = 'weak'
    },
    markStrong: (state, action) => {
      const card = state.flashcards[action.payload]
      if (card) card.strength = 'strong'
    },
  },
})

export const {
  setFlashcards,
  nextCard,
  prevCard,
  flipCard,
  markWeak,
  markStrong,
} = flashcardsSlice.actions
export default flashcardsSlice.reducer
