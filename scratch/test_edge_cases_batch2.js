const { detectIntent } = require('../server/utils/intentDetector');
const { parseAmount, parseTenure } = require('../server/utils/fdCalculator');

const testCases = [
    // --- Ambiguous Numbers ---
    { type: 'calc_flow', input: "Calculate for 2", expected: { amount: null, tenure: 2, rate: 7 } }, 
    { type: 'calc_flow', input: "100000 for 10", expected: { amount: 100000, tenure: 10, rate: 7 } },

    // --- Semantic Overlap ---
    { type: 'intent', input: "What is the best interest rate for 1 year?", expected: 'fd_rate' }, // Could also be suggestion
    { type: 'intent', input: "I want to invest in SBI", expected: 'fd_suggestion' }, 
    
    // --- Off-topic Bypass ---
    { type: 'intent', input: "My FD is 1 lakh, by the way how to make pasta?", expected: 'unknown' }, // Should ideally ignore pasta or flag unknown

    // --- Vernacular Parsing Nuances ---
    { type: 'tenure', input: "2 samvatsaralu", expected: 2 }, // Telugu Roman
    { type: 'tenure', input: "6 nelalu", expected: 0.5 }, // Telugu Roman
    { type: 'amount', input: "2 lakshalu", expected: 200000 }, // Telugu Roman
    
    // --- Boundary/Strange inputs ---
    { type: 'amount', input: "amount is 1,00,00,000", expected: 10000000 },
    { type: 'tenure', input: "tenure is 0.1 years", expected: 0.1 },
    { type: 'calc_flow', input: "50000 at 0% for 1 year", expected: { amount: 50000, tenure: 1, rate: 0 } },
];

console.log("=== Chatbot Logic Edge Case Testing - Batch 2 ===\n");

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
