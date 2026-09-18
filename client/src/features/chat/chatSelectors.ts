import { createSelector } from '@reduxjs/toolkit'

export const selectMessages = (state) => state.chat.messages
export const selectChatLoading = (state) => state.chat.isLoading
export const selectIsStreaming = (state) => state.chat.isStreaming
export const selectLastAssistantMessage = createSelector(
  selectMessages,
  (messages) => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i]
    }
    return null
  },
)
