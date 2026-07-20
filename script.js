/* ══════════════════════════════════════════
   THE PAGE PROJECT — script.js
   Book donation tracking system
══════════════════════════════════════════ */
 
// ── STORAGE KEY
const STORAGE_KEY = 'pageproject_donations_v2';
const GOAL = 10000;
const BOOKS_ALREADY_COLLECTED = 802;
const DONORS_ALREADY_COUNTED = 15;
 
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
    status: 'past',
    pending: true,
    description: 'Thanks to everyone who came out! Final book count is still being tallied — check back soon.'
  },
  {
    title: 'Summer Book Drive',
    date: 'July 25, 2026 • 6:30 PM – 8:30 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: null,
    status: 'upcoming',
    description: 'Our second summer collection event. Every donated book helps inspire another young reader.'
  }
];

// ── TEAM DATA
// Default roster. Photos and bios can be overridden right on the page
// (click a photo to upload one, click a name or bio to edit it) — those
// edits are saved in the visitor's browser via localStorage.
const TEAM = [
  { id: 'founder-1', name: 'Founder Name', role: 'Co-Founder', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'founder-2', name: 'Founder Name', role: 'Co-Founder', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'founder-3', name: 'Founder Name', role: 'Co-Founder', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'exec-logistics', name: 'Team Member', role: 'Executive of Logistics', group: 'Leadership', bio: 'Click here to add a short bio.' },
  { id: 'exec-outreach', name: 'Team Member', role: 'Executive of Outreach', group: 'Leadership', bio: 'Click here to add a short bio.' },
  { id: 'logistics-1', name: 'Team Member', role: 'Logistics Team Member', group: 'Logistics Team', bio: 'Click here to add a short bio.' },
  { id: 'logistics-2', name: 'Team Member', role: 'Logistics Team Member', group: 'Logistics Team', bio: 'Click here to add a short bio.' },
  { id: 'outreach-1', name: 'Team Member', role: 'Outreach Team Member', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'outreach-2', name: 'Team Member', role: 'Outreach Team Member', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'social-media-officer', name: 'Team Member', role: 'Social Media Officer', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'technology-director', name: 'Team Member', role: 'Technology Director', group: 'Outreach Team', bio: 'Click here to add a short bio.' }
];
const TEAM_GROUP_ORDER = ['Founders', 'Leadership', 'Logistics Team', 'Outreach Team'];
const TEAM_STORAGE_KEY = 'pageproject_team_v1';
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB

// ── DEVELOPER EDIT-MODE GATE
// This is a static site with no server, so this can't be real authentication —
// anyone who reads the page source can find this check. It's a practical
// speed bump: casual visitors can't edit team info, but a developer who
// knows the passcode can toggle edit mode on for their browser session.
//
// To change the passcode: open a browser console anywhere and run
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPasscode'))
//     .then(buf => console.log([...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('')))
// then paste the printed hash in as TEAM_EDIT_PASSCODE_HASH below.
const TEAM_EDIT_PASSCODE_HASH = '35cb162995f85b21863f8b94f71d76e665ae29732079216585546c50d4177f08'; // default passcode: PageProject2026!
const TEAM_EDIT_SESSION_KEY = 'pageproject_team_edit_unlocked';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function isTeamEditUnlocked() {
  return sessionStorage.getItem(TEAM_EDIT_SESSION_KEY) === 'true';
}
function setTeamEditUnlocked(unlocked) {
  if (unlocked) sessionStorage.setItem(TEAM_EDIT_SESSION_KEY, 'true');
  else sessionStorage.removeItem(TEAM_EDIT_SESSION_KEY);
}
function updateTeamEditToggleUI() {
  const btn = document.getElementById('teamEditToggle');
  if (!btn) return;
  const unlocked = isTeamEditUnlocked();
  btn.textContent = unlocked ? '🔓 Edit Mode: ON (click to exit)' : '🔒 Developer Edit Mode';
  btn.classList.toggle('unlocked', unlocked);
}
 
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

  // Count unique donors (starting from our existing donor base)
  const donors = DONORS_ALREADY_COUNTED + new Set(
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
 
// ── BOOK GALLERY DATA
// Replace these placeholder entries with real photos from your drives.
// src can be any image URL or a local path like 'images/gallery-1.jpg'.
const GALLERY = [
  { src: 'https://picsum.photos/seed/pageproject1/600/450', caption: 'Sorting donations from the Fall Book Drive' },
  { src: 'https://picsum.photos/seed/pageproject2/600/450', caption: 'A box of picture books ready for delivery' },
  { src: 'https://picsum.photos/seed/pageproject3/600/450', caption: 'Volunteers boxing up middle grade novels' },
  { src: 'https://picsum.photos/seed/pageproject4/600/450', caption: 'Young Adult titles collected this season' },
  { src: 'https://picsum.photos/seed/pageproject5/600/450', caption: 'A classroom library restocked with donations' },
  { src: 'https://picsum.photos/seed/pageproject6/600/450', caption: 'Delivery day at Lincoln Community School' }
];
 
// ── RENDER GALLERY
function renderGallery() {
  const grid = document.getElementById('bookGallery');
  if (!grid) return;
 
  if (GALLERY.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🖼️</div><p>No photos yet.<br>Check back soon!</p></div>`;
    return;
  }
 
  grid.innerHTML = GALLERY.map((item, i) => `
    <button type="button" class="gallery-item fade-in" data-idx="${i}">
      <img src="${item.src}" alt="${escHtml(item.caption)}" loading="lazy">
      <span class="gallery-item-caption">${escHtml(item.caption)}</span>
    </button>
  `).join('');
 
  grid.querySelectorAll('.gallery-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = GALLERY[parseInt(btn.dataset.idx)];
      openLightbox(item);
    });
  });
 
  observeFadeIns();
}
 
// ── LIGHTBOX
function openLightbox(item) {
  const lb = document.getElementById('galleryLightbox');
  document.getElementById('galleryLightboxImg').src = item.src;
  document.getElementById('galleryLightboxImg').alt = item.caption;
  document.getElementById('galleryLightboxCaption').textContent = item.caption;
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('galleryLightbox').classList.remove('open');
}
document.getElementById('galleryLightboxClose').addEventListener('click', closeLightbox);
document.getElementById('galleryLightbox').addEventListener('click', (e) => {
  if (e.target.id === 'galleryLightbox') closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
 
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

// ── TEAM: LOAD / SAVE OVERRIDES
// Overrides are keyed by team member id and can contain { name, role, bio, photo }.
// photo is stored as a base64 data URL so uploads persist across page loads
// on the same device/browser (there's no server to upload files to on a
// static GitHub Pages site).
function loadTeamOverrides() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY)) || {};
  } catch { return {}; }
}
function saveTeamOverrides(data) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(data));
}

// ── RENDER TEAM
function renderTeam() {
  const container = document.getElementById('teamGroups');
  if (!container) return;

  const overrides = loadTeamOverrides();
  const groups = TEAM_GROUP_ORDER.filter(g => TEAM.some(m => m.group === g));

  container.innerHTML = groups.map(group => `
    <div class="team-group">
      <h3 class="team-group-title">${escHtml(group)}</h3>
      <div class="row g-4 mb-5">
        ${TEAM.filter(m => m.group === group).map(m => renderTeamCard(m, overrides[m.id] || {})).join('')}
      </div>
    </div>
  `).join('');

  attachTeamHandlers();
  observeFadeIns();
}

function renderTeamCard(member, data) {
  const name = data.name || member.name;
  const bio = data.bio || member.bio;
  const photo = data.photo || '';
  const unlocked = isTeamEditUnlocked();
  const lockedClass = unlocked ? '' : ' locked';
  const overlayText = unlocked ? '📷 Click to upload photo' : '🔒 Developers only';

  return `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="team-card fade-in">
        <div class="team-photo-wrap${lockedClass}" data-id="${member.id}" tabindex="0" role="button"
             aria-label="${unlocked ? `Upload a photo for ${escHtml(name)}` : 'Photo editing is limited to developers'}">
          ${photo
            ? `<img src="${photo}" alt="${escHtml(name)}" class="team-photo">`
            : `<div class="team-photo-placeholder">🧑‍🤝‍🧑</div>`}
          <div class="team-photo-overlay">${overlayText}</div>
          <input type="file" accept="image/*" class="team-photo-input" data-id="${member.id}">
        </div>
        <div class="team-card-body">
          <div class="team-name${lockedClass}" contenteditable="${unlocked}" spellcheck="false"
               data-id="${member.id}" data-field="name">${escHtml(name)}</div>
          <div class="team-role">${escHtml(member.role)}</div>
          <div class="team-bio${lockedClass}" contenteditable="${unlocked}" spellcheck="false"
               data-id="${member.id}" data-field="bio">${escHtml(bio)}</div>
        </div>
      </div>
    </div>
  `;
}

function attachTeamHandlers() {
  const unlocked = isTeamEditUnlocked();

  // Click (or keyboard-activate) a photo to open the file picker
  document.querySelectorAll('.team-photo-wrap').forEach(wrap => {
    const input = wrap.querySelector('.team-photo-input');
    wrap.addEventListener('click', () => {
      if (!unlocked) {
        showToast('Photo and bio editing is limited to developers.', 'warning');
        return;
      }
      input.click();
    });
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrap.click();
      }
    });
  });

  if (!unlocked) return; // nothing else to wire up while locked

  document.querySelectorAll('.team-photo-input').forEach(input => {
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.', 'error');
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        showToast('Please choose an image under 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const overrides = loadTeamOverrides();
        const id = input.dataset.id;
        overrides[id] = { ...(overrides[id] || {}), photo: reader.result };
        saveTeamOverrides(overrides);
        renderTeam();
        showToast('Photo updated!', 'success');
      };
      reader.onerror = () => showToast('Could not read that image — please try another.', 'error');
      reader.readAsDataURL(file);
    });
  });

  // Editable name / bio fields — save on blur
  document.querySelectorAll('.team-name, .team-bio').forEach(el => {
    el.addEventListener('blur', () => {
      const id = el.dataset.id;
      const field = el.dataset.field;
      const value = el.textContent.trim();
      const overrides = loadTeamOverrides();
      overrides[id] = { ...(overrides[id] || {}), [field]: value };
      saveTeamOverrides(overrides);
    });
    // Single-line fields (name) shouldn't allow line breaks
    if (el.dataset.field === 'name') {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      });
    }
  });
}

// ── DEVELOPER EDIT-MODE TOGGLE BUTTON
document.getElementById('teamEditToggle').addEventListener('click', async () => {
  if (isTeamEditUnlocked()) {
    setTeamEditUnlocked(false);
    updateTeamEditToggleUI();
    renderTeam();
    showToast('Edit mode turned off.', 'success');
    return;
  }

  const attempt = prompt('Enter the developer passcode to edit team photos and bios:');
  if (attempt === null) return; // cancelled

  const hash = await sha256Hex(attempt);
  if (hash === TEAM_EDIT_PASSCODE_HASH) {
    setTeamEditUnlocked(true);
    updateTeamEditToggleUI();
    renderTeam();
    showToast('Edit mode enabled for this session.', 'success');
  } else {
    showToast('Incorrect passcode.', 'error');
  }
});
 
// ── REFRESH ALL
function refreshAll() {
  const donations = loadDonations();
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
            </div>` : (d.status === 'past' ? `
            <div style="margin-top:16px">
              <div class="drive-books drive-books-pending">Pending</div>
              <div class="drive-books-label">final count coming soon</div>
            </div>` : '')}
        </div>
      </div>
    </div>
  `).join('');
  observeFadeIns();
}
 
// ── CONTACT FORM
// Sends via Formspree. Sign up free at https://formspree.io, create a form
// pointed at official.thepageproject@gmail.com, and replace YOUR_FORM_ID below
// with the endpoint ID Formspree gives you (e.g. "abc1234").
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

document.getElementById('contactSend').addEventListener('click', async () => {
  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const subject = document.getElementById('cSubject').value;
  const message = document.getElementById('cMessage').value.trim();
  const msg     = document.getElementById('contactMsg');
  const btn     = document.getElementById('contactSend');

  msg.style.display = 'none';

  if (!name || !email) {
    showMsg(msg, 'Please fill in your name and email.', 'error');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg(msg, 'Please enter a valid email address.', 'error');
    return;
  }

  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    });

    if (response.ok) {
      showMsg(msg, `✉️ Thanks, ${name}! We'll be in touch soon.`, 'success');
      showToast(`✉️ Message sent!`, 'success');
      document.getElementById('cName').value = '';
      document.getElementById('cEmail').value = '';
      document.getElementById('cMessage').value = '';
    } else {
      showMsg(msg, 'Something went wrong sending your message. Please try emailing us directly.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Network error — please try emailing us directly at official.thepageproject@gmail.com.', 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
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
  renderGallery();
  renderTeam();
  updateTeamEditToggleUI();
  refreshAll();
  observeFadeIns();
 
  // Hero fade-ins on load
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('visible'));
  }, 100);
 
  // Re-observe on scroll for non-hero elements
  window.addEventListener('scroll', observeFadeIns, { passive: true });
});
