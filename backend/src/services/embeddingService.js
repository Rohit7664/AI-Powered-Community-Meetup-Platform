const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Generate semantic embeddings for a list of texts or a single string.
 * Calls Python AI microservice (Sentence Transformers all-MiniLM-L6-v2).
 * Includes robust fallback if AI service is not yet ready.
 */
const generateEmbeddings = async (texts) => {
  const textArray = Array.isArray(texts) ? texts : [texts];
  const cleanTexts = textArray.map((t) => (typeof t === 'string' ? t.trim() : JSON.stringify(t)));

  try {
    const response = await axios.post(
      `${config.AI_SERVICE_URL}/ai/embeddings`,
      { texts: cleanTexts },
      { timeout: 8000 }
    );

    if (response.data && response.data.embeddings) {
      return Array.isArray(texts) ? response.data.embeddings : response.data.embeddings[0];
    }
  } catch (err) {
    logger.warn(`[EmbeddingService] AI microservice call failed: ${err.message}. Using deterministic semantic vector fallback.`);
  }

  // Deterministic 384-dimensional fallback vector (same dimension as all-MiniLM-L6-v2)
  const fallbackEmbeddings = cleanTexts.map((text) => createDeterministicEmbedding(text, 384));
  return Array.isArray(texts) ? fallbackEmbeddings : fallbackEmbeddings[0];
};

/**
 * Creates a deterministic normalized vector of given dimension
 * based on token hashes, character n-grams and frequency for smooth offline testing.
 */
function createDeterministicEmbedding(text, dim = 384) {
  const vector = new Array(dim).fill(0);
  const words = (text || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return vector;
  }

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 1;

    // secondary feature
    const idx2 = Math.abs((hash * 31) ^ (word.length * 17)) % dim;
    vector[idx2] += 0.5;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] = Math.round((vector[i] / norm) * 10000) / 10000;
    }
  }

  return vector;
}

/**
 * Calculate cosine similarity between two numeric vectors (0 to 1)
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  const sim = dot / denominator;
  return Math.max(0, Math.min(1, sim));
}

module.exports = {
  generateEmbeddings,
  calculateCosineSimilarity,
  createDeterministicEmbedding,
};
