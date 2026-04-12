const express = require('express');
const router = express.Router();
const DB = require('../config/database');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/donations — list with filters
router.get('/', (req, res) => {
  try {
    const { status, city, category, dietType } = req.query;
    const donations = DB.getAllDonations({ status, city, category, dietType });
    // Mark expired donations
    const now = new Date();
    donations.forEach(d => {
      if (d.status === 'available' && new Date(d.expiresAt) < now) {
        DB.updateDonation(d.id, { status: 'expired' });
        d.status = 'expired';
      }
    });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// GET /api/donations/stats
router.get('/stats', (req, res) => {
  res.json(DB.getImpactStats());
});

// GET /api/donations/:id
router.get('/:id', (req, res) => {
  const donation = DB.findDonationById(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });
  res.json(donation);
});

// POST /api/donations — create donation (donors only)
router.post('/', auth, requireRole('donor', 'admin'), (req, res) => {
  try {
    const {
      title, description, category, quantity, servings,
      expiresAt, address, city, lat, lng, pickupBy,
      allergens, dietType
    } = req.body;

    if (!title || !category || !quantity || !expiresAt) {
      return res.status(400).json({ error: 'Title, category, quantity, and expiry are required' });
    }

    const donation = DB.createDonation({
      donorId: req.user.id,
      donorName: req.user.name,
      title, description: description || '',
      category, quantity,
      servings: servings || 1,
      expiresAt,
      status: 'available',
      images: [],
      address: address || req.user.address,
      city: city || req.user.city,
      lat: lat || 26.9124,
      lng: lng || 75.7873,
      pickupBy: pickupBy || expiresAt,
      allergens: allergens || [],
      dietType: dietType || 'vegetarian'
    });

    // Update stats
    DB.updateImpactStats({
      totalFoodSaved: parseInt(quantity) || 1,
      mealsProvided: donation.servings
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// PUT /api/donations/:id — update donation
router.put('/:id', auth, (req, res) => {
  try {
    const donation = DB.findDonationById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.donorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'Cannot edit a claimed or completed donation' });
    }
    const updated = DB.updateDonation(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/donations/:id
router.delete('/:id', auth, (req, res) => {
  const donation = DB.findDonationById(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });
  if (donation.donorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  DB.deleteDonation(req.params.id);
  res.json({ message: 'Donation deleted' });
});

// POST /api/donations/:id/claim — claim donation (recipients only)
router.post('/:id/claim', auth, requireRole('recipient', 'admin'), (req, res) => {
  try {
    const donation = DB.findDonationById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'Donation is not available' });
    }
    if (new Date(donation.expiresAt) < new Date()) {
      DB.updateDonation(req.params.id, { status: 'expired' });
      return res.status(400).json({ error: 'Donation has expired' });
    }

    const updated = DB.updateDonation(req.params.id, {
      status: 'claimed',
      claimedBy: req.user.id,
      claimedAt: new Date().toISOString()
    });

    // Notify donor
    DB.addNotification(donation.donorId,
      `Your donation "${donation.title}" has been claimed by ${req.user.name}!`, 'success');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Claim failed' });
  }
});

// POST /api/donations/:id/complete
router.post('/:id/complete', auth, (req, res) => {
  try {
    const donation = DB.findDonationById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.status !== 'claimed') {
      return res.status(400).json({ error: 'Donation is not in claimed state' });
    }
    if (donation.donorId !== req.user.id && donation.claimedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = DB.updateDonation(req.params.id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    DB.updateImpactStats({ co2Saved: donation.servings * 0.5 });
    DB.addNotification(donation.claimedBy,
      `Pickup of "${donation.title}" marked complete. Thank you!`, 'success');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Complete failed' });
  }
});

module.exports = router;
