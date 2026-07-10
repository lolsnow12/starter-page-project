/* ══════════════════════════════════════════
   THE PAGE PROJECT — script.js
   Book donation tracking system
══════════════════════════════════════════ */
 
// ── STORAGE KEY
const STORAGE_KEY = 'pageproject_donations_v2';
const GOAL = 10000;
const BOOKS_ALREADY_COLLECTED = 802;
 
// ── SAMPLE DRIVES DATA
const DRIVES = [
  {
    title: 'Fall Book Drive',
    date: 'October 19, 2025 • 1:00 PM – 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: 300,
    status: 'past',
    description: 'Community book drive supporting local literacy initiatives.'
  },
  {
    title: 'Fall Book Drive',
    date: 'October 26, 2025 • 1:00 PM – 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: 502,
    status: 'past',
    description: 'Second collection event with an even greater community turnout.'
  },
  {
    title: 'Summer Book Drive',
    date: 'July 18, 2026 • 1:00 PM – 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: null,
    status: 'upcoming',
    description: 'Join us in donating books to help expand access to reading for children in our community.'
  },
  {
    title: 'Summer Book Drive',
    date: 'July 25, 2026 • 1:00 PM – 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: null,
    status: 'upcoming',
    description: 'Our second summer collection event. Every donated book helps inspire another young reader.'
  }
];
 
// ── LOAD / SAVE
function loadDonations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}
function saveDonations(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
 
// ── UPDATE ALL UI COUNTERS
function updateCounters(list) {
  const loggedTotal = list.reduce((sum, donation) => {
    return sum + (Number(donation.books) || 0);
  }, 0);

  // Total books from completed drives plus newly logged donations
  const total = BOOKS_ALREADY_COLLECTED + loggedTotal;

  // Count unique donors
  const donors = new Set(
    list
      .map(donation => donation.name?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  // Floating hero counter
  animateCount('heroCounter', total);

  // Statistics counters
  animateCount('stat-books', total);
  animateCount('stat-donors', donors);

  // Progress toward the book goal
  const pct = Math.min(Math.round((total / GOAL) * 100), 100);

  const goalPct = document.getElementById('goal-pct');
  const goalBarFill = document.getElementById('goalBarFill');
  const goalLabel = document.getElementById('goal-label');

  if (goalLabel) {
    goalLabel.textContent = `${GOAL.toLocaleString()} Book`;
  }

  if (goalPct) {
    goalPct.textContent = `${pct}%`;
  }

  if (goalBarFill) {
    goalBarFill.style.width = `${pct}%`;
  }
}
 
function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
 
// ── RENDER TABLE
function renderTable(list, search = '', genre = '') {
  const body = document.getElementById('donationBody');
  const empty = document.getElementById('emptyState');
  const table = document.getElementById('donationTable');
 
  const filtered = list.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q)
      || (d.dest || '').toLowerCase().includes(q)
      || (d.genre || '').toLowerCase().includes(q)
      || (d.note || '').toLowerCase().includes(q);
    const matchGenre = !genre || d.genre === genre;
    return matchSearch && matchGenre;
  });
 
  const filteredTotal = filtered.reduce((s, d) => s + Number(d.books), 0);
  document.getElementById('rowCount').textContent = filtered.length;
  document.getElementById('totalCount').textContent = filteredTotal.toLocaleString();
 
  if (filtered.length === 0) {
    body.innerHTML = '';
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }
 
  empty.style.display = 'none';
  table.style.display = 'table';
 
  // Show newest first
  const sorted = [...filtered].reverse();
  body.innerHTML = sorted.map((d, i) => `
    <tr>
      <td><strong>${escHtml(d.name)}</strong>${d.note ? `<br><small style="color:#888">${escHtml(d.note)}</small>` : ''}</td>
      <td><strong style="color:var(--amber)">${Number(d.books).toLocaleString()}</strong></td>
      <td><span class="badge-genre">${escHtml(d.genre || 'General')}</span></td>
      <td>${d.dest ? escHtml(d.dest) : '<span style="color:#bbb">—</span>'}</td>
      <td style="white-space:nowrap; color:#999; font-size:0.78rem">${formatDate(d.date)}</td>
      <td><button class="del-btn" title="Remove" data-idx="${list.indexOf(d)}">✕</button></td>
    </tr>
  `).join('');
 
  // Delete handlers
  body.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const donations = loadDonations();
      donations.splice(idx, 1);
      saveDonations(donations);
      refreshAll();
      showToast('Donation removed.', 'warning');
    });
  });
}
 
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  } catch { return iso; }
}
 
// ── REFRESH ALL
function refreshAll() {
  const donations = loadDonations();
  const search = document.getElementById('logSearch').value;
  const genre  = document.getElementById('logFilter').value;
  renderTable(donations, search, genre);
  updateCounters(donations);
}
 
// ── LOG FORM SUBMIT
document.getElementById('logBtn').addEventListener('click', () => {
  const name  = document.getElementById('donorName').value.trim();
  const books = parseInt(document.getElementById('bookCount').value);
  const genre = document.getElementById('bookGenre').value;
  const dest  = document.getElementById('bookDest').value.trim();
  const note  = document.getElementById('bookNote').value.trim();
  const msg   = document.getElementById('logMsg');
 
  msg.style.display = 'none';
 
  if (!name) { showMsg(msg, 'Please enter your name.', 'error'); return; }
  if (!books || books < 1) { showMsg(msg, 'Please enter a valid number of books (minimum 1).', 'error'); return; }
  if (!genre) { showMsg(msg, 'Please select a genre.', 'error'); return; }
 
  const donation = {
    name, books, genre, dest, note,
    date: new Date().toISOString()
  };
 
  const donations = loadDonations();
  donations.push(donation);
  saveDonations(donations);
  refreshAll();
 
  // Reset form
  document.getElementById('donorName').value = '';
  document.getElementById('bookCount').value = '';
  document.getElementById('bookGenre').value = '';
  document.getElementById('bookDest').value = '';
  document.getElementById('bookNote').value = '';
 
  showMsg(msg, `🎉 Thank you, ${name}! ${books} book${books > 1 ? 's' : ''} logged.`, 'success');
  showToast(`📚 ${books} books logged by ${name}!`, 'success');
});
 
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'log-msg ' + type;
  el.style.display = 'block';
  if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 4000);
}
 
// ── SEARCH & FILTER
document.getElementById('logSearch').addEventListener('input', refreshAll);
document.getElementById('logFilter').addEventListener('change', refreshAll);
 
// ── TOAST
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const colors = { success: '#1f6e6e', warning: '#c96f18', error: '#c0392b' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${colors[type] || colors.success};
    color: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    margin-bottom: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    cursor: pointer;
    max-width: 320px;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => {
    toast.style.animation = 'fadeOutRight 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
 
// ── RENDER DRIVES
function renderDrives() {
  const grid = document.getElementById('drivesGrid');
  grid.innerHTML = DRIVES.map(d => `
    <div class="col-md-6 col-lg-3">
      <div class="drive-card fade-in">
        <div class="drive-card-banner"></div>
        <div class="drive-card-body">
          <div class="drive-status ${d.status}">${d.status === 'upcoming' ? '🗓 Upcoming' : '✅ Completed'}</div>
          <h5 class="drive-card-title">${d.title}</h5>
          <div class="drive-meta">
            <span>📅 ${d.date}</span>
            <span style="margin-top:4px">📍 ${d.location}</span>
            <span style="margin-top:8px; color:var(--ink-soft)">${d.description}</span>
          </div>
          ${d.books ? `
            <div style="margin-top:16px">
              <div class="drive-books">${d.books.toLocaleString()}</div>
              <div class="drive-books-label">books collected</div>
            </div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
  observeFadeIns();
}
 
// ── CONTACT FORM
document.getElementById('contactSend').addEventListener('click', () => {
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const msg = document.getElementById('contactMsg');
  if (!name || !email) {
    showMsg(msg, 'Please fill in your name and email.', 'error');
    return;
  }
  showMsg(msg, `✉️ Thanks, ${name}! We'll be in touch soon.`, 'success');
  document.getElementById('cName').value = '';
  document.getElementById('cEmail').value = '';
  document.getElementById('cMessage').value = '';
});
 
// ── NAVBAR SCROLL EFFECT
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('scrolled', window.scrollY > 20);
});
 
// ── INTERSECTION OBSERVER (fade-ins)
function observeFadeIns() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}
 
// ── TOAST ANIMATION STYLES
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOutRight {
    to { transform: translateX(120px); opacity: 0; }
  }
`;
document.head.appendChild(style);
 
// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  renderDrives();
  refreshAll();
  observeFadeIns();
 
  // Hero fade-ins on load
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('visible'));
  }, 100);
 
  // Re-observe on scroll for non-hero elements
  window.addEventListener('scroll', observeFadeIns, { passive: true });
});
