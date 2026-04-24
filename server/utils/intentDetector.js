/**
 * intentDetector.js
 * Detects user intent using keyword + pattern matching across multiple languages.
 */

// Intent keyword map — multi-language keywords for each intent
const intentKeywords = {
  fd_start: [
    /start.*fd/i, /open.*fd/i, /fd.*shuru/i, /fd.*start/i,
    /invest/i, /new.*fd/i, /create.*fd/i, /fd.*book/i,
    // Telugu Roman
    /fd.*modalu/i, /modalu.*pettu/i, /fd.*start/i,
    // Hindi Native (Devanagari)
    /fd.*शुरू/i, /fd.*खोलें/i, /fd.*खोलो/i, /निवेश/i,
    // Telugu Native
    /fd.*ప్రారంభించు/i, /fd.*పెట్టు/i, /పెట్టుబడి/i
  ],

  calculate: [
    'calculate', 'maturity', 'returns', 'how much',
    'kitna milega', 'hisab', 'hisab karein',
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
    'what is fixed deposit', 'tell me about fd', 'details of fd',
    // Telugu Roman
    'fd ante emiti', 'fd enti', 'fd meaning',
    // Hindi Native (Devanagari)
    'fd क्या है', 'fd क्या होता है', 'फिक्स्ड डिपॉजिट क्या',
    // Telugu Native
    'fd అంటే ఏమిటి', 'fd అంటే', 'fd యొక్క అర్థం', 'fd ఏమిటి'
  ],

  fd_suggestion: [
    'suggest', 'recommend', 'best scheme', 'which fd is good', 'best bank',
    'kaun sa achha hai', 'salla', 'mashwara', 'vikalp', 'best scheme',
    // Telugu Roman
    'edi manchidi', 'best bank edi', 'suggestion kavali', 'suchana',
    // Hindi Roman
    'sujhav', 'kaunsa best', 'best scheme',
    // Hindi Native
    'सुझाव', 'सबसे अच्छा', 'बेस्ट', 'अच्छी स्कीम',
    // Telugu Native
    'సూచన', 'ఏది మంచిది', 'బెస్ట్ బ్యాంక్'
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

  // 1. FD SUGGESTION (High Priority if specific keywords found)
  const bankNames = ['sbi', 'hdfc', 'icici', 'axis', 'bob', 'pnb', 'canara'];
  const mentionsBank = bankNames.some(bank => lower.includes(bank));

  const isSuggestionQuery = 
    lower.includes('best bank') || 
    lower.includes('vs') || 
    lower.includes('compare') ||
    mentionsBank ||
    (lower.includes('suggest') && !lower.includes('calculate'));

  if (isSuggestionQuery || intentKeywords.fd_suggestion.some(kw => 
    typeof kw === 'string' ? lower.includes(kw) : kw.test(lower)
  )) {
    return 'fd_suggestion';
  }

  // 2. FD RATE (High Priority if "rate" mentioned without data)
  if (intentKeywords.fd_rate.some(kw => typeof kw === 'string' ? lower.includes(kw) : kw.test(lower))) {
    // Only return fd_rate if it's not a calculation request with data
    if (!/\d+/.test(lower)) return 'fd_rate';
  }

  // 3. CALCULATE (Action-Oriented)
  const hasNumbers = /\d+/.test(lower);
  const hasCalcKeyword = intentKeywords.calculate.some(kw => 
    typeof kw === 'string' ? lower.includes(kw) : kw.test(lower)
  );

  const mentionsCalcContext =
    lower.includes('%') ||
    lower.includes('year') ||
    lower.includes('month') ||
    lower.includes('lakh') ||
    lower.includes('lac') ||
    lower.includes('saal') ||
    lower.includes('mahina') ||
    lower.includes('nela') ||
    lower.includes('samvatsaram') ||
    lower.includes('vaddi') ||
    // Hindi Native
    lower.includes('साल') ||
    lower.includes('लाख') ||
    lower.includes('ब्याज');

  // Safety check for off-topic mixing: if the sentence is very long and contains non-FD words
  const isTooLong = lower.split(' ').length > 15;
  const hasOffTopicHints = lower.includes('pasta') || lower.includes('joke') || lower.includes('weather') || lower.includes('how to make');

  // TRIGGER CALCULATE ONLY IF:
  // - It has a calculate keyword OR
  // - It has numbers AND a context word AND it's NOT a long off-topic sentence
  if (hasCalcKeyword || (hasNumbers && mentionsCalcContext)) {
    if (hasOffTopicHints) return 'unknown';

    // Exclusion: "What is the interest rate for 1 year" -> fd_rate
    if (lower.includes('what is') || lower.includes('kya hai') || lower.includes('enti')) {
       if (lower.includes('rate') || lower.includes('dar') || lower.includes('vaddi')) return 'fd_rate';
    }
    return 'calculate';
  }

  // 4. FD START
  if (intentKeywords.fd_start.some(kw => typeof kw === 'string' ? lower.includes(kw) : kw.test(lower))) {
    return 'fd_start';
  }

  // 5. FD EXPLAIN
  const isFD = lower.includes('fd') || lower.includes('fixed deposit');
  const isMeaningQuery =
    lower.includes('what is') || lower.includes('kya hai') || 
    lower.includes('meaning') || lower.includes('tell me') || 
    lower.includes('about') || lower.includes('details') ||
    lower.includes('ante') || lower.includes('enti');

  if ((isFD && isMeaningQuery) || intentKeywords.fd_explain.some(kw => 
    typeof kw === 'string' ? lower.includes(kw) : kw.test(lower)
  )) {
    return 'fd_explain';
  }

  return 'unknown';
}


module.exports = { detectIntent };