/* ============================================================
   MISCANTHUS STRIPES — Main JS
   ============================================================ */

/* ── Scroll Reveal ────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ── Navbar scroll behavior ───────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* ── Mobile nav ───────────────────────────────────────────────── */
const hamburger = document.getElementById('nav-hamburger');
const mobileNav = document.getElementById('nav-mobile');
const mobileClose = document.getElementById('nav-mobile-close');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => mobileNav.classList.add('open'));
  mobileClose && mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

/* ── Animated counters ────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const decimals = (el.dataset.target.split('.')[1] || '').length;
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = (target * ease).toFixed(decimals);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('.count-up').forEach(el => counterObserver.observe(el));

/* ── Parallax ─────────────────────────────────────────────────── */
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    parallaxEls.forEach(el => {
      const speed  = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
}

/* ── Hero Canvas Grass ────────────────────────────────────────── */
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, blades = [], animId;

  class Blade {
    constructor(x) {
      this.reset(x);
    }
    reset(x) {
      this.x      = x != null ? x : Math.random() * W;
      this.baseY  = H;
      this.h      = 70 + Math.random() * 160;
      this.w      = 1.2 + Math.random() * 2.4;
      this.phase  = Math.random() * Math.PI * 2;
      this.freq   = 0.4 + Math.random() * 0.7;
      this.amp    = 10  + Math.random() * 22;
      this.layer  = Math.floor(Math.random() * 5); // 0=back, 4=front
      const hue   = 110 + Math.random() * 25;
      const sat   = 30 + this.layer * 7;
      const lBase = 8  + this.layer * 5;
      const lTip  = lBase + 18 + this.layer * 4;
      this.cBase  = `hsl(${hue},${sat}%,${lBase}%)`;
      this.cTip   = `hsl(${hue+5},${sat+8}%,${lTip}%)`;
    }
    draw(t) {
      const sway = Math.sin(t * this.freq + this.phase) * this.amp;
      const cx   = this.x + sway * 0.45;
      const cy   = this.baseY - this.h * 0.55;
      const tx   = this.x + sway;
      const ty   = this.baseY - this.h;

      const grad = ctx.createLinearGradient(this.x, this.baseY, tx, ty);
      grad.addColorStop(0, this.cBase);
      grad.addColorStop(1, this.cTip);

      ctx.beginPath();
      ctx.moveTo(this.x, this.baseY);
      ctx.quadraticCurveTo(cx, cy, tx, ty);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = this.w;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
  }

  function buildBlades() {
    blades = [];
    const density = Math.max(2, Math.floor(W / 7));
    // 5 layers, back to front
    for (let layer = 0; layer < 5; layer++) {
      const count = Math.floor(density * (0.6 + layer * 0.15));
      for (let i = 0; i < count; i++) {
        const b   = new Blade(Math.random() * W);
        b.layer   = layer;
        b.baseY   = H + 2 + Math.random() * 12;
        b.h       = (40 + layer * 30) + Math.random() * (60 + layer * 20);
        b.w       = 1 + layer * 0.4 + Math.random() * 1.2;
        b.amp     = 8 + layer * 3 + Math.random() * 14;
        const hue = 115 + Math.random() * 20;
        const sat = 28 + layer * 6;
        const lB  = 7 + layer * 4;
        const lT  = lB + 16 + layer * 5;
        b.cBase   = `hsl(${hue},${sat}%,${lB}%)`;
        b.cTip    = `hsl(${hue+4},${sat+6}%,${lT}%)`;
        blades.push(b);
      }
    }
    // sort back→front
    blades.sort((a, b) => a.layer - b.layer);
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildBlades();
  }

  let t = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    // Draw ground strip
    const grd = ctx.createLinearGradient(0, H * 0.72, 0, H);
    grd.addColorStop(0, 'rgba(8,18,8,0)');
    grd.addColorStop(1, 'rgba(4,10,4,0.9)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, H * 0.7, W, H * 0.3);

    blades.forEach(b => b.draw(t));
    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize, { passive: true });
}

/* ── Gallery filter ───────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;
        item.style.opacity    = show ? '1' : '0.25';
        item.style.transform  = show ? '' : 'scale(0.96)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
}

/* ── Active nav link ──────────────────────────────────────────── */
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});
