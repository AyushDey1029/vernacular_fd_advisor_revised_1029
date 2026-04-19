/**
 * chatController.js (CLEAN VERSION)
 * Fully controlled multilingual chatbot
 */

const { detectIntent } = require('../utils/intentDetector');
const { getChatResponse } = require('../services/openaiService');

const {
  calculateSimpleInterest,
  parseAmount,
  parseTenure,
  formatINR,
} = require('../utils/fdCalculator');

const {
  getFDStartFlow,
  getFDExplanation,
  getFDRateInfo
} = require('../services/fdService');

const { getTranslator, formatScript } = require('../utils/translator');

// ===============================
// MAIN HANDLER
// ===============================
async function handleChat(req, res) {
  try {
    console.log('\n[Backend] --- Incoming Request ---');
    console.log(JSON.stringify(req.body, null, 2));

    let { message, history = [], language, scriptType } = req.body;

    // ✅ Validations and Defaults
    const validLangs = ['en', 'hi', 'te'];
    if (!validLangs.includes(language)) {
      language = 'en';
    }
    scriptType = scriptType || "native";

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "Message is required." });
    }

    const userMessage = message.trim().toLowerCase();

    console.log("Language:", language);
    console.log("Script:", scriptType);

    const intent = detectIntent(userMessage);

    let reply = "";
    let calculation = null;

    const t = getTranslator(language);
    const localize = (key, vars = {}) => formatScript(t(key, vars), scriptType, language);

    // ===============================
    // 🎯 INTENT HANDLERS
    // ===============================

    // 1. START FD
    if (intent === "fd_start") {
      reply = getFDStartFlow(language, scriptType);
    }

    // 2. CALCULATION
    else if (intent === "calculate") {
      const amount = parseAmount(userMessage);
      const tenure = parseTenure(userMessage);

      const rateMatch = userMessage.match(/(\d+\.?\d*)\s*%/);
      const rate = rateMatch ? parseFloat(rateMatch[1]) : 7.0;

      if (amount) {
        const result = calculateSimpleInterest(amount, rate, tenure);
        calculation = result;
        
        const p = formatINR(result.principal);
        const i = formatINR(result.interest);
        const m = formatINR(result.maturity);
        
        reply = localize("calc_result", { p, rate, tenureYears: result.tenureYears, i, m });
      } else {
        reply = localize("ask_amount");
      }
    }

    // 3. INTEREST RATES
    else if (intent === "fd_rate") {
      reply = getFDRateInfo(language, scriptType);
    }

    // 4. FD EXPLANATION
    else if (intent === "fd_explain") {
      reply = getFDExplanation(language, scriptType);
    }

    // 5. AI FALLBACK (CONTROLLED)
    else {
      try {
        reply = await getChatResponse(
          userMessage,
          language,
          intent,
          history,
          scriptType
        );
      } catch (err) {
        console.error("AI Error:", err.message);
        reply = localize("fallback");
      }
    }

    // ===============================
    // 🧼 FINAL SAFETY
    // ===============================
    if (!reply || reply.trim() === "") {
      reply = localize("fallback");
    }

    const response = {
      reply,
      language,
      intent,
      calculation,
    };

    console.log('\n[Backend] --- Response ---');
    console.log(JSON.stringify(response, null, 2));

    return res.json(response);

  } catch (error) {
    console.error("[Backend] Fatal Error:", error.message);

    return res.status(500).json({
      reply: "Server error. Please try again."
    });
  }
}

module.exports = { handleChat };