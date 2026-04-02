/* ============================================================
   MISCANTHUS IM STREIFENANBAU — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Reduced Motion Preference ────────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Language Toggle ───────────────────────────────────── */
  var LANG_KEY = 'lang';
  var currentLang = localStorage.getItem(LANG_KEY) || 'de';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    document.querySelectorAll('[data-de]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) {
        if (el.tagName === 'OPTION') {
          el.textContent = text;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    // Update toggle button text
    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.textContent = lang === 'de' ? 'EN' : 'DE';
    });

    // Update html lang attribute
    document.documentElement.lang = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);

    document.querySelectorAll('.lang-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLanguage(currentLang === 'de' ? 'en' : 'de');
      });
    });
  });

  /* ── Mobile Menu ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
      });

      // Close menu when link clicked
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });
    }
  });

  /* ── Navbar Scroll Effect ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.getElementById('navbar');
    if (navbar) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
  });

  /* ── Navbar Hero Transparency ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.getElementById('navbar');
    var hero = document.querySelector('.hero');
    if (!navbar || !hero) return;

    navbar.classList.add('navbar--on-hero');

    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navbar.classList.add('navbar--on-hero');
        } else {
          navbar.classList.remove('navbar--on-hero');
        }
      });
    }, { threshold: 0.1 });

    heroObserver.observe(hero);
  });

  /* ── Scroll Reveal (IntersectionObserver) ──────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) {
      observer.observe(el);
    });

    /* ── Staggered Reveal Delays ──────────────────────────── */
    var staggerParentClasses = ['grid-3', 'goals-grid', 'steps', 'gallery-grid'];

    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!parent) return;

      var isStaggerParent = staggerParentClasses.some(function (cls) {
        return parent.classList.contains(cls);
      });

      if (isStaggerParent) {
        var siblings = parent.querySelectorAll('.reveal');
        var index = -1;
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] === el) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          var delay = Math.min(index + 1, 3);
          el.setAttribute('data-delay', delay);
        }
      }
    });
  });

  /* ── Animated Number Counters ──────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      observer.observe(el);
    });

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = Math.round(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }
  });

  /* ── Hero Canvas — Immersive Landscape Scene ────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;
    var mouseX = 0.5, mouseY = 0.5;
    var time = 0;

    // Scene data
    var clouds = [];
    var turbines = [];
    var blades = [];
    var particles = [];
    var fieldStrips = [];

    function resize() {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
      initScene();
    }

    function initScene() {
      // Clouds
      clouds = [];
      for (var i = 0; i < 8; i++) {
        clouds.push({
          x: Math.random() * W * 1.5 - W * 0.25,
          y: H * 0.05 + Math.random() * H * 0.2,
          w: 120 + Math.random() * 200,
          h: 30 + Math.random() * 40,
          speed: 0.15 + Math.random() * 0.25,
          alpha: 0.3 + Math.random() * 0.4
        });
      }

      // Wind turbines on hills
      turbines = [];
      var turbinePositions = [0.15, 0.35, 0.55, 0.78, 0.92];
      turbinePositions.forEach(function (xp) {
        var hillY = getHillY(xp * W, 1);
        turbines.push({
          x: xp * W,
          y: hillY,
          height: 50 + Math.random() * 30,
          bladeLen: 22 + Math.random() * 12,
          angle: Math.random() * Math.PI * 2,
          speed: 0.015 + Math.random() * 0.01
        });
      });

      // Field strips (strip cultivation pattern)
      fieldStrips = [];
      var stripCount = 12;
      for (var s = 0; s < stripCount; s++) {
        fieldStrips.push({
          isMiscanthus: s % 3 === 0,
          hue: s % 3 === 0 ? 135 + Math.random() * 10 : 95 + Math.random() * 20,
          lightness: s % 3 === 0 ? 30 + Math.random() * 8 : 38 + Math.random() * 12,
          saturation: 45 + Math.random() * 20
        });
      }

      // Foreground grass blades
      blades = [];
      var bladeCount = 300;
      for (var b = 0; b < bladeCount; b++) {
        var xPos = Math.random() * W;
        var fromBottom = Math.random();
        blades.push({
          x: xPos,
          y: H,
          height: 100 + Math.random() * 200 + fromBottom * 60,
          width: 2 + Math.random() * 3,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.012,
          swayAmount: 10 + Math.random() * 20,
          hue: 130 + Math.random() * 35,
          saturation: 50 + Math.random() * 30,
          lightness: 22 + Math.random() * 22,
          alpha: 0.4 + Math.random() * 0.5,
          depth: 0.5 + Math.random() * 0.5
        });
      }

      // Sort blades by depth (back to front)
      blades.sort(function (a, b) { return a.depth - b.depth; });

      // Floating particles
      particles = [];
      for (var p = 0; p < 30; p++) {
        particles.push({
          x: Math.random() * W,
          y: H * 0.3 + Math.random() * H * 0.5,
          radius: 1 + Math.random() * 2,
          speed: 0.15 + Math.random() * 0.35,
          alpha: 0.15 + Math.random() * 0.2,
          drift: (Math.random() - 0.5) * 0.4
        });
      }
    }

    // Get hill Y position at a given x for a specific hill layer
    function getHillY(x, layer) {
      var base;
      if (layer === 0) {
        // Far hills
        base = H * 0.38;
        return base - Math.sin(x / W * Math.PI * 1.2 + 0.5) * H * 0.06
                     - Math.sin(x / W * Math.PI * 2.5) * H * 0.03;
      } else if (layer === 1) {
        // Mid hills (where turbines sit)
        base = H * 0.44;
        return base - Math.sin(x / W * Math.PI * 1.5 + 1) * H * 0.05
                     - Math.sin(x / W * Math.PI * 3.2 + 0.8) * H * 0.025;
      } else {
        // Near hills / field line
        base = H * 0.55;
        return base - Math.sin(x / W * Math.PI * 1.8 + 0.3) * H * 0.03;
      }
    }

    function drawSky() {
      var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      skyGrad.addColorStop(0, '#5b9bd5');
      skyGrad.addColorStop(0.3, '#7db8e0');
      skyGrad.addColorStop(0.6, '#a8d4ea');
      skyGrad.addColorStop(0.85, '#d4e8c2');
      skyGrad.addColorStop(1, '#e8ebc0');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.6);
    }

    function drawClouds() {
      clouds.forEach(function (c) {
        if (!prefersReducedMotion) c.x += c.speed;
        if (c.x > W + c.w) c.x = -c.w;
        var px = c.x + (mouseX - 0.5) * -15;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + c.alpha + ')';
        ctx.beginPath();
        ctx.ellipse(px, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px - c.w * 0.25, c.y + c.h * 0.15, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px + c.w * 0.22, c.y + c.h * 0.1, c.w * 0.3, c.h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawHill(layer, color1, color2) {
      var parallax = (mouseX - 0.5) * (layer === 0 ? -8 : layer === 1 ? -15 : -25);
      ctx.beginPath();
      ctx.moveTo(-10, H);
      for (var x = -10; x <= W + 10; x += 5) {
        ctx.lineTo(x + parallax, getHillY(x, layer));
      }
      ctx.lineTo(W + 10, H);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, getHillY(W / 2, layer) - 20, 0, H);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    function drawFieldStrips() {
      var fieldTop = H * 0.50;
      var fieldBot = H * 0.68;
      var fieldH = fieldBot - fieldTop;
      var stripW = W / fieldStrips.length;
      var parallax = (mouseX - 0.5) * -20;

      fieldStrips.forEach(function (strip, i) {
        var x = i * stripW + parallax;
        var perspT = 0.7;
        var topX = W / 2 + (x - W / 2 + stripW / 2) * perspT;
        var topW = stripW * perspT;

        ctx.beginPath();
        ctx.moveTo(x, fieldBot);
        ctx.lineTo(x + stripW, fieldBot);
        ctx.lineTo(topX + topW / 2, fieldTop);
        ctx.lineTo(topX - topW / 2, fieldTop);
        ctx.closePath();
        ctx.fillStyle = 'hsla(' + strip.hue + ', ' + strip.saturation + '%, ' + strip.lightness + '%, 0.85)';
        ctx.fill();

        // Add subtle stripe texture for Miscanthus rows
        if (strip.isMiscanthus) {
          ctx.fillStyle = 'rgba(5, 80, 40, 0.08)';
          for (var row = 0; row < 4; row++) {
            var ry = fieldTop + (fieldH * (row + 0.5) / 4);
            var rFrac = (ry - fieldTop) / fieldH;
            var rw = stripW * (perspT + (1 - perspT) * rFrac);
            var rx = W / 2 + (x - W / 2 + stripW / 2) * (perspT + (1 - perspT) * rFrac) - rw / 2;
            ctx.fillRect(rx, ry - 1, rw, 2);
          }
        }
      });
    }

    function drawTurbines() {
      var parallax = (mouseX - 0.5) * -15;
      turbines.forEach(function (t) {
        if (!prefersReducedMotion) t.angle += t.speed;
        var tx = t.x + parallax;
        var ty = t.y;
        // Tower
        ctx.strokeStyle = 'rgba(200, 210, 210, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx, ty - t.height);
        ctx.stroke();
        // Hub
        ctx.fillStyle = 'rgba(220, 225, 225, 0.8)';
        ctx.beginPath();
        ctx.arc(tx, ty - t.height, 3, 0, Math.PI * 2);
        ctx.fill();
        // 3 blades
        for (var b = 0; b < 3; b++) {
          var a = t.angle + (b * Math.PI * 2 / 3);
          ctx.strokeStyle = 'rgba(220, 230, 230, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx, ty - t.height);
          ctx.lineTo(
            tx + Math.cos(a) * t.bladeLen,
            ty - t.height + Math.sin(a) * t.bladeLen
          );
          ctx.stroke();
        }
      });
    }

    function drawGrass() {
      var parallax = (mouseX - 0.5) * -35;
      var windTime = time * 0.001;

      blades.forEach(function (b) {
        if (!prefersReducedMotion) b.sway += b.swaySpeed;
        var globalWind = Math.sin(windTime + b.x * 0.005) * 8;
        var swayX = Math.sin(b.sway) * b.swayAmount + globalWind;
        var px = b.x + parallax * b.depth;

        ctx.beginPath();
        ctx.moveTo(px, b.y);
        ctx.quadraticCurveTo(
          px + swayX * 0.4, b.y - b.height * 0.5,
          px + swayX, b.y - b.height
        );
        ctx.strokeStyle = 'hsla(' + b.hue + ', ' + b.saturation + '%, ' + b.lightness + '%, ' + b.alpha * b.depth + ')';
        ctx.lineWidth = b.width * b.depth;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }

    function drawParticles() {
      if (prefersReducedMotion) return;
      particles.forEach(function (p) {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < H * 0.1) {
          p.y = H * 0.7 + Math.random() * H * 0.2;
          p.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 220, 180, ' + p.alpha + ')';
        ctx.fill();
      });
    }

    function drawOverlay() {
      // Bottom darkening gradient so text is readable
      var grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      grad.addColorStop(0, 'rgba(10, 32, 24, 0)');
      grad.addColorStop(0.5, 'rgba(10, 32, 24, 0.25)');
      grad.addColorStop(1, 'rgba(10, 32, 24, 0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Top vignette for text readability
      var topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
      topGrad.addColorStop(0, 'rgba(10, 32, 24, 0.35)');
      topGrad.addColorStop(1, 'rgba(10, 32, 24, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H * 0.4);
    }

    function draw(t) {
      time = t || 0;
      ctx.clearRect(0, 0, W, H);

      drawSky();
      drawClouds();
      drawHill(0, '#4a7a48', '#3d6b40');
      drawTurbines();
      drawHill(1, '#3d7a3d', '#2d5e2d');
      drawFieldStrips();
      drawHill(2, '#2a5a28', '#1e4a1e');
      drawGrass();
      drawParticles();
      drawOverlay();

      if (!prefersReducedMotion) {
        requestAnimationFrame(draw);
      }
    }

    // Mouse/touch interaction for parallax
    canvas.parentElement.addEventListener('mousemove', function (e) {
      var rect = canvas.parentElement.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });

    canvas.parentElement.addEventListener('touchmove', function (e) {
      var rect = canvas.parentElement.getBoundingClientRect();
      var touch = e.touches[0];
      mouseX = (touch.clientX - rect.left) / rect.width;
      mouseY = (touch.clientY - rect.top) / rect.height;
    }, { passive: true });

    resize();
    window.addEventListener('resize', resize);

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    } else {
      draw(0);
    }
  });

  /* ── Hero Parallax ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var hero = document.querySelector('.hero');
    var heroContent = hero ? hero.querySelector('.hero__content') : null;

    if (!hero || !heroContent || prefersReducedMotion) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)';
        heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.5;
      }
    });
  });

  /* ── Tabs (Gallery page) ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');

        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(function (tc) {
          tc.classList.remove('active');
        });

        var target = document.getElementById('tab-' + tab);
        if (target) target.classList.add('active');
      });
    });
  });

  /* ── Gallery Filters ───────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        document.querySelectorAll('.gallery-item').forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });

  /* ── Lightbox ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxClose = document.getElementById('lightboxClose');

    if (!lightbox) return;

    document.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (!item) return;

      var img = item.querySelector('img');
      var caption = item.querySelector('.gallery-item__caption');

      if (img) {
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
      }
    });

    lightboxClose.addEventListener('click', function () {
      lightbox.classList.remove('active');
      lightboxImg.src = '';
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
      }
    });
  });

  /* ── Load localStorage Gallery Items ───────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;

    var stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('miscanthus_gallery')) || [];
    } catch (e) { /* ignore */ }

    stored.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'gallery-item';
      div.setAttribute('data-category', item.category || 'all');
      div.innerHTML =
        '<img src="' + item.image + '" alt="' + (item.caption || '') + '">' +
        '<div class="gallery-item__overlay">' +
        '<div class="gallery-item__caption">' + (item.caption || '') + '</div>' +
        '<div class="gallery-item__tag">' + (item.category || '') + '</div>' +
        '</div>';
      grid.insertBefore(div, grid.firstChild);
    });
  });

  /* ── Load localStorage Updates ─────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var list = document.getElementById('updatesList');
    if (!list) return;

    var stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('miscanthus_updates')) || [];
    } catch (e) { /* ignore */ }

    stored.forEach(function (post) {
      var div = document.createElement('div');
      div.className = 'update-card';
      div.innerHTML =
        '<div class="update-card__meta">' +
        '<span class="update-card__tag">' + (post.tag || '') + '</span>' +
        '<span class="update-card__date">' + (post.date || '') + '</span>' +
        '</div>' +
        '<h3 class="update-card__title">' + (post.title || '') + '</h3>' +
        '<p class="update-card__excerpt">' + (post.body || '') + '</p>';
      list.insertBefore(div, list.firstChild);
    });
  });

  /* ── Contact Form Handler ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var success = document.getElementById('formSuccess');
      if (success) {
        success.classList.add('show');
        form.reset();
        setTimeout(function () {
          success.classList.remove('show');
        }, 4000);
      }
    });
  });

})();
