/**
 * api.js — Frontend API service
 * Handles all HTTP calls to the backend server.
 */

const BASE_URL = 'http://localhost:5000/api';

/**
 * Sends a chat message to the backend and returns the AI response.
 * @param {string} message - User message text
 * @param {Array}  history - Conversation history [{role, content}]
 * @returns {Promise<object>} - { reply, language, intent, calculation }
 */
export async function sendMessage(message, history = [], language = "en", scriptType = "native") {
  const payload = { message, history, language, scriptType };
  console.log('[Frontend API] Sending Request to /api/chat:', payload);

  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Frontend API] Server Error Response:', data);
      throw new Error(data.error || data.reply || 'Failed to get response from server.');
    }

    console.log('[Frontend API] Success Response:', data);
    
    // Ensure we always return a valid reply string safely
    if (!data || !data.reply) {
      data.reply = "No response was generated properly by the server.";
    }
    
    return data;
  } catch (error) {
    console.error('[Frontend API] Network/Parse Error:', error);
    // Enforce graceful degradation by providing a safe fallback object
    return {
      reply: `Connection Error: ${error.message}`,
      intent: 'unknown',
      calculation: null
    };
  }
}

/**
 * Books an FD with given details.
 * @param {object} details - { name, amount, tenureYears, rate? }
 * @returns {Promise<object>} - Booking confirmation
 */
export async function bookFD(details) {
  const response = await fetch(`${BASE_URL}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Booking failed.');
  }

  return response.json();
}

/**
 * Fetches a specific booking by reference number.
 * @param {string} ref - Booking reference number
 * @returns {Promise<object>}
 */
export async function getBooking(ref) {
  const response = await fetch(`${BASE_URL}/booking/${ref}`);
  if (!response.ok) throw new Error('Booking not found.');
  return response.json();
}
