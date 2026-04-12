// Homepage JS

// Animate counter numbers
function animateCounter(el, target, duration = 1800) {
  const start = 0;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('en-IN');
    if (current >= target) clearInterval(timer);
  }, 16);
}

// Intersection observer for counters
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = true;
        animateCounter(entry.target, parseInt(entry.target.dataset.target));
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => observer.observe(c));
}

// Load live feed
async function loadLiveFeed() {
  const feed = document.getElementById('liveFeed');
  if (!feed) return;
  try {
    const donations = await api.getDonations({ status: 'available' });
    const limited = donations.slice(0, 6);
    if (limited.length === 0) {
      feed.innerHTML = '<div class="feed-loading">No food available right now. Check back soon! 🌱</div>';
      return;
    }
    feed.innerHTML = limited.map(d => utils.createDonationCard(d, api.isLoggedIn() && api.getUser()?.role === 'recipient')).join('');
  } catch (err) {
    feed.innerHTML = `<div class="feed-loading">Could not load donations. Make sure the backend is running on port 5000.</div>`;
  }
}

// Handle claim from homepage
async function handleClaim(id) {
  if (!api.isLoggedIn()) {
    window.location.href = 'pages/auth.html';
    return;
  }
  try {
    await api.claimDonation(id);
    toast.show('Food claimed successfully! 🎉', 'success');
    loadLiveFeed();
  } catch (err) {
    toast.show(err.message, 'error');
  }
}

// Load stats from API
async function loadStats() {
  try {
    const stats = await api.getStats();
    const map = {
      '[data-stat="foodSaved"]': stats.totalFoodSaved,
      '[data-stat="donations"]': stats.totalDonations,
      '[data-stat="meals"]': stats.mealsProvided,
      '[data-stat="members"]': stats.totalDonors + stats.totalRecipients
    };
    Object.entries(map).forEach(([sel, val]) => {
      const el = document.querySelector(sel);
      if (el) el.dataset.target = val;
    });
  } catch {}
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  initCounters();
  loadLiveFeed();
});
