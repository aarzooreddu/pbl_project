const express = require('express');
const router = express.Router();
const DB = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/users — admin only
router.get('/', auth, requireRole('admin'), (req, res) => {
  const users = DB.getAllUsers().map(({ password: _, ...u }) => u);
  res.json(users);
});

// GET /api/users/:id/donations
router.get('/:id/donations', auth, (req, res) => {
  const donations = DB.getAllDonations({ donorId: req.params.id });
  res.json(donations);
});

// GET /api/users/:id/claimed
router.get('/:id/claimed', auth, (req, res) => {
  const all = DB.getAllDonations({});
  const claimed = all.filter(d => d.claimedBy === req.params.id);
  res.json(claimed);
});

// GET /api/users/notifications
router.get('/notifications/mine', auth, (req, res) => {
  res.json(DB.getUserNotifications(req.user.id));
});

// PUT /api/users/notifications/:id/read
router.put('/notifications/:id/read', auth, (req, res) => {
  DB.markNotificationRead(req.params.id);
  res.json({ success: true });
});

module.exports = router;
