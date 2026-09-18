import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { retrieveRelevantChunks } from '../ai/retrieval.service.js';
import { flashcardRepository } from '../repositories/flashcard.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { gamificationService } from './gamification.service.js';

export const flashcardService = {
  async generate(userId, { documentId, topic, count = 10 }) {
    const document = documentId
      ? await documentRepository.findByIdForProcessing(documentId)
      : null;

    const context = document
      ? await retrieveRelevantChunks(document, topic || 'key concepts', { topK: 6 })
          .then((chunks) => chunks.map((c) => `[Page ${c.page}]\n${c.text}`).join('\n\n'))
      : '';

    const { content } = await llm.complete(
      [
        {
          role: 'system',
          content: `You create high-yield flashcard pairs for medical students. Return a JSON array of ${count} objects with "front" (short prompt) and "back" (concise answer). Base cards on context when provided.`,
        },
        {
          role: 'user',
          content: context
            ? `Context:\n${context}\n\nGenerate flashcards for topic: ${topic || 'key concepts'}.`
            : `Generate flashcards for topic: ${topic || 'general medical concepts'}.`,
        },
      ],
      { temperature: 0.6, maxTokens: 3000 },
    );

    const cards = this._parseCards(content).map((card) => ({
      user: userId,
      document: documentId || null,
      front: card.front,
      back: card.back,
      topic: topic || '',
    }));

    if (!cards.length) throw new ApiError(502, 'Could not generate flashcards');

    return flashcardRepository.createMany(cards);
  },

  async list(userId, query) {
    const pagination = getPaginationOptions(query);
    const filters: any = {};
    if (query.dueToday === 'true') filters.dueToday = true;
    if (query.mastery) filters.mastery = query.mastery;
    if (query.topic) filters.topic = query.topic;
    return flashcardRepository.listForUser(userId, { ...pagination, filters });
  },

  async review(userId, cardId, { quality }) {
    if (![0, 1, 2, 3, 4, 5].includes(quality)) {
      throw new ApiError(400, 'quality must be between 0 and 5');
    }
    const card = await flashcardRepository.findByIdForUser(cardId, userId);
    if (!card) throw new ApiError(404, 'Flashcard not found');

    const update = sm2Review(card, quality);
    const updated = await flashcardRepository.updateById(cardId, userId, update);
    gamificationService.awardXp(userId, 'flashcard.review').catch(() => {});
    return updated;
  },

  async delete(userId, cardId) {
    const card = await flashcardRepository.findByIdForUser(cardId, userId);
    if (!card) throw new ApiError(404, 'Flashcard not found');
    await flashcardRepository.deleteById(cardId);
  },

  _parseCards(content) {
    try {
      let parsed;
      if (typeof content === 'string') {
        const json = content.match(/\[[\s\S]*\]/)?.[0];
        if (!json) throw new Error('No JSON array found');
        parsed = JSON.parse(json);
      } else if (Array.isArray(content)) {
        parsed = content;
      } else {
        throw new Error('Response is not a JSON array');
      }
      return parsed.filter((c) => c.front && c.back);
    } catch (err) {
      throw new ApiError(502, `Failed to parse flashcards: ${err.message}`);
    }
  },
};

/**
 * Simplified SuperMemo-2 spaced repetition algorithm.
 */
function sm2Review(card, quality) {
  const { easeFactor, intervalDays, reviewCount } = card;
  let newEase = easeFactor;

  if (quality >= 3) {
    newEase = Math.min(3.5, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  let newInterval;
  if (quality < 3) {
    newInterval = 0;
  } else if (reviewCount === 0) {
    newInterval = 1;
  } else if (reviewCount === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(intervalDays * newEase);
  }

  const mastery = quality >= 4 ? 'mastered' : quality >= 3 ? 'reviewing' : 'learning';

  return {
    easeFactor: newEase,
    intervalDays: newInterval,
    reviewCount: reviewCount + 1,
    mastery,
    lastReviewedAt: new Date(),
    nextReviewAt: quality < 3 ? new Date(Date.now() + 10 * 60 * 1000) : addDays(new Date(), newInterval),
  };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
