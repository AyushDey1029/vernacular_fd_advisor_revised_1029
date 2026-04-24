/**
 * openaiService.js (Refactored to use Groq API)
 * Handles communication with the AI models via the OpenAI SDK wrapper.
 */

const OpenAI = require('openai');

let client;
function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("[OpenAI Service] WARNING: GROQ_API_KEY is not set in environment variables.");
    }
    client = new OpenAI({
      apiKey: apiKey || 'MISSING_KEY',
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

/**
 * Fallback response mechanism based on language
 * @param {string} language 
 */
function getFallback(language) {
  if (language === "hi") {
    return "Sorry, abhi thodi dikkat ho rahi hai. Kripya baad mein try karein. (Basic FD: Ek surakshit nivesh jisme guaranteed return milta hai.)";
  }
  return "Sorry, something went wrong. Please try again. (Basic FD: A secure investment that offers guaranteed returns at a fixed interest rate.)";
}

/**
 * Generates a chat response from Groq.
 * @param {string} message - The user's message
 * @param {string} language - Detected language
 * @param {string} intent - Detected intent
 * @param {Array}  history - Previous messages [{role, content}]
 * @param {string} scriptType - Native or Roman script
 * @returns {Promise<string>} - AI-generated response text
 */
async function getChatResponse(message, language = 'english', intent = 'unknown', history = [], scriptType = 'native') {
  try {
    const languageMap = {
      en: "English",
      hi: "Hindi",
      te: "Telugu"
    };

    const selectedLanguage = languageMap[language?.toLowerCase()] || "English";

    const systemPrompt = `
You are a strict Fixed Deposit (FD) Advisor for a banking application. 
Your SOLE PURPOSE is to assist users with Fixed Deposit (FD) related queries.

### 🚫 STRICT PROHIBITIONS:
1. NEVER play games (e.g., Tic Tac Toe, Chess, Riddles).
2. NEVER tell jokes or engage in general entertainment.
3. NEVER answer questions about politics, sports, weather, or general knowledge.
4. If a user asks to "start a game" or "play", you MUST refuse politely and redirect them to FD services.

### ✅ ALLOWED TOPICS:
- Explaining what a Fixed Deposit (FD) is.
- Calculation of FD returns/maturity.
- Providing FD interest rate information.
- Suggesting FD schemes based on user needs.

### 🌐 MULTILINGUAL & SCRIPT RULES:
1. Output MUST be ONLY in ${selectedLanguage}.
2. DO NOT mix any other language.
3. NO English explanations, translations, or "In English:" phrases.
4. SCRIPT: You must use the "${scriptType}" script of ${selectedLanguage}.
5. If scriptType is "roman", use ONLY English alphabet to phonetically write ${selectedLanguage}.
6. If scriptType is "native", use ONLY the native script characters of ${selectedLanguage}.

### CONTEXT:
The user is asking: "${message}"
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-4),
      { role: "user", content: message }
    ];

    const response = await getClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      temperature: 0.1, // Lower temperature for more consistent instruction following
    });

    const reply = response.choices[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("Received empty or null response from AI model.");
    }

    return reply;

  } catch (error) {
    console.error(`[Groq API Error] Failed to fetch response:`, error.message);
    return getFallback(language);
  }
}

module.exports = { getChatResponse, getFallback };
