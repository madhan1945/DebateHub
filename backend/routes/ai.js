const express = require('express');
const router = express.Router();
const { summarizeDebate, generateDebateTopics } = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/summarize/:debateId', summarizeDebate);
router.post('/generate-topics', protect, adminOnly, generateDebateTopics);

module.exports = router;
