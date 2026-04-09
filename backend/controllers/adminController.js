const User = require('../models/User');
const Debate = require('../models/Debate');
const Argument = require('../models/Argument');

// @route  GET /api/admin/users
// @access Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments()
    ]);
    
    res.status(200).json({ success: true, users, pagination: { total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/admin/users/:id/ban
// @access Private (Admin)
const banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban an admin' });

    user.isBanned = !user.isBanned;
    await user.save();
    
    res.status(200).json({ success: true, isBanned: user.isBanned, message: user.isBanned ? 'User banned' : 'User unbanned' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/admin/analytics
// @access Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    const stats = {};
    
    stats.totalUsers = await User.countDocuments();
    stats.totalDebates = await Debate.countDocuments();
    stats.totalArguments = await Argument.countDocuments();
    
    // Growth over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const debatesWeek = await Debate.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const usersWeek = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const categoriesPie = await Debate.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ success: true, stats, debatesWeek, usersWeek, categoriesPie });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, banUser, getAnalytics };
