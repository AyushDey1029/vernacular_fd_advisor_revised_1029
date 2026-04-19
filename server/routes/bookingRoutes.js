/**
 * bookingRoutes.js
 * Express router for FD booking endpoints.
 */

const express = require('express');
const router  = express.Router();
const { bookFD, getBooking, listBookings } = require('../controllers/bookingController');

// POST /api/booking  — Create a new FD booking
router.post('/', bookFD);

// GET  /api/booking/:ref  — Fetch booking by reference number
router.get('/:ref', getBooking);

// GET  /api/bookings  — List all bookings (dev/demo only)
router.get('/', listBookings);

module.exports = router;
