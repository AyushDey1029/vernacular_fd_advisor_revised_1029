/**
 * app.js — Main Express server entry point
 *
 * Vernacular FD Advisor — Backend
 * --------------------------------
 * A multilingual chatbot backend for Fixed Deposit guidance.
 *
 * Routes:
 *   POST /api/chat         — Chat with the FD advisor
 *   POST /api/booking      — Book an FD (mock)
 *   GET  /api/booking/:ref — Get booking by reference
 *   GET  /api/bookings     — List all bookings
 *   GET  /api/health       — Health check
 */

require('dotenv').config(); // Load .env variables

const express = require('express');
const cors    = require('cors');

const chatRoutes    = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

// Allow all origins in development. Restrict in production.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

// Parse incoming JSON bodies
app.use(express.json());

// Request logger (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/chat',     chatRoutes);
app.use('/api/booking',  bookingRoutes);
app.use('/api/bookings', bookingRoutes); // alias for list endpoint

// Health check — useful for deployment monitoring
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Vernacular FD Advisor API', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Vernacular FD Advisor API running on http://localhost:${PORT}`);
  console.log(`   Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ NOT SET — add to .env'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
