const Notification = require('../models/Notification');

// @route  GET /api/notifications
// @access Private
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sender', 'username avatar')
        .populate('debate', 'title')
        .lean(),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/notifications/read-all
// @access Private
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/notifications/:id/read
// @access Private
const markOneRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/notifications
// @access Private
const clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({ success: true, message: 'Notifications cleared.' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/notifications/unread-count
// @access Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAllRead, markOneRead, clearAll, getUnreadCount };
