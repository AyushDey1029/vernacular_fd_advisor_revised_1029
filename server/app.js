/**
 * app.js — Main Express server entry point
 *
 * Vernacular FD Advisor — Backend
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const chatRoutes    = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

// ✅ FIXED CORS (Vercel + Local + No crashes)
app.use(cors({
  origin: true, // Allow all origins dynamically
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Parse incoming JSON bodies
app.use(express.json());

// Request logger (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/chat',     chatRoutes);
app.use('/api/booking',  bookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/suggestion', suggestionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Vernacular FD Advisor API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server (Only local, NOT Vercel) ─────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Groq API: ${process.env.GROQ_API_KEY ? 'Loaded' : 'Missing'}`);
  });
}

module.exports = app;