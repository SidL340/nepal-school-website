// ── Dynamic Data Loader for Shree Nepal Secondary School ─────────────────────
// Loads data from Firebase Firestore and updates the DOM dynamically.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') return;

  const path = window.location.pathname.toLowerCase();

  // 1. Load School Info (Settings collection)
  db.collection('settings').doc('school').get().then(doc => {
    if (doc.exists) {
      const s = doc.data();
      
      // Update names
      if (s.name) {
        document.querySelectorAll('.dyn-school-name').forEach(el => {
          el.textContent = s.name;
        });
        if (document.title === 'School Website' || document.title.includes('School Website')) {
           document.title = s.name + ' - Official Website';
        }
      }
      
      // Update phones
      if (s.phone) {
        document.querySelectorAll('.dyn-school-phone').forEach(el => {
          el.textContent = s.phone;
          // If the parent is an anchor tag, update its href
          if (el.closest('a')) el.closest('a').href = 'tel:' + s.phone;
        });
      }
      
      // Update emails
      if (s.email1) {
        document.querySelectorAll('.dyn-school-email').forEach(el => {
          el.textContent = s.email1;
          if (el.closest('a')) el.closest('a').href = 'mailto:' + s.email1;
        });
      }
      
      // Update about text
      if (s.about) {
        document.querySelectorAll('.dyn-school-about').forEach(el => {
          el.innerHTML = s.about.replace(/\n/g, '<br>');
        });
      }
    }
  }).catch(console.error);

  // 2. Load Principal Info (Settings collection)
  const pNames = document.querySelectorAll('.principal-name');
  const pMessages = document.querySelectorAll('.message-text, .message-full');
  
  db.collection('settings').doc('principal').get().then(doc => {
    if (doc.exists) {
      const p = doc.data();
      if (p.name) pNames.forEach(el => el.textContent = p.name);
      if (p.message) pMessages.forEach(el => el.innerHTML = '"' + p.message.replace(/\n/g, '<br>') + '"');
      
      // Update Principal Email explicitly
      if (p.email) {
        document.querySelectorAll('.principal-email').forEach(el => {
          el.textContent = p.email;
          if (el.closest('a')) el.closest('a').href = 'mailto:' + p.email;
        });
      }

      if (p.photoUrl) {
        const indexPhotoWrap = document.querySelector('.principal-photo-wrap');
        if (indexPhotoWrap) {
          indexPhotoWrap.innerHTML = \`<img src="\${p.photoUrl}" alt="\${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">\`;
        }
        
        if (path.includes('faculty')) {
          const facultyPhotoContainer = document.querySelector('.principal-hero .grid-2 > div:first-child');
          if (facultyPhotoContainer) {
            const oldImg = facultyPhotoContainer.querySelector('img, .principal-photo-placeholder');
            if (oldImg) oldImg.remove();
            facultyPhotoContainer.insertAdjacentHTML('afterbegin', \`<img src="\${p.photoUrl}" alt="\${p.name}" class="principal-photo">\`);
          }
          const facultyName = document.querySelector('.principal-hero p[style*="var(--gold)"]');
          if (facultyName) facultyName.textContent = '— ' + p.name;
        }
      }
    }
  }).catch(console.error);

  // 3. Load Staff Directory
  if (path.includes('faculty')) {
    const staffGrid = document.querySelector('.grid-4'); 
    if (staffGrid) {
      db.collection('staff').orderBy('order').get().then(snap => {
        if (!snap.empty) {
          staffGrid.innerHTML = '';
          snap.forEach(doc => {
            const s = doc.data();
            const card = document.createElement('div');
            card.className = 'glass-card staff-card reveal visible';
            card.innerHTML = \`
              \${s.photoUrl 
                ? \`<img src="\${s.photoUrl}" class="staff-photo" alt="\${s.name}" onerror="this.outerHTML='<div class=\\'staff-photo-icon\\'>👤</div>'">\`
                : \`<div class="staff-photo-icon">👤</div>\`}
              <div class="staff-name">\${s.name}</div>
              <div class="staff-role">\${s.role || 'Teacher'}</div>
              <div class="staff-subject">\${s.subject || ''}</div>
            \`;
            staffGrid.appendChild(card);
          });
        } else {
           staffGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">👩‍🏫</div><p>Staff directory is currently being updated.</p></div>';
        }
      }).catch(console.error);
    }
  }

  // 4. Load Committee Directory
  if (path.includes('committee')) {
    const commGrid = document.querySelector('.grid-3');
    if (commGrid) {
      db.collection('committee').orderBy('order').get().then(snap => {
        if (!snap.empty) {
          commGrid.innerHTML = '';
          snap.forEach(doc => {
            const c = doc.data();
            const card = document.createElement('div');
            card.className = 'glass-card member-card reveal visible';
            card.innerHTML = \`
              \${c.photoUrl 
                ? \`<img src="\${c.photoUrl}" class="member-photo" alt="\${c.name}" onerror="this.outerHTML='<div class=\\'member-photo-placeholder\\'>👤</div>'">\`
                : \`<div class="member-photo-placeholder">👤</div>\`}
              <div class="member-name">\${c.name}</div>
              <div class="member-role">\${c.role}</div>
              \${c.contact ? \`<div class="member-contact">📞 <a href="tel:\${c.contact}">\${c.contact}</a></div>\` : ''}
            \`;
            commGrid.appendChild(card);
          });
        } else {
           commGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">👥</div><p>Committee directory is currently being updated.</p></div>';
        }
      }).catch(console.error);
    }
  }

  // 5. Load Gallery
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
