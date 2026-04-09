const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, markAllRead, markOneRead, clearAll, getUnreadCount,
} = require('../controllers/notificationController');

router.get('/',              protect, getNotifications);
router.get('/unread-count',  protect, getUnreadCount);
router.put('/read-all',      protect, markAllRead);
router.put('/:id/read',      protect, markOneRead);
router.delete('/',           protect, clearAll);

module.exports = router;
