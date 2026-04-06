/**
 * Wilson Score Interval — lower bound
 * Used to rank arguments fairly: accounts for both vote count and ratio.
 * A 90% upvote ratio on 1000 votes > 100% upvote ratio on 3 votes.
 *
 * @param {number} upvotes
 * @param {number} total  - total votes (up + down)
 * @returns {number}      - score between 0 and 1
 */
function wilsonScore(upvotes, total) {
  if (total === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = upvotes / total;
  const numerator   = p + (z * z) / (2 * total) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  const denominator = 1 + (z * z) / total;
  return Math.max(0, numerator / denominator);
}

/**
 * Hot score — combines wilson score with recency.
 * Used for "trending" sort.
 *
 * @param {number} upvotes
 * @param {number} total
 * @param {Date}   createdAt
 * @returns {number}
 */
function hotScore(upvotes, total, createdAt) {
  const ws  = wilsonScore(upvotes, total);
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  // Decay: newer arguments get a bonus that fades over 48 hours
  const recencyBonus = Math.max(0, 1 - ageHours / 48);
  return ws + recencyBonus * 0.2;
}

module.exports = { wilsonScore, hotScore };
