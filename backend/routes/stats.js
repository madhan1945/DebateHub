const express  = require('express');
const router   = express.Router();
const Debate   = require('../models/Debate');
const Argument = require('../models/Argument');
const Vote     = require('../models/Vote');
const User     = require('../models/User');

// GET /api/stats — real platform stats for landing page
router.get('/', async (req, res) => {
  try {
    const [debates, arguments_, votes, users] = await Promise.all([
      Debate.countDocuments({ status: { $in: ['active', 'closed'] } }),
      Argument.countDocuments({ isDeleted: false }),
      Vote.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      stats: { debates, arguments: arguments_, votes, users },
    });
  } catch (err) {
    res.status(500).json({ success: false, stats: { debates: 0, arguments: 0, votes: 0, users: 0 } });
  }
});

module.exports = router;
