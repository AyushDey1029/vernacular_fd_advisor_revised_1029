const { detectIntent } = require('../server/utils/intentDetector');
const { parseAmount, parseTenure, calculateSimpleInterest } = require('../server/utils/fdCalculator');

const testCases = [
    // --- Intent Detection ---
    { type: 'intent', input: "What is an FD?", expected: 'fd_explain' },
    { type: 'intent', input: "Tell me about Fixed Deposit", expected: 'fd_explain' },
    { type: 'intent', input: "Calculate return for 1 lakh for 1 year", expected: 'calculate' },
    { type: 'intent', input: "1 lakh par 1 saal ka kitna milega?", expected: 'calculate' },
    { type: 'intent', input: "Interest rate kya hai?", expected: 'fd_rate' },
    { type: 'intent', input: "Best bank for FD?", expected: 'fd_suggestion' },
    { type: 'intent', input: "How are you?", expected: 'unknown' },
    { type: 'intent', input: "Play a game", expected: 'unknown' },
    { type: 'intent', input: "SBI vs HDFC FD", expected: 'fd_suggestion' },
    { type: 'intent', input: "I want to start an FD", expected: 'fd_start' },
    { type: 'intent', input: "FD shuru karna hai", expected: 'fd_start' },

    // --- Amount Parsing ---
    { type: 'amount', input: "50000", expected: 50000 },
    { type: 'amount', input: "1 lakh", expected: 100000 },
    { type: 'amount', input: "1.5 lac", expected: 150000 },
    { type: 'amount', input: "Rs 5000", expected: 5000 },
    { type: 'amount', input: "5000 rupaiye", expected: 5000 },
    { type: 'amount', input: "I want to invest 1 lakh", expected: 100000 },
    { type: 'amount', input: "1 year 1 lakh", expected: 100000 },
    { type: 'amount', input: "Fifty thousand", expected: null }, // Potential fail
    { type: 'amount', input: "0", expected: null },

    // --- Tenure Parsing ---
    { type: 'tenure', input: "2 years", expected: 2 },
    { type: 'tenure', input: "18 months", expected: 1.5 },
    { type: 'tenure', input: "6 mahina", expected: 0.5 },
    { type: 'tenure', input: "1 saal", expected: 1 },
    { type: 'tenure', input: "2 ఏళ్ళు", expected: 2 },
    { type: 'tenure', input: "1.5 years", expected: 1.5 },
    { type: 'tenure', input: "100 years", expected: 100 },
    { type: 'tenure', input: "2", expected: 2 },

    // --- Mixed/Edge Calculation Parsing ---
    { type: 'calc_flow', input: "1 lakh for 2 years at 7.5%", expected: { amount: 100000, tenure: 2, rate: 7.5 } },
    { type: 'calc_flow', input: "Calculate 50000 for 6 months", expected: { amount: 50000, tenure: 0.5, rate: 7 } }, // Default rate 7
];

console.log("=== Chatbot Logic Edge Case Testing ===\n");

let passed = 0;
let total = testCases.length;

testCases.forEach((tc, index) => {
    let result;
    let isMatch = false;

    if (tc.type === 'intent') {
        result = detectIntent(tc.input);
        isMatch = result === tc.expected;
    } else if (tc.type === 'amount') {
        result = parseAmount(tc.input);
        isMatch = result === tc.expected;
    } else if (tc.type === 'tenure') {
        result = parseTenure(tc.input);
        isMatch = result === tc.expected;
    } else if (tc.type === 'calc_flow') {
        const amount = parseAmount(tc.input);
        const tenure = parseTenure(tc.input);
        const rateMatch = tc.input.match(/(\d+\.?\d*)\s*%/);
        const rate = rateMatch ? parseFloat(rateMatch[1]) : 7.0;
        result = { amount, tenure, rate };
        isMatch = result.amount === tc.expected.amount && result.tenure === tc.expected.tenure && result.rate === tc.expected.rate;
    }

    if (isMatch) {
        console.log(`[PASS] Test ${index + 1}: "${tc.input}" -> ${JSON.stringify(result)}`);
        passed++;
    } else {
        console.log(`[FAIL] Test ${index + 1}: "${tc.input}"`);
        console.log(`       Expected: ${JSON.stringify(tc.expected)}`);
        console.log(`       Actual:   ${JSON.stringify(result)}`);
    }
});

console.log(`\nResults: ${passed}/${total} tests passed.`);
