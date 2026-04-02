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
      // 3 layers of grass: back (shorter, dimmer), mid, front (tallest, boldest)
      var layers = [
        { count: 100, minH: 0.08, maxH: 0.18, minW: 1.5, maxW: 2.5, minA: 0.15, maxA: 0.3, lightMin: 28, lightMax: 38, depth: 0.3 },
        { count: 120, minH: 0.14, maxH: 0.28, minW: 2, maxW: 3.5, minA: 0.25, maxA: 0.5, lightMin: 22, lightMax: 32, depth: 0.6 },
        { count: 100, minH: 0.22, maxH: 0.42, minW: 2.5, maxW: 4.5, minA: 0.4, maxA: 0.7, lightMin: 18, lightMax: 28, depth: 1.0 }
      ];

      layers.forEach(function (layer) {
        for (var i = 0; i < layer.count; i++) {
          blades.push({
            xFrac: Math.random(),
            hFrac: layer.minH + Math.random() * (layer.maxH - layer.minH),
            width: layer.minW + Math.random() * (layer.maxW - layer.minW),
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.006 + Math.random() * 0.01,
            swayAmount: 6 + Math.random() * 14,
            hue: 125 + Math.random() * 40,
            saturation: 45 + Math.random() * 35,
            lightness: layer.lightMin + Math.random() * (layer.lightMax - layer.lightMin),
            alpha: layer.minA + Math.random() * (layer.maxA - layer.minA),
            depth: layer.depth
          });
        }
      });

      // Sort by depth (back to front)
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

    function drawBlades() {
      var windTime = time * 0.0008;

      blades.forEach(function (b) {
        if (!prefersReducedMotion) b.sway += b.swaySpeed;
        var globalWind = Math.sin(windTime + b.xFrac * 5) * 6 * b.depth;
        var swayX = Math.sin(b.sway) * b.swayAmount * b.depth + globalWind;

        var x = b.xFrac * W;
        var bladeH = b.hFrac * H;

        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.quadraticCurveTo(
          x + swayX * 0.4, H - bladeH * 0.5,
          x + swayX, H - bladeH
        );
        ctx.strokeStyle = 'hsla(' + b.hue + ', ' + b.saturation + '%, ' + b.lightness + '%, ' + b.alpha + ')';
        ctx.lineWidth = b.width;
        ctx.lineCap = 'round';
        ctx.stroke();
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
