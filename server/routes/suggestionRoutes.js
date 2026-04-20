/**
 * suggestionRoutes.js
 * Express router for the /api/suggestion endpoint.
 */

const express = require('express');
const router  = express.Router();
const { handleGetSuggestion } = require('../controllers/suggestionController');

// POST /api/suggestion — Get best FD scheme recommendations
router.post('/', handleGetSuggestion);

module.exports = router;
