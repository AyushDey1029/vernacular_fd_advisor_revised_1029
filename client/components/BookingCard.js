/**
 * BookingCard.js — FD Booking Confirmation Card component
 * Renders a stylized confirmation receipt after successful booking.
 */

/**
 * Creates a booking confirmation card DOM element.
 * @param {object} booking - Booking object from API
 * @returns {HTMLElement}
 */
export function renderBookingCard(booking) {
  const {
    refNumber, name, amount, rate, tenureYears,
    interest, maturityAmount, startDate, maturityDate, status,
  } = booking;

  const card = document.createElement('div');
  card.className = 'booking-card';

  card.innerHTML = `
    <div class="booking-header">
      <span class="booking-icon">🎉</span>
      <div>
        <div class="booking-title">FD Booking Confirmed!</div>
        <div class="booking-ref">Ref: <strong>${refNumber}</strong></div>
      </div>
      <span class="booking-status ${status.toLowerCase()}">${status}</span>
    </div>
    <div class="booking-divider"></div>
    <div class="booking-rows">
      <div class="booking-row">
        <span class="bk-label">👤 Name</span>
        <span class="bk-value">${name}</span>
      </div>
      <div class="booking-row">
        <span class="bk-label">💰 Amount</span>
        <span class="bk-value">${formatINR(amount)}</span>
      </div>
      <div class="booking-row">
        <span class="bk-label">📈 Rate</span>
        <span class="bk-value">${rate}% p.a.</span>
      </div>
      <div class="booking-row">
        <span class="bk-label">📅 Tenure</span>
        <span class="bk-value">${tenureYears} year${tenureYears !== 1 ? 's' : ''}</span>
      </div>
      <div class="booking-row">
        <span class="bk-label">📆 Start Date</span>
        <span class="bk-value">${startDate}</span>
      </div>
      <div class="booking-row">
        <span class="bk-label">🔚 Maturity Date</span>
        <span class="bk-value">${maturityDate}</span>
      </div>
      <div class="booking-row highlight">
        <span class="bk-label">✨ Interest Earned</span>
        <span class="bk-value green">${formatINR(interest)}</span>
      </div>
      <div class="booking-row maturity-row">
        <span class="bk-label">🎯 Maturity Amount</span>
        <span class="bk-value maturity-val">${formatINR(maturityAmount)}</span>
      </div>
    </div>
    <p class="booking-note">📌 This is a simulated booking for demonstration purposes.</p>
  `;

  return card;
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
