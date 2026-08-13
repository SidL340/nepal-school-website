// ─── dynamic.js — Real-Time High Performance Firestore Data Loader ───────────

// Attachment Modal Handler
window.openAttachmentModal = function(url) {
  let modal = document.getElementById('attachment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'attachment-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(7,15,30,0.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';
    
    modal.innerHTML = `
      <div style="position:absolute;top:20px;right:30px;color:white;font-size:2.5rem;cursor:pointer;user-select:none;line-height:1;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="closeAttachmentModal()">&times;</div>
      <div id="attachment-content" style="max-width:90%;max-height:90%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'attachment-content') closeAttachmentModal();
    });
  }
  
  const content = document.getElementById('attachment-content');
  content.innerHTML = '<div style="color:var(--gold);font-size:1.2rem;font-weight:600;">Loading Attachment...</div>';
  
  modal.style.display = 'flex';
  setTimeout(() => modal.style.opacity = '1', 10);
  
  const safeUrl = sanitizeHTML(url);
  if (safeUrl.toLowerCase().includes('.pdf')) {
    closeAttachmentModal();
    window.open(safeUrl, '_blank');
  } else {
    content.innerHTML = `<img src="${safeUrl}" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,0.7);border:1px solid rgba(244,169,0,0.3);">`;
  }
};

window.closeAttachmentModal = function() {
  const modal = document.getElementById('attachment-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
  }
};

function optimizeImage(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('/image/upload/') && !url.includes('c_limit') && !url.toLowerCase().includes('.pdf')) {
    return url.replace('/image/upload/', '/image/upload/c_limit,w_1200,q_auto,f_auto/');
  }
  return url;
}

function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'=\/]/g, function (s) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '=': '&#x3D;' }[s];
  });
}

function removeSkeletons(container) {
  if (!container) return;
  const skeletons = container.querySelectorAll('.skeleton-card, .skeleton-text, .skeleton-img, .skeleton');
  skeletons.forEach(el => el.classList.remove('skeleton', 'skeleton-card', 'skeleton-text', 'skeleton-img'));
}

// Global data synchronization
document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') return;

  const path = window.location.pathname.toLowerCase();

  // 1. Real-time School Settings Listener
  db.collection('settings').doc('school').onSnapshot(doc => {
    if (doc.exists) {
      const s = doc.data();
      if (s.name) {
        document.querySelectorAll('.dyn-school-name').forEach(el => {
          el.textContent = s.name;
          el.classList.remove('skeleton-text');
        });
        if (document.title === 'School Website' || document.title.includes('School Website')) {
          document.title = s.name + ' - Official Website';
        }
      }
      if (s.bgUrl) {
        const heroBg = document.querySelector('.hero-bg img, #about-intro-bg');
        if (heroBg) {
          heroBg.src = optimizeImage(s.bgUrl);
          heroBg.style.display = "";
        }
      }
      if (s.logoUrl) {
        document.querySelectorAll('img[alt="School Logo"]').forEach(img => {
          img.src = optimizeImage(s.logoUrl);
          img.style.display = '';
        });
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) favicon.href = s.logoUrl;
      }
      if (s.phone) {
        document.querySelectorAll('.dyn-school-phone').forEach(el => {
          el.textContent = s.phone;
          if (el.closest('a')) el.closest('a').href = 'tel:' + s.phone;
        });
        document.querySelectorAll('.dyn-school-phone-link').forEach(el => el.href = 'tel:' + s.phone);
      }
      if (s.email1) {
        document.querySelectorAll('.dyn-school-email').forEach(el => {
          el.textContent = s.email1;
          if (el.closest('a')) el.closest('a').href = 'mailto:' + s.email1;
        });
        document.querySelectorAll('.dyn-school-email-link').forEach(el => el.href = 'mailto:' + s.email1);
      }
      if (s.about) {
        document.querySelectorAll('.dyn-school-about').forEach(el => {
          el.innerHTML = s.about.replace(/\n/g, '<br>');
          el.classList.remove('skeleton-text');
        });
      }

      // Ticker Bar Animation
      const isHomePage = document.querySelector('.hero-content') !== null || path === '/' || path.includes('index');
      if ((s.ticker || s.ticker2) && isHomePage) {
        let tw = document.getElementById('ticker-wrapper');
        if (!tw) {
          tw = document.createElement('div');
          tw.id = 'ticker-wrapper';
          tw.className = 'ticker-bar';
          const nav = document.getElementById('navbar');
          if (nav && nav.parentNode) { nav.parentNode.insertBefore(tw, nav.nextSibling); }
          else { document.body.insertBefore(tw, document.body.firstChild); }
        }
        tw.innerHTML = '';
        tw.style.display = 'block';
        
        const slider = document.createElement('div');
        slider.id = 'ticker-slider';
        slider.className = 'ticker-content';
        
        const items = [];
        if (s.ticker) items.push(s.ticker);
        if (s.ticker2) items.push(s.ticker2);
        
        slider.innerHTML = items.map(t => `<div class="ticker-item"><span class="ticker-badge">LATEST</span> ${sanitizeHTML(t)}</div>`).join('');
        tw.appendChild(slider);
      } else {
        const tw = document.getElementById('ticker-wrapper');
        if (tw) tw.style.display = 'none';
      }
    }
  }, console.error);

  // 2. Real-Time Principal Settings Listener
  const pNames = document.querySelectorAll('.principal-name');
  const pMessages = document.querySelectorAll('.message-text, .message-full');
  db.collection('settings').doc('principal').onSnapshot(doc => {
    if (doc.exists) {
      const p = doc.data();
      if (p.name) pNames.forEach(el => { el.textContent = p.name; el.classList.remove('skeleton-text'); });
      if (p.message) pMessages.forEach(el => { el.innerHTML = '"' + p.message.replace(/\n/g, '<br>') + '"'; el.classList.remove('skeleton-text'); });
      if (p.email) document.querySelectorAll('.principal-email').forEach(el => { el.textContent = p.email; if (el.closest('a')) el.closest('a').href = 'mailto:' + p.email; });

      if (p.photoUrl) {
        const indexPhotoWrap = document.querySelector('.principal-photo-wrap');
        if (indexPhotoWrap) indexPhotoWrap.innerHTML = `<img src="${optimizeImage(p.photoUrl)}" alt="${sanitizeHTML(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:3px solid var(--gold);">`;
        
        if (path.includes('faculty')) {
          const facultyPhotoContainer = document.querySelector('.principal-hero .grid-2 > div:first-child');
          if (facultyPhotoContainer) {
            const oldImg = facultyPhotoContainer.querySelector('img, .principal-photo-placeholder, .skeleton-img');
            if (oldImg) oldImg.remove();
            facultyPhotoContainer.insertAdjacentHTML('afterbegin', `<img src="${optimizeImage(p.photoUrl)}" alt="${sanitizeHTML(p.name)}" class="principal-photo" style="border-radius:20px;box-shadow:var(--shadow-gold);">`);
          }
          const facultyName = document.querySelector('.principal-hero p[style*="var(--gold)"]');
          if (facultyName) facultyName.textContent = '— ' + p.name;
        }
      }
    }
  }, console.error);

  // 3. Real-Time Staff Directory Listener
  if (path.includes('faculty')) {
    const staffGrid = document.querySelector('.grid-4'); 
    if (staffGrid) {
      const parentContainer = staffGrid.parentNode;
      
      db.collection('staff').onSnapshot(snap => {
        if (!snap.empty) {
          parentContainer.innerHTML = '';
          const docs = [];
          snap.forEach(d => docs.push(d));
          docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99));
          
          const teaching = docs.filter(d => d.data().isTeachingStaff !== false);
          const nonTeaching = docs.filter(d => d.data().isTeachingStaff === false);
          
          function renderSection(title, list) {
            if (list.length === 0) return;
            const sec = document.createElement('div');
            sec.style.marginBottom = "4rem";
            sec.innerHTML = `
              <div style="text-align:center; margin-bottom: 2.5rem;">
                <h3 style="color:var(--gold); font-size:2rem; margin-top:2rem;">${title}</h3>
                <div class="gold-line" style="margin:0.5rem auto 0; width:60px; height:3px; background:var(--gold-gradient);"></div>
              </div>
              <div class="grid-4">
                ${list.map(doc => {
                  const s = doc.data();
                  return `<div class="glass-card staff-card reveal visible" style="position:relative;text-align:center;padding:1.75rem 1.25rem;">
                    ${s.photoUrl ? `<img src="${sanitizeHTML(optimizeImage(s.photoUrl))}" class="staff-photo" alt="${sanitizeHTML(s.name)}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;border:3px solid var(--gold);" onerror="this.outerHTML='<div class=&quot;staff-photo-icon&quot;>👤</div>'">` : `<div class="staff-photo-icon" style="width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto 1rem;border:2px dashed var(--gold);">👤</div>`}
                    <div class="staff-name" style="font-size:1.15rem;font-weight:700;color:var(--white);margin-bottom:0.25rem;">${sanitizeHTML(s.name)}</div>
                    <div class="staff-role" style="color:var(--gold);font-size:0.9rem;font-weight:600;">${sanitizeHTML(s.role)}</div>
                    <div class="staff-subject" style="color:var(--text-muted);font-size:0.82rem;margin-top:0.35rem;">${sanitizeHTML(s.qualification||s.subject||'')}</div>
                    ${s.position ? `<div style="margin-top:0.75rem; background:rgba(244,169,0,0.15); border:1px solid rgba(244,169,0,0.4); color:var(--gold-light); padding:0.25rem 0.75rem; border-radius:50px; font-size:0.75rem; font-weight:600; display:inline-block;">${sanitizeHTML(s.position)}</div>` : ''}
                  </div>`;
                }).join('')}
              </div>
            `;
            parentContainer.appendChild(sec);
          }
          
          renderSection('Teaching Faculty', teaching);
          renderSection('Administrative & Support Staff', nonTeaching);
          
        } else {
           staffGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;"><div style="font-size:3.5rem;">👥</div><p>Staff directory is being updated.</p></div>';
        }
      }, console.error);
    }
  }

  // 4. Real-Time Committee Listener
  if (path.includes('committee')) {
    const commGrid = document.querySelector('.grid-3');
    if (commGrid) {
      db.collection('committee').onSnapshot(snap => {
        if (!snap.empty) {
          commGrid.innerHTML = '';
          const docs = []; snap.forEach(d => docs.push(d));
          docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99)).forEach(doc => {
            const c = doc.data();
            const isChair = c.isChairperson === true || (c.role && c.role.toLowerCase().includes('chair'));
            const cardStyle = isChair ? 'grid-column: 1 / -1; max-width: 420px; margin: 0 auto 2rem; border: 2px solid var(--gold); background: rgba(244, 169, 0, 0.08); transform: scale(1.04);' : '';
            const tag = isChair ? '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--gold-gradient);color:var(--navy);padding:4px 22px;border-radius:20px;font-size:0.85rem;font-weight:800;box-shadow:0 4px 15px rgba(244,169,0,0.4);z-index:2;letter-spacing:1px;text-transform:uppercase;">' + (c.role || 'Chairperson') + '</div>' : '';
            
            commGrid.innerHTML += `<div class="glass-card member-card reveal visible" style="position:relative; text-align:center; padding:2rem 1.5rem; ${cardStyle}">
              ${tag}
              ${c.photoUrl ? `<img src="${sanitizeHTML(optimizeImage(c.photoUrl))}" class="member-photo" alt="${sanitizeHTML(c.name)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;border:3px solid var(--gold);" onerror="this.outerHTML='<div class=&quot;member-photo-placeholder&quot;>👤</div>'">` : `<div class="member-photo-placeholder" style="width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:3rem;margin:0 auto 1rem;border:2px dashed var(--gold);">👤</div>`}
              <div class="member-name" style="font-size:1.25rem;font-weight:700;${isChair ? 'color:var(--gold-light);font-size:1.45rem;' : 'color:var(--white);'}">${sanitizeHTML(c.name)}</div>
              <div class="member-role" style="color:var(--gold);font-size:0.9rem;font-weight:600;margin-top:0.25rem;${isChair ? 'display:none' : ''}">${sanitizeHTML(c.role)}</div>
              ${c.contact ? `<div class="member-contact" style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-body);">📞 <a href="tel:${sanitizeHTML(c.contact)}" style="color:var(--gold);font-weight:600;">${sanitizeHTML(c.contact)}</a></div>` : ''}
            </div>`;
          });
        } else {
           commGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;"><div style="font-size:3.5rem;">📜</div><p>Management committee directory is being updated.</p></div>';
        }
      }, console.error);
    }
  }

  // 5. Real-Time Gallery Listener
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const filterBtns = document.querySelectorAll('.gfilter-btn');
    let allPhotos = [];
    
    function renderGallery(category) {
      if (allPhotos.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:4rem;"><div style="font-size:3.5rem;margin-bottom:1rem;">📸</div><p>Gallery is being populated.</p></div>';
        return;
      }
      
      let filtered = category === 'All' ? allPhotos : allPhotos.filter(p => p.category === category);
      if (filtered.length === 0) {
        galleryGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;"><div style="font-size:3.5rem;margin-bottom:1rem;">📸</div><p>No photos in this category.</p></div>';
        return;
      }
      
      galleryGrid.innerHTML = '';
      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal visible';
        item.innerHTML = `<img src="${sanitizeHTML(optimizeImage(p.url || p.imageUrl))}" alt="Gallery Image" loading="lazy" style="width:100%;height:260px;object-fit:cover;border-radius:16px;transition:var(--transition);"><div class="gallery-overlay" style="border-radius:16px;"><span>🔍 Zoom View</span></div>`;
        item.addEventListener('click', () => {
          const lbImg = document.getElementById('lightbox-img');
          const lbOverlay = document.getElementById('lightbox-overlay');
          if (lbImg && lbOverlay) {
            lbImg.src = p.url || p.imageUrl;
            lbOverlay.classList.add('active');
          }
        });
        galleryGrid.appendChild(item);
      });
    }

    db.collection('gallery').orderBy('createdAt','desc').onSnapshot(snap => {
      allPhotos = [];
      if (!snap.empty) {
        snap.forEach(doc => allPhotos.push(doc.data()));
        const activeBtn = document.querySelector('.gfilter-btn.active');
        renderGallery(activeBtn ? (activeBtn.dataset.category || activeBtn.textContent.trim()) : 'All');
        
        if (filterBtns) {
          filterBtns.forEach(btn => {
            btn.onclick = () => {
              filterBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              renderGallery(btn.dataset.category || btn.textContent.trim());
            };
          });
        }
      } else {
        renderGallery('All');
      }
    }, console.error);
  }

  // 6. Real-Time Notices Listener
  const noticeList = document.getElementById('notice-preview-list');
  const noticeGrid = document.getElementById('notice-grid');
  const noticeFilter = document.getElementById('notice-filter');
  if (noticeList || noticeGrid) {
    db.collection('notices').orderBy('createdAt','desc').onSnapshot(snap => {
      if (!snap.empty) {
        if (noticeList) noticeList.innerHTML = '';
        if (noticeGrid) noticeGrid.innerHTML = '';
        const allNotices = [];
        snap.forEach(doc => allNotices.push(doc.data()));

        if (noticeList) {
          allNotices.slice(0, 4).forEach(n => {
            noticeList.innerHTML += `<div class="notice-preview-card glass-card" style="padding:1.2rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1rem;">
              <div class="notice-icon" style="font-size:1.5rem;">${n.important ? '🚨' : '📢'}</div>
              <div class="notice-info" style="flex:1;">
                <h4 style="font-size:1rem;color:var(--white);margin-bottom:0.25rem;">${sanitizeHTML(n.title)}</h4>
                <div style="font-size:0.8rem;color:var(--text-muted);display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                  <span>📅 ${sanitizeHTML(n.date || 'Recent')}</span>
                  <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${sanitizeHTML(n.category || 'General')}</span>
                </div>
              </div>
              ${n.imageUrl ? `<button onclick="openAttachmentModal('${n.imageUrl}')" class="btn btn-outline btn-sm" style="flex-shrink:0;">View Attachment</button>` : ''}
            </div>`;
          });
        }

        if (noticeGrid) {
          const renderGrid = (filterCat) => {
            noticeGrid.innerHTML = '';
            allNotices.forEach(n => {
              if (filterCat !== 'All' && n.category !== filterCat) return;
              noticeGrid.innerHTML += `<div class="notice-card glass-card reveal visible" data-category="${n.category}" style="padding:1.75rem;position:relative;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                  <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${n.important ? 'URGENT NOTICE' : sanitizeHTML(n.category || 'NOTICE')}</span>
                  <span style="font-size:0.8rem;color:var(--text-muted);">📅 ${sanitizeHTML(n.date || '')}</span>
                </div>
                <h3 style="font-size:1.2rem;color:var(--white);margin-bottom:0.75rem;line-height:1.4;">${sanitizeHTML(n.title)}</h3>
                ${n.description ? `<p style="color:var(--text-body);font-size:0.9rem;margin-bottom:1.25rem;line-height:1.6;">${sanitizeHTML(n.description)}</p>` : ''}
                ${n.imageUrl ? `<button onclick="openAttachmentModal('${n.imageUrl}')" class="btn btn-gold btn-sm" style="cursor:pointer;width:100%;justify-content:center;">📄 View Official Document / Notice</button>` : ''}
              </div>`;
            });
          };

          renderGrid('All');

          if (noticeFilter) {
            const categories = ['All', ...new Set(allNotices.map(n => n.category || 'General'))];
            noticeFilter.innerHTML = '';
            categories.forEach(cat => {
              const btn = document.createElement('button');
              btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
              btn.textContent = cat;
              btn.dataset.filter = cat;
              btn.onclick = () => {
                noticeFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderGrid(cat);
              };
              noticeFilter.appendChild(btn);
            });
          }
        }
      } else {
        if (noticeList) noticeList.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">No notices currently published.</p>';
        if (noticeGrid) noticeGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">No notices currently published.</p>';
      }
    }, console.error);
  }

  // 7. Facilities & Gallery Photos Preview on Home Page
  if (path === '/' || path.includes('index')) {
    const facComp = document.getElementById('fac-computer');
    const facSmart = document.getElementById('fac-smart');
    const facGround = document.getElementById('fac-ground');
    
    if (facComp || facSmart || facGround) {
      db.collection('gallery').orderBy('createdAt', 'desc').onSnapshot(snap => {
        if (snap.empty) return;
        let compFound = false, smartFound = false, groundFound = false;
        snap.forEach(doc => {
          const d = doc.data();
          if (facComp && !compFound && d.category === 'Lab') { facComp.src = optimizeImage(d.url || d.imageUrl); facComp.style.display = ""; compFound = true; }
          if (facSmart && !smartFound && d.category === 'Classroom') { facSmart.src = optimizeImage(d.url || d.imageUrl); facSmart.style.display = ""; smartFound = true; }
          if (facGround && !groundFound && d.category === 'Ground') { facGround.src = optimizeImage(d.url || d.imageUrl); facGround.style.display = ""; groundFound = true; }
        });
      }, console.error);
    }
  }
});
