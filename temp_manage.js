
function sanitizeHTML(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return String(str).replace(/[&<>"'/]/ig, (match)=>(map[match]));
}
// ─── Firebase Init ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyD0-OAeAAXI6irXO2msUvqF2RqOPVheuuw",
  authDomain: "nepal-school-website.firebaseapp.com",
  projectId: "nepal-school-website",
  storageBucket: "nepal-school-website.firebasestorage.app",
  messagingSenderId: "1040299047198",
  appId: "1:1040299047198:web:b06f451c075e0c7e5e710f"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
let editingNoticeId = null;
let editingStaffId = null;
let editingMemberId = null;
const auth = firebase.auth();
// Note: Images are uploaded via Cloudinary (not Firebase Storage)

// ─── Auth ──────────────────────────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('user-email').textContent = user.email;
    initDashboard();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
  }
});

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  const btn   = document.getElementById('login-btn');
  const err   = document.getElementById('login-error');
  err.style.display = 'none';
  if (!email || !pass) { err.textContent = 'Please enter email and password.'; err.style.display = 'block'; return; }
  btn.disabled = true; btn.textContent = 'Signing in...';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e) {
    err.textContent = 'Login failed: ' + (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' ? 'Incorrect email or password.' : e.message);
    err.style.display = 'block';
    btn.disabled = false; btn.textContent = '🔐 Sign In';
  }
}

function doLogout() {
  if (confirm('Are you sure you want to log out?')) auth.signOut();
}

// ─── Init ──────────────────────────────────────────────────────────────────
function initDashboard() {
  showSection('overview');
  loadOverviewStats();
  db.collection('settings').doc('school').get().then(doc => {
    if (doc.exists && doc.data().logoUrl) {
      document.querySelectorAll('img[src="images/logo.png"]').forEach(img => img.src = doc.data().logoUrl);
    }
  }).catch(console.error);
}

// ─── Navigation ───────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  const navEl = document.querySelector(`[data-section="${name}"]`);
  if (navEl) navEl.classList.add('active');
  // Lazy load sections
  if (name === 'notices')   loadNotices();
  if (name === 'staff')     loadStaff();
  if (name === 'committee') loadCommittee();
  if (name === 'gallery')   loadGallery(currentGalleryCat);
  if (name === 'school')    loadSchoolInfo();
  if (name === 'principal') loadPrincipal();
}

// ─── Image Upload via Cloudinary (always free — 25GB) ─────────────────────
const CLOUDINARY_CLOUD = 'ugowk6kp';
const CLOUDINARY_PRESET = 'school_uploads';

function uploadImage(file, folder, progressId) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', 'nepal-school/' + folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`);

    // Track upload progress
    if (progressId) {
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const el = document.getElementById(progressId);
          if (el) el.style.width = ((e.loaded / e.total) * 100) + '%';
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error('Upload failed. Please try again.'));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
    xhr.send(formData);
  });
}

async function deleteStorageImage(url) {
  // Cloudinary deletion requires server-side API secret (not possible in browser)
  // The item is removed from the website. To permanently remove from Cloudinary,
  // go to cloudinary.com → Media Library and delete manually.
  return;
}


// ─── Toast ────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = '', 3200);
}



// ─── Overview Stats ───────────────────────────────────────────────────────
async function loadOverviewStats() {
  try {
    const [n, s, c, g] = await Promise.all([
      db.collection('notices').get(),
      db.collection('staff').get(),
      db.collection('committee').get(),
      db.collection('gallery').get()
    ]);
    document.getElementById('stat-notices').textContent   = n.size;
    document.getElementById('stat-staff').textContent     = s.size;
    document.getElementById('stat-committee').textContent = c.size;
    document.getElementById('stat-gallery').textContent   = g.size;
  } catch(e) { console.error(e); }
}

// ─── NOTICES ─────────────────────────────────────────────────────────────
let noticesUnsub = null;
function loadNotices() {
  if (noticesUnsub) { noticesUnsub(); noticesUnsub = null; }
  const el = document.getElementById('notices-list');
  el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div>Loading...</div>';
  noticesUnsub = db.collection('notices').orderBy('createdAt','desc').onSnapshot(snap => {
    if (snap.empty) { el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div>No notices yet. Add one above.</div>'; return; }
    el.innerHTML = '';
    const grid = document.createElement('div'); grid.className = 'notice-grid';
    snap.forEach(doc => {
      const n = doc.data(); const id = doc.id;
      const card = document.createElement('div'); card.className = 'notice-card';
      card.innerHTML = `
        ${n.imageUrl ? `<img src="${n.imageUrl}" alt="${sanitizeHTML(n.title)}">` : `<div class="notice-card-placeholder">📋</div>`}
        <div class="notice-card-bo📷>
                    <div class="notice-meta">
            <span class="badge ${n.important ? 'badge-red' : 'badge-blue'}"></span>
            <span class="notice-date">📅 ${n.date}</span>
          </div>
          <h4>${sanitizeHTML(n.title)}</h4>
          <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="editNotice('${id}', '${sanitizeHTML(n.title).replace(/'/g, "\\'")}', '${n.date}', '${n.category}', ${n.important}, '${n.imageUrl||''}')" style="color:var(--gold);border-color:var(--gold);">✏ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteNotice('${id}','${n.imageUrl||''}')">🗑 Delete</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    el.appendChild(grid);
  }, err => { el.innerHTML = '<div class="empty">Error loading notices: ' + err.message + '</div>'; });
}

function editNotice(id, title, date, cat, imp, img) {
  editingNoticeId = id;
  document.getElementById('notice-title').value = title;
  document.getElementById('notice-date').value = date;
  document.getElementById('notice-category').value = cat;
  document.getElementById('notice-important').checked = imp;
  document.getElementById('notice-add-btn').textContent = 'Update Notice';
  window.scrollTo({top:0, behavior:'smooth'});
}

async function addNotice() {
  const title    = document.getElementById('notice-title').value.trim();
  const date     = document.getElementById('notice-date').value;
  const category = document.getElementById('notice-category').value;
  const important= document.getElementById('notice-important').checked;
  const file     = document.getElementById('notice-image').files[0];
  if (!title) { toast('Title is required', 'error'); return; }
  const btn = document.getElementById('notice-add-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    let imageUrl = '';
    if (file) imageUrl = await uploadImage(file, 'notices', 'notice-progress');
        if (editingNoticeId) {
      const updates = { title, date, category, important };
      if (file) updates.imageUrl = imageUrl;
      await db.collection('notices').doc(editingNoticeId).update(updates);
      editingNoticeId = null;
    } else {
      await db.collection('notices').add({ title, date, category, important, imageUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    document.getElementById('notice-title').value = '';
    document.getElementById('notice-date').value  = '';
    document.getElementById('notice-image').value = '';
    document.getElementById('notice-progress').style.width = '0';
    toast('Notice added! 🎉');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '+ Add Notice';
}

async function deleteNotice(id, imgUrl) {
  if (!confirm('Delete this notice?')) return;
  try {
    await db.collection('notices').doc(id).delete();
    await deleteStorageImage(imgUrl);
    toast('Notice deleted.');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ─── STAFF ───────────────────────────────────────────────────────────────
let staffUnsub = null;
function loadStaff() {
  if (staffUnsub) { staffUnsub(); staffUnsub = null; }
  const el = document.getElementById('staff-list');
  el.innerHTML = '<div class="empty"><div class="empty-icon">👩‍🏫</div>Loading...</div>';
  staffUnsub = db.collection('staff').onSnapshot(snap => {
        if (snap.empty) { el.innerHTML = '<div class="empty"><div class="empty-icon">👩‍🏫</div>No staff members yet.</div>'; return; }
    el.innerHTML = '';
      const isTeaching = s.isTeachingStaff !== false;
      const typeLabel = isTeaching ? '<span style="color:#28a745;font-size:0.75rem;padding-left:0.5rem;">(Teaching)</span>' : '<span style="color:#007bff;font-size:0.75rem;padding-left:0.5rem;">(Non-Teaching)</span>';
      const card = document.createElement('div'); card.className = 'item-card';
      card.innerHTML = `
        ${s.photoUrl ? `<img src="${sanitizeHTML(s.photoUrl)}" class="item-thumb">` : `<div class="item-thumb-placeholder">&#128100;</div>`}
        <div class="item-info"><h4>${sanitizeHTML(s.name)} ${typeLabel}</h4><p>${sanitizeHTML(s.role||'')} | ${sanitizeHTML(s.qualification||s.subject||'')} ${s.position ? '| '+sanitizeHTML(s.position) : ''}</p></div>
                <div class="item-actions">
          <button class="btn btn-outline btn-sm" onclick="editStaff('${id}', '${sanitizeHTML(s.name).replace(/'/g, \"\\\'\")}', '${sanitizeHTML(s.role||'').replace(/'/g, \"\\\'\")}', '${sanitizeHTML(s.qualification||s.subject||'').replace(/'/g, \"\\\'\")}', '${sanitizeHTML(s.position||'').replace(/'/g, \"\\\'\")}', ${isTeaching}, ${s.order||99}, '${s.photoUrl||''}')" style="color:var(--gold);border-color:var(--gold);">&#9998;</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStaff('${id}','${s.photoUrl||''}')">&#128465;</button>
        </div>`;
      el.appendChild(card);
    });
  }, err => { el.innerHTML = '<div class="empty">Error: ' + err.message + '</div>'; });
}

function editStaff(id, name, role, qual, pos, isTeaching, ord, img) {
  editingStaffId = id;
  document.getElementById('staff-name').value = name;
  document.getElementById('staff-role').value = role;
  document.getElementById('staff-qualification').value = qual;
  document.getElementById('staff-position').value = pos;
  document.getElementById('staff-type').value = isTeaching ? 'teaching' : 'non-teaching';
  document.getElementById('staff-order').value = ord;
  document.getElementById('staff-add-btn').textContent = 'Update Staff';
  window.scrollTo({top:0, behavior:'smooth'});
}

async function addStaff() {
  const name    = document.getElementById('staff-name').value.trim();
  const role    = document.getElementById('staff-role').value.trim();
  const qualification = document.getElementById('staff-qualification').value.trim();
  const position = document.getElementById('staff-position').value.trim();
  const isTeachingStaff = document.getElementById('staff-type').value === 'teaching';
  const order   = parseInt(document.getElementById('staff-order').value) || 99;
  const file    = document.getElementById('staff-photo').files[0];
  if (!name) { toast('Name is required', 'error'); return; }
  const btn = document.getElementById('staff-add-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    let photoUrl = '';
    if (file) photoUrl = await uploadImage(file, 'staff', 'staff-progress');
        if (editingStaffId) {
      const updates = { name, role, qualification, position, isTeachingStaff, order };
      if (file) updates.photoUrl = photoUrl;
      await db.collection('staff').doc(editingStaffId).update(updates);
      editingStaffId = null;
    } else {
      await db.collection('staff').add({ name, role, qualification, position, isTeachingStaff, photoUrl, order });
    }
    ['staff-name','staff-role','staff-qualification','staff-position','staff-order'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('staff-photo').value = '';
    document.getElementById('staff-progress').style.width = '0';
    toast('Staff member added! 🎉');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '+ Add Staff';
}

async function deleteStaff(id, photoUrl) {
  if (!confirm('Remove this staff member?')) return;
  try {
    await db.collection('staff').doc(id).delete();
    await deleteStorageImage(photoUrl);
    toast('Staff member removed.');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ─── COMMITTEE ───────────────────────────────────────────────────────────
let committeeUnsub = null;
function loadCommittee() {
  if (committeeUnsub) { committeeUnsub(); committeeUnsub = null; }
  const el = document.getElementById('committee-list');
  el.innerHTML = '<div class="empty"><div class="empty-icon">🏛️</div>Loading...</div>';
  committeeUnsub = db.collection('committee').onSnapshot(snap => {
        if (snap.empty) { el.innerHTML = '<div class="empty"><div class="empty-icon">👩‍🏫</div>No staff members yet.</div>'; return; }
    el.innerHTML = '';
        const docs = []; snap.forEach(d => docs.push(d));
    docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99)).forEach(doc => {
      const m = doc.data(); const id = doc.id;
      const card = document.createElement('div'); card.className = 'item-card';
      card.innerHTML = `
        ${m.photoUrl ? `<img src="${sanitizeHTML(m.photoUrl)}" class="item-thumb">` : `<div class="item-thumb-placeholder">${m.isChairperson ? '👑' : '👤'}</div>`}
        <div class="item-info">
          <h4>${sanitizeHTML(m.name)} ${m.isChairperson ? '<span class="badge badge-gold">Chairperson</span>' : ''}</h4>
          <p>${m.contact ? ' · '+m.contact : ''}</p>
        </div>
                <div class="item-actions">
          <button class="btn btn-outline btn-sm" onclick="editMember('${id}', '${sanitizeHTML(m.name).replace(/'/g, "\\'")}', '${sanitizeHTML(m.role||'').replace(/'/g, "\\'")}', '${sanitizeHTML(m.contact||'').replace(/'/g, "\\'")}', ${m.isChairperson}, ${m.order||99}, '${m.photoUrl||''}')" style="color:var(--gold);border-color:var(--gold);">✏</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMember('${id}','${m.photoUrl||''}')">🗑</button>
        </div>`;
      el.appendChild(card);
    });
  }, err => { el.innerHTML = '<div class="empty">Error: ' + err.message + '</div>'; });
}

function editMember(id, name, role, cont, isC, ord, img) {
  editingMemberId = id;
  document.getElementById('member-name').value = name;
  document.getElementById('member-role').value = role;
  document.getElementById('member-contact').value = cont;
  document.getElementById('member-chairperson').checked = isC;
  document.getElementById('member-order').value = ord;
  document.getElementById('member-add-btn').textContent = 'Update Member';
  window.scrollTo({top:0, behavior:'smooth'});
}

async function addMember() {
  const name          = document.getElementById('member-name').value.trim();
  const role          = document.getElementById('member-role').value.trim();
  const contact       = document.getElementById('member-contact').value.trim();
  const isChairperson = document.getElementById('member-chairperson').checked;
  const order         = parseInt(document.getElementById('member-order').value) || 99;
  const file          = document.getElementById('member-photo').files[0];
  if (!name) { toast('Name is required', 'error'); return; }
  const btn = document.getElementById('member-add-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    let photoUrl = '';
    if (file) photoUrl = await uploadImage(file, 'committee', 'member-progress');
        if (editingMemberId) {
      const updates = { name, role, contact, isChairperson, order };
      if (file) updates.photoUrl = photoUrl;
      await db.collection('committee').doc(editingMemberId).update(updates);
      editingMemberId = null;
    } else {
      await db.collection('committee').add({ name, role, contact, isChairperson, photoUrl, order });
    }
    ['member-name','member-role','member-contact','member-order'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('member-chairperson').checked = false;
    document.getElementById('member-photo').value = '';
    document.getElementById('member-progress').style.width = '0';
    toast('Member added! 🎉');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '+ Add Member';
}

async function deleteMember(id, photoUrl) {
  if (!confirm('Remove this committee member?')) return;
  try {
    await db.collection('committee').doc(id).delete();
    await deleteStorageImage(photoUrl);
    toast('Member removed.');
    loadOverviewStats();
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ─── GALLERY ─────────────────────────────────────────────────────────────
let currentGalleryCat = 'Building';
function setGalleryCat(cat) {
  currentGalleryCat = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === cat));
  const sel = document.getElementById('gallery-category');
  if (sel) sel.value = cat;
  loadGallery(cat);
}
function loadGallery(cat) {
  const el = document.getElementById('gallery-grid');
  el.innerHTML = '<div class="empty"><div class="empty-icon">📷</div>Loading...</div>';
  db.collection('gallery').where('category','==',cat).get().then(snap => {
    if (snap.empty) { el.innerHTML = '<div class="empty"><div class="empty-icon">📷</div>No photos in this category yet.</div>'; return; }
    el.innerHTML = '';
    el.className = 'gallery-grid';
    snap.forEach(doc => {
      const g = doc.data(); const id = doc.id;
      const item = document.createElement('div'); item.className = 'gal-item';
      item.innerHTML = `<img src="${g.imageUrl}" alt="${g.caption||cat}">
        <div class="gal-delete"><button class="btn btn-danger btn-sm" onclick="deleteGalleryPhoto('${id}','${g.imageUrl}')">🗑 Delete</button></div>`;
      el.appendChild(item);
    });
  }).catch(err => { el.innerHTML = '<div class="empty">Error: ' + err.message + '</div>'; });
}

async function uploadGalleryPhoto() {
  const file    = document.getElementById('gallery-file').files[0];
  const caption = document.getElementById('gallery-caption').value;
  const cat     = currentGalleryCat;
  if (!file) { toast('Please choose a photo first', 'error'); return; }
  const btn = document.getElementById('gallery-upload-btn');
  btn.disabled = true; btn.textContent = 'Uploading...';
  try {
    const imageUrl = await uploadImage(file, 'gallery/' + cat, 'gallery-progress');
    await db.collection('gallery').add({ imageUrl, caption, category: cat, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('gallery-file').value   = '';
    document.getElementById('gallery-caption').value = '';
    document.getElementById('gallery-progress').style.width = '0';
    loadGallery(cat);
    loadOverviewStats();
    toast('Photo uploaded! 🎉');
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '📤 Upload Photo';
}

async function deleteGalleryPhoto(id, imgUrl) {
  if (!confirm('Delete this photo permanently?')) return;
  try {
    await db.collection('gallery').doc(id).delete();
    await deleteStorageImage(imgUrl);
    loadGallery(currentGalleryCat);
    loadOverviewStats();
    toast('Photo deleted.');
  } catch(e) { toast('Error: ' + e.message, 'error'); }
}

// ─── SCHOOL INFO ─────────────────────────────────────────────────────────
async function loadSchoolInfo() {
  try {
    const doc = await db.collection('settings').doc('school').get();
    if (!doc.exists) return;
    const d = doc.data();
    const fields = ['name','tagline','ticker','ticker2','address','province','phone','estd','email1','email2','facebook1','facebook2','about'];
    fields.forEach(f => { const el = document.getElementById('school-'+f); if (el && d[f] !== undefined) el.value = d[f]; });
    if (d.bgUrl) {
      const bgPrev = document.getElementById('school-bg-preview');
      if (bgPrev) { bgPrev.src = d.bgUrl; bgPrev.style.display = 'block'; }
    }
    if (d.logoUrl) {
      const prev = document.getElementById('school-logo-preview');
      if (prev) { prev.src = d.logoUrl; prev.style.display = 'block'; }
    }
  } catch(e) { toast('Error loading school info: ' + e.message, 'error'); }
}

async function saveSchoolInfo() {
  const fields = ['name','tagline','ticker','ticker2','address','province','phone','estd','email1','email2','facebook1','facebook2','about'];
  const data = {};
  fields.forEach(f => { const el = document.getElementById('school-'+f); if (el) data[f] = el.value; });
  const file = document.getElementById('school-logo')?.files[0];
  const btn = document.getElementById('school-save-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    const bgFile = document.getElementById('school-bg')?.files[0];
    if (bgFile) {
      data.bgUrl = await uploadImage(bgFile, 'school', 'school-bg-progress');
      const bgPrev = document.getElementById('school-bg-preview');
      if (bgPrev) { bgPrev.src = data.bgUrl; bgPrev.style.display = 'block'; }
    }
    if (file) {
      data.logoUrl = await uploadImage(file, 'school', 'school-logo-progress');
      const prev = document.getElementById('school-logo-preview');
      if (prev) { prev.src = data.logoUrl; prev.style.display = 'block'; }
    }
    await db.collection('settings').doc('school').set(data, { merge: true });
    toast('School info saved! ✅');
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '💾 Save Changes';
}

// ─── PRINCIPAL ───────────────────────────────────────────────────────────
async function loadPrincipal() {
  try {
    const doc = await db.collection('settings').doc('principal').get();
    if (!doc.exists) return;
    const d = doc.data();
    ['name','email','message'].forEach(f => { const el = document.getElementById('principal-'+f); if (el && d[f]) el.value = d[f]; });
    const titleEl = document.getElementById('principal-title-field');
    if (titleEl && d.title) titleEl.value = d.title;
    if (d.photoUrl) {
      const prev = document.getElementById('principal-photo-preview');
      prev.src = d.photoUrl; prev.style.display = 'block';
    }
  } catch(e) { toast('Error loading principal info: ' + e.message, 'error'); }
}

async function savePrincipal() {
  const name    = document.getElementById('principal-name').value;
  const title   = document.getElementById('principal-title-field').value;
  const email   = document.getElementById('principal-email').value;
  const message = document.getElementById('principal-message').value;
  const file    = document.getElementById('principal-photo').files[0];
  const btn = document.getElementById('principal-save-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    const data = { name, title, email, message };
    const bgFile = document.getElementById('school-bg')?.files[0];
    if (bgFile) {
      data.bgUrl = await uploadImage(bgFile, 'school', 'school-bg-progress');
      const bgPrev = document.getElementById('school-bg-preview');
      if (bgPrev) { bgPrev.src = data.bgUrl; bgPrev.style.display = 'block'; }
    }
    if (file) {
      data.photoUrl = await uploadImage(file, 'principal', 'principal-progress');
      const prev = document.getElementById('principal-photo-preview');
      prev.src = data.photoUrl; prev.style.display = 'block';
    }
    await db.collection('settings').doc('principal').set(data, { merge: true });
    toast('Principal info saved! ✅');
  } catch(e) { toast('Error: ' + e.message, 'error'); }
  btn.disabled = false; btn.textContent = '💾 Save Changes';
}
