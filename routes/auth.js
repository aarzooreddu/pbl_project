const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DB = require('../config/database');
const { auth, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }
    if (!['donor', 'recipient'].includes(role)) {
      return res.status(400).json({ error: 'Role must be donor or recipient' });
    }
    const existing = DB.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = DB.createUser({
      name, email,
      password: hashedPassword,
      role, phone: phone || '',
      address: address || '',
      city: city || 'Jaipur',
      verified: false,
      rating: 0,
      totalDonations: 0,
      totalReceived: 0,
      avatar: null
    });

    // Update stats
    if (role === 'donor') DB.updateImpactStats({ totalDonors: 1 });
    else DB.updateImpactStats({ totalRecipients: 1 });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = DB.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const { password: _, ...userSafe } = req.user;
  res.json(userSafe);
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;
    const updated = DB.updateUser(req.user.id, { name, phone, address, city });
    const { password: _, ...userSafe } = updated;
    res.json(userSafe);
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;
