// ============================================================
//  SHREE NEPAL SECONDARY SCHOOL — Core Client Scripts & UX
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── 0. Subdomain Routing Helper (admin.nepalssb.edu.np) ─────
  const host = window.location.hostname.toLowerCase();
  const currentPath = window.location.pathname.toLowerCase();
  
  if (host === 'admin.nepalssb.edu.np' && !currentPath.includes('manage')) {
    window.location.replace('/manage.html');
    return;
  }

  // ── 1. Navbar scroll effect ──────────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ── 2. Mobile Nav Drawer Toggle ────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('is-open');
      const spans = toggle.querySelectorAll('span');
      if (toggle.classList.contains('is-open')) {
        spans[0].style.transform = 'translateY(8.5px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-8.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('is-open');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  // ── 3. Active Nav Link Highlighting ────────────────────────
  let page = currentPath.split('/').pop() || 'index.html';
  if (page === '' || page === '/') page = 'index.html';

  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && (href === '/' || href === 'index.html'))) {
      a.classList.add('active');
    }
  });

  // ── 4. Scroll Reveal Intersection Observer ─────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── 5. Lightbox Viewer Setup ──────────────────────────────
  const overlay = document.getElementById('lightbox-overlay');
  const lbImg   = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  if (overlay && lbImg) {
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.dataset.lightbox || el.src || el.querySelector('img')?.src;
        if (src) {
          lbImg.src = src;
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
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

  // ── 6. Animated Counter Stats ──────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          let start = 0;
          const duration = 1600;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(easeProgress * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(c => cio.observe(c));
  }

});
