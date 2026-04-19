const { detectIntent } = require('../utils/intentDetector');

const testCases = [
    // FD Explain - Roman Telugu
    { input: "FD ante emiti?", expected: "fd_explain" },
    { input: "fd ante enti", expected: "fd_explain" },
    { input: "fd meaning telugu", expected: "fd_explain" },
    { input: "fixed deposit ante enti", expected: "fd_explain" },
    
    // FD Explain - English/Hindi (existing)
    { input: "what is fd", expected: "fd_explain" },
    { input: "fd kya hai", expected: "fd_explain" },
    { input: "tell me about fd", expected: "fd_explain" },

    // FD Start
    { input: "start fd", expected: "fd_start" },
    { input: "fd start cheyali", expected: "fd_start" },

    // Calculate
    { input: "10000 fd returns", expected: "calculate" },
    { input: "calculate interest for 5 years", expected: "calculate" },

    // FD Rate
    { input: "interest rate", expected: "fd_rate" },
    { input: "fd rate", expected: "fd_rate" },
    { input: "vadi", expected: "fd_rate" },

    // Unknown
    { input: "hello", expected: "unknown" },
    { input: "how are you", expected: "unknown" }
];

console.log("Running Intent Detection Tests...\n");
let passed = 0;
testCases.forEach(({ input, expected }) => {
    const result = detectIntent(input);
    if (result === expected) {
        console.log(`✅ [PASS] "${input}" -> ${result}`);
        passed++;
    } else {
        console.log(`❌ [FAIL] "${input}" -> Expected: ${expected}, Got: ${result}`);
    }
});

console.log(`\nTests Passed: ${passed}/${testCases.length}`);
