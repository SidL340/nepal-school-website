// ============================================================
//  SHREE NEPAL SECONDARY SCHOOL — Global JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ── Mobile nav toggle ─────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      toggle.classList.toggle('is-open');
      if (toggle.classList.contains('is-open')) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('is-open');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // ── Active nav link ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ── Scroll reveal ──────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── Lightbox ─────────────────────────────────────────────
  const overlay = document.getElementById('lightbox-overlay');
  const lbImg   = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  if (overlay && lbImg) {
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.dataset.lightbox || el.src || el.querySelector('img')?.src;
        lbImg.src = src;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    const closeLb = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      lbImg.src = '';
    };
    if (lbClose) lbClose.addEventListener('click', closeLb);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
  }

  // ── Counter animation ─────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          let start = 0;
          const duration = 1800;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            el.textContent = Math.floor(progress * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  // ── Notice board builder ──────────────────────────────────
  buildNoticeBoard();

});

// ── CSS for reveal ──────────────────────────────────────────
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  .reveal:nth-child(2) { transition-delay: 0.1s; }
  .reveal:nth-child(3) { transition-delay: 0.2s; }
  .reveal:nth-child(4) { transition-delay: 0.3s; }
  .reveal:nth-child(5) { transition-delay: 0.4s; }
  .reveal:nth-child(6) { transition-delay: 0.5s; }
`;
document.head.appendChild(revealStyle);

// ── Notice board ─────────────────────────────────────────────
function buildNoticeBoard() {
  const grid = document.getElementById('notice-grid');
  if (!grid) return;

  // Use Firebase data if already loaded, else wait for static notices variable
  if (window._firestoreNotices) {
    const list = window._firestoreNotices;
    buildFilters(list);
    renderNotices(list);
    return;
  }

  if (typeof notices === 'undefined') return;
  buildFilters(notices);
  renderNotices(notices);
}

function buildFilters(list) {
  const categories = ['All', ...new Set(list.map(n => n.category))];
  const filterEl = document.getElementById('notice-filter');
  if (!filterEl) return;
  filterEl.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.dataset.filter = cat;
    btn.addEventListener('click', () => {
      filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNotices(cat === 'All' ? list : list.filter(n => n.category === cat));
    });
    filterEl.appendChild(btn);
  });
}

function renderNotices(list) {
  const grid = document.getElementById('notice-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 0">
        <div style="font-size:3.5rem;margin-bottom:1rem">📋</div>
        <h3 style="color:var(--white);margin-bottom:0.5rem">No Notices at the Moment</h3>
        <p style="color:var(--text-muted);font-size:0.9rem">Please check back later for new announcements.</p>
      </div>`;
    return;
  }
  list.forEach(n => {
    // Support both full Firebase Storage URLs and legacy relative paths
    const imgSrc    = n.isUrl ? n.file : (n.file ? `notices/${n.file}` : '');
    const openHref  = imgSrc || '#';
    const card = document.createElement('div');
    card.className = 'notice-card glass-card reveal';
    card.innerHTML = `
      <div class="notice-img-wrap" style="cursor:pointer">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${n.title}" loading="lazy"
               onerror="this.outerHTML='<div style=\'width:100%;height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--navy-light);gap:0.5rem\'><div style=\'font-size:3rem\'>📄</div><div style=\'color:var(--text-muted);font-size:0.8rem\'>Notice Image</div></div>'">` 
          : `<div style="width:100%;height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--navy-light);gap:0.5rem"><div style="font-size:3rem">📄</div><div style="color:var(--text-muted);font-size:0.8rem">No Image</div></div>`
        }
        <div class="notice-overlay"><span>📄 View Full</span></div>
      </div>
      <div class="notice-body">
        <div class="notice-meta">
          <span class="badge ${n.important ? 'badge-red' : 'badge-gold'}">${n.important ? '⚠ Important' : n.category}</span>
          <span class="notice-date">📅 ${n.date}</span>
        </div>
        <h4>${n.title}</h4>
        ${imgSrc ? `<a href="${openHref}" target="_blank" class="btn btn-outline" style="margin-top:0.75rem;font-size:0.8rem;padding:0.5rem 1.2rem">Open Full Size ↗</a>` : ''}
      </div>`;
    if (imgSrc) {
      card.querySelector('.notice-img-wrap').addEventListener('click', () => {
        const overlay = document.getElementById('lightbox-overlay');
        const lbImg   = document.getElementById('lightbox-img');
        if (overlay && lbImg) {
          lbImg.src = imgSrc;
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }
    grid.appendChild(card);
  });
  // Re-trigger reveal observer
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    el.classList.add('visible');
  });
}
