/**
 * chatRoutes.js
 * Express router for the /api/chat endpoint.
 */

const express = require('express');
const router  = express.Router();
const { handleChat } = require('../controllers/chatController');

// POST /api/chat — Send a message and get a response
router.post('/', handleChat);

module.exports = router;
