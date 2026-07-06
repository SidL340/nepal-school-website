// â”€â”€ Dynamic Data Loader for Shree Nepal Secondary School â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Loads data from Firebase Firestore and updates the DOM dynamically.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') return;

  const path = window.location.pathname.toLowerCase();

  // 1. Load School Info (Settings collection)
  db.collection('settings').doc('school').get().then(doc => {
    if (doc.exists) {
      const s = doc.data();
      if (s.name) {
        document.querySelectorAll('.dyn-school-name').forEach(el => el.textContent = s.name);
        if (document.title === 'School Website' || document.title.includes('School Website')) document.title = s.name + ' - Official Website';
      }
      if (s.bgUrl) {
        const heroBg = document.querySelector('.hero-bg img, #about-intro-bg');
        if (heroBg) heroBg.src = s.bgUrl;
      }
      if (s.logoUrl) {
        document.querySelectorAll('img[alt="School Logo"]').forEach(img => { img.src = s.logoUrl; img.style.display = ''; });
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = s.logoUrl;
      }
      if (s.phone) document.querySelectorAll('.dyn-school-phone').forEach(el => { el.textContent = s.phone; if (el.closest('a')) el.closest('a').href = 'tel:' + s.phone; });
      if (s.email1) document.querySelectorAll('.dyn-school-email').forEach(el => { el.textContent = s.email1; if (el.closest('a')) el.closest('a').href = 'mailto:' + s.email1; });
      if (s.about) document.querySelectorAll('.dyn-school-about').forEach(el => el.innerHTML = s.about.replace(/\n/g, '<br>'));
      else document.querySelectorAll('.dyn-school-about').forEach(el => el.innerHTML = 'Welcome to our school. We are dedicated to providing excellent education.');
    }
  }).catch(console.error);

  // 2. Load Principal Info
  const pNames = document.querySelectorAll('.principal-name');
  const pMessages = document.querySelectorAll('.message-text, .message-full');
  db.collection('settings').doc('principal').get().then(doc => {
    if (doc.exists) {
      const p = doc.data();
      if (p.name) pNames.forEach(el => el.textContent = p.name);
      if (p.message) pMessages.forEach(el => el.innerHTML = '"' + p.message.replace(/\n/g, '<br>') + '"');
      else pMessages.forEach(el => el.innerHTML = '"We are committed to nurturing young minds and building a better future."');
      if (p.email) document.querySelectorAll('.principal-email').forEach(el => { el.textContent = p.email; if (el.closest('a')) el.closest('a').href = 'mailto:' + p.email; });

      if (p.photoUrl) {
        const indexPhotoWrap = document.querySelector('.principal-photo-wrap');
        if (indexPhotoWrap) indexPhotoWrap.innerHTML = `<img src="${p.photoUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        
        if (path.includes('faculty')) {
          const facultyPhotoContainer = document.querySelector('.principal-hero .grid-2 > div:first-child');
          if (facultyPhotoContainer) {
            const oldImg = facultyPhotoContainer.querySelector('img, .principal-photo-placeholder');
            if (oldImg) oldImg.remove();
            facultyPhotoContainer.insertAdjacentHTML('afterbegin', `<img src="${p.photoUrl}" alt="${p.name}" class="principal-photo">`);
          }
          const facultyName = document.querySelector('.principal-hero p[style*="var(--gold)"]');
          if (facultyName) facultyName.textContent = 'â€” ' + p.name;
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
            staffGrid.innerHTML += `<div class="glass-card staff-card reveal visible">
              ${s.photoUrl ? `<img src="${s.photoUrl}" class="staff-photo" alt="${s.name}" onerror="this.outerHTML='<div class=&quot;staff-photo-icon&quot;>ðŸ‘¤</div>'">` : `<div class="staff-photo-icon">ðŸ‘¤</div>`}
              <div class="staff-name">${s.name}</div>
              <div class="staff-role">${s.role || 'Teacher'}</div>
              <div class="staff-subject">${s.subject || ''}</div>
            </div>`;
          });
        } else {
           staffGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">ðŸ‘©â€ðŸ«</div><p>Staff directory is empty.</p></div>';
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
            commGrid.innerHTML += `<div class="glass-card member-card reveal visible">
              ${c.photoUrl ? `<img src="${c.photoUrl}" class="member-photo" alt="${c.name}" onerror="this.outerHTML='<div class=&quot;member-photo-placeholder&quot;>ðŸ‘¤</div>'">` : `<div class="member-photo-placeholder">ðŸ‘¤</div>`}
              <div class="member-name">${c.name}</div>
              <div class="member-role">${c.role}</div>
              ${c.contact ? `<div class="member-contact">ðŸ“ž <a href="tel:${c.contact}">${c.contact}</a></div>` : ''}
            </div>`;
          });
        } else {
           commGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">ðŸ‘¥</div><p>Committee directory is empty.</p></div>';
        }
      }).catch(console.error);
    }
  }

  // 5. Load Gallery
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const filterBtns = document.querySelectorAll('.gfilter-btn');
    let allPhotos = [];
    
    function renderGallery(category) {
      if (allPhotos.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">ðŸ“·</div><p>Gallery is empty.</p></div>';
        return;
      }
      
      let filtered = category === 'All' ? allPhotos : allPhotos.filter(p => p.category === category);
      if (filtered.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">ðŸ“·</div><p>No photos in this category.</p></div>';
        return;
      }
      
      galleryGrid.innerHTML = '';
      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal visible';
        item.innerHTML = `<img src="${p.url || p.imageUrl}" alt="Gallery Image" loading="lazy"><div class="gallery-overlay"><span>ðŸ” View</span></div>`;
        item.addEventListener('click', () => {
          document.getElementById('lightbox-img').src = p.url || p.imageUrl;
          document.getElementById('lightbox-overlay').classList.add('active');
        });
        galleryGrid.appendChild(item);
      });
    }

    db.collection('gallery').orderBy('createdAt','desc').get().then(snap => {
        if (!snap.empty) {
          snap.forEach(doc => allPhotos.push(doc.data()));
          renderGallery('All');
          
          if (filterBtns) {
            filterBtns.forEach(btn => {
              btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderGallery(btn.dataset.category || btn.textContent.trim());
              });
            });
          }
        } else {
          renderGallery('All');
        }
    }).catch(console.error);
  }

  // 6. Load Notices
  const noticeList = document.getElementById('notice-preview-list');
  const noticeGrid = document.getElementById('notice-grid');
  if (noticeList || noticeGrid) {
    db.collection('notices').orderBy('createdAt','desc').get().then(snap => {
      if (!snap.empty) {
        if (noticeList) noticeList.innerHTML = '';
        if (noticeGrid) noticeGrid.innerHTML = '';
        let count = 0;
        snap.forEach(doc => {
          const n = doc.data();
          const cardHTML = `<div class="${noticeGrid ? 'notice-card reveal visible' : 'notice-preview-card'}">
            <div class="notice-icon">${n.important ? '⚠️' : '📄'}</div>
            <div class="notice-info">
              <h4>${n.title}</h4>
              <span>📅 ${n.date} &nbsp; <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${n.category}</span></span>
            </div>
            ${n.imageUrl && noticeGrid ? `<a href="${n.imageUrl}" target="_blank" class="btn btn-outline" style="margin-top:1rem;display:inline-block;padding:0.35rem 0.8rem;font-size:0.8rem">View Attachment</a>` : ''}
          </div>`;
          
          if (noticeGrid) noticeGrid.innerHTML += cardHTML;
          if (noticeList && count < 3) noticeList.innerHTML += cardHTML;
          count++;
        });
      } else {
        if (noticeList) noticeList.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No notices yet.</p>';
        if (noticeGrid) noticeGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No notices yet.</p>';
      }
    }).catch(console.error);
  }

  // 7. Load Facilities Photos (Home Page)
  if (path === '/' || path.includes('index')) {
    const facComp = document.getElementById('fac-computer');
    const facSmart = document.getElementById('fac-smart');
    const facGround = document.getElementById('fac-ground');
    
    if (facComp || facSmart || facGround) {
      db.collection('gallery').orderBy('createdAt', 'desc').get().then(snap => {
        if (snap.empty) return;
        let compFound = false, smartFound = false, groundFound = false;
        snap.forEach(doc => {
          const d = doc.data();
          if (facComp && !compFound && d.category === 'Lab') { facComp.src = d.url || d.imageUrl; compFound = true; }
          if (facSmart && !smartFound && d.category === 'Classroom') { facSmart.src = d.url || d.imageUrl; smartFound = true; }
          if (facGround && !groundFound && d.category === 'Sports') { facGround.src = d.url || d.imageUrl; groundFound = true; }
        });
      }).catch(console.error);
    }
  }
});
