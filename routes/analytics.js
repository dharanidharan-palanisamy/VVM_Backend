// routes/analytics.js
const express = require('express');
const router = express.Router();
const { products, enquiries, orders } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// GET /api/analytics/summary — admin only
router.get('/summary', authMiddleware, (req, res) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const summary = {
    totalProducts: products.length,
    totalEnquiries: enquiries.length,
    totalOrders: orders.length,
    totalRevenue,
    pendingEnquiries: enquiries.filter(e => e.status === 'Pending').length,
    inProgressEnquiries: enquiries.filter(e => e.status === 'In Progress').length,
    repliedEnquiries: enquiries.filter(e => e.status === 'Replied').length,
    inStockProducts: products.filter(p => p.stock === 'In Stock').length,
    limitedProducts: products.filter(p => p.stock === 'Limited').length,
    outOfStockProducts: products.filter(p => p.stock === 'Out of Stock').length,
    productsByCategory: {
      powder: products.filter(p => p.cat === 'powder').length,
      whole: products.filter(p => p.cat === 'whole').length,
      seed: products.filter(p => p.cat === 'seed').length,
      blend: products.filter(p => p.cat === 'blend').length,
    },
    ordersByStatus: {
      Pending: orders.filter(o => o.status === 'Pending').length,
      Processing: orders.filter(o => o.status === 'Processing').length,
      'In Transit': orders.filter(o => o.status === 'In Transit').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length,
    },
    recentEnquiries: enquiries.slice(0, 5),
    recentOrders: orders.slice(0, 5),
    monthlyEnquiries: [
      { month: 'Jan', count: 8 }, { month: 'Feb', count: 12 }, { month: 'Mar', count: 15 },
      { month: 'Apr', count: 11 }, { month: 'May', count: 18 }, { month: 'Jun', count: enquiries.length },
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 62000 }, { month: 'Mar', revenue: 78000 },
      { month: 'Apr', revenue: 55000 }, { month: 'May', revenue: 91000 }, { month: 'Jun', revenue: totalRevenue },
    ],
  };
  res.json({ success: true, data: summary });
});

module.exports = router;
