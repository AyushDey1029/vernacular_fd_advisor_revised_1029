/**
 * fdCalculator.js
 * Core FD calculation logic.
 *
 * Formula Used:
 *   Simple Interest Maturity = principal + (principal * rate/100 * years)
 *   Compound Interest Maturity = principal * (1 + rate/(n*100))^(n*t)
 *     where n = compounding frequency per year (default 4 = quarterly)
 */

/**
 * Calculates FD maturity using Simple Interest.
 * @param {number} principal - The deposit amount (₹)
 * @param {number} annualRate - Annual interest rate in % (e.g., 7.5)
 * @param {number} tenureYears - Tenure in years
 * @returns {object} - { principal, rate, tenureYears, interest, maturity }
 */
function calculateSimpleInterest(principal, annualRate, tenureYears) {
  const interest = (principal * annualRate * tenureYears) / 100;
  const maturity = principal + interest;
  return {
    principal: roundTo2(principal),
    rate: annualRate,
    tenureYears,
    interest: roundTo2(interest),
    maturity: roundTo2(maturity),
    type: 'simple',
  };
}

/**
 * Calculates FD maturity using Compound Interest.
 * @param {number} principal - The deposit amount (₹)
 * @param {number} annualRate - Annual interest rate in % (e.g., 7.5)
 * @param {number} tenureYears - Tenure in years
 * @param {number} [n=4] - Compounding frequency per year (default: quarterly)
 * @returns {object} - { principal, rate, tenureYears, interest, maturity }
 */
function calculateCompoundInterest(principal, annualRate, tenureYears, n = 4) {
  const maturity = principal * Math.pow(1 + annualRate / (n * 100), n * tenureYears);
  const interest = maturity - principal;
  return {
    principal: roundTo2(principal),
    rate: annualRate,
    tenureYears,
    n,
    interest: roundTo2(interest),
    maturity: roundTo2(maturity),
    type: 'compound',
  };
}

/**
 * Parses amounts from text like "50000", "50k", "1 lakh", "1.5 lakh"
 * @param {string} text
 * @returns {number|null}
 */
function parseAmount(text) {
  const lower = text.toLowerCase().replace(/,/g, '');

  // Match lakh patterns: "1 lakh", "1.5 lakh", "2lakh"
  const lakhMatch = lower.match(/(\d+\.?\d*)\s*lakh/);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;

  // Match "k" shorthand: "50k", "100k"
  const kMatch = lower.match(/(\d+\.?\d*)\s*k/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  // Match plain numbers
  const numMatch = lower.match(/\d+\.?\d*/);
  if (numMatch) return parseFloat(numMatch[0]);

  return null;
}

/**
 * Parses tenure from text: "2 years", "6 months", "18 months"
 * @param {string} text
 * @returns {number} - tenure in years
 */
function parseTenure(text) {
  const lower = text.toLowerCase();

  const monthsMatch = lower.match(/(\d+)\s*month/);
  if (monthsMatch) return parseFloat(monthsMatch[1]) / 12;

  const yearsMatch = lower.match(/(\d+\.?\d*)\s*year/);
  if (yearsMatch) return parseFloat(yearsMatch[1]);

  // Plain number assumed as years
  const numMatch = lower.match(/\d+\.?\d*/);
  if (numMatch) return parseFloat(numMatch[0]);

  return 1; // default 1 year
}

/** Helper: Round to 2 decimal places */
function roundTo2(val) {
  return Math.round(val * 100) / 100;
}

/** Format Indian number system (with commas) */
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

module.exports = {
  calculateSimpleInterest,
  calculateCompoundInterest,
  parseAmount,
  parseTenure,
  formatINR,
};
