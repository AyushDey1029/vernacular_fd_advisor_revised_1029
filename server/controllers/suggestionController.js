/**
 * suggestionController.js
 * Handles requests for best FD recommendations.
 */

const { getFDSuggestions } = require('../services/suggestionService');
const { getTranslator, formatScript } = require('../utils/translator');

async function handleGetSuggestion(req, res) {
  try {
    const { amount, tenure, age, language, scriptType } = req.body;

    if (!amount || !tenure || !age) {
      return res.status(400).json({ error: "Missing required details." });
    }

    const t = getTranslator(language || 'en');
    const localize = (key, vars = {}) => formatScript(t(key, vars), scriptType || 'native', language || 'en');

    const suggestions = getFDSuggestions(amount, tenure, age);

    if (!suggestions) {
      return res.json({ 
        reply: localize("sug_no_match")
      });
    }

    // Construct the formatted reply
    const { best, alternative } = suggestions;

    // Use translation keys for "why"
    const whyMap = {
      "Highest return for your tenure": "sug_why_highest",
      "Safer option from a major bank": "sug_why_safer",
      "Competitive alternative": "sug_why_comp"
    };

    const bestWhyKey = whyMap[best.why] || best.why;
    const altWhyKey = alternative ? (whyMap[alternative.why] || alternative.why) : '';

    let reply = localize('sug_best') + '\n\n';
    reply += localize('sug_bank', { b: best.bank });
    reply += localize('sug_rate', { r: best.rate });
    
    // Check if we have a key for this 'why', otherwise use string directly (it translates internally if matched)
    const translatedBestWhy = localize(bestWhyKey) !== bestWhyKey ? localize(bestWhyKey) : best.why;
    reply += localize('sug_why', { w: translatedBestWhy });

    if (alternative) {
      reply += localize('sug_alt');
      reply += localize('sug_alt_desc', { b: alternative.bank, r: alternative.rate, n: alternative.note });
    }

    return res.json({
      reply,
      best,
      alternative
    });

  } catch (error) {
    console.error("[Suggestion Controller Error]", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { handleGetSuggestion };
