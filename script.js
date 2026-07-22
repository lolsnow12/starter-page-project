/* ══════════════════════════════════════════
   THE PAGE PROJECT — script.js
   Team & gallery content management
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   FIREBASE SETUP (shared data for all visitors)
   ──────────────────────────────────────────
   1. Go to https://console.firebase.google.com → Create a project (free).
   2. In the project, click "Build" → "Realtime Database" → Create Database
      → start in "test mode" (we lock it down with rules below).
   3. Click the gear icon → Project settings → scroll to "Your apps" →
      click the </> (web) icon → register an app (no hosting needed) →
      copy the firebaseConfig object it gives you and paste it below,
      replacing the placeholder values.
   4. In Realtime Database → Rules, paste this and click Publish:
        {
          "rules": {
            "teamOverrides": { ".read": true, ".write": true },
            "gallery":       { ".read": true, ".write": true }
          }
        }
      NOTE: like the developer passcode below, this is a practical speed
      bump, not real security — anyone with the config could technically
      write bad data. For a nonprofit site this is an acceptable tradeoff
      for "no backend to maintain." If it's ever abused, tighten the rules
      (e.g. Firebase App Check, or require sign-in) or add server-side
      validation via Cloud Functions.
══════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyDCHnN0klihy9zktyuGajRFTJTTf23LZx4",
  authDomain: "page-project-27c38.firebaseapp.com",
  databaseURL: "https://page-project-27c38-default-rtdb.firebaseio.com",
  projectId: "page-project-27c38",
  storageBucket: "page-project-27c38.firebasestorage.app",
  messagingSenderId: "47005585431",
  appId: "1:47005585431:web:84c670d7f73df19ceecc52",
  measurementId: "G-YRFXYZS1LN"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── STATIC IMPACT NUMBERS
// These reflect totals from completed book drives. Update these two
// constants by hand whenever a drive wraps up and you have a new count.
const BOOKS_ALREADY_COLLECTED = 1000;
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
    date: 'July 18, 2026 • 6:30 PM – 8:30 PM',
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
// Default roster (names/roles/groups). Photos and bios are stored in
// Firebase so any edit made by a developer shows up for every visitor —
// visitors always see this section; only editing requires the passcode.
const TEAM = [
  { id: 'founder-1', name: 'Founder Name', role: 'Founder, President', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'founder-2', name: 'Founder Name', role: 'Founder, Executive Director', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'founder-3', name: 'Founder Name', role: 'Founder, Vice President', group: 'Founders', bio: 'Click here to add a short bio.' },
  { id: 'exec-logistics', name: 'Team Member', role: 'Logistics Director', group: 'Leadership', bio: 'Click here to add a short bio.' },
  { id: 'exec-outreach', name: 'Team Member', role: 'Outreach Director', group: 'Leadership', bio: 'Click here to add a short bio.' },
  { id: 'logistics-1', name: 'Team Member', role: 'Logistics Team Member', group: 'Logistics Team', bio: 'Click here to add a short bio.' },
  { id: 'logistics-2', name: 'Team Member', role: 'Logistics Team Member', group: 'Logistics Team', bio: 'Click here to add a short bio.' },
  { id: 'outreach-1', name: 'Team Member', role: 'Outreach Team Member', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'outreach-2', name: 'Team Member', role: 'Outreach Team Member', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'social-media-officer', name: 'Team Member', role: 'Social Media Officer', group: 'Outreach Team', bio: 'Click here to add a short bio.' },
  { id: 'technology-director', name: 'Team Member', role: 'Webmaster', group: 'Outreach Team', bio: 'Click here to add a short bio.' }
];
const TEAM_GROUP_ORDER = ['Founders', 'Leadership', 'Logistics Team', 'Outreach Team'];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB

// ── DEFAULT GALLERY (fallback / seed content)
// Shown until a developer adds real photos. The first edit made in
// Developer Edit Mode moves this content into Firebase permanently, so
// after that this array is no longer used.
const DEFAULT_GALLERY = [
  { src: 'https://picsum.photos/seed/pageproject1/600/450', caption: 'Sorting donations from the Fall Book Drive' },
  { src: 'https://picsum.photos/seed/pageproject2/600/450', caption: 'A box of picture books ready for delivery' },
  { src: 'https://picsum.photos/seed/pageproject3/600/450', caption: 'Volunteers boxing up middle grade novels' },
  { src: 'https://picsum.photos/seed/pageproject4/600/450', caption: 'Young Adult titles collected this season' },
  { src: 'https://picsum.photos/seed/pageproject5/600/450', caption: 'A classroom library restocked with donations' },
  { src: 'https://picsum.photos/seed/pageproject6/600/450', caption: 'Delivery day at Lincoln Community School' }
];
const MAX_GALLERY_PHOTO_BYTES = 3 * 1024 * 1024; // 3MB

// ── SHARED DEVELOPER EDIT-MODE GATE (governs Team + Gallery editing)
// This only gates WHO can edit in their own browser session — it does not
// affect where the data is stored. Since it's a static site, this can't be
// real authentication; it's a practical speed bump so casual visitors can't
// edit content, while a developer who knows the passcode can, from any
// device. One passcode unlocks editing for both the Team and Gallery
// sections.
//
// To change the passcode: open a browser console anywhere and run
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourNewPasscode'))
//     .then(buf => console.log([...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('')))
// then paste the printed hash in as EDIT_PASSCODE_HASH below.
const EDIT_PASSCODE_HASH = '35cb162995f85b21863f8b94f71d76e665ae29732079216585546c50d4177f08'; // default passcode: PageProject2026!
const EDIT_SESSION_KEY = 'pageproject_dev_edit_unlocked';

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function isDevEditUnlocked() {
  return sessionStorage.getItem(EDIT_SESSION_KEY) === 'true';
}
function setDevEditUnlocked(unlocked) {
  if (unlocked) sessionStorage.setItem(EDIT_SESSION_KEY, 'true');
  else sessionStorage.removeItem(EDIT_SESSION_KEY);
}
function updateDevEditToggleUI() {
  const unlocked = isDevEditUnlocked();
  document.querySelectorAll('.dev-edit-toggle').forEach(btn => {
    btn.textContent = unlocked ? '🔓 Edit Mode: ON (click to exit)' : '🔒 Developer Edit Mode';
    btn.classList.toggle('unlocked', unlocked);
  });
}
async function toggleDevEditMode() {
  if (isDevEditUnlocked()) {
    setDevEditUnlocked(false);
    updateDevEditToggleUI();
    renderTeam();
    renderGallery();
    showToast('Edit mode turned off.', 'success');
    return;
  }

  const attempt = prompt('Enter the developer passcode to edit team or gallery content:');
  if (attempt === null) return; // cancelled

  const hash = await sha256Hex(attempt);
  if (hash === EDIT_PASSCODE_HASH) {
    setDevEditUnlocked(true);
    updateDevEditToggleUI();
    renderTeam();
    renderGallery();
    showToast('Edit mode enabled for this session.', 'success');
  } else {
    showToast('Incorrect passcode.', 'error');
  }
}
document.querySelectorAll('.dev-edit-toggle').forEach(btn => btn.addEventListener('click', toggleDevEditMode));

// ── STATIC IMPACT COUNTERS (hero + stats strip)
function initStaticCounters() {
  animateCount('heroCounter', BOOKS_ALREADY_COLLECTED, '+');
  animateCount('stat-books', BOOKS_ALREADY_COLLECTED, '+');
  animateCount('stat-donors', DONORS_ALREADY_COUNTED, '+');
}

function animateCount(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + diff * ease) + (progress >= 1 ? suffix : '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ── GALLERY: SHARED, DEVELOPER-EDITABLE (Firebase)
let galleryCache = null; // null/empty = not yet seeded in Firebase, use defaults

function watchGallery() {
  db.ref('gallery').on('value', (snap) => {
    galleryCache = snap.val(); // null if the node is empty
    renderGallery();
  }, (err) => console.error('Failed to sync gallery', err));
}

function galleryEntries() {
  if (galleryCache && Object.keys(galleryCache).length) {
    return Object.entries(galleryCache);
  }
  return DEFAULT_GALLERY.map((item, i) => [`default-${i}`, item]);
}

// Moves the fallback defaults into Firebase the first time a developer
// makes an edit, so the edit targets a real, syncable entry.
async function ensureGallerySeeded() {
  if (galleryCache && Object.keys(galleryCache).length) return;
  const updates = {};
  DEFAULT_GALLERY.forEach((item) => {
    const key = db.ref('gallery').push().key;
    updates[key] = item;
  });
  await db.ref('gallery').set(updates);
}

async function addGalleryPhoto(src, caption) {
  await ensureGallerySeeded();
  await db.ref('gallery').push({ src, caption });
}
async function updateGalleryItem(key, patch) {
  await ensureGallerySeeded();
  await db.ref('gallery/' + key).update(patch);
}
async function deleteGalleryItem(key) {
  await ensureGallerySeeded();
  await db.ref('gallery/' + key).remove();
}

// ── RENDER GALLERY
function renderGallery() {
  const grid = document.getElementById('bookGallery');
  if (!grid) return;

  const entries = galleryEntries();
  const unlocked = isDevEditUnlocked();

  if (entries.length === 0 && !unlocked) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🖼️</div><p>No photos yet.<br>Check back soon!</p></div>`;
    return;
  }

  const itemsHtml = entries.map(([key, item]) => {
    if (unlocked) {
      return `
        <div class="gallery-item editable fade-in" data-key="${key}">
          <img src="${item.src}" alt="${escHtml(item.caption)}">
          <div class="gallery-edit-toolbar">
            <button type="button" class="gallery-icon-btn gallery-replace-btn" data-key="${key}" title="Replace photo">📷</button>
            <button type="button" class="gallery-icon-btn gallery-delete-btn" data-key="${key}" title="Remove photo">🗑</button>
          </div>
          <input type="file" accept="image/*" class="gallery-photo-input" data-key="${key}" style="display:none">
          <div class="gallery-item-caption-edit" contenteditable="true" spellcheck="false" data-key="${key}">${escHtml(item.caption)}</div>
        </div>`;
    }
    return `
      <button type="button" class="gallery-item fade-in" data-key="${key}">
        <img src="${item.src}" alt="${escHtml(item.caption)}" loading="lazy">
        <span class="gallery-item-caption">${escHtml(item.caption)}</span>
      </button>`;
  }).join('');

  const addTileHtml = unlocked ? `
    <button type="button" class="gallery-add-tile fade-in" id="galleryAddTile">
      <span class="gallery-add-icon">➕</span>
      <span>Add Photo</span>
    </button>
    <input type="file" accept="image/*" id="galleryAddInput" style="display:none">` : '';

  grid.innerHTML = itemsHtml + addTileHtml;

  attachGalleryHandlers(unlocked);
  observeFadeIns();
}

function attachGalleryHandlers(unlocked) {
  if (!unlocked) {
    document.querySelectorAll('#bookGallery .gallery-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const entry = galleryEntries().find(([k]) => k === key);
        if (entry) openLightbox(entry[1]);
      });
    });
    return;
  }

  // Replace an existing photo
  document.querySelectorAll('.gallery-replace-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector(`.gallery-photo-input[data-key="${btn.dataset.key}"]`).click();
    });
  });
  document.querySelectorAll('.gallery-photo-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return; }
      if (file.size > MAX_GALLERY_PHOTO_BYTES) { showToast('Please choose an image under 3MB.', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = async () => {
        await updateGalleryItem(input.dataset.key, { src: reader.result });
        showToast('Photo updated for everyone!', 'success');
      };
      reader.onerror = () => showToast('Could not read that image — please try another.', 'error');
      reader.readAsDataURL(file);
    });
  });

  // Delete a photo
  document.querySelectorAll('.gallery-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this photo for all visitors?')) return;
      await deleteGalleryItem(btn.dataset.key);
      showToast('Photo removed.', 'success');
    });
  });

  // Edit a caption — save on blur
  document.querySelectorAll('.gallery-item-caption-edit').forEach(el => {
    el.addEventListener('blur', async () => {
      await updateGalleryItem(el.dataset.key, { caption: el.textContent.trim() });
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    });
  });

  // Add a new photo
  const addTile = document.getElementById('galleryAddTile');
  const addInput = document.getElementById('galleryAddInput');
  if (addTile && addInput) {
    addTile.addEventListener('click', () => addInput.click());
    addInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return; }
      if (file.size > MAX_GALLERY_PHOTO_BYTES) { showToast('Please choose an image under 3MB.', 'warning'); return; }
      const caption = prompt('Add a short caption for this photo:', '') || '';
      const reader = new FileReader();
      reader.onload = async () => {
        await addGalleryPhoto(reader.result, caption.trim());
        showToast('Photo added for everyone!', 'success');
      };
      reader.onerror = () => showToast('Could not read that image — please try another.', 'error');
      reader.readAsDataURL(file);
    });
  }
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

// ── TEAM: SHARED OVERRIDES (Firebase)
// Overrides are keyed by team member id and can contain { name, role, bio, photo }.
// photo is stored as a base64 data URL. Stored in Firebase so every visitor
// (not just the editing browser) sees the update. Visitors always see the
// team cards — the passcode only gates the ability to edit them.
let teamOverridesCache = {};

function watchTeamOverrides() {
  db.ref('teamOverrides').on('value', (snap) => {
    teamOverridesCache = snap.val() || {};
    renderTeam();
  }, (err) => {
    console.error('Failed to sync team overrides', err);
  });
}

async function saveTeamOverride(id, patch) {
  try {
    await db.ref('teamOverrides/' + id).update(patch);
    // No manual re-render needed — watchTeamOverrides() listener will fire.
  } catch (err) {
    console.error('Failed to save team override', err);
    showToast('Could not save — check your connection and try again.', 'error');
  }
}

// ── RENDER TEAM
function renderTeam() {
  const container = document.getElementById('teamGroups');
  if (!container) return;

  const overrides = teamOverridesCache;
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
  const unlocked = isDevEditUnlocked();
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
  const unlocked = isDevEditUnlocked();

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
      reader.onload = async () => {
        const id = input.dataset.id;
        showToast('Uploading photo…', 'success');
        await saveTeamOverride(id, { photo: reader.result });
        showToast('Photo updated for everyone!', 'success');
      };
      reader.onerror = () => showToast('Could not read that image — please try another.', 'error');
      reader.readAsDataURL(file);
    });
  });

  // Editable name / bio fields — save on blur
  document.querySelectorAll('.team-name, .team-bio').forEach(el => {
    el.addEventListener('blur', async () => {
      const id = el.dataset.id;
      const field = el.dataset.field;
      const value = el.textContent.trim();
      await saveTeamOverride(id, { [field]: value });
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
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'log-msg ' + type;
  el.style.display = 'block';
  if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 4000);
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
// The HTML form submits through FormSubmit, so no JavaScript handler is needed.

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
  updateDevEditToggleUI();

  // Show Team and Gallery immediately to every visitor.
  renderTeam();
  renderGallery();

  // Firebase then loads and applies the newest shared edits.
  watchTeamOverrides();
  watchGallery();

  initStaticCounters();
  observeFadeIns();

  // Hero fade-ins on load
  setTimeout(() => {
    document.querySelectorAll('.hero .fade-in').forEach(el => el.classList.add('visible'));
  }, 100);

  // Re-observe on scroll for non-hero elements
  window.addEventListener('scroll', observeFadeIns, { passive: true });
});
