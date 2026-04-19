/**
 * ChatPage.js — Main chat page component
 * 
 * Manages:
 *  - Full conversation state
 *  - Booking flow state machine
 *  - Rendering message list, quick buttons, typing indicator
 */

import { sendMessage, bookFD } from '../services/api.js';
import { renderMessage }       from '../components/Message.js';
import { renderCalcCard }      from '../components/CalcCard.js';
import { renderBookingCard }   from '../components/BookingCard.js';
import { translations }        from '../utils/translations.js';

// ── App State ────────────────────────────────────────────────────────────────
let currentLanguage = 'en';
let currentScript = 'native';
let bookingState  = null;
let bookingData   = {};
let conversationHistory = [];

const langMap = { en: 'english', hi: 'hindi', te: 'telugu', english: 'english', hindi: 'hindi', telugu: 'telugu' };

/**
 * Initializes the app — initially shows language screen
 */
export function initChatPage() {
  const app = document.getElementById('app');
  app.innerHTML = getLanguageScreenHTML();

  // Attach language selection listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.dataset.lang;
      if (lang === 'en' || lang === 'english') {
        currentLanguage = 'en';
        currentScript = 'native'; // English has no roman step
        startChatInterface();
      } else {
        selectedLanguageStep(lang);
      }
    });
  });
}

function selectedLanguageStep(langCode) {
  currentLanguage = langCode;
  const app = document.getElementById('app');
  app.innerHTML = getScriptScreenHTML(langCode);
  
  // Attach script selection listeners
  document.querySelectorAll('.script-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentScript = e.target.dataset.script;
      startChatInterface();
    });
  });
}

function startChatInterface() {
  // Reset the chat completely
  conversationHistory = [];
  bookingState = null;
  bookingData = {};

  const app = document.getElementById('app');
  app.innerHTML = getChatPageHTML(currentLanguage, currentScript);

  // Attach chat event listeners
  document.getElementById('send-btn').addEventListener('click', handleSend);
  document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.message;
      handleUserMessage(text);
    });
  });
  
  // Change Language button
  document.getElementById('change-lang-btn').addEventListener('click', () => {
    initChatPage();
  });

  // Show welcome message translated
  const mappedLang = langMap[currentLanguage] || 'english';
  const langTranslations = translations[mappedLang] || translations['english'];
  const scriptTranslations = langTranslations[currentScript] || langTranslations['native'];
  appendBotMessage(scriptTranslations.welcome);
}

// ── Message Handlers ──────────────────────────────────────────────────────────

async function handleSend() {
  const input = document.getElementById('user-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  await handleUserMessage(text);
}

async function handleUserMessage(text) {
  appendUserMessage(text);
  showTypingIndicator();

  try {
    // Booking flow intercept
    if (bookingState) {
      await handleBookingFlow(text);
    } else {
      await handleAIResponse(text);
    }
  } catch (err) {
    hideTypingIndicator();
    appendBotMessage(`⚠️ ${err.message || 'Something went wrong. Please try again.'}`);
  }
}

/** Sends message to backend and renders response */
async function handleAIResponse(text) {
  // Ensure strict fallback correctly uses the persisted language/scriptType state
  const lang = currentLanguage || 'en';
  const scriptType = currentScript || 'native';
  
  console.log("Sending:", { message: text, language: lang, scriptType });
  const data = await sendMessage(text, conversationHistory, lang, scriptType);
  hideTypingIndicator();

  // Update conversation history for context
  conversationHistory.push({ role: 'user',      content: text });
  conversationHistory.push({ role: 'assistant', content: data.reply });

  // If a calculation was returned, show a rich card
  if (data.calculation) {
    appendBotMessage(data.reply, data.calculation);
  } else {
    appendBotMessage(data.reply);
  }

  // If intent was 'book_fd', automatically start booking flow
  if (data.intent === 'book_fd' && !bookingState) {
    setTimeout(() => startBookingFlow(), 800);
  }
}

// ── Booking Flow ──────────────────────────────────────────────────────────────
function startBookingFlow() {
  bookingState = 'ask_name';
  bookingData  = {};
  appendBotMessage('📋 Let\'s start your FD booking!\n\nFirst, please enter your **full name**:');
}

async function handleBookingFlow(text) {
  hideTypingIndicator();

  switch (bookingState) {
    case 'ask_name':
      bookingData.name  = text;
      bookingState      = 'ask_amount';
      appendBotMessage(`Great, ${text}! 👍\n\nHow much would you like to deposit? (e.g., ₹50,000 or 1 lakh)`);
      break;

    case 'ask_amount': {
      const rawAmount = parseIndianAmount(text);
      if (!rawAmount || rawAmount < 1000) {
        appendBotMessage('Please enter a valid amount (minimum ₹1,000). For example: ₹50000 or 1 lakh');
        return;
      }
      bookingData.amount = rawAmount;
      bookingState       = 'ask_tenure';
      appendBotMessage(`Amount noted: **₹${rawAmount.toLocaleString('en-IN')}** 👍\n\nFor how long? (e.g., 1 year, 2 years, 18 months)`);
      break;
    }

    case 'ask_tenure': {
      const tenureYears = parseTenureText(text);
      bookingData.tenureYears = tenureYears;
      bookingState = 'confirm';

      // Create the booking
      try {
        const result = await bookFD(bookingData);
        hideTypingIndicator();
        showBookingConfirmation(result.booking);
        bookingState = null;
        bookingData  = {};
      } catch (err) {
        appendBotMessage(`❌ Booking failed: ${err.message}`);
        bookingState = null;
      }
      break;
    }

    default:
      bookingState = null;
      await handleAIResponse(text);
  }
}

function showBookingConfirmation(booking) {
  const card = renderBookingCard(booking);
  document.getElementById('messages').appendChild(card);
  scrollToBottom();
}

// ── DOM Helpers ───────────────────────────────────────────────────────────────
function appendUserMessage(text) {
  const msgs = document.getElementById('messages');
  msgs.appendChild(renderMessage(text, 'user'));
  scrollToBottom();
}

function appendBotMessage(text, calculation = null) {
  hideTypingIndicator();
  const msgs = document.getElementById('messages');
  msgs.appendChild(renderMessage(text, 'bot'));

  if (calculation) {
    msgs.appendChild(renderCalcCard(calculation));
  }

  scrollToBottom();
}

function showTypingIndicator() {
  const existing = document.getElementById('typing-indicator');
  if (existing) return;

  const indicator = document.createElement('div');
  indicator.id        = 'typing-indicator';
  indicator.className = 'typing-indicator';
  indicator.innerHTML = `<span></span><span></span><span></span>`;
  document.getElementById('messages').appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function scrollToBottom() {
  const msgs = document.getElementById('messages');
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Pure Parsers ──────────────────────────────────────────────────────────────
function parseIndianAmount(text) {
  const lower = text.toLowerCase().replace(/,/g, '');
  const lakh  = lower.match(/(\d+\.?\d*)\s*lakh/);
  if (lakh)  return parseFloat(lakh[1]) * 100000;
  const k    = lower.match(/(\d+\.?\d*)\s*k/);
  if (k)     return parseFloat(k[1]) * 1000;
  const num  = lower.match(/\d+\.?\d*/);
  if (num)   return parseFloat(num[0]);
  return null;
}

function parseTenureText(text) {
  const lower = text.toLowerCase();
  const months = lower.match(/(\d+)\s*month/);
  if (months) return parseFloat(months[1]) / 12;
  const years  = lower.match(/(\d+\.?\d*)\s*year/);
  if (years)  return parseFloat(years[1]);
  const num   = lower.match(/\d+\.?\d*/);
  if (num)    return parseFloat(num[0]);
  return 1;
}

// ── Templates ─────────────────────────────────────────────────────────────────

function getLanguageScreenHTML() {
  return `
    <div class="chat-container">
      <div class="lang-screen">
        <div class="bot-avatar" style="margin: 0 auto 20px auto; width: 70px; height: 70px; font-size: 32px;">🏦</div>
        <div class="lang-title">Please select your preferred language<br><span style="font-size:16px; color: var(--text-secondary); font-weight: 400; margin-top: 5px; display: block;">Kripya apni bhasha chunein</span></div>
        <div class="lang-buttons">
          <button class="lang-btn" data-lang="en">English</button>
          <button class="lang-btn" data-lang="hi">हिंदी (Hindi)</button>
          <button class="lang-btn" data-lang="te">తెలుగు (Telugu)</button>
        </div>
      </div>
    </div>
  `;
}

function getScriptScreenHTML(langCode) {
  let nativeLabel = '';
  let romanLabel = '';
  
  if (langCode === 'hi' || langCode === 'hindi') {
    nativeLabel = 'हिंदी (Native Script)';
    romanLabel = 'Hinglish (English Letters)';
  } else if (langCode === 'te' || langCode === 'telugu') {
    nativeLabel = 'తెలుగు (Native Script)';
    romanLabel = 'Telglish (English Letters)';
  }

  return `
    <div class="chat-container">
      <div class="lang-screen">
        <div class="bot-avatar" style="margin: 0 auto 20px auto; width: 70px; height: 70px; font-size: 32px;">🏦</div>
        <div class="lang-title">How would you like to read this language?</div>
        <div class="lang-buttons">
          <button class="lang-btn script-btn" data-script="native">${nativeLabel}</button>
          <button class="lang-btn script-btn" data-script="roman">${romanLabel}</button>
        </div>
        <button id="change-lang-btn" class="change-lang-btn" style="margin: 30px auto 0 auto;" onclick="document.dispatchEvent(new Event('DOMContentLoaded'))">🔙 Go Back</button>
      </div>
    </div>
  `;
}

function getChatPageHTML(langCode, scriptCode) {
  const mappedLang = langMap[langCode] || 'english';
  const langTranslations = translations[mappedLang] || translations.english;
  const t = langTranslations[scriptCode] || langTranslations.native;
  
  // Format the language/script tag in header
  const badgeLabel = mappedLang.charAt(0).toUpperCase() + mappedLang.slice(1) + (scriptCode === 'roman' ? ' (' + scriptCode + ')' : '');
  
  return `
    <div class="chat-container">
      <header class="chat-header">
        <div class="header-left">
          <div class="bot-avatar">🏦</div>
          <div>
            <h1 class="header-title">FD Advisor</h1>
            <span class="header-subtitle">🟢 Online • ${badgeLabel}</span>
          </div>
        </div>
        <button id="change-lang-btn" class="change-lang-btn">${t.changeLang}</button>
      </header>

      <main id="messages" class="messages-list" role="log" aria-live="polite"></main>

      <div class="quick-actions" id="quick-actions">
        <button class="quick-btn" id="btn-what-fd"    data-message="${t.btnWhatFd}">${t.btnWhatFd}</button>
        <button class="quick-btn" id="btn-interest"   data-message="${t.btnInterest}">${t.btnInterest}</button>
        <button class="quick-btn" id="btn-calculate"  data-message="${t.btnCalculate}">${t.btnCalculate}</button>
        <button class="quick-btn" id="btn-book"       data-message="${t.btnBook}">${t.btnBook}</button>
      </div>

      <footer class="chat-input-area">
        <textarea
          id="user-input"
          class="chat-input"
          placeholder="${t.placeholder}"
          rows="1"
          aria-label="Chat input"
        ></textarea>
        <button id="send-btn" class="send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </footer>
    </div>
  `;
}
