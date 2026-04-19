/**
 * CalcCard.js — FD Calculation Result Card component
 * Renders a beautiful card showing FD calculation breakdown.
 */

/**
 * Creates a calculation result card DOM element.
 * @param {object} calc - { principal, rate, tenureYears, interest, maturity, type }
 * @returns {HTMLElement}
 */
export function renderCalcCard(calc) {
  const { principal, rate, tenureYears, interest, maturity } = calc;

  const card = document.createElement('div');
  card.className = 'calc-card';

  // Progress bar: interest as % of maturity
  const interestPct = Math.round((interest / maturity) * 100);

  card.innerHTML = `
    <div class="calc-card-header">
      <span class="calc-icon">📊</span>
      <span class="calc-title">FD Maturity Breakdown</span>
    </div>
    <div class="calc-rows">
      <div class="calc-row">
        <span class="calc-label">💰 Principal</span>
        <span class="calc-value">${formatINR(principal)}</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">📈 Rate</span>
        <span class="calc-value">${rate}% p.a.</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">📅 Tenure</span>
        <span class="calc-value">${tenureYears} year${tenureYears !== 1 ? 's' : ''}</span>
      </div>
      <div class="calc-row highlight">
        <span class="calc-label">✨ Interest Earned</span>
        <span class="calc-value green">${formatINR(interest)}</span>
      </div>
      <div class="calc-row maturity-row">
        <span class="calc-label">🎯 Maturity Amount</span>
        <span class="calc-value maturity-val">${formatINR(maturity)}</span>
      </div>
    </div>
    <div class="calc-bar-container">
      <div class="calc-bar-label">
        <span>Principal</span><span>Interest (${interestPct}%)</span>
      </div>
      <div class="calc-bar">
        <div class="calc-bar-principal" style="width: ${100 - interestPct}%"></div>
        <div class="calc-bar-interest"  style="width: ${interestPct}%"></div>
      </div>
    </div>
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
