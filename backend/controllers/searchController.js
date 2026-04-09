const Debate = require('../models/Debate');
const User   = require('../models/User');

// @route  GET /api/search?q=query&type=debates|users&category=X&sort=X
// @access Public
const search = async (req, res, next) => {
  try {
    const { q, type = 'debates', category, sort = 'relevance', page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const skip     = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(50, parseInt(limit));

    if (type === 'users') {
      const users = await User.find({
        $or: [
          { username: { $regex: q.trim(), $options: 'i' } },
          { bio:      { $regex: q.trim(), $options: 'i' } },
        ],
        isBanned: false,
      })
        .select('username avatar bio reputationPoints debatesParticipated argumentsPosted')
        .limit(limitNum)
        .lean();

      return res.status(200).json({
        success: true,
        type: 'users',
        results: users.map(u => ({
          ...u,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&length=1&color=fff&bold=true`,
        })),
        total: users.length,
      });
    }

    // Debate search
    const filter = { status: { $in: ['active', 'closed'] } };

    // Use MongoDB text index if available, fallback to regex
    try {
      filter.$text = { $search: q.trim() };
    } catch {
      filter.title = { $regex: q.trim(), $options: 'i' };
    }

    if (category && category !== 'All') filter.category = category;

    let sortObj = {};
    switch (sort) {
      case 'popular':  sortObj = { totalVotes: -1 };     break;
      case 'newest':   sortObj = { createdAt: -1 };      break;
      case 'closing':  sortObj = { endTime: 1 };         break;
      default:
        if (filter.$text) sortObj = { score: { $meta: 'textScore' }, totalVotes: -1 };
        else               sortObj = { createdAt: -1 };
    }

    const projection = filter.$text ? { score: { $meta: 'textScore' } } : {};

    const [debates, total] = await Promise.all([
      Debate.find(filter, projection)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('creator', 'username avatar')
        .lean(),
      Debate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      type: 'debates',
      results: debates,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/search/suggestions?q=query
// @access Public — quick autocomplete
const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ success: true, suggestions: [] });

    const debates = await Debate.find({
      title: { $regex: q.trim(), $options: 'i' },
      status: 'active',
    })
      .select('title category')
      .limit(6)
      .lean();

    res.json({
      success: true,
      suggestions: debates.map(d => ({ title: d.title, category: d.category, _id: d._id })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { search, getSuggestions };
