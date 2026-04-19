/**
 * intentDetector.js
 * Detects user intent using keyword + pattern matching across multiple languages.
 */

// Intent keyword map — multi-language keywords for each intent
const intentKeywords = {

  fd_start: [
    'start fd', 'open fd', 'fd shuru', 'fd start cheyali',
    'invest', 'new fd', 'create fd', 'fd book',

    // Telugu Roman
    'fd modalu', 'modalu pettu', 'fd start cheyyi',

    // Hindi Native (Devanagari)
    'fd शुरू', 'fd खोलें', 'fd खोलो', 'निवेश',

    // Telugu Native
    'fd ప్రారంభించు', 'fd పెట్టు', 'పెట్టుబడి'
  ],

  calculate: [
    'calculate', 'maturity', 'returns', 'how much',
    'kitna milega', 'hisab',

    // Telugu Roman
    'lekkhinchu', 'lekkinchu', 'lekka', 'lekka chey',
    'calculate chey', 'calculate cheyyi', 'entha vastundi',

    // Hindi Native (Devanagari)
    'कैलकुलेट', 'हिसाब', 'कितना मिलेगा', 'कैलकुलेट करें',

    // Telugu Native
    'లెక్కించు', 'లెక్క', 'ఎంత వస్తుంది'
  ],

  fd_rate: [
    'interest rate', 'fd rate', 'byaaj dar', 'interest',
    'rate of interest', 'vadi',

    // Telugu Roman
    'vaddi', 'vaddi reetu', 'interest enti', 'rate enti',

    // Hindi Native (Devanagari)
    'ब्याज दर', 'ब्याज', 'ब्याज़ दर',

    // Telugu Native
    'వడ్డీ రేటు', 'వడ్డీ'
  ],

  fd_explain: [
    'what is fd', 'fd kya hai', 'fd ante enti', 'explain fd',
    'what is fixed deposit', 'tell me about fd',

    // Telugu Roman
    'fd ante emiti', 'fd enti', 'fd meaning',

    // Hindi Native (Devanagari)
    'fd क्या है', 'fd क्या होता है', 'फिक्स्ड डिपॉजिट क्या',

    // Telugu Native
    'fd అంటే ఏమిటి', 'fd అంటే', 'fd యొక్క అర్థం', 'fd ఏమిటి'
  ],
};

/**
 * Detects intent from user message text.
 * @param {string} text
 * @returns {string}
 */
function detectIntent(text) {
  if (!text || typeof text !== 'string') return 'unknown';

  const lower = text.toLowerCase();

  // ================================
  // 1. FD START
  // ================================
  if (intentKeywords.fd_start.some(kw => lower.includes(kw))) {
    return 'fd_start';
  }

  // ================================
  // 2. CALCULATE
  // ================================
  const hasNumbers = /\d+/.test(lower);

  const mentionsCalcContext =
    lower.includes('%') ||
    lower.includes('year') ||
    lower.includes('month') ||
    lower.includes('lakh') ||
    lower.includes('k') ||
    lower.includes('saal') ||
    lower.includes('mahina') ||
    lower.includes('samay');

  const hasCalcKeyword = intentKeywords.calculate.some(kw => lower.includes(kw));

  if (hasNumbers && (mentionsCalcContext || hasCalcKeyword)) {
    return 'calculate';
  }

  if (hasCalcKeyword) {
    return 'calculate';
  }

  // ================================
  // 3. FD RATE
  // ================================
  if (intentKeywords.fd_rate.some(kw => lower.includes(kw))) {
    return 'fd_rate';
  }

  // ================================
  // 4. FD EXPLAIN (🔥 FIXED LOGIC)
  // ================================

  const isFD =
    lower.includes('fd') ||
    lower.includes('fixed deposit');

  const isMeaningQuery =
    lower.includes('what is') ||
    lower.includes('kya hai') ||
    lower.includes('meaning') ||

    // Telugu native + roman
    lower.includes('ante') ||
    lower.includes('enti') ||
    lower.includes('emiti') ||

    // Hindi Roman
    lower.includes('kya') ||
    lower.includes('hai') ||

    // Hindi Native (Devanagari)
    lower.includes('क्या') ||
    lower.includes('है') ||
    lower.includes('होता') ||

    // Telugu Native
    lower.includes('అంటే') ||
    lower.includes('ఏమిటి') ||
    lower.includes('అర్థం');

  if (isFD && isMeaningQuery) {
    return 'fd_explain';
  }

  // Fallback keyword check (keep existing behavior)
  if (intentKeywords.fd_explain.some(kw => lower.includes(kw))) {
    return 'fd_explain';
  }

  return 'unknown';
}

module.exports = { detectIntent };