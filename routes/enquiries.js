// routes/enquiries.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { enquiries } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// POST /api/enquiries — public (client website form submission)
router.post('/', (req, res) => {
  const { name, company, email, phone, product, message } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: 'name and email are required' });
  const newEnquiry = {
    id: uuidv4(), name, company: company || '', email, phone: phone || '',
    product: product || '', message: message || '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  enquiries.unshift(newEnquiry);
  res.status(201).json({ success: true, data: newEnquiry, message: 'Enquiry submitted successfully' });
});

// GET /api/enquiries — admin only, supports ?status=&search=
router.get('/', authMiddleware, (req, res) => {
  let result = [...enquiries];
  const { status, search } = req.query;
  if (status && status !== 'all') result = result.filter(e => e.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.product.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/enquiries/:id — admin only
router.get('/:id', authMiddleware, (req, res) => {
  const enq = enquiries.find(e => e.id === req.params.id);
  if (!enq) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  res.json({ success: true, data: enq });
});

// PATCH /api/enquiries/:id/status — admin only
router.patch('/:id/status', authMiddleware, (req, res) => {
  const idx = enquiries.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  const { status } = req.body;
  const valid = ['Pending', 'In Progress', 'Replied'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  enquiries[idx].status = status;
  enquiries[idx].updatedAt = new Date().toISOString();
  res.json({ success: true, data: enquiries[idx] });
});

// DELETE /api/enquiries/:id — admin only
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = enquiries.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  enquiries.splice(idx, 1);
  res.json({ success: true, message: 'Enquiry deleted' });
});

module.exports = router;
