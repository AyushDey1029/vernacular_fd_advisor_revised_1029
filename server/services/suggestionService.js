/**
 * suggestionService.js
 * Logic to recommend the best FD schemes based on user details.
 */

const fdSchemes = [
  {
    bank: "SBI",
    tenureRange: [1, 10],
    rates: { normal: 6.8, senior: 7.3 },
    minAmount: 1000,
    note: "Safe & government-backed"
  },
  {
    bank: "HDFC Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.0, senior: 7.5 },
    minAmount: 5000,
    note: "High returns for mid-term FDs"
  },
  {
    bank: "ICICI Bank",
    tenureRange: [1, 7],
    rates: { normal: 6.9, senior: 7.4 },
    minAmount: 10000,
    note: "Flexible tenure options"
  },
  {
    bank: "Axis Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.2, senior: 7.7 },
    minAmount: 5000,
    note: "Best for short-term gains"
  },
  {
    bank: "Kotak Mahindra Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.1, senior: 7.6 },
    minAmount: 5000,
    note: "Competitive rates across tenures"
  },
  {
    bank: "Punjab National Bank",
    tenureRange: [1, 10],
    rates: { normal: 6.7, senior: 7.2 },
    minAmount: 1000,
    note: "Trusted public sector bank"
  },
  {
    bank: "Bank of Baroda",
    tenureRange: [1, 10],
    rates: { normal: 6.75, senior: 7.25 },
    minAmount: 1000,
    note: "Stable returns with low risk"
  },
  {
    bank: "IDFC FIRST Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.25, senior: 7.75 },
    minAmount: 10000,
    note: "High interest for new investors"
  },
  {
    bank: "Yes Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.3, senior: 7.8 },
    minAmount: 10000,
    note: "Higher returns with moderate risk"
  },
  {
    bank: "IndusInd Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.15, senior: 7.65 },
    minAmount: 10000,
    note: "Good balance of risk and return"
  },
  {
    bank: "AU Small Finance Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.5, senior: 8.0 },
    minAmount: 5000,
    note: "Highest returns (small finance bank)"
  },
  {
    bank: "Ujjivan Small Finance Bank",
    tenureRange: [1, 5],
    rates: { normal: 7.6, senior: 8.1 },
    minAmount: 5000,
    note: "Very high returns, slightly higher risk"
  }
];

/**
 * Finds the best and an alternative FD scheme.
 * @param {number} amount 
 * @param {number} tenure 
 * @param {number} age 
 */
function getFDSuggestions(amount, tenure, age) {
  const isSenior = age >= 60;
  const category = isSenior ? "senior" : "normal";

  // Filter schemes that match min amount and tenure range
  const validSchemes = fdSchemes.filter(s => 
    amount >= s.minAmount && 
    tenure >= s.tenureRange[0] && 
    tenure <= s.tenureRange[1]
  );

  if (validSchemes.length === 0) return null;

  // Sort by interest rate descending
  validSchemes.sort((a, b) => b.rates[category] - a.rates[category]);

  const best = validSchemes[0];
  
  // Find a "safer" alternative if best is a Small Finance Bank
  let alternative = validSchemes[1]; 
  
  // Try to find a major bank (SBI, HDFC, ICICI, Axis) as alternative if best is high-risk
  const majorBanks = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"];
  if (best.bank.includes("Small Finance Bank")) {
    const majorAlt = validSchemes.find(s => majorBanks.includes(s.bank));
    if (majorAlt && majorAlt.bank !== best.bank) {
      alternative = majorAlt;
    }
  }

  return {
    best: {
      bank: best.bank,
      rate: best.rates[category],
      why: "Highest return for your tenure",
      note: best.note
    },
    alternative: alternative ? {
      bank: alternative.bank,
      rate: alternative.rates[category],
      why: majorBanks.includes(alternative.bank) ? "Safer option from a major bank" : "Competitive alternative",
      note: alternative.note
    } : null
  };
}

module.exports = { getFDSuggestions };
