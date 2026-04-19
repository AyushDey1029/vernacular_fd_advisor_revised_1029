/**
 * App.js — Root application entry point (client-side)
 * Initializes the application and mounts the chat page.
 */

import { initChatPage } from './pages/ChatPage.js';

/**
 * Boot the application once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initChatPage();
});
