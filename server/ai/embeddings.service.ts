import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Embeddings service. Returns vectors for text chunks used in semantic
 * search / retrieval. Falls back to a deterministic local hashing-based
 * embedding when no provider key is configured (still useful for demo).
 */
class EmbeddingsService {
  async embed(text) {
    const normalized = text.trim();
    if (!normalized) return [];

    if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
      return this._embedOpenAI(normalized);
    }

    return this._embedLocal(normalized);
  }

  async embedBatch(texts) {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async _embedOpenAI(text) {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!res.ok) throw new Error(`Embeddings error ${res.status}`);
    const json: any = await res.json();
    return json.data[0].embedding;
  }

  /**
   * Deterministic local embedding: character trigram hashing -> 96-dim vector.
   * Cosine similarity still works, giving a meaningful "semantic-ish" ranking.
   */
  _embedLocal(text) {
    const dim = 96;
    const vec = new Array(dim).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    for (let i = 0; i < clean.length - 2; i += 1) {
      const trigram = clean.slice(i, i + 3);
      const hash = hashCode(trigram);
      vec[hash % dim] += 1;
    }

    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const embeddings = new EmbeddingsService();

logger.info('Embeddings provider: %s', env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY ? 'openai' : 'local-hash');
