/**
 * bookingController.js
 * Handles FD booking simulation endpoints.
 *
 * Endpoints:
 *  POST /api/booking        — Create a new FD booking
 *  GET  /api/booking/:ref   — Fetch a booking by reference number
 *  GET  /api/bookings       — List all bookings (dev only)
 */

const { createBooking, getAllBookings, getBookingByRef } = require('../services/bookingService');
const { parseAmount, parseTenure } = require('../utils/fdCalculator');

/**
 * POST /api/booking
 * Body: { name, amount, tenureYears, rate? }
 */
async function bookFD(req, res) {
  try {
    let { name, amount, tenureYears, tenure, rate } = req.body;

    // Normalize: support both tenureYears and tenure keys
    tenureYears = tenureYears || tenure;

    // If amount/tenure are strings (e.g., "50000", "2 years"), parse them
    if (typeof amount === 'string') amount = parseAmount(amount);
    if (typeof tenureYears === 'string') tenureYears = parseTenure(tenureYears);

    if (!name || !amount || !tenureYears) {
      return res.status(400).json({
        error: 'Please provide name, amount, and tenure to book an FD.',
      });
    }

    const booking = createBooking({ name, amount, tenureYears, rate: rate || 7.0 });

    return res.status(201).json({
      success: true,
      message: 'Your Fixed Deposit has been booked successfully! 🎉',
      booking,
    });

  } catch (error) {
    console.error('[BookingController] Error:', error.message);
    return res.status(500).json({ error: error.message || 'Booking failed. Please try again.' });
  }
}

/**
 * GET /api/booking/:ref
 * Returns a specific booking by reference number.
 */
async function getBooking(req, res) {
  try {
    const { ref } = req.params;
    const booking = getBookingByRef(ref.toUpperCase());

    if (!booking) {
      return res.status(404).json({ error: `No booking found with reference: ${ref}` });
    }

    return res.json({ booking });

  } catch (error) {
    console.error('[BookingController] Error:', error.message);
    return res.status(500).json({ error: 'Could not fetch booking.' });
  }
}

/**
 * GET /api/bookings
 * Lists all bookings — for development/demo only.
 */
async function listBookings(req, res) {
  try {
    const bookings = getAllBookings();
    return res.json({ total: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Could not retrieve bookings.' });
  }
}

module.exports = { bookFD, getBooking, listBookings };
