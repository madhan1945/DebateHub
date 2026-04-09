const Argument = require('../models/Argument');
const Debate   = require('../models/Debate');
const Vote     = require('../models/Vote');
const User     = require('../models/User');
const { wilsonScore } = require('../utils/ranking');
const { checkToxicity } = require('../utils/claude');

// @route  POST /api/debates/:debateId/arguments
// @access Private
const createArgument = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.debateId);
    if (!debate) return res.status(404).json({ success: false, message: 'Debate not found.' });
    if (debate.status === 'closed') return res.status(400).json({ success: false, message: 'This debate is closed.' });

    const { content, side, referenceLinks, images, parentArgumentId } = req.body;

    if (!content || !side) return res.status(400).json({ success: false, message: 'content and side are required.' });
    if (!['support', 'oppose'].includes(side)) return res.status(400).json({ success: false, message: 'side must be "support" or "oppose".' });

    let isFlagged = false;
    let flagReason = '';
    const toxicity = await checkToxicity(content);
    if (toxicity.isToxic) {
      isFlagged = true;
      flagReason = toxicity.reason || 'Violation of community guidelines.';
    }

    let depth = 0;
    if (parentArgumentId) {
      const parent = await Argument.findById(parentArgumentId);
      if (!parent || parent.debate.toString() !== debate._id.toString()) {
        return res.status(404).json({ success: false, message: 'Parent argument not found.' });
      }
      depth = Math.min(parent.depth + 1, 3);
    }

    const argument = await Argument.create({
      debate: debate._id,
      author: req.user._id,
      side,
      content: content.trim(),
      referenceLinks: Array.isArray(referenceLinks) ? referenceLinks.slice(0, 5) : [],
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      parentArgument: parentArgumentId || null,
      depth,
      isFlagged,
      flagReason,
    });

    // Update debate counters
    const updateDebate = { $inc: { totalArguments: 1 } };
    if (!parentArgumentId) {
      if (side === 'support') updateDebate.$inc.supportCount = 1;
      else                    updateDebate.$inc.opposeCount  = 1;
    }
    if (!debate.participants.includes(req.user._id)) {
      updateDebate.$addToSet = { participants: req.user._id };
      await User.findByIdAndUpdate(req.user._id, { $inc: { debatesParticipated: 1 } });
    }
    await Debate.findByIdAndUpdate(debate._id, updateDebate);

    // Update parent reply count
    if (parentArgumentId) {
      await Argument.findByIdAndUpdate(parentArgumentId, { $inc: { replyCount: 1 } });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { argumentsPosted: 1 } });

    const populated = await argument.populate('author', 'username avatar reputationPoints');
    res.status(201).json({ success: true, argument: populated });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/debates/:debateId/arguments
// @access Public
const getArguments = async (req, res, next) => {
  try {
    const { side, sort = 'top', page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const filter = {
      debate: req.params.debateId,
      parentArgument: null, // top-level only
      isDeleted: false,
    };
    if (side && ['support', 'oppose'].includes(side)) filter.side = side;

    let sortObj = {};
    switch (sort) {
      case 'top':     sortObj = { wilsonScore: -1 };  break;
      case 'newest':  sortObj = { createdAt: -1 };    break;
      case 'oldest':  sortObj = { createdAt: 1 };     break;
      case 'hot':     sortObj = { score: -1, replyCount: -1 }; break;
      default:        sortObj = { wilsonScore: -1 };
    }

    const args = await Argument.find(filter)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('author', 'username avatar reputationPoints')
      .lean();

    // Get user votes if authenticated (passed via query)
    const total = await Argument.countDocuments(filter);

    res.status(200).json({
      success: true,
      arguments: args,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), hasMore: (pageNum - 1) * limitNum + limitNum < total },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/arguments/:id/replies
// @access Public
const getReplies = async (req, res, next) => {
  try {
    const replies = await Argument.find({
      parentArgument: req.params.id,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate('author', 'username avatar reputationPoints')
      .lean();

    res.status(200).json({ success: true, replies });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/arguments/:id
// @access Private (author or admin)
const deleteArgument = async (req, res, next) => {
  try {
    const argument = await Argument.findById(req.params.id);
    if (!argument) return res.status(404).json({ success: false, message: 'Argument not found.' });

    if (argument.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    // Soft delete
    argument.isDeleted = true;
    argument.content   = '[deleted]';
    await argument.save();

    res.status(200).json({ success: true, message: 'Argument removed.' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/arguments/:id/vote
// @access Private
const voteArgument = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'voteType must be "upvote" or "downvote".' });
    }

    const argument = await Argument.findById(req.params.id);
    if (!argument || argument.isDeleted) return res.status(404).json({ success: false, message: 'Argument not found.' });

    // Check if debate is still open
    const debate = await Debate.findById(argument.debate);
    if (debate?.status === 'closed') return res.status(400).json({ success: false, message: 'Debate is closed.' });

    // Cannot vote on your own argument
    if (argument.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot vote on your own argument.' });
    }

    const existingVote = await Vote.findOne({ argument: argument._id, user: req.user._id });

    let deltaUp = 0, deltaDown = 0;
    let action  = '';

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await existingVote.deleteOne();
        if (voteType === 'upvote')   deltaUp   = -1;
        else                          deltaDown = -1;
        action = 'removed';
      } else {
        // Switch vote
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === 'upvote') { deltaUp = 1; deltaDown = -1; }
        else                       { deltaUp = -1; deltaDown = 1; }
        action = 'switched';
      }
    } else {
      await Vote.create({ argument: argument._id, user: req.user._id, voteType });
      if (voteType === 'upvote') deltaUp = 1;
      else                       deltaDown = 1;
      action = 'added';

      // Award 1 rep to argument author on new upvote
      if (voteType === 'upvote') {
        await User.findByIdAndUpdate(argument.author, { $inc: { reputationPoints: 1, totalVotesReceived: 1 } });
      }
    }

    // Recompute argument score
    const newUpvotes   = Math.max(0, argument.upvotes + deltaUp);
    const newDownvotes = Math.max(0, argument.downvotes + deltaDown);
    const total        = newUpvotes + newDownvotes;
    const ws           = wilsonScore(newUpvotes, total);

    await Argument.findByIdAndUpdate(argument._id, {
      upvotes:     newUpvotes,
      downvotes:   newDownvotes,
      score:       newUpvotes - newDownvotes,
      wilsonScore: ws,
    });

    // Update debate total votes
    await Debate.findByIdAndUpdate(argument.debate, { $inc: { totalVotes: deltaUp + deltaDown } });

    res.status(200).json({
      success: true,
      action,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newUpvotes - newDownvotes,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/arguments/:id/my-vote
// @access Private
const getMyVote = async (req, res, next) => {
  try {
    const vote = await Vote.findOne({ argument: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, voteType: vote?.voteType || null });
  } catch (err) {
    next(err);
  }
};

module.exports = { createArgument, getArguments, getReplies, deleteArgument, voteArgument, getMyVote };
