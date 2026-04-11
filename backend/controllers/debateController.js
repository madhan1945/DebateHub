const Debate = require('../models/Debate');
const User   = require('../models/User');
const { checkToxicity } = require('../utils/claude');

const VALID_SORTS = ['newest', 'popular', 'trending', 'closing_soon'];

// @route  POST /api/debates
// @access Private
const createDebate = async (req, res, next) => {
  try {
    const { title, description, category, tags, durationHours, bannerImage } = req.body;

    if (!title || !description || !category || !durationHours) {
      return res.status(400).json({ success: false, message: 'title, description, category, and durationHours are required.' });
    }

    const hours = parseFloat(durationHours);
    if (isNaN(hours) || hours < 1 || hours > 720) {
      return res.status(400).json({ success: false, message: 'durationHours must be between 1 and 720 (30 days).' });
    }

    const toxicity = await checkToxicity(`${title}\n${description}`);
    if (toxicity.isToxic) {
      return res.status(400).json({ success: false, message: `Debate flagged for toxicity: ${toxicity.reason || 'Violation of community guidelines.'}`});
    }

    const endTime = new Date(Date.now() + hours * 60 * 60 * 1000);

    const debate = await Debate.create({
      title: title.trim(),
      description: description.trim(),
      category,
      tags: Array.isArray(tags) ? tags.slice(0, 8).map(t => t.trim().toLowerCase()) : [],
      creator: req.user._id,
      bannerImage: bannerImage || '',
      endTime,
    });

    // Add to participants
    debate.participants.push(req.user._id);
    await debate.save();

    // Update creator stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { debatesParticipated: 1 } });

    const populated = await debate.populate('creator', 'username avatar reputationPoints');

    res.status(201).json({ success: true, debate: populated });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/debates
// @access Public
const getDebates = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      category, status, sort = 'newest',
      search, tag,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && ['active', 'closed', 'draft'].includes(status)) {
      filter.status = status;
    } else {
      filter.status = { $in: ['active', 'closed'] };
    }

    if (category) filter.category = category;
    if (tag)      filter.tags = tag;

    if (search) {
      filter.$text = { $search: search };
    }

    let sortObj = {};
    switch (sort) {
      case 'popular':      sortObj = { totalVotes: -1, totalArguments: -1 }; break;
      case 'trending':     sortObj = { viewCount: -1, totalVotes: -1 };      break;
      case 'closing_soon': sortObj = { endTime: 1 };                          break;
      default:             sortObj = { createdAt: -1 };
    }

    const [debates, total] = await Promise.all([
      Debate.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('creator', 'username avatar reputationPoints')
        .lean(),
      Debate.countDocuments(filter),
    ]);

    // Auto-close any that snuck through
    const now = new Date();
    for (const d of debates) {
      if (d.status === 'active' && d.endTime < now) d.status = 'closed';
    }

    res.status(200).json({
      success: true,
      debates,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
        hasMore: skip + limitNum < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/debates/:id
// @access Public
const getDebate = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.id)
      .populate('creator', 'username avatar reputationPoints bio');

    if (!debate) return res.status(404).json({ success: false, message: 'Debate not found.' });

    // Auto-close if expired
    await debate.checkAndClose();

    // Increment view count
    debate.viewCount += 1;
    await debate.save({ timestamps: false });

    res.status(200).json({ success: true, debate });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/debates/:id
// @access Private (creator only)
const updateDebate = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ success: false, message: 'Debate not found.' });

    if (debate.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this debate.' });
    }
    if (debate.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot edit a closed debate.' });
    }

    const { title, description, bannerImage, tags } = req.body;
    if (title)       debate.title       = title.trim();
    if (description) debate.description = description.trim();
    if (bannerImage !== undefined) debate.bannerImage = bannerImage;
    if (Array.isArray(tags)) debate.tags = tags.slice(0, 8).map(t => t.trim().toLowerCase());

    await debate.save();
    res.status(200).json({ success: true, debate });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/debates/:id
// @access Private (creator or admin)
const deleteDebate = async (req, res, next) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ success: false, message: 'Debate not found.' });

    if (debate.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this debate.' });
    }

    await debate.deleteOne();
    res.status(200).json({ success: true, message: 'Debate deleted.' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/debates/categories
// @access Public
const getCategories = async (req, res, next) => {
  try {
    const counts = await Debate.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, categories: counts.map(c => ({ name: c._id, count: c.count })) });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/debates/trending
// @access Public — returns top 6 trending debates
const getTrending = async (req, res, next) => {
  try {
    const debates = await Debate.find({ status: { $in: ['active', 'closed'] } })
      .sort({ viewCount: -1, totalVotes: -1 })
      .limit(6)
      .populate('creator', 'username avatar')
      .lean();
    res.status(200).json({ success: true, debates });
  } catch (err) {
    next(err);
  }
};

module.exports = { createDebate, getDebates, getDebate, updateDebate, deleteDebate, getCategories, getTrending };
