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

  /* ── Hero Canvas — Animated Grass + Particles ─────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var blades = [];
    var particles = [];
    var bladeCount = 250;
    var particleCount = 40;

    function resize() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      initBlades();
      initParticles();
    }

    function initBlades() {
      blades = [];
      for (var i = 0; i < bladeCount; i++) {
        blades.push({
          x: Math.random() * canvas.width,
          y: canvas.height,
          height: 80 + Math.random() * 180,
          width: 1.5 + Math.random() * 2.5,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.005 + Math.random() * 0.01,
          swayAmount: 8 + Math.random() * 15,
          hue: 140 + Math.random() * 30,
          saturation: 40 + Math.random() * 30,
          lightness: 25 + Math.random() * 20,
          alpha: 0.25 + Math.random() * 0.35
        });
      }
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 1 + Math.random() * 2,
          speed: 0.2 + Math.random() * 0.5,
          alpha: 0.1 + Math.random() * 0.15,
          drift: (Math.random() - 0.5) * 0.6
        });
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blades.forEach(function (b) {
        b.sway += b.swaySpeed;
        var swayX = Math.sin(b.sway) * b.swayAmount;

        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(
          b.x + swayX * 0.5, b.y - b.height * 0.5,
          b.x + swayX, b.y - b.height
        );
        ctx.strokeStyle = 'hsla(' + b.hue + ', ' + b.saturation + '%, ' + b.lightness + '%, ' + b.alpha + ')';
        ctx.lineWidth = b.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      if (!prefersReducedMotion) {
        particles.forEach(function (p) {
          p.y -= p.speed;
          p.x += p.drift;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, ' + p.alpha + ')';
          ctx.fill();
        });
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    } else {
      // Draw a single static frame without animation
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
