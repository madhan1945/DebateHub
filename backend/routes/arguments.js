const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReplies, deleteArgument, voteArgument, getMyVote,
} = require('../controllers/argumentController');

router.get('/:id/replies',  getReplies);
router.delete('/:id',       protect, deleteArgument);
router.post('/:id/vote',    protect, voteArgument);
router.get('/:id/my-vote',  protect, getMyVote);

module.exports = router;
