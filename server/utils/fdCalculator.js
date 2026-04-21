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

  // 1. Match lakh/crore patterns: "1 lakh", "1.5 lac", "లక్ష", "लाख"
  const lakhMatch = lower.match(/(\d+\.?\d*)\s*(lakh|lac|lak|laakh|laksha|లక్ష|लाख)/);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]) * 100000;
    return val > 0 ? val : null;
  }

  // 2. Match "k" shorthand or thousand: "50k", "thousand", "hazaar", "వేయి", "हज़ार"
  const kMatch = lower.match(/(\d+\.?\d*)\s*(k|thousand|hazaar|hazar|వేయి|हज़ार)/);
  if (kMatch) {
    const val = parseFloat(kMatch[1]) * 1000;
    return val > 0 ? val : null;
  }

  // 3. Match numbers with currency hints: "100000 rupaiye", "rs 5000"
  const currencyMatch = lower.match(/(?:rs\.?|rupees?|rupaiye?|rupaye?|రూపాయిలు)\s*(\d+\.?\d*)|(\d+\.?\d*)\s*(?:rs\.?|rupees?|rupaiye?|rupaye?|రూపాయిలు)/);
  if (currencyMatch) {
    const val = parseFloat(currencyMatch[1] || currencyMatch[2]);
    return val > 0 ? val : null;
  }

  // 4. Plain number (Fallback) - Filter out numbers likely to be tenure or rate
  // We look for numbers that aren't followed by tenure words
  const matches = lower.matchAll(/(\d+\.?\d*)/g);
  for (const match of matches) {
    const val = parseFloat(match[0]);
    const index = match.index;
    const after = lower.substring(index + match[0].length).trim();
    
    // If the number is followed by tenure words, it's probably not the amount
    if (/^(year|saal|sal|vars|varsh|ellu|eelu|samvatsaram|month|mahina|nela|%)/.test(after)) {
      continue;
    }
    
    // Principal amounts are usually larger than tenure/rate
    if (val >= 100) return val;
  }

  // Last resort: first number
  const firstNum = lower.match(/\d+\.?\d*/);
  const val = firstNum ? parseFloat(firstNum[0]) : null;
  return val > 0 ? val : null;
}

/**
 * Parses tenure from text: "2 years", "6 months", "18 months"
 * @param {string} text
 * @returns {number} - tenure in years
 */
function parseTenure(text) {
  const lower = text.toLowerCase();

  // 1. Months: mahina, maheene, nela, nelalu, month, months
  const monthsTerms = 'month|mahina|maheene|mahena|nela|nelalu|నెల|నెలలు|మహిన|మహినె|మహేన|మహీనా|మహీనే|महीना|महीने';
  const monthsMatch = lower.match(new RegExp(`(\\d+\\.?\\d*)\\s*(${monthsTerms})`));
  if (monthsMatch) {
    const val = parseFloat(monthsMatch[1]);
    return val > 0 ? val / 12 : null;
  }

  // 2. Years: year, saal, sal, vars, varsh, eelu, samvatsaram, ఏళ్ళు, సంవత్సరం, साल, वर्ष
  const yearsTerms = 'year|saal|sal|vars|varsh|ellu|eelu|samvatsaram|samvatsaralu|ఏళ్ళు|సంవత్సరం|साल|वर्ष';
  const yearsMatch = lower.match(new RegExp(`(\\d+\\.?\\d*)\\s*(${yearsTerms})`));
  if (yearsMatch) {
    const val = parseFloat(yearsMatch[1]);
    return val > 0 ? val : null;
  }

  // 3. Fallback: Search for a "small" number that isn't the rate (%) or the large principal
  const matches = lower.matchAll(/(\d+\.?\d*)/g);
  for (const match of matches) {
    const val = parseFloat(match[0]);
    const index = match.index;
    const after = lower.substring(index + match[0].length).trim();
    
    // Skip if it's the interest rate
    if (after.startsWith('%')) continue;
    
    // Skip if it's likely the principal amount (large number)
    if (val >= 1000) continue;

    // If it's a small standalone number, assume it's tenure
    return val > 0 ? val : null;
  }

  return null; // Don't default to 1 year if parsing fails or returns 0
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
