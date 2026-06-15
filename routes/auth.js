// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { admins } = require('../data/store');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  const admin = admins.find(a => a.username === username);
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, admin: { id: admin.id, username: admin.username, name: admin.name, role: admin.role } });
});

// GET /api/auth/me — verify token
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
