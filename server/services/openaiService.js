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

    const prompt = `
User question: ${message}

You are a strict Fixed Deposit (FD) Advisor. You ONLY answer questions related to Fixed Deposits.
If the user's question is NOT related to Fixed Deposits, you MUST politely decline to answer, state a formal "No", and explain that you can only assist with FD-related queries.

STRICT OUTPUT RULES (MANDATORY):

1. Output MUST be ONLY in ${selectedLanguage}
2. DO NOT mix any other language
3. DO NOT add English explanations
4. DO NOT translate your answer
5. DO NOT include phrases like:
   - "Translation:"
   - "In English:"
   - "(This means...)"

6. Only allowed English words:
   - "Fixed Deposit (FD)"

7. Keep sentences simple and natural

SCRIPT RULES:
- scriptType = native → use ONLY native script
- scriptType = roman → use ONLY English letters
  (Current selected scriptType: ${scriptType})

STRICT:
- If roman → NO native script characters allowed
- If native → NO English sentences allowed

FAIL CONDITION:
If you mix languages or break rules, the answer is INVALID.

Now answer clearly.
`;

    // Optionally include conversation history if the model supports continuity nicely:
    const messages = [
      ...history.slice(-4), // keep short history
      { role: "user", content: prompt }
    ];

    const response = await getClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
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
