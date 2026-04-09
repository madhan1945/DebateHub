const express = require('express');
const router  = express.Router();
const { search, getSuggestions } = require('../controllers/searchController');

router.get('/',           search);
router.get('/suggestions', getSuggestions);

module.exports = router;
