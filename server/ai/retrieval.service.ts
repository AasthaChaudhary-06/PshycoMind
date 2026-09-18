import { embeddings } from './embeddings.service.js';
import { logger } from '../utils/logger.js';

/**
 * Retrieval layer over document chunks.
 * For documents without stored embeddings we fall back to lexical scoring,
 * which keeps the pipeline functional in zero-config mode.
 */
export async function retrieveRelevantChunks(document, query, { topK = 4 } = {}) {
  const chunks = document.chunks || [];
  if (!chunks.length) return [];

  const hasEmbeddings = chunks.some((c) => c.embedding && c.embedding.length > 0);

  let scored;
  if (hasEmbeddings) {
    const queryVec = await embeddings.embed(query);
    scored = chunks.map((chunk) => {
      const plain = chunk.toObject ? chunk.toObject() : chunk;
      return {
        ...plain,
        score: cosineSimilarity(queryVec, chunk.embedding),
      };
    });
  } else {
    scored = chunks.map((chunk) => {
      const plain = chunk.toObject ? chunk.toObject() : chunk;
      return {
        ...plain,
        score: lexicalScore(query, chunk.text),
      };
    });
  }

  const ranked = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  logger.info('Retrieved %d chunks (embedding=%s)', ranked.length, hasEmbeddings);
  return ranked;
}

export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function lexicalScore(query, text) {
  const queryTerms = new Set(query.toLowerCase().split(/\W+/).filter((t) => t.length > 2));
  const lower = text.toLowerCase();
  let score = 0;
  queryTerms.forEach((term) => {
    if (lower.includes(term)) score += 1;
  });
  return queryTerms.size ? score / queryTerms.size : 0;
}
