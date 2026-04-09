const express = require('express');
const router = express.Router();
const { getUsers, banUser, getAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);
router.get('/analytics', getAnalytics);

module.exports = router;
