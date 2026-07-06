// --- ATTACHMENT MODAL ---
window.openAttachmentModal = function(url) {
  let modal = document.getElementById('attachment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'attachment-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(5px);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
    
    modal.innerHTML = `
      <div style="position:absolute;top:20px;right:30px;color:white;font-size:3rem;cursor:pointer;user-select:none;line-height:1;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="closeAttachmentModal()">&times;</div>
      <div id="attachment-content" style="max-width:90%;max-height:90%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'attachment-content') closeAttachmentModal();
    });
  }
  
  const content = document.getElementById('attachment-content');
  content.innerHTML = '<div style="color:white;font-size:1.2rem;">Loading...</div>';
  
  modal.style.display = 'flex';
  setTimeout(() => modal.style.opacity = '1', 10);
  
  const safeUrl = sanitizeHTML(url);
  if (safeUrl.toLowerCase().includes('.pdf')) {
    // Open PDFs directly in a new tab to bypass mobile iframe restrictions
    closeAttachmentModal();
    window.open(safeUrl, '_blank');
  } else {
    content.innerHTML = `<img src="${safeUrl}" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.5);">`;
  }
}

window.closeAttachmentModal = function() {
  const modal = document.getElementById('attachment-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
  }
}
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

      const isHomePage = document.querySelector('.hero-content') !== null;
      if ((s.ticker || s.ticker2) && isHomePage) {
        let tw = document.getElementById('ticker-wrapper');
        if (!tw) {
          tw = document.createElement('div');
          tw.id = 'ticker-wrapper';
          const nav = document.getElementById('navbar');
          if (nav && nav.parentNode) { nav.parentNode.insertBefore(tw, nav.nextSibling); }
          else { document.body.insertBefore(tw, document.body.firstChild); }
        }
        tw.innerHTML = ''; // clear existing
        tw.style.display = 'block';
        
        const slider = document.createElement('div');
        slider.id = 'ticker-slider';
        
        if (s.ticker) {
          const tm1 = document.createElement('div');
          tm1.className = 'home-ticker-line';
          tm1.textContent = s.ticker;
          slider.appendChild(tm1);
        }
        if (s.ticker2) {
          const tm2 = document.createElement('div');
          tm2.className = 'home-ticker-line';
          tm2.textContent = s.ticker2;
          slider.appendChild(tm2);
        }
        
        tw.appendChild(slider);
      } else {
        const tw = document.getElementById('ticker-wrapper');
        if (tw) tw.style.display = 'none';
      }
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
      const parentContainer = staffGrid.parentNode;
      
      db.collection('staff').get().then(snap => {
        if (!snap.empty) {
          parentContainer.innerHTML = ''; // clear existing
          
          const docs = []; snap.forEach(d => docs.push(d));
          docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99));
          
          const teaching = docs.filter(d => d.data().isTeachingStaff !== false);
          const nonTeaching = docs.filter(d => d.data().isTeachingStaff === false);
          
          function renderSection(title, list) {
            if (list.length === 0) return;
            const sec = document.createElement('div');
            sec.style.marginBottom = "4rem";
            sec.innerHTML = `
              <div style="text-align:center; margin-bottom: 2rem;">
                <h3 style="color:var(--gold); font-size:1.8rem; margin-top:2rem;">${title}</h3>
                <div class="gold-line" style="margin:0.5rem auto 0; width:50px; height:3px; background:var(--gold);"></div>
              </div>
              <div class="grid-4">
                ${list.map(doc => {
                  const s = doc.data();
                  return `<div class="glass-card staff-card reveal visible" style="position:relative;">
                    ${s.photoUrl ? `<img src="${sanitizeHTML(s.photoUrl)}" class="staff-photo" alt="${sanitizeHTML(s.name)}" onerror="this.outerHTML='<div class=&quot;staff-photo-icon&quot;>👤</div>'">` : `<div class="staff-photo-icon">👤</div>`}
                    <div class="staff-name">${sanitizeHTML(s.name)}</div>
                    <div class="staff-role">${sanitizeHTML(s.role)}</div>
                    <div class="staff-subject">${sanitizeHTML(s.qualification||s.subject||'')}</div>
                    ${s.position ? `<div style="margin-top:0.75rem; background:rgba(244,169,0,0.15); border:1px solid rgba(244,169,0,0.3); color:var(--gold); padding:0.25rem 0.5rem; border-radius:50px; font-size:0.75rem; font-weight:600; display:inline-block;">${sanitizeHTML(s.position)}</div>` : ''}
                  </div>`;
                }).join('')}
              </div>
            `;
            parentContainer.appendChild(sec);
          }
          
          renderSection('Teaching Staff', teaching);
          renderSection('Non-Teaching Staff', nonTeaching);
          
        } else {
           staffGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);"><div style="font-size:3rem;">👥</div><p>Staff directory is empty.</p></div>';
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
  const noticeFilter = document.getElementById('notice-filter');
  if (noticeList || noticeGrid) {
    db.collection('notices').orderBy('createdAt','desc').get().then(snap => {
      if (!snap.empty) {
        if (noticeList) noticeList.innerHTML = '';
        if (noticeGrid) noticeGrid.innerHTML = '';
        const allNotices = [];
        snap.forEach(doc => allNotices.push(doc.data()));

        if (noticeList) {
          allNotices.slice(0, 3).forEach(n => {
            noticeList.innerHTML += `<div class="notice-preview-card">
              <div class="notice-icon">${n.important ? '&#10071;' : '&#128227;'}</div>
              <div class="notice-info">
                <h4>${sanitizeHTML(n.title)}</h4>
                <span>&#128197; ${sanitizeHTML(n.date)} &nbsp; <span class="badge ${n.important ? '&#10071;' : '&#128227;'}">${n.category}</span></span>
              </div>
            </div>`;
          });
        }

        if (noticeGrid) {
          const renderGrid = (filterCat) => {
            noticeGrid.innerHTML = '';
            allNotices.forEach(n => {
              if (filterCat !== 'All' && n.category !== filterCat) return;
              noticeGrid.innerHTML += `<div class="notice-card reveal visible" data-category="${n.category}">
                <div class="notice-icon">${n.important ? '&#10071;' : '&#128227;'}</div>
                <div class="notice-info">
                  <h4>${sanitizeHTML(n.title)}</h4>
                  <span>&#128197; ${sanitizeHTML(n.date)} &nbsp; <span class="badge ${n.important ? '&#10071;' : '&#128227;'}">${n.category}</span></span>
                </div>
                ${n.imageUrl ? `<button onclick="openAttachmentModal('${n.imageUrl}')" class="btn btn-outline" style="margin-top:1rem;display:inline-block;padding:0.35rem 0.8rem;font-size:0.8rem;cursor:pointer;">View Attachment</button>` : ''}
              </div>`;
            });
          };

          renderGrid('All');

          if (noticeFilter) {
             const categories = ['All', ...new Set(allNotices.map(n => n.category))];
             noticeFilter.innerHTML = '';
             categories.forEach(cat => {
               const btn = document.createElement('button');
               btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
               btn.textContent = cat;
               btn.dataset.filter = cat;
               btn.addEventListener('click', () => {
                 noticeFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                 btn.classList.add('active');
                 renderGrid(cat);
               });
               noticeFilter.appendChild(btn);
             });
          }
        }
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
