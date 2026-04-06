const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  createDebate, getDebates, getDebate,
  updateDebate, deleteDebate, getCategories, getTrending,
} = require('../controllers/debateController');
const {
  createArgument, getArguments,
} = require('../controllers/argumentController');

// Public
router.get('/categories', getCategories);
router.get('/trending',   getTrending);
router.get('/',           getDebates);
router.get('/:id',        getDebate);

// Authenticated
router.post('/',      protect, createDebate);
router.put('/:id',    protect, updateDebate);
router.delete('/:id', protect, deleteDebate);

// Arguments nested under debate
router.post('/:debateId/arguments', protect, createArgument);
router.get('/:debateId/arguments',          getArguments);

module.exports = router;
