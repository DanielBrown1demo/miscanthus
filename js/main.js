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

  /* ── Hero Canvas — Refined Landscape Scene ──────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;
    var mouseX = 0.5, mouseY = 0.5;
    var time = 0;

    var clouds = [];
    var turbines = [];
    var fieldStrips = [];

    function resize() {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
      initScene();
    }

    function initScene() {
      // Clouds - fluffy, multi-bubble, slow
      clouds = [];
      for (var i = 0; i < 6; i++) {
        var bubbles = [];
        var cw = 100 + Math.random() * 180;
        var numBubbles = 5 + Math.floor(Math.random() * 4);
        for (var b = 0; b < numBubbles; b++) {
          bubbles.push({
            ox: (Math.random() - 0.5) * cw * 0.7,
            oy: (Math.random() - 0.5) * cw * 0.15,
            rx: cw * (0.15 + Math.random() * 0.25),
            ry: cw * (0.08 + Math.random() * 0.12)
          });
        }
        clouds.push({
          x: Math.random() * W * 1.5 - W * 0.25,
          y: H * 0.06 + Math.random() * H * 0.18,
          speed: 0.03 + Math.random() * 0.05,
          alpha: 0.35 + Math.random() * 0.25,
          bubbles: bubbles
        });
      }

      // Wind turbines - 3 on far hills
      turbines = [];
      var tPos = [0.22, 0.52, 0.82];
      tPos.forEach(function (xp) {
        turbines.push({
          x: xp * W,
          y: getHillY(xp * W, 0),
          height: 40 + Math.random() * 20,
          bladeLen: 18 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.004
        });
      });

      // Strip cultivation fields - 18 alternating strips
      fieldStrips = [];
      var types = ['miscanthus', 'wheat', 'crop', 'soil', 'crop', 'miscanthus',
                   'wheat', 'crop', 'miscanthus', 'soil', 'wheat', 'crop',
                   'miscanthus', 'crop', 'wheat', 'miscanthus', 'soil', 'crop'];
      for (var s = 0; s < types.length; s++) {
        var t = types[s];
        var col, colDark;
        if (t === 'miscanthus') {
          col = 'hsla(' + (130 + Math.random() * 10) + ', 55%, ' + (28 + Math.random() * 6) + '%, 1)';
          colDark = 'hsla(' + (130 + Math.random() * 10) + ', 55%, ' + (22 + Math.random() * 4) + '%, 1)';
        } else if (t === 'wheat') {
          col = 'hsla(' + (68 + Math.random() * 15) + ', 50%, ' + (42 + Math.random() * 8) + '%, 1)';
          colDark = 'hsla(' + (68 + Math.random() * 15) + ', 45%, ' + (36 + Math.random() * 6) + '%, 1)';
        } else if (t === 'soil') {
          col = 'hsla(' + (30 + Math.random() * 10) + ', 30%, ' + (35 + Math.random() * 8) + '%, 1)';
          colDark = 'hsla(' + (30 + Math.random() * 10) + ', 28%, ' + (28 + Math.random() * 6) + '%, 1)';
        } else {
          col = 'hsla(' + (105 + Math.random() * 15) + ', 45%, ' + (38 + Math.random() * 8) + '%, 1)';
          colDark = 'hsla(' + (105 + Math.random() * 15) + ', 40%, ' + (32 + Math.random() * 6) + '%, 1)';
        }
        fieldStrips.push({ type: t, col: col, colDark: colDark });
      }
    }

    function getHillY(x, layer) {
      if (layer === 0) {
        return H * 0.40
          - Math.sin(x / W * Math.PI * 1.1 + 0.3) * H * 0.05
          - Math.sin(x / W * Math.PI * 2.7 + 1.2) * H * 0.02
          - Math.sin(x / W * Math.PI * 0.5 + 0.8) * H * 0.03;
      } else if (layer === 1) {
        return H * 0.48
          - Math.sin(x / W * Math.PI * 1.4 + 0.7) * H * 0.04
          - Math.sin(x / W * Math.PI * 3.1 + 0.5) * H * 0.02;
      } else {
        return H * 0.58
          - Math.sin(x / W * Math.PI * 1.6 + 0.2) * H * 0.025
          - Math.sin(x / W * Math.PI * 2.8 + 1.5) * H * 0.015;
      }
    }

    function drawSky() {
      var g = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      g.addColorStop(0, '#4a90c4');
      g.addColorStop(0.35, '#7cb8da');
      g.addColorStop(0.65, '#a8d0e8');
      g.addColorStop(0.85, '#d0dfc0');
      g.addColorStop(1, '#e8dcc0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.55);
    }

    function drawHaze() {
      var g = ctx.createLinearGradient(0, H * 0.32, 0, H * 0.46);
      g.addColorStop(0, 'rgba(200, 215, 200, 0)');
      g.addColorStop(0.5, 'rgba(200, 215, 200, 0.25)');
      g.addColorStop(1, 'rgba(200, 215, 200, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.32, W, H * 0.14);
    }

    function drawHill(layer) {
      var parallax = (mouseX - 0.5) * (layer === 0 ? -4 : layer === 1 ? -8 : -14);
      var colors;
      if (layer === 0) {
        colors = ['#6a9a78', '#5a8a68'];
      } else if (layer === 1) {
        colors = ['#4a8050', '#3a7040'];
      } else {
        colors = ['#2a6a30', '#1e5a25'];
      }

      ctx.beginPath();
      ctx.moveTo(-20, H);
      for (var x = -20; x <= W + 20; x += 3) {
        ctx.lineTo(x + parallax, getHillY(x, layer));
      }
      ctx.lineTo(W + 20, H);
      ctx.closePath();

      var topY = getHillY(W * 0.3, layer);
      var g = ctx.createLinearGradient(0, topY - 10, 0, topY + H * 0.15);
      g.addColorStop(0, colors[0]);
      g.addColorStop(1, colors[1]);
      ctx.fillStyle = g;
      ctx.fill();
    }

    function drawTurbines() {
      var parallax = (mouseX - 0.5) * -4;
      ctx.globalAlpha = 0.6;
      turbines.forEach(function (t) {
        if (!prefersReducedMotion) t.angle += t.speed;
        var tx = t.x + parallax;
        var ty = t.y;
        // Tower - tapered
        ctx.strokeStyle = '#c8d4d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx - 1, ty);
        ctx.lineTo(tx, ty - t.height);
        ctx.moveTo(tx + 1, ty);
        ctx.lineTo(tx, ty - t.height);
        ctx.stroke();
        // Hub
        ctx.fillStyle = '#dce4e4';
        ctx.beginPath();
        ctx.arc(tx, ty - t.height, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // 3 blades - tapered
        for (var b = 0; b < 3; b++) {
          var a = t.angle + (b * Math.PI * 2 / 3);
          var tipX = tx + Math.cos(a) * t.bladeLen;
          var tipY = ty - t.height + Math.sin(a) * t.bladeLen;
          ctx.beginPath();
          ctx.moveTo(tx, ty - t.height);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = '#d4dede';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    }

    function drawClouds() {
      clouds.forEach(function (c) {
        if (!prefersReducedMotion) c.x += c.speed;
        if (c.x > W + 200) c.x = -250;
        var px = c.x + (mouseX - 0.5) * -5;
        ctx.fillStyle = 'rgba(255, 255, 255, ' + c.alpha + ')';
        c.bubbles.forEach(function (b) {
          ctx.beginPath();
          ctx.ellipse(px + b.ox, c.y + b.oy, b.rx, b.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    function drawFields() {
      var fieldTop = H * 0.56;
      var fieldBot = H;
      var vanishY = H * 0.42;
      var vanishX = W * 0.5;
      var stripCount = fieldStrips.length;
      var botW = W * 1.4;
      var botLeft = -W * 0.2;
      var parallax = (mouseX - 0.5) * -12;

      for (var i = 0; i < stripCount; i++) {
        var strip = fieldStrips[i];
        var frac0 = i / stripCount;
        var frac1 = (i + 1) / stripCount;

        // Bottom edge positions (wide, close)
        var bx0 = botLeft + frac0 * botW + parallax;
        var bx1 = botLeft + frac1 * botW + parallax;

        // Top edge positions (converge toward vanishing point)
        var tx0 = vanishX + (bx0 - vanishX) * 0.35;
        var tx1 = vanishX + (bx1 - vanishX) * 0.35;

        // Draw strip trapezoid
        ctx.beginPath();
        ctx.moveTo(bx0, fieldBot);
        ctx.lineTo(bx1, fieldBot);
        ctx.lineTo(tx1, fieldTop);
        ctx.lineTo(tx0, fieldTop);
        ctx.closePath();
        ctx.fillStyle = strip.col;
        ctx.fill();

        // Shadow edge between strips
        ctx.beginPath();
        ctx.moveTo(bx1, fieldBot);
        ctx.lineTo(tx1, fieldTop);
        ctx.strokeStyle = 'rgba(0, 20, 0, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Row texture for miscanthus strips
        if (strip.type === 'miscanthus') {
          for (var row = 0; row < 8; row++) {
            var rf = (row + 0.5) / 8;
            var ry = fieldTop + (fieldBot - fieldTop) * rf;
            var lx = bx0 + (tx0 - bx0) * (1 - rf);
            var rx = bx1 + (tx1 - bx1) * (1 - rf);
            ctx.beginPath();
            ctx.moveTo(lx, ry);
            ctx.lineTo(rx, ry);
            ctx.strokeStyle = 'rgba(0, 40, 10, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Wheat texture - small dashes
        if (strip.type === 'wheat') {
          ctx.fillStyle = 'rgba(180, 170, 80, 0.08)';
          for (var wr = 0; wr < 6; wr++) {
            var wf = (wr + 0.5) / 6;
            var wy = fieldTop + (fieldBot - fieldTop) * wf;
            var wlx = bx0 + (tx0 - bx0) * (1 - wf);
            var wrx = bx1 + (tx1 - bx1) * (1 - wf);
            ctx.fillRect(wlx, wy - 0.5, wrx - wlx, 1);
          }
        }
      }

      // Subtle ground gradient at very bottom for depth
      var gndGrad = ctx.createLinearGradient(0, H * 0.85, 0, H);
      gndGrad.addColorStop(0, 'rgba(20, 50, 20, 0)');
      gndGrad.addColorStop(1, 'rgba(20, 50, 20, 0.15)');
      ctx.fillStyle = gndGrad;
      ctx.fillRect(0, H * 0.85, W, H * 0.15);
    }

    function drawOverlay() {
      // Light overlay for text readability
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(10, 32, 24, 0.18)');
      g.addColorStop(0.35, 'rgba(10, 32, 24, 0.08)');
      g.addColorStop(0.6, 'rgba(10, 32, 24, 0.12)');
      g.addColorStop(1, 'rgba(10, 32, 24, 0.3)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function draw(t) {
      time = t || 0;
      ctx.clearRect(0, 0, W, H);

      drawSky();
      drawHaze();
      drawHill(0);
      drawTurbines();
      drawClouds();
      drawHill(1);
      drawHill(2);
      drawFields();
      drawOverlay();

      if (!prefersReducedMotion) {
        requestAnimationFrame(draw);
      }
    }

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
