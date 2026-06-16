// server.js – VVM Traders Backend API
// Node.js + Express.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://vvm-frontend-client.vercel.app',
    'https://vvm-frontend-admin.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VVM Traders API is running', timestamp: new Date().toISOString() });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌶️  VVM Traders API running on http://localhost:${PORT}`);
  console.log(`📋  API endpoints:`);
  console.log(`    GET    /api/health`);
  console.log(`    POST   /api/auth/login`);
  console.log(`    GET    /api/products`);
  console.log(`    POST   /api/enquiries`);
  console.log(`    GET    /api/analytics/summary  (admin)`);
  console.log(`\n🔑  Admin: username=admin  password=admin123\n`);
});

module.exports = app;
