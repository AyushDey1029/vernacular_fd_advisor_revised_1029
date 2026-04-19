const fs = require('fs');
const path = require('path');

/**
 * Basic transliteration mapping for static strings.
 */
const romanMap = {
  hi: {
    "फिक्स्ड डिपॉज़िट (FD) एक सुरक्षित निवेश है जिसमें आप अपना पैसा एक निश्चित समय के लिए रखते हैं और उस पर ब्याज मिलता है।": "Fixed Deposit (FD) ek surakshit nivesh hai jisme app paisa ek nishchit samay ke liye rakhte hain aur byaaj milta hai.",
    "कृपया राशि, ब्याज दर और समय बताएं (जैसे ₹50000, 2 साल, 7%)": "Kripaya rashi, byaaj dar aur samay batayein (jaise ₹50000, 2 saal, 7%)",
    "माफ़ कीजिए, कुछ समस्या हो गई है।": "Maaf kijiye, kuch samasya ho gayi hai.",
    "FD परिणाम:": "FD Parinam:",
    "मूल राशि:": "Mool Rashi:",
    "ब्याज दर:": "Byaaj Dar:",
    "समय:": "Samay:",
    "साल": "saal",
    "ब्याज:": "Byaaj:",
    "कुल राशि:": "Kul Rashi:",
    "FD शुरू करने के लिए, कृपया हमारी नजदीकी शाखा पर जाएँ या हमारे मोबाइल ऐप में 'Book FD' विकल्प का उपयोग करें।": "FD shuru karne ke liye, kripaya hamari najdiki shakha par jayein ya hamare mobile app mein 'Book FD' vikalp ka upyog karein.",
    "हमारी वर्तमान FD ब्याज दरें आम नागरिकों के लिए 7.5% और वरिष्ठ नागरिकों के लिए 8.0% तक हैं।": "Hamari vartaman FD byaaj darein aam nagrikon ke liye 7.5% aur varishth nagrikon ke liye 8.0% tak hain."
  },
  te: {
    "Fixed Deposit (FD) ఒక సురక్షితమైన పెట్టుబడి, ఇక్కడ మీరు నిర్దిష్ట సమయానికి డబ్బును ఉంచి వడ్డీని పొందుతారు.": "Fixed Deposit (FD) oka surakshitamaina pettubadi, ikkada meeru nirdishta samayaniki dabbunu unchi vaddini pondutaru.",
    "దయచేసి మొత్తం, వడ్డీ మరియు కాలం చెప్పండి": "Dayachesi mottam, vaddi mariyu kaalam cheppandi",
    "క్షమించండి, సమస్య వచ్చింది.": "Kshaminchandi, samasya vachindi.",
    "FD లెక్క:": "FD Lekka:",
    "మూలధనం:": "Mooladhanam:",
    "వడ్డీ:": "Vaddi:",
    "కాలం:": "Kaalam:",
    "సంవత్సరాలు": "samvatsaralu",
    "మొత్తం:": "Mottham:",
    "FD ప్రారంభించడానికి, దయచేసి మా సమీప శాఖను సందర్శించండి లేదా మా మొబైల్ యాప్‌లో 'Book FD' ఎంపికను ఉపయోగించండి.": "FD prarambhinchadaniki, dayachesi ma sameepa shakhanu sandarsinchandi leda ma mobile app lo 'Book FD' empika nu upayoginchandi.",
    "మా ప్రస్తుత FD వడ్డీ రేట్లు సాధారణ పౌరులకు 7.5% మరియు సీనియర్ సిటిజన్లకు 8.0% వరకు ఉన్నాయి.": "Ma prastuta FD vaddi retlu sadharana pourulaku 7.5% mariyu senior citizen laku 8.0% varaku unnayi."
  }
};

/**
 * Replace occurrences iteratively if not a full string match.
 */
function transliterate(text, language) {
  if (language === 'en') return text;
  
  const map = romanMap[language];
  if (!map) return text;
  
  // Exact match first
  if (map[text]) return map[text];

  // Try replacing parts (useful for generated templates)
  let romanized = text;
  for (const [native, roman] of Object.entries(map)) {
    romanized = romanized.split(native).join(roman);
  }
  
  return romanized;
}

/**
 * Returns text appropriately formatted based on the script requested.
 */
function formatScript(text, scriptType, language) {
  if (scriptType === "roman") {
    return transliterate(text, language);
  }
  return text;
}

/**
 * Fetches JSON translation file.
 */
function getTranslator(language) {
  const defaultLang = 'en';
  let i18nPath = path.join(__dirname, '..', 'i18n', `${language}.json`);
  
  if (!fs.existsSync(i18nPath)) {
    console.warn(`[i18n Warning] Missing dictionary for: ${language}. Falling back to default.`);
    i18nPath = path.join(__dirname, '..', 'i18n', `${defaultLang}.json`);
  }

  const translations = require(i18nPath);

  // Return an accessor function
  return (key, variables = {}) => {
    let str = translations[key] || translations["fallback"] || "Unknown key";
    
    // Inject dynamic variables {p}, {rate}, etc.
    for (const [k, v] of Object.entries(variables)) {
      str = str.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    
    return str;
  };
}

module.exports = {
  getTranslator,
  formatScript
};
