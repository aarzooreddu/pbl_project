// FoodSave API Client
const API_BASE = 'http://localhost:3001/api';

const api = {
  getToken: () => localStorage.getItem('fs_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('fs_user')); } catch { return null; } },
  setAuth: (token, user) => { localStorage.setItem('fs_token', token); localStorage.setItem('fs_user', JSON.stringify(user)); },
  clearAuth: () => { localStorage.removeItem('fs_token'); localStorage.removeItem('fs_user'); },
  isLoggedIn: () => !!localStorage.getItem('fs_token'),

  request: async (method, path, body = null) => {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const token = api.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // Auth
  login: (email, password) => api.request('POST', '/auth/login', { email, password }),
  register: (data) => api.request('POST', '/auth/register', data),
  me: () => api.request('GET', '/auth/me'),
  updateProfile: (data) => api.request('PUT', '/auth/profile', data),

  // Donations
  getDonations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.request('GET', `/donations${q ? '?' + q : ''}`);
  },
  getDonation: (id) => api.request('GET', `/donations/${id}`),
  createDonation: (data) => api.request('POST', '/donations', data),
  updateDonation: (id, data) => api.request('PUT', `/donations/${id}`, data),
  deleteDonation: (id) => api.request('DELETE', `/donations/${id}`),
  claimDonation: (id) => api.request('POST', `/donations/${id}/claim`),
  completeDonation: (id) => api.request('POST', `/donations/${id}/complete`),
  getStats: () => api.request('GET', '/donations/stats'),

  // Users
  getMyDonations: () => api.request('GET', `/users/${api.getUser()?.id}/donations`),
  getMyClaimed: () => api.request('GET', `/users/${api.getUser()?.id}/claimed`),
  getNotifications: () => api.request('GET', '/users/notifications/mine'),
};

// Toast notifications
const toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'default', duration = 3500) {
    this.init();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', default: 'ℹ️' };
    t.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
    this.container.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }
};

// Utility helpers
const utils = {
  timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  },
  timeUntil(dateStr) {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m left`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h left`;
    return `${Math.floor(h / 24)}d left`;
  },
  categoryEmoji(cat) {
    const map = { cooked: '🍛', grocery: '🛒', bakery: '🥖', fruits: '🍎', sweets: '🍬', beverages: '🥤', other: '🍽️' };
    return map[cat] || '🍽️';
  },
  dietBadge(diet) {
    const map = { vegetarian: '🟢 Veg', vegan: '🌿 Vegan', 'non-vegetarian': '🔴 Non-Veg', 'jain': '⬜ Jain' };
    return map[diet] || diet;
  },
  createDonationCard(d, showClaimBtn = false) {
    const timeLeft = utils.timeUntil(d.expiresAt);
    const expired = timeLeft === 'Expired';
    const statusColors = { available: 'status-available', claimed: 'status-claimed', completed: 'status-completed', expired: 'status-expired' };
    return `
      <div class="donation-card" onclick="window.location='pages/donation-detail.html?id=${d.id}'">
        <div class="card-img">
          ${utils.categoryEmoji(d.category)}
          <span class="card-status ${statusColors[d.status] || ''}">${d.status.toUpperCase()}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${d.title}</div>
          <div class="card-meta">
            <span>📦 ${d.quantity}</span>
            <span>🍽️ ~${d.servings} servings</span>
            <span>📍 ${d.city}</span>
          </div>
          <div class="card-desc">${d.description || 'No description provided.'}</div>
          <div style="font-size:0.8rem;color:var(--ink-40)">${utils.dietBadge(d.dietType)} · Posted ${utils.timeAgo(d.createdAt)}</div>
        </div>
        <div class="card-footer">
          <span class="card-expiry ${!expired && d.status === 'available' ? 'ok' : ''}">${timeLeft}</span>
          ${showClaimBtn && d.status === 'available' && !expired
            ? `<button class="btn-claim" onclick="event.stopPropagation();handleClaim('${d.id}')">Claim →</button>`
            : `<span style="font-size:0.8rem;color:var(--ink-40)">${d.donorName}</span>`
          }
        </div>
      </div>`;
  }
};

// Update nav based on auth state
function updateNav() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const dashBtn = document.getElementById('dashBtn');
  if (api.isLoggedIn()) {
    loginBtn?.classList.add('hidden');
    signupBtn?.classList.add('hidden');
    dashBtn?.classList.remove('hidden');
  } else {
    loginBtn?.classList.remove('hidden');
    signupBtn?.classList.remove('hidden');
    dashBtn?.classList.add('hidden');
  }
}

// Hamburger
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  ham?.addEventListener('click', () => links?.classList.toggle('open'));

  // Scroll nav effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
});
