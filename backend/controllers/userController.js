const User     = require('../models/User');
const Debate   = require('../models/Debate');
const Argument = require('../models/Argument');

// @route  GET /api/users/:username
// @access Public
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -googleId -passwordResetToken -passwordResetExpires -isBanned');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Get recent debates and arguments
    const [recentDebates, recentArguments] = await Promise.all([
      Debate.find({ creator: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category status totalArguments totalVotes createdAt')
        .lean(),
      Argument.find({ author: user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('debate', 'title')
        .select('content side score createdAt debate')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      user: { ...user.toJSON(), avatar: user.getAvatarUrl() },
      recentDebates,
      recentArguments,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/leaderboard
// @access Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { sort = 'reputation', limit = 20 } = req.query;

    let sortField = {};
    switch (sort) {
      case 'votes':    sortField = { totalVotesReceived: -1 }; break;
      case 'debates':  sortField = { debatesParticipated: -1 }; break;
      case 'wins':     sortField = { debateWins: -1 }; break;
      default:         sortField = { reputationPoints: -1 };
    }

    const users = await User.find({ isBanned: false })
      .sort(sortField)
      .limit(parseInt(limit))
      .select('username avatar reputationPoints debatesParticipated totalVotesReceived argumentsPosted debateWins createdAt')
      .lean();

    const ranked = users.map((u, i) => ({
      ...u,
      rank: i + 1,
      avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=random&length=1&color=fff&bold=true`,
    }));

    res.status(200).json({ success: true, users: ranked });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/users/follow-category
// @access Private
const followCategory = async (req, res, next) => {
  try {
    const { category } = req.body;
    const validCategories = ['Technology','Education','Environment','Business','Politics','Science','Health','Society','Culture','Sports','Other'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const user = await User.findById(req.user._id);
    const isFollowing = user.followedCategories.includes(category);

    if (isFollowing) {
      user.followedCategories = user.followedCategories.filter(c => c !== category);
    } else {
      user.followedCategories.push(category);
    }
    await user.save();

    res.status(200).json({
      success: true,
      following: !isFollowing,
      followedCategories: user.followedCategories,
    });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/users/bookmark/:debateId
// @access Private
const toggleBookmark = async (req, res, next) => {
  try {
    const { debateId } = req.params;
    const user = await User.findById(req.user._id);

    const isBookmarked = user.bookmarkedDebates.some(id => id.toString() === debateId);

    if (isBookmarked) {
      user.bookmarkedDebates = user.bookmarkedDebates.filter(id => id.toString() !== debateId);
    } else {
      user.bookmarkedDebates.push(debateId);
    }
    await user.save();

    res.status(200).json({
      success: true,
      bookmarked: !isBookmarked,
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/bookmarks
// @access Private
const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarkedDebates',
      select: 'title category status totalArguments totalVotes endTime createdAt',
      populate: { path: 'creator', select: 'username avatar' },
    });

    res.status(200).json({ success: true, debates: user.bookmarkedDebates });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/:username/debates
// @access Public
const getUserDebates = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const debates = await Debate.find({ creator: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('creator', 'username avatar')
      .lean();

    res.status(200).json({ success: true, debates });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/users/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { bio, philosophicalStance, socialLinks, settings } = req.body;
    const user = await User.findById(req.user._id);
    
    if (bio !== undefined) user.bio = bio;
    if (philosophicalStance !== undefined) user.philosophicalStance = philosophicalStance;
    if (socialLinks !== undefined) {
      if (!user.socialLinks) user.socialLinks = {};
      if (socialLinks.twitter !== undefined) user.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.github !== undefined) user.socialLinks.github = socialLinks.github;
      if (socialLinks.website !== undefined) user.socialLinks.website = socialLinks.website;
      if (socialLinks.instagram !== undefined) user.socialLinks.instagram = socialLinks.instagram;
      if (socialLinks.discord !== undefined) user.socialLinks.discord = socialLinks.discord;
      user.markModified('socialLinks');
    }
    if (settings !== undefined) {
      if (!user.settings) user.settings = {};
      if (settings.autoDestruct !== undefined) user.settings.autoDestruct = settings.autoDestruct;
      if (settings.hardcoreToxicity !== undefined) user.settings.hardcoreToxicity = settings.hardcoreToxicity;
      if (settings.incognitoVote !== undefined) user.settings.incognitoVote = settings.incognitoVote;
      if (settings.hapticFeedback !== undefined) user.settings.hapticFeedback = settings.hapticFeedback;
      user.markModified('settings');
    }
    
    await user.save();
    res.status(200).json({ success: true, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, getLeaderboard, followCategory, toggleBookmark, getBookmarks, getUserDebates, updateProfile };
