const jwt = require('jsonwebtoken');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.getAvatarUrl(),
      bio: user.bio,
      role: user.role,
      reputationPoints: user.reputationPoints,
      debatesParticipated: user.debatesParticipated,
      totalVotesReceived: user.totalVotesReceived,
      argumentsPosted: user.argumentsPosted,
      debateWins: user.debateWins,
      followedCategories: user.followedCategories,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { signToken, verifyToken, sendTokenResponse };
