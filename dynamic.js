function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'=\/]/g, function (s) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '': '&#x60;', '=': '&#x3D;' }[s];
  });
}
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
        if (heroBg) { heroBg.src = s.bgUrl; heroBg.style.display = ""; }
      }
      if (s.logoUrl) {
        document.querySelectorAll('img[alt="School Logo"]').forEach(img => { img.src = s.logoUrl; img.style.display = ''; });
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = s.logoUrl;
      }
      if (s.phone) {
        document.querySelectorAll('.dyn-school-phone').forEach(el => { el.textContent = s.phone; if (el.closest('a')) el.closest('a').href = 'tel:' + s.phone; });
        document.querySelectorAll('.dyn-school-phone-link').forEach(el => el.href = 'tel:' + s.phone);
      }
      if (s.email1) {
        document.querySelectorAll('.dyn-school-email').forEach(el => { el.textContent = s.email1; if (el.closest('a')) el.closest('a').href = 'mailto:' + s.email1; });
        document.querySelectorAll('.dyn-school-email-link').forEach(el => el.href = 'mailto:' + s.email1);
      }
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
      db.collection('staff').get().then(snap => {
        if (!snap.empty) {
          staffGrid.innerHTML = '';
              const docs = []; snap.forEach(d => docs.push(d));
    docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99)).forEach(doc => {
            const s = doc.data();
            staffGrid.innerHTML += `<div class="glass-card staff-card reveal visible">
              ${s.photoUrl ? `<img src="${sanitizeHTML(s.photoUrl)}" class="staff-photo" alt="${sanitizeHTML(s.name)}" onerror="this.outerHTML='<div class=&quot;staff-photo-icon&quot;>👤</div>'">` : `<div class="staff-photo-icon">👤</div>`}
              <div class="staff-name">${sanitizeHTML(s.name)}</div>
              <div class="staff-role">${sanitizeHTML(s.role)}</div>
              <div class="staff-subject">${sanitizeHTML(s.subject)}</div>
            </div>`;
          });
        } else {
           staffGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">👩‍🏫</div><p>Staff directory is empty.</p></div>';
        }
      }).catch(console.error);
    }
  }

  // 4. Load Committee Directory
  if (path.includes('committee')) {
    const commGrid = document.querySelector('.grid-3');
    if (commGrid) {
      db.collection('committee').get().then(snap => {
        if (!snap.empty) {
          commGrid.innerHTML = '';
              const docs = []; snap.forEach(d => docs.push(d));
    docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99)).forEach(doc => {
            const c = doc.data();
            const isChair = c.isChairperson === true || (c.role && c.role.toLowerCase().includes('chair'));
            const cardStyle = isChair ? 'grid-column: 1 / -1; max-width: 380px; margin: 0 auto 1.5rem; border: 2px solid var(--gold); background: rgba(255, 183, 3, 0.05); transform: scale(1.03);' : '';
            const tag = isChair ? '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--navy);padding:4px 20px;border-radius:20px;font-size:0.85rem;font-weight:700;box-shadow:0 4px 15px rgba(0,0,0,0.3);z-index:2;letter-spacing:1px;text-transform:uppercase;">' + (c.role || 'Chairperson') + '</div>' : '';
            
            commGrid.innerHTML += `<div class="glass-card member-card reveal visible" style="position:relative; ${cardStyle}">
              ${tag}
              ${c.photoUrl ? `<img src="${sanitizeHTML(c.photoUrl)}" class="member-photo" alt="${sanitizeHTML(c.name)}" onerror="this.outerHTML='<div class=&quot;member-photo-placeholder&quot;>👤</div>'">` : `<div class="member-photo-placeholder">👤</div>`}
              <div class="member-name" style="${isChair ? 'color:var(--gold);font-size:1.4rem;' : ''}">${sanitizeHTML(c.name)}</div>
              <div class="member-role" style="${isChair ? 'display:none' : ''}">${sanitizeHTML(c.role)}</div>
              ${c.contact ? `<div class="member-contact">📞 <a href="tel:${sanitizeHTML(c.contact)}">${sanitizeHTML(c.contact)}</a></div>` : ''}
            </div>`;
          });
        } else {
           commGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">👥</div><p>Committee directory is empty.</p></div>';
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
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">📸</div><p>Gallery is empty.</p></div>';
        return;
      }
      
      let filtered = category === 'All' ? allPhotos : allPhotos.filter(p => p.category === category);
      if (filtered.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;margin-bottom:1rem;">📸</div><p>No photos in this category.</p></div>';
        return;
      }
      
      galleryGrid.innerHTML = '';
      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal visible';
        item.innerHTML = `<img src="${sanitizeHTML(p.url || p.imageUrl)}" alt="Gallery Image" loading="lazy"><div class="gallery-overlay"><span>🔍 View</span></div>`;
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
              <h4>${sanitizeHTML(n.title)}</h4>
              <span>📅 ${sanitizeHTML(n.date)} &nbsp; <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${n.category}</span></span>
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
          if (facComp && !compFound && d.category === 'Lab') { facComp.src = d.url || d.imageUrl; facComp.style.display = ""; compFound = true; }
          if (facSmart && !smartFound && d.category === 'Classroom') { facSmart.src = d.url || d.imageUrl; facSmart.style.display = ""; smartFound = true; }
          if (facGround && !groundFound && d.category === 'Ground') { facGround.src = d.url || d.imageUrl; facGround.style.display = ""; groundFound = true; }
        });
      }).catch(console.error);
    }
  }
});
