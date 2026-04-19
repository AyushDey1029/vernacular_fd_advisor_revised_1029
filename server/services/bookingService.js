/**
 * bookingService.js
 * Mock FD booking simulation service.
 * In production, this would connect to a bank API or database.
 */

// In-memory store for demo bookings (resets on server restart)
const bookings = [];

/**
 * Creates a mock FD booking.
 * @param {object} details - { name, amount, tenureYears, rate }
 * @returns {object} - Booking confirmation with reference number
 */
function createBooking(details) {
  const { name, amount, tenureYears, rate = 7.0 } = details;

  // Validate required fields
  if (!name || !amount || !tenureYears) {
    throw new Error('Missing required booking details: name, amount, or tenure.');
  }

  // Generate a random booking reference (mock)
  const refNumber = `FD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Calculate maturity date
  const startDate = new Date();
  const maturityDate = new Date(startDate);
  maturityDate.setFullYear(maturityDate.getFullYear() + Math.floor(tenureYears));
  maturityDate.setMonth(maturityDate.getMonth() + Math.round((tenureYears % 1) * 12));

  // Compute interest (simple interest for mock)
  const interest = (amount * rate * tenureYears) / 100;
  const maturityAmount = amount + interest;

  const booking = {
    refNumber,
    name,
    amount: Math.round(amount),
    rate,
    tenureYears,
    interest: Math.round(interest),
    maturityAmount: Math.round(maturityAmount),
    startDate: startDate.toDateString(),
    maturityDate: maturityDate.toDateString(),
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  // Save to in-memory store
  bookings.push(booking);

  return booking;
}

/**
 * Retrieves all bookings (for admin/debug purposes).
 * @returns {Array} - Array of booking objects
 */
function getAllBookings() {
  return bookings;
}

/**
 * Finds a booking by reference number.
 * @param {string} refNumber
 * @returns {object|null}
 */
function getBookingByRef(refNumber) {
  return bookings.find(b => b.refNumber === refNumber) || null;
}

module.exports = { createBooking, getAllBookings, getBookingByRef };
