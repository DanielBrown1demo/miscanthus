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
        if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
          navbar.classList.add('navbar--on-hero');
        } else if (!entry.isIntersecting) {
          navbar.classList.remove('navbar--on-hero');
        }
      });
    }, { threshold: [0, 0.15, 0.5] });

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

  /* ── Hero Canvas — Sky Gradient + Grass Blades ──────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H, dpr;
    var time = 0;
    var blades = [];
    var initialized = false;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      var displayW = canvas.parentElement.offsetWidth;
      var displayH = canvas.parentElement.offsetHeight;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = displayW;
      H = displayH;
      if (!initialized) {
        initBlades();
        initialized = true;
      }
    }

    function initBlades() {
      blades = [];
      // 3 depth layers of Miscanthus plants
      var layers = [
        { count: 30, minH: 0.12, maxH: 0.22, minA: 0.15, maxA: 0.3, lightMin: 30, lightMax: 40, depth: 0.3 },
        { count: 35, minH: 0.20, maxH: 0.35, minA: 0.3, maxA: 0.55, lightMin: 24, lightMax: 34, depth: 0.6 },
        { count: 25, minH: 0.30, maxH: 0.50, minA: 0.5, maxA: 0.75, lightMin: 20, lightMax: 30, depth: 1.0 }
      ];

      layers.forEach(function (layer) {
        for (var i = 0; i < layer.count; i++) {
          var stemH = layer.minH + Math.random() * (layer.maxH - layer.minH);
          // Each plant has a stem + several arching leaves
          var leafCount = 4 + Math.floor(Math.random() * 5);
          var leaves = [];
          for (var l = 0; l < leafCount; l++) {
            var attachFrac = 0.2 + Math.random() * 0.65; // where leaf joins stem
            var side = Math.random() > 0.5 ? 1 : -1;
            leaves.push({
              attachFrac: attachFrac,
              side: side,
              length: 0.3 + Math.random() * 0.5, // fraction of stem height
              droop: 0.4 + Math.random() * 0.6, // how much it curves down
              width: 1.2 + Math.random() * 1.5,
              hueOff: (Math.random() - 0.5) * 20,
              lightOff: (Math.random() - 0.5) * 8
            });
          }
          // Some tall stems get a feathery plume at the top
          var hasPlume = stemH > (layer.minH + (layer.maxH - layer.minH) * 0.5) && Math.random() > 0.4;
          blades.push({
            xFrac: Math.random(),
            hFrac: stemH,
            stemWidth: 1.5 + Math.random() * 1.5 * layer.depth,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.004 + Math.random() * 0.008,
            swayAmount: 4 + Math.random() * 10,
            hue: 110 + Math.random() * 30,
            saturation: 40 + Math.random() * 30,
            lightness: layer.lightMin + Math.random() * (layer.lightMax - layer.lightMin),
            alpha: layer.minA + Math.random() * (layer.maxA - layer.minA),
            depth: layer.depth,
            leaves: leaves,
            hasPlume: hasPlume,
            plumeSpread: 0.15 + Math.random() * 0.2
          });
        }
      });

      blades.sort(function (a, b) { return a.depth - b.depth; });
    }

    function drawSky() {
      // Sky gradient: deep blue at top, warm golden horizon at bottom
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a3a5c');
      g.addColorStop(0.2, '#2d5a7b');
      g.addColorStop(0.4, '#4a88b0');
      g.addColorStop(0.6, '#7ab4cc');
      g.addColorStop(0.78, '#b8d4c8');
      g.addColorStop(0.9, '#d4dbb0');
      g.addColorStop(1, '#c8c89a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Warm glow at horizon
      var radGrad = ctx.createRadialGradient(W * 0.5, H * 0.85, 0, W * 0.5, H * 0.85, W * 0.6);
      radGrad.addColorStop(0, 'rgba(220, 200, 140, 0.15)');
      radGrad.addColorStop(0.5, 'rgba(200, 190, 130, 0.06)');
      radGrad.addColorStop(1, 'rgba(200, 190, 130, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);
    }

    function getStemPoint(x, baseY, stemH, swayX, frac) {
      // Returns position along the stem at fraction frac (0=base, 1=tip)
      var bendX = swayX * frac * frac; // quadratic bend
      var px = x + bendX;
      var py = baseY - stemH * frac;
      return { x: px, y: py };
    }

    function drawBlades() {
      var windTime = time * 0.0008;

      blades.forEach(function (b) {
        if (!prefersReducedMotion) b.sway += b.swaySpeed;
        var globalWind = Math.sin(windTime + b.xFrac * 5) * 5 * b.depth;
        var swayX = Math.sin(b.sway) * b.swayAmount * b.depth + globalWind;

        var x = b.xFrac * W;
        var stemH = b.hFrac * H;
        var baseY = H;

        // Draw stem (central stalk)
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        for (var s = 0; s <= 10; s++) {
          var f = s / 10;
          var pt = getStemPoint(x, baseY, stemH, swayX, f);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'hsla(' + b.hue + ', ' + (b.saturation - 5) + '%, ' + (b.lightness - 3) + '%, ' + b.alpha + ')';
        ctx.lineWidth = b.stemWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw arching leaves
        b.leaves.forEach(function (leaf) {
          var attachPt = getStemPoint(x, baseY, stemH, swayX, leaf.attachFrac);
          var leafLen = stemH * leaf.length;
          var leafSway = swayX * 0.3 + leaf.side * 15 * b.depth;

          // Leaf curves outward then droops down
          var midX = attachPt.x + leaf.side * leafLen * 0.4 + leafSway * 0.2;
          var midY = attachPt.y - leafLen * 0.15;
          var tipX = attachPt.x + leaf.side * leafLen * 0.6 + leafSway * 0.3;
          var tipY = attachPt.y + leafLen * leaf.droop * 0.4;

          ctx.beginPath();
          ctx.moveTo(attachPt.x, attachPt.y);
          ctx.quadraticCurveTo(midX, midY, tipX, tipY);
          var lHue = b.hue + leaf.hueOff;
          var lLight = b.lightness + leaf.lightOff;
          ctx.strokeStyle = 'hsla(' + lHue + ', ' + b.saturation + '%, ' + lLight + '%, ' + (b.alpha * 0.85) + ')';
          ctx.lineWidth = leaf.width * b.depth;
          ctx.lineCap = 'round';
          ctx.stroke();
        });

        // Draw feathery plume at top
        if (b.hasPlume) {
          var tipPt = getStemPoint(x, baseY, stemH, swayX, 1);
          var plumeH = stemH * b.plumeSpread;
          ctx.globalAlpha = b.alpha * 0.6;
          for (var p = 0; p < 7; p++) {
            var angle = -0.8 + (p / 6) * 1.6; // spread from -0.8 to 0.8 radians
            var pLen = plumeH * (0.6 + Math.random() * 0.4);
            var pTipX = tipPt.x + Math.sin(angle + swayX * 0.01) * pLen;
            var pTipY = tipPt.y - Math.cos(angle) * pLen * 0.8;
            ctx.beginPath();
            ctx.moveTo(tipPt.x, tipPt.y);
            ctx.quadraticCurveTo(
              tipPt.x + Math.sin(angle) * pLen * 0.5,
              tipPt.y - pLen * 0.5,
              pTipX, pTipY
            );
            ctx.strokeStyle = 'hsla(40, 30%, 65%, 1)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      });
    }

    function draw(t) {
      time = t || 0;
      ctx.clearRect(0, 0, W, H);
      drawSky();
      drawBlades();

      if (!prefersReducedMotion) {
        requestAnimationFrame(draw);
      }
    }

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
