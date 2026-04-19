/**
 * Message.js — Chat message bubble component
 * Renders a single message bubble for 'user' or 'bot'.
 * Supports markdown-like bold (**text**) and newlines.
 */

/**
 * Creates a message bubble DOM element.
 * @param {string} text - Message text (supports **bold** and \n)
 * @param {'user'|'bot'} role - Who sent the message
 * @returns {HTMLElement}
 */
export function renderMessage(text, role) {
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${role}`;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${role}`;

  // Parse simple markdown: **bold** → <strong> and \n → <br>
  bubble.innerHTML = parseMarkdown(text);

  // Avatar for bot
  if (role === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'bot-msg-avatar';
    avatar.textContent = '🏦';
    wrapper.appendChild(avatar);
  }

  wrapper.appendChild(bubble);

  // Timestamp
  const time = document.createElement('span');
  time.className = 'message-time';
  time.textContent = formatTime(new Date());
  wrapper.appendChild(time);

  return wrapper;
}

/** Converts **bold** and newlines to HTML */
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/** Formats a date to HH:MM */
function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
