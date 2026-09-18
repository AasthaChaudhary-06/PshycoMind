import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { retrieveRelevantChunks } from '../ai/retrieval.service.js';
import { chatRepository } from '../repositories/chat.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { gamificationService } from './gamification.service.js';

const SYSTEM_PROMPT = `You are PhysioMind, an expert medical education assistant for physiotherapy and physiology students.
Answer using ONLY the provided document context. If the context does not contain the answer, say so clearly.
Cite the source page for each claim. Keep answers focused, structured, and clinically accurate.`;

export const chatService = {
  async createChat(userId, { title, documentId }) {
    return chatRepository.create({
      user: userId,
      title: title || 'New Chat',
      document: documentId || null,
    });
  },

  async listChats(userId, query) {
    const pagination = getPaginationOptions(query);
    const filters: any = {};
    if (query.search) filters.search = query.search;
    if (query.pinned === 'true') filters.pinned = true;
    return chatRepository.listForUser(userId, { ...pagination, filters });
  },

  async getChat(userId, chatId) {
    const chat = await chatRepository.findByIdForUser(chatId, userId);
    if (!chat) throw new ApiError(404, 'Chat not found');
    return chat;
  },

  async sendMessage(userId, chatId, { content, documentId }) {
    if (!content?.trim()) throw new ApiError(400, 'Message content is required');

    const chat = await this._resolveChat(userId, chatId, documentId);
    const targetDocumentId = documentId || chat.document || null;

    const userMessage = { role: 'user', content };
    await chatRepository.pushMessage(chat._id, userId, userMessage);

    const { answer, sources } = await this._generateAnswer(content, targetDocumentId);
    const assistantMessage = { role: 'assistant', content: answer, sources };

    const updated = await chatRepository.pushMessage(chat._id, userId, assistantMessage);
    gamificationService.awardXp(userId, 'chat.message').catch(() => {});
    return {
      userMessage,
      assistantMessage,
      messages: updated.messages,
    };
  },

  async renameChat(userId, chatId, title) {
    const chat = await chatRepository.updateById(chatId, { title });
    if (!chat || chat.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Chat not found');
    }
    return chat;
  },

  async toggleBookmark(userId, chatId) {
    const chat = await this.getChat(userId, chatId);
    return chatRepository.updateById(chatId, { bookmarked: !chat.bookmarked });
  },

  async togglePin(userId, chatId) {
    const chat = await this.getChat(userId, chatId);
    return chatRepository.updateById(chatId, { pinned: !chat.pinned });
  },

  async deleteChat(userId, chatId) {
    const chat = await chatRepository.findByIdForUser(chatId, userId);
    if (!chat) throw new ApiError(404, 'Chat not found');
    await chatRepository.deleteById(chatId);
  },

  async _resolveChat(userId, chatId, documentId) {
    if (chatId) {
      const chat = await chatRepository.findByIdForUser(chatId, userId);
      if (!chat) throw new ApiError(404, 'Chat not found');
      return chat;
    }
    return chatRepository.create({
      user: userId,
      document: documentId || null,
      title: 'New Chat',
    });
  },

  async _generateAnswer(question, documentId) {
    if (!documentId) {
      const { content } = await llm.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ]);
      return { answer: content, sources: [] };
    }

    const document = await documentRepository.findByIdForProcessing(documentId);
    if (!document) throw new ApiError(404, 'Document not found');

    const chunks = await retrieveRelevantChunks(document, question);
    const context = chunks.map((c) => `[Page ${c.page}]\n${c.text}`).join('\n\n');

    const { content } = await llm.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
    ]);

    const sources = chunks.map((c) => ({
      document: document._id,
      page: c.page,
      excerpt: c.text.slice(0, 240),
      score: Math.round(c.score * 1000) / 1000,
    }));

    return { answer: content, sources };
  },
};
