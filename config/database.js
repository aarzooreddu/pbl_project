// In-memory database (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');

const db = {
  users: [
    {
      id: 'u1',
      name: 'Priya Sharma',
      email: 'donor@foodsave.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'donor',
      phone: '+91-9876543210',
      address: 'Malviya Nagar, Jaipur',
      city: 'Jaipur',
      verified: true,
      rating: 4.8,
      totalDonations: 23,
      joinedAt: '2024-01-15T00:00:00Z',
      avatar: null
    },
    {
      id: 'u2',
      name: 'Ravi NGO Center',
      email: 'ngo@foodsave.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'recipient',
      phone: '+91-9823456789',
      address: 'Civil Lines, Jaipur',
      city: 'Jaipur',
      verified: true,
      rating: 4.9,
      totalReceived: 45,
      joinedAt: '2023-11-10T00:00:00Z',
      avatar: null
    },
    {
      id: 'u3',
      name: 'Admin User',
      email: 'admin@foodsave.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      phone: '+91-9000000001',
      address: 'Jaipur HQ',
      city: 'Jaipur',
      verified: true,
      joinedAt: '2023-01-01T00:00:00Z',
      avatar: null
    }
  ],
  donations: [
    {
      id: 'd1',
      donorId: 'u1',
      donorName: 'Priya Sharma',
      title: 'Fresh Biryani & Bread',
      description: 'Leftover from wedding function, freshly cooked, still warm',
      category: 'cooked',
      quantity: '15 kg',
      servings: 30,
      expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
      status: 'available',
      images: [],
      address: 'Malviya Nagar, Jaipur',
      city: 'Jaipur',
      lat: 26.8467,
      lng: 75.7494,
      pickupBy: new Date(Date.now() + 6 * 3600000).toISOString(),
      allergens: ['gluten', 'dairy'],
      dietType: 'vegetarian',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      claimedBy: null,
      claimedAt: null,
      completedAt: null
    },
    {
      id: 'd2',
      donorId: 'u1',
      donorName: 'Priya Sharma',
      title: 'Packaged Groceries & Dal',
      description: 'Unopened packets of rice, dal, oil — surplus from event',
      category: 'grocery',
      quantity: '8 kg',
      servings: 20,
      expiresAt: new Date(Date.now() + 72 * 3600000).toISOString(),
      status: 'claimed',
      images: [],
      address: 'Malviya Nagar, Jaipur',
      city: 'Jaipur',
      lat: 26.8467,
      lng: 75.7494,
      pickupBy: new Date(Date.now() + 24 * 3600000).toISOString(),
      allergens: [],
      dietType: 'vegan',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      claimedBy: 'u2',
      claimedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: null
    },
    {
      id: 'd3',
      donorId: 'u1',
      donorName: 'Priya Sharma',
      title: 'Sweets & Snacks',
      description: 'Gulab jamun, ladoos, and namkeen from festival',
      category: 'sweets',
      quantity: '5 kg',
      servings: 40,
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
      images: [],
      address: 'Malviya Nagar, Jaipur',
      city: 'Jaipur',
      lat: 26.8467,
      lng: 75.7494,
      pickupBy: new Date(Date.now() - 7200000).toISOString(),
      allergens: ['dairy', 'nuts'],
      dietType: 'vegetarian',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      claimedBy: 'u2',
      claimedAt: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  claims: [],
  notifications: [],
  reviews: [],
  impactStats: {
    totalFoodSaved: 2340,
    totalDonations: 187,
    totalRecipients: 42,
    totalDonors: 89,
    co2Saved: 4680,
    mealsProvided: 9360
  }
};

// Helper CRUD
const DB = {
  // Users
  findUserByEmail: (email) => db.users.find(u => u.email === email),
  findUserById: (id) => db.users.find(u => u.id === id),
  createUser: (userData) => {
    const user = { id: uuidv4(), ...userData, joinedAt: new Date().toISOString() };
    db.users.push(user);
    return user;
  },
  updateUser: (id, data) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) db.users[idx] = { ...db.users[idx], ...data };
    return db.users[idx];
  },
  getAllUsers: () => db.users,

  // Donations
  getAllDonations: (filters = {}) => {
    let results = [...db.donations];
    if (filters.status) results = results.filter(d => d.status === filters.status);
    if (filters.city) results = results.filter(d => d.city.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.category) results = results.filter(d => d.category === filters.category);
    if (filters.donorId) results = results.filter(d => d.donorId === filters.donorId);
    if (filters.dietType) results = results.filter(d => d.dietType === filters.dietType);
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  findDonationById: (id) => db.donations.find(d => d.id === id),
  createDonation: (data) => {
    const donation = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), claimedBy: null, claimedAt: null, completedAt: null };
    db.donations.push(donation);
    db.impactStats.totalDonations++;
    return donation;
  },
  updateDonation: (id, data) => {
    const idx = db.donations.findIndex(d => d.id === id);
    if (idx !== -1) db.donations[idx] = { ...db.donations[idx], ...data };
    return db.donations[idx];
  },
  deleteDonation: (id) => {
    const idx = db.donations.findIndex(d => d.id === id);
    if (idx !== -1) db.donations.splice(idx, 1);
  },

  // Stats
  getImpactStats: () => ({ ...db.impactStats }),
  updateImpactStats: (delta) => {
    Object.keys(delta).forEach(k => { db.impactStats[k] = (db.impactStats[k] || 0) + delta[k]; });
  },

  // Notifications
  addNotification: (userId, message, type = 'info') => {
    const notif = { id: uuidv4(), userId, message, type, read: false, createdAt: new Date().toISOString() };
    db.notifications.push(notif);
    return notif;
  },
  getUserNotifications: (userId) => db.notifications.filter(n => n.userId === userId),
  markNotificationRead: (id) => {
    const n = db.notifications.find(n => n.id === id);
    if (n) n.read = true;
  }
};

module.exports = DB;
