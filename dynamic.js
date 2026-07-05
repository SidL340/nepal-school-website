// ── Dynamic Data Loader for Shree Nepal Secondary School ─────────────────────
// Loads data from Firebase Firestore and updates the DOM if elements exist.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') return;

  // 1. Load Principal Info
  const principalEls = {
    names: document.querySelectorAll('.principal-name'),
    photos: document.querySelectorAll('.principal-photo-wrap img, .principal-photo'),
    messages: document.querySelectorAll('.message-text, .message-full')
  };
  
  if (principalEls.names.length > 0) {
    db.collection('schoolInfo').doc('principal').get().then(doc => {
      if (doc.exists) {
        const p = doc.data();
        if (p.name) principalEls.names.forEach(el => el.textContent = p.name);
        if (p.message) principalEls.messages.forEach(el => el.innerHTML = '"' + p.message.replace(/\n/g, '<br>') + '"');
        if (p.photoUrl) principalEls.photos.forEach(el => el.src = p.photoUrl);
      }
    }).catch(console.error);
  }

  // 2. Load Staff Directory
  const staffGrid = document.querySelector('.grid-4'); // faculty.html grid
  if (staffGrid && window.location.pathname.includes('faculty.html')) {
    db.collection('staff').orderBy('order').get().then(snap => {
      if (!snap.empty) {
        staffGrid.innerHTML = '';
        snap.forEach(doc => {
          const s = doc.data();
          const card = document.createElement('div');
          card.className = 'glass-card staff-card reveal visible';
          card.innerHTML = `
            ${s.photoUrl 
              ? \`<img src="\${s.photoUrl}" class="staff-photo" alt="\${s.name}" onerror="this.outerHTML='<div class=\\'staff-photo-icon\\'>👤</div>'">\`
              : \`<div class="staff-photo-icon">👤</div>\`}
            <div class="staff-name">\${s.name}</div>
            <div class="staff-role">\${s.role || 'Teacher'}</div>
            <div class="staff-subject">\${s.subject || ''}</div>
          `;
          staffGrid.appendChild(card);
        });
      }
    }).catch(console.error);
  }

  // 3. Load Committee Directory
  const commGrid = document.querySelector('.grid-3'); // committee.html grid
  if (commGrid && window.location.pathname.includes('committee.html')) {
    db.collection('committee').orderBy('order').get().then(snap => {
      if (!snap.empty) {
        commGrid.innerHTML = '';
        snap.forEach(doc => {
          const c = doc.data();
          const card = document.createElement('div');
          card.className = 'glass-card member-card reveal visible';
          card.innerHTML = `
            ${c.photoUrl 
              ? \`<img src="\${c.photoUrl}" class="member-photo" alt="\${c.name}" onerror="this.outerHTML='<div class=\\'member-photo-placeholder\\'>👤</div>'">\`
              : \`<div class="member-photo-placeholder">👤</div>\`}
            <div class="member-name">\${c.name}</div>
            <div class="member-role">\${c.role}</div>
            ${c.contact ? \`<div class="member-contact">📞 <a href="tel:\${c.contact}">\${c.contact}</a></div>\` : ''}
          `;
          commGrid.appendChild(card);
        });
      }
    }).catch(console.error);
  }

  // 4. Load Gallery
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    async function renderGallery(category) {
      galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">⏳</div><p>Loading photos...</p></div>';
      try {
        const snap = await db.collection('gallery').get();
        let photos = [];
        snap.forEach(doc => photos.push(doc.data()));
        if (category !== 'All') photos = photos.filter(p => p.category === category);
        photos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        if (photos.length === 0) {
          galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 0;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">📷</div><p>No photos in this category yet.</p></div>';
          return;
        }
        
        galleryGrid.innerHTML = '';
        photos.forEach(p => {
          const item = document.createElement('div');
          item.className = 'gallery-item reveal visible';
          item.dataset.lightbox = p.url;
          item.innerHTML = \`<img src="\${p.url}" alt="Gallery Image" loading="lazy">
                           <div class="gallery-overlay"><span>🔍 View</span></div>\`;
          item.addEventListener('click', () => {
            const lbOverlay = document.getElementById('lightbox-overlay');
            const lbImg = document.getElementById('lightbox-img');
            if (lbOverlay && lbImg) {
              lbImg.src = p.url;
              lbOverlay.classList.add('active');
              document.body.style.overflow = 'hidden';
            }
          });
          galleryGrid.appendChild(item);
        });
      } catch(e) { console.error('Error loading gallery:', e); }
    }
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.textContent.trim());
      });
    });
    renderGallery('All');
  }

});
