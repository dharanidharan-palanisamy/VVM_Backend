// routes/orders.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { orders } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// GET /api/orders — admin only
router.get('/', authMiddleware, (req, res) => {
  let result = [...orders];
  const { status } = req.query;
  if (status && status !== 'all') result = result.filter(o => o.status === status);
  res.json({ success: true, count: result.length, data: result });
});

// POST /api/orders — admin only
router.post('/', authMiddleware, (req, res) => {
  const { clientName, clientEmail, product, qty, unit, total, address } = req.body;
  if (!clientName || !product) return res.status(400).json({ success: false, message: 'clientName and product are required' });
  const count = orders.length + 1;
  const newOrder = {
    id: `ORD-2025-${String(count).padStart(3, '0')}`,
    clientName, clientEmail: clientEmail || '', product, qty: Number(qty) || 0,
    unit: unit || 'kg', total: Number(total) || 0, address: address || '',
    date: new Date().toISOString().split('T')[0], status: 'Pending',
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', authMiddleware, (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  const { status } = req.body;
  const valid = ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  res.json({ success: true, data: orders[idx] });
});

module.exports = router;
