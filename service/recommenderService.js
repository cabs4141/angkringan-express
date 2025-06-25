// utils/recommender.js

export function buildUserProductMatrix(orders) {
  const matrix = {};
  orders.forEach((order) => {
    const userId = order.user.toString();
    if (!matrix[userId]) matrix[userId] = {};

    order.cart.forEach((item) => {
      const productId = item.product.toString();
      const quantity = item.quantity;
      if (!matrix[userId][productId]) matrix[userId][productId] = 0;
      matrix[userId][productId] += quantity;
    });
  });
  return matrix;
}

export function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0,
    normA = 0,
    normB = 0;
  keys.forEach((key) => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export function getNearestNeighbors(userId, matrix, k = 2) {
  const similarities = [];
  for (let otherUser in matrix) {
    if (otherUser === userId) continue;
    const sim = cosineSimilarity(matrix[userId], matrix[otherUser]);
    similarities.push({ user: otherUser, similarity: sim });
  }
  return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, k);
}

export function recommendProducts(userId, matrix, k = 2) {
  const neighbors = getNearestNeighbors(userId, matrix, k);
  const userProducts = new Set(Object.keys(matrix[userId]));
  const scores = {};
  const weights = {};

  neighbors.forEach(({ user, similarity }) => {
    for (let product in matrix[user]) {
      if (userProducts.has(product)) continue;
      const weightedScore = matrix[user][product] * similarity;
      if (!scores[product]) scores[product] = 0;
      if (!weights[product]) weights[product] = 0;
      scores[product] += weightedScore;
      weights[product] += similarity;
    }
  });

  return Object.keys(scores)
    .map((product) => ({
      product,
      score: scores[product] / (weights[product] || 1),
    }))
    .sort((a, b) => b.score - a.score);
}
