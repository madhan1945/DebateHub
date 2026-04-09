const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile, getLeaderboard, followCategory,
  toggleBookmark, getBookmarks, getUserDebates, updateProfile
} = require('../controllers/userController');

router.get('/leaderboard',           getLeaderboard);
router.put('/profile',      protect, updateProfile);
router.get('/bookmarks',    protect, getBookmarks);
router.put('/follow-category', protect, followCategory);
router.put('/bookmark/:debateId', protect, toggleBookmark);
router.get('/:username',             getProfile);
router.get('/:username/debates',     getUserDebates);

module.exports = router;
