// ─── dynamic.js — Real-Time High Performance Firestore Data Loader ───────────

// Attachment Modal Handler
window.openAttachmentModal = function(url) {
  let modal = document.getElementById('attachment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'attachment-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(6,13,25,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;padding:1rem;';
    
    modal.innerHTML = `
      <div style="position:absolute;top:15px;right:20px;color:white;font-size:2.5rem;cursor:pointer;user-select:none;line-height:1;z-index:10;" onclick="closeAttachmentModal()">&times;</div>
      <div id="attachment-content" style="max-width:95%;max-height:90%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'attachment-content') closeAttachmentModal();
    });
  }
  
  const content = document.getElementById('attachment-content');
  content.innerHTML = '<div style="color:var(--gold);font-size:1.2rem;font-weight:700;">Opening Notice Document...</div>';
  
  modal.style.display = 'flex';
  setTimeout(() => modal.style.opacity = '1', 10);
  
  const safeUrl = sanitizeHTML(url);
  if (safeUrl.toLowerCase().includes('.pdf')) {
    closeAttachmentModal();
    window.open(safeUrl, '_blank');
  } else {
    content.innerHTML = `<img src="${safeUrl}" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.8);border:2px solid var(--gold);">`;
  }
};

window.closeAttachmentModal = function() {
  const modal = document.getElementById('attachment-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
  }
};

// Global Interactive Notice Detail Modal Handler
window.openNoticeDetailModal = function(title, category, date, description, url) {
  let modal = document.getElementById('notice-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'notice-detail-modal';
    modal.className = 'splash-modal-overlay';
    document.body.appendChild(modal);

    window.closeNoticeDetailModal = function() {
      if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
      }
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeNoticeDetailModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeNoticeDetailModal();
    });
  }

  const safeTitle = sanitizeHTML(title || 'Official Notice Announcement');
  const safeCat   = sanitizeHTML(category || 'General Notice');
  const safeDate  = sanitizeHTML(date || 'Recent');
  const safeDesc  = sanitizeHTML(description || 'No detailed description provided. Please contact the school administrative office during office hours for further details.');
  const safeUrl   = url ? sanitizeHTML(url) : '';

  const imgHtml = safeUrl 
    ? `<img src="${optimizeImage(safeUrl)}" alt="${safeTitle}" onclick="openAttachmentModal('${safeUrl}')" style="width:100%;max-height:55vh;object-fit:contain;border-radius:12px;margin-bottom:1rem;border:1px solid var(--glass-border);cursor:pointer;" title="Click to view full screen">`
    : `<div style="font-size:3.5rem;margin:1rem 0;text-align:center;">📋</div>`;

  const btnHtml = safeUrl 
    ? `<button onclick="openAttachmentModal('${safeUrl}')" class="btn btn-gold btn-sm" style="width:100%;justify-content:center;margin-top:1rem;">📄 Open Official Document / Image</button>`
    : '';

  modal.innerHTML = `
    <div class="splash-modal-card" style="max-width:600px;width:95%;">
      <button class="splash-close-btn" onclick="closeNoticeDetailModal()" aria-label="Close Notice">&times;</button>
      <div class="splash-modal-header">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span class="badge badge-gold">📢 ${safeCat}</span>
          <span style="font-size:0.8rem;color:var(--text-muted);">📅 ${safeDate}</span>
        </div>
      </div>
      <div class="splash-modal-body" style="text-align:left;padding:1.5rem;">
        ${imgHtml}
        <h3 style="font-size:1.3rem;color:var(--white);margin-bottom:0.75rem;line-height:1.4;">${safeTitle}</h3>
        <p style="color:var(--text-body);font-size:0.95rem;line-height:1.75;white-space:pre-line;">${safeDesc}</p>
        ${btnHtml}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('active'), 10);
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

// Global real-time data sync with Firestore
document.addEventListener('DOMContentLoaded', () => {
  if (typeof db === 'undefined') return;

  const path = window.location.pathname.toLowerCase();

  // 1. Real-Time School Settings
  db.collection('settings').doc('school').onSnapshot(doc => {
    if (doc.exists) {
      const s = doc.data();
      if (s.name) {
        document.querySelectorAll('.dyn-school-name').forEach(el => {
          el.textContent = s.name;
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
        });
      }

      // ── Restored Dual Constant Moving Ribbon Tickers ─────────────────────
      const isHomePage = path === '/' || path.includes('index') || document.querySelector('.hero-content') !== null;
      if (isHomePage) {
        const text1 = s.ticker || "Welcome to Shree Nepal Secondary School, Brindaban-02, Rautahat! Quality Education from ECD to Class 12 (+2).";
        const text2 = s.ticker2 || "Notice: Admissions open for Grade 11 (+2 Management, Education & Humanities). Visit office or portal for details.";

        let tw = document.getElementById('ticker-wrapper');
        if (!tw) {
          tw = document.createElement('div');
          tw.id = 'ticker-wrapper';
          tw.className = 'ticker-ribbon-container';
          const nav = document.getElementById('navbar');
          if (nav && nav.parentNode) { nav.parentNode.insertBefore(tw, nav.nextSibling); }
          else { document.body.insertBefore(tw, document.body.firstChild); }
        }
        tw.style.display = 'block';
        
        const item1Html = `<div class="ticker-item"><span class="ticker-badge">📢 ANNOUNCEMENT</span> <span>${sanitizeHTML(text1)}</span></div>`;
        const item2Html = `<div class="ticker-item"><span class="ticker-badge badge-cyan">📌 NOTICE</span> <span>${sanitizeHTML(text2)}</span></div>`;

        tw.innerHTML = `
          <div class="ticker-ribbon ribbon-top">
            <div class="ticker-track track-left">
              ${item1Html}${item1Html}${item1Html}${item1Html}
            </div>
          </div>
          <div class="ticker-ribbon ribbon-bottom">
            <div class="ticker-track track-right">
              ${item2Html}${item2Html}${item2Html}${item2Html}
            </div>
          </div>
        `;
      } else {
        const tw = document.getElementById('ticker-wrapper');
        if (tw) tw.style.display = 'none';
      }

      // ── Stats Bar (controlled strictly from admin portal / Firebase) ──────
      function updateStat(selector, value, suffix) {
        const el = document.querySelector(selector);
        if (!el || value === undefined || value === null || value === '') return;

        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          el.dataset.count = num;
          el.dataset.suffix = suffix || '';
          el.textContent = num + (suffix || '');
        } else {
          el.textContent = value;
        }
      }
      if (s.statStudents) updateStat('.dyn-stat-students', s.statStudents, s.statStudentsSuffix);
      if (s.statStaff)    updateStat('.dyn-stat-staff',    s.statStaff,    s.statStaffSuffix);
      if (s.statPassRate) updateStat('.dyn-stat-passrate', s.statPassRate, s.statPassRateSuffix);
      if (s.statYears)    updateStat('.dyn-stat-years',    s.statYears,    s.statYearsSuffix);

      if (s.statStudentsLabel)  { const el = document.querySelector('.dyn-stat-students-label');  if (el) el.textContent = s.statStudentsLabel; }
      if (s.statStaffLabel)     { const el = document.querySelector('.dyn-stat-staff-label');     if (el) el.textContent = s.statStaffLabel; }
      if (s.statPassRateLabel)  { const el = document.querySelector('.dyn-stat-passrate-label');  if (el) el.textContent = s.statPassRateLabel; }
      if (s.statYearsLabel)     { const el = document.querySelector('.dyn-stat-years-label');     if (el) el.textContent = s.statYearsLabel; }
    }
  }, console.error);

  // 2. Real-Time Principal Settings
  const pNames = document.querySelectorAll('.principal-name');
  const pMessages = document.querySelectorAll('.message-text, .message-full');
  db.collection('settings').doc('principal').onSnapshot(doc => {
    if (doc.exists) {
      const p = doc.data();
      if (p.name) pNames.forEach(el => { el.textContent = p.name; });
      if (p.message) {
        pMessages.forEach(el => {
          if (el.classList.contains('message-text')) {
            const cleanMsg = p.message.replace(/\n+/g, ' ');
            const shortMsg = cleanMsg.length > 200 ? cleanMsg.substring(0, 195) + '...' : cleanMsg;
            el.innerHTML = '"' + sanitizeHTML(shortMsg) + '"';
          } else {
            el.innerHTML = '"' + p.message.replace(/\n/g, '<br>') + '"';
          }
        });
      }
      if (p.email) document.querySelectorAll('.principal-email').forEach(el => { el.textContent = p.email; if (el.closest('a')) el.closest('a').href = 'mailto:' + p.email; });

      if (p.photoUrl) {
        const indexPhotoWrap = document.querySelector('.principal-photo-wrap');
        if (indexPhotoWrap) {
          indexPhotoWrap.style.cssText = 'width:85px;height:85px;min-width:85px;min-height:85px;flex-shrink:0;border-radius:50%;overflow:hidden;border:2.5px solid var(--gold);';
          indexPhotoWrap.innerHTML = `<img src="${optimizeImage(p.photoUrl)}" alt="${sanitizeHTML(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
        
        const facultyPhotoContainer = document.querySelector('.principal-photo-container');
        if (facultyPhotoContainer) {
          facultyPhotoContainer.innerHTML = `<img src="${optimizeImage(p.photoUrl)}" alt="${sanitizeHTML(p.name)}" class="principal-photo" style="border-radius:50%;width:120px;height:120px;object-fit:cover;border:3px solid var(--gold);margin:0 auto;box-shadow:var(--shadow-gold);">`;
        }
      }
    }
  }, console.error);

  // 3. Real-Time Staff Directory
  const staffGrid = document.getElementById('staff-container') || document.getElementById('staff-grid');
  if (staffGrid) {
    const parentContainer = staffGrid.closest('#staff-container') || staffGrid.parentNode;
    
    db.collection('staff').onSnapshot(snap => {
      if (!snap.empty) {
        parentContainer.innerHTML = ''; // ALWAYS clear to prevent duplicated items!
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
              <h3 style="color:var(--gold); font-size:1.8rem; margin-top:2rem;">${title}</h3>
              <div class="gold-line" style="margin:0.5rem auto 0; width:60px; height:3px;"></div>
            </div>
            <div class="grid-4">
              ${list.map(doc => {
                const s = doc.data();
                return `<div class="glass-card staff-card reveal visible" style="position:relative;text-align:center;padding:1.75rem 1.25rem;">
                  ${s.photoUrl ? `<img src="${sanitizeHTML(optimizeImage(s.photoUrl))}" class="staff-photo" alt="${sanitizeHTML(s.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;border:3px solid var(--gold);" onerror="this.outerHTML='<div class=&quot;staff-photo-icon&quot;>👤</div>'">` : `<div class="staff-photo-icon" style="width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:2.8rem;margin:0 auto 1rem;border:2px dashed var(--gold);">👤</div>`}
                  <div class="staff-name" style="font-size:1.1rem;font-weight:700;color:var(--white);margin-bottom:0.25rem;">${sanitizeHTML(s.name)}</div>
                  <div class="staff-role" style="color:var(--gold);font-size:0.88rem;font-weight:600;">${sanitizeHTML(s.role)}</div>
                  <div class="staff-subject" style="color:var(--text-muted);font-size:0.82rem;margin-top:0.35rem;">${sanitizeHTML(s.qualification||s.subject||'')}</div>
                  ${s.position ? `<div style="margin-top:0.75rem; background:rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.4); color:var(--gold-light); padding:0.25rem 0.75rem; border-radius:50px; font-size:0.75rem; font-weight:700; display:inline-block;">${sanitizeHTML(s.position)}</div>` : ''}
                </div>`;
              }).join('')}
            </div>
          `;
          parentContainer.appendChild(sec);
        }
        
        renderSection('Teaching Faculty', teaching);
        renderSection('Administrative & Support Staff', nonTeaching);
      }
    }, console.error);
  }

  // 4. Real-Time Committee Listener
  const commGrid = document.getElementById('committee-grid');
  if (commGrid) {
      db.collection('committee').onSnapshot(snap => {
        if (!snap.empty) {
          commGrid.innerHTML = ''; // ALWAYS clear to prevent duplicated items!
          const docs = []; snap.forEach(d => docs.push(d));
          docs.sort((a,b)=>(a.data().order||99)-(b.data().order||99)).forEach(doc => {
            const c = doc.data();
            const isChair = c.isChairperson === true || (c.role && (c.role.toLowerCase().includes('chair') || c.role.includes('अध्यक्ष')));
            const cardStyle = isChair ? 'grid-column: 1 / -1; max-width: 420px; margin: 0 auto 2rem; border: 2px solid var(--gold); background: rgba(245, 158, 11, 0.1); overflow: visible !important;' : 'overflow: visible !important;';
            const tag = isChair ? '<div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:#060d19;color:var(--gold-light);border:2px solid var(--gold);padding:5px 24px;border-radius:50px;font-size:0.92rem;font-weight:800;box-shadow:0 6px 25px rgba(0,0,0,0.85);z-index:10;white-space:nowrap;">' + sanitizeHTML(c.role || 'अध्यक्ष') + '</div>' : '';
            
            commGrid.innerHTML += `<div class="glass-card member-card reveal visible" style="position:relative; text-align:center; padding:2.25rem 1.5rem 1.75rem; ${cardStyle}">
              ${tag}
              ${c.photoUrl ? `<img src="${sanitizeHTML(optimizeImage(c.photoUrl))}" class="member-photo" alt="${sanitizeHTML(c.name)}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;margin:0 auto 1rem;border:3px solid var(--gold);" onerror="this.outerHTML='<div class=&quot;member-photo-placeholder&quot;>👤</div>'">` : `<div class="member-photo-placeholder" style="width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:2.8rem;margin:0 auto 1rem;border:2px dashed var(--gold);">👤</div>`}
              <div class="member-name" style="font-size:1.2rem;font-weight:700;${isChair ? 'color:var(--gold-light);font-size:1.4rem;' : 'color:var(--white);'}">${sanitizeHTML(c.name)}</div>
              <div class="member-role" style="color:var(--gold);font-size:0.88rem;font-weight:600;margin-top:0.25rem;${isChair ? 'display:none' : ''}">${sanitizeHTML(c.role)}</div>
              ${c.contact ? `<div class="member-contact" style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-body);">📞 <a href="tel:${sanitizeHTML(c.contact)}" style="color:var(--gold);font-weight:700;">${sanitizeHTML(c.contact)}</a></div>` : ''}
            </div>`;
          });
        }
      }, console.error);
  }

  // 5. Real-Time Gallery Listener
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    const filterBtns = document.querySelectorAll('.gfilter-btn');
    let allPhotos = [];
    
    function renderGallery(category) {
      if (allPhotos.length === 0) return;
      let filtered = category === 'All' ? allPhotos : allPhotos.filter(p => p.category === category);
      if (filtered.length === 0) return;
      
      galleryGrid.innerHTML = ''; // ALWAYS clear to prevent duplicates!
      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'gallery-item reveal visible';
        item.innerHTML = `<img src="${sanitizeHTML(optimizeImage(p.url || p.imageUrl))}" alt="Gallery Image" loading="lazy" style="width:100%;height:240px;object-fit:cover;border-radius:16px;"><div class="gallery-overlay" style="border-radius:16px;"><span>🔍 View Image</span></div>`;
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
      }
    }, console.error);
  }

  // 6. Real-Time Notices & Splash Popup Listener
  const noticeList = document.getElementById('notice-preview-list');
  const noticeGrid = document.getElementById('notice-grid');
  const noticeFilter = document.getElementById('notice-filter');
  
  db.collection('notices').onSnapshot(snap => {
    const allNotices = [];
    if (!snap.empty) {
      snap.forEach(doc => {
        const d = doc.data();
        d.id = doc.id;
        allNotices.push(d);
      });
      // Sort descending by createdAt or date
      allNotices.sort((a,b) => {
        const tA = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA;
      });
    }

    // Attach click handlers to any hardcoded HTML default cards if Firestore has no custom notices yet
    if (allNotices.length === 0) {
      document.querySelectorAll('.notice-grid-card').forEach(card => {
        card.style.cursor = 'pointer';
        if (!card.onclick) {
          const title = card.querySelector('h3')?.textContent || 'School Notice';
          const cat   = card.querySelector('.badge')?.textContent || 'General';
          const date  = card.querySelector('span[style*="font-size:0.78rem"]')?.textContent || '2081 B.S.';
          const desc  = card.querySelector('p')?.textContent || '';
          card.onclick = () => openNoticeDetailModal(title, cat, date, desc, '');
        }
      });
    }

    // ── Splash Notice Popup Handler ──────────────────────
    const splashNotice = allNotices.find(n => n.isSplash === true);
    const forceSplash = window.location.search.includes('splash=1');
    const isClosedInSession = sessionStorage.getItem('splashNoticeClosed') === 'true';
    
    if (splashNotice && (!isClosedInSession || forceSplash)) {
      let splashModal = document.getElementById('splash-modal');
      if (!splashModal) {
        splashModal = document.createElement('div');
        splashModal.id = 'splash-modal';
        splashModal.className = 'splash-modal-overlay';
        document.body.appendChild(splashModal);

        window.closeSplashModal = function() {
          if (splashModal) {
            splashModal.classList.remove('active');
            sessionStorage.setItem('splashNoticeClosed', 'true');
          }
        };

        splashModal.addEventListener('click', (e) => {
          if (e.target === splashModal) closeSplashModal();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && splashModal.classList.contains('active')) closeSplashModal();
        });
      }

      const imgHtml = splashNotice.imageUrl 
        ? `<img src="${optimizeImage(splashNotice.imageUrl)}" alt="${sanitizeHTML(splashNotice.title)}" onclick="openAttachmentModal('${splashNotice.imageUrl}')">`
        : `<div style="font-size:3.5rem;margin:1rem 0;">📋</div>`;

      splashModal.innerHTML = `
        <div class="splash-modal-card">
          <button class="splash-close-btn" onclick="closeSplashModal()" aria-label="Close Notice">&times;</button>
          <div class="splash-modal-header">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span class="badge ${splashNotice.important ? 'badge-red' : 'badge-gold'}">📢 ${sanitizeHTML(splashNotice.category || 'NOTICE')}</span>
              <span style="font-size:0.8rem;color:var(--text-muted);">📅 ${sanitizeHTML(splashNotice.date || '')}</span>
            </div>
          </div>
          <div class="splash-modal-body">
            ${imgHtml}
            <h3 style="font-size:1.25rem;color:var(--white);margin-bottom:0.6rem;line-height:1.4;">${sanitizeHTML(splashNotice.title)}</h3>
            ${splashNotice.description ? `<p style="color:var(--text-body);font-size:0.9rem;margin-bottom:1rem;line-height:1.6;">${sanitizeHTML(splashNotice.description)}</p>` : ''}
            ${splashNotice.imageUrl ? `<button onclick="openAttachmentModal('${splashNotice.imageUrl}')" class="btn btn-gold btn-sm" style="margin-bottom:0.5rem;">🔍 View Full Document</button>` : ''}
          </div>
        </div>
      `;

      setTimeout(() => splashModal.classList.add('active'), 250);
    }

    if (noticeList && allNotices.length > 0) {
      noticeList.innerHTML = ''; // Clear fallback
      allNotices.slice(0, 4).forEach(n => {
        const sTitle = (n.title || '').replace(/'/g, "\\'");
        const sCat   = (n.category || '').replace(/'/g, "\\'");
        const sDate  = (n.date || '').replace(/'/g, "\\'");
        const sDesc  = (n.description || '').replace(/'/g, "\\'");
        const sUrl   = (n.imageUrl || '').replace(/'/g, "\\'");

        noticeList.innerHTML += `<div class="notice-preview-card glass-card" style="padding:1.2rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1rem;cursor:pointer;" onclick="openNoticeDetailModal('${sTitle}', '${sCat}', '${sDate}', '${sDesc}', '${sUrl}')">
          <div class="notice-icon" style="font-size:1.5rem;">${n.important ? '🚨' : '📢'}</div>
          <div class="notice-info" style="flex:1;">
            <h4 style="font-size:1rem;color:var(--white);margin-bottom:0.25rem;">${sanitizeHTML(n.title)}</h4>
            <div style="font-size:0.8rem;color:var(--text-muted);display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
              <span>📅 ${sanitizeHTML(n.date || 'Recent')}</span>
              <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${sanitizeHTML(n.category || 'General')}</span>
            </div>
          </div>
          ${n.imageUrl ? `<button onclick="event.stopPropagation();openAttachmentModal('${n.imageUrl}')" class="btn btn-outline btn-sm" style="flex-shrink:0;">View File</button>` : ''}
        </div>`;
      });
    }

    if (noticeGrid && allNotices.length > 0) {
      const renderGrid = (filterCat) => {
        noticeGrid.innerHTML = ''; // Clear fallback
        allNotices.forEach(n => {
          if (filterCat !== 'All' && n.category !== filterCat) return;
          const sTitle = (n.title || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
          const sCat   = (n.category || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
          const sDate  = (n.date || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
          const sDesc  = (n.description || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
          const sUrl   = (n.imageUrl || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

          noticeGrid.innerHTML += `<div class="notice-card glass-card reveal visible" data-category="${n.category}" style="padding:1.75rem;position:relative;cursor:pointer;display:flex;flex-direction:column;" onclick="openNoticeDetailModal('${sTitle}', '${sCat}', '${sDate}', '${sDesc}', '${sUrl}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
              <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${n.important ? 'URGENT NOTICE' : sanitizeHTML(n.category || 'NOTICE')}</span>
              <span style="font-size:0.8rem;color:var(--text-muted);">📅 ${sanitizeHTML(n.date || '')}</span>
            </div>
            <h3 style="font-size:1.15rem;color:var(--white);margin-bottom:0.75rem;line-height:1.4;">${sanitizeHTML(n.title)}</h3>
            ${n.description ? `<p style="color:var(--text-body);font-size:0.9rem;margin-bottom:1.25rem;line-height:1.6;">${sanitizeHTML(n.description)}</p>` : ''}
            <div style="margin-top:auto;padding-top:0.75rem;border-top:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
              <span style="color:var(--gold-light);font-size:0.83rem;font-weight:700;">🔍 Read Details ➔</span>
              ${n.imageUrl ? `<button onclick="event.stopPropagation();openAttachmentModal('${n.imageUrl}')" class="btn btn-gold btn-sm" style="cursor:pointer;">📄 Attachment</button>` : ''}
            </div>
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
  }, console.error);
  }

  // 7. Facilities Photos on Home Page
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
