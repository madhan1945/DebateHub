const { checkToxicity, summarizeThread, generateTopics } = require('../utils/claude');
const Argument = require('../models/Argument');
const Debate = require('../models/Debate');

// @route  POST /api/ai/summarize/:debateId
// @access Public
const summarizeDebate = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.debateId);
    if (!debate) return res.status(404).json({ success: false, message: 'Debate not found' });

    // Grab top 20 arguments
    const args = await Argument.find({ debate: debate._id, isDeleted: false })
      .sort({ score: -1 })
      .limit(20)
      .lean();

    if (args.length === 0) return res.status(400).json({ success: false, message: 'No arguments to summarize' });

    const argList = args.map(a => ({ side: a.side, content: a.content }));
    const summary = await summarizeThread(debate.title, argList);

    res.status(200).json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/ai/generate-topics
// @access Private (Admin only)
const generateDebateTopics = async (req, res, next) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ success: false, message: 'Category required' });

    const topics = await generateTopics(category);
    res.status(200).json({ success: true, topics });
  } catch (err) {
    next(err);
  }
};

module.exports = { summarizeDebate, generateDebateTopics };
