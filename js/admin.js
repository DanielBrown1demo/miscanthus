/* ============================================================
   MISCANTHUS IM STREIFENANBAU — Admin Panel JS
   ============================================================ */

(function () {
  'use strict';

  var PASSWORD_HASH = 'de778e202d681a6de83d7117101783b18403394d6f4bc7117f4ceeccccad457f';

  /* ── SHA-256 helper ────────────────────────────────────── */
  function sha256(str) {
    var encoder = new TextEncoder();
    var data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      var hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  /* ── Auth ───────────────────────────────────────────────── */
  function checkAuth() {
    if (sessionStorage.getItem('adminAuth') === '1') {
      showPanel();
    }
  }

  function showPanel() {
    var login = document.getElementById('adminLogin');
    var panel = document.getElementById('adminPanel');
    if (login) login.style.display = 'none';
    if (panel) panel.classList.add('active');
    renderManage();
  }

  document.addEventListener('DOMContentLoaded', function () {
    checkAuth();

    var loginBtn = document.getElementById('adminLoginBtn');
    var passwordInput = document.getElementById('adminPassword');
    var loginError = document.getElementById('loginError');

    if (!loginBtn) return;

    function attemptLogin() {
      var pw = passwordInput.value;
      sha256(pw).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem('adminAuth', '1');
          if (loginError) loginError.classList.remove('show');
          showPanel();
        } else {
          if (loginError) loginError.classList.add('show');
        }
      });
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attemptLogin();
    });
  });

  /* ── Admin Tabs ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var tabBtns = document.querySelectorAll('[data-admin-tab]');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-admin-tab');
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(function (tc) {
          tc.classList.remove('active');
        });
        var target = document.getElementById('admin-tab-' + tab);
        if (target) target.classList.add('active');
        if (tab === 'manage') renderManage();
      });
    });
  });

  /* ── Upload Photo ──────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var uploadBtn = document.getElementById('uploadPhotoBtn');
    if (!uploadBtn) return;

    uploadBtn.addEventListener('click', function () {
      var fileInput = document.getElementById('photoFile');
      var caption = document.getElementById('photoCaption').value.trim();
      var category = document.getElementById('photoCategory').value;

      if (!fileInput.files.length) return;

      var file = fileInput.files[0];
      var reader = new FileReader();

      reader.onload = function (e) {
        resizeImage(e.target.result, 1200, function (resized) {
          var gallery = [];
          try {
            gallery = JSON.parse(localStorage.getItem('miscanthus_gallery')) || [];
          } catch (err) { /* ignore */ }

          gallery.push({
            image: resized,
            caption: caption,
            category: category,
            date: new Date().toISOString()
          });

          localStorage.setItem('miscanthus_gallery', JSON.stringify(gallery));

          fileInput.value = '';
          document.getElementById('photoCaption').value = '';
          showSuccess('uploadSuccess');
        });
      };

      reader.readAsDataURL(file);
    });
  });

  /* ── Resize Image via Canvas ───────────────────────────── */
  function resizeImage(dataUrl, maxWidth, callback) {
    var img = new Image();
    img.onload = function () {
      var width = img.width;
      var height = img.height;

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }

      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  }

  /* ── Post Update ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var postBtn = document.getElementById('postUpdateBtn');
    if (!postBtn) return;

    // Pre-fill date
    var dateInput = document.getElementById('postDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    postBtn.addEventListener('click', function () {
      var title = document.getElementById('postTitle').value.trim();
      var body = document.getElementById('postBody').value.trim();
      var tag = document.getElementById('postTag').value;
      var date = document.getElementById('postDate').value;

      if (!title || !body) return;

      var updates = [];
      try {
        updates = JSON.parse(localStorage.getItem('miscanthus_updates')) || [];
      } catch (err) { /* ignore */ }

      updates.push({
        title: title,
        body: body,
        tag: tag,
        date: date
      });

      localStorage.setItem('miscanthus_updates', JSON.stringify(updates));

      document.getElementById('postTitle').value = '';
      document.getElementById('postBody').value = '';
      showSuccess('postSuccess');
    });
  });

  /* ── Manage Tab ────────────────────────────────────────── */
  function renderManage() {
    renderManagePhotos();
    renderManageUpdates();
  }

  function renderManagePhotos() {
    var container = document.getElementById('managePhotos');
    if (!container) return;

    var gallery = [];
    try {
      gallery = JSON.parse(localStorage.getItem('miscanthus_gallery')) || [];
    } catch (e) { /* ignore */ }

    if (!gallery.length) {
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.9rem;">Keine Fotos vorhanden. / No photos yet.</p>';
      return;
    }

    container.innerHTML = '';
    gallery.forEach(function (item, index) {
      var div = document.createElement('div');
      div.className = 'admin-item';
      div.innerHTML =
        '<img class="admin-item__thumb" src="' + item.image + '" alt="">' +
        '<div class="admin-item__info">' +
        '<div class="admin-item__title">' + (item.caption || 'Ohne Titel') + '</div>' +
        '<div class="admin-item__meta">' + (item.category || '') + '</div>' +
        '</div>' +
        '<button class="admin-delete-btn" data-type="gallery" data-index="' + index + '">Löschen</button>';
      container.appendChild(div);
    });
  }

  function renderManageUpdates() {
    var container = document.getElementById('manageUpdates');
    if (!container) return;

    var updates = [];
    try {
      updates = JSON.parse(localStorage.getItem('miscanthus_updates')) || [];
    } catch (e) { /* ignore */ }

    if (!updates.length) {
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.9rem;">Keine Beiträge vorhanden. / No posts yet.</p>';
      return;
    }

    container.innerHTML = '';
    updates.forEach(function (item, index) {
      var div = document.createElement('div');
      div.className = 'admin-item';
      div.innerHTML =
        '<div class="admin-item__info">' +
        '<div class="admin-item__title">' + (item.title || 'Ohne Titel') + '</div>' +
        '<div class="admin-item__meta">' + (item.tag || '') + ' &mdash; ' + (item.date || '') + '</div>' +
        '</div>' +
        '<button class="admin-delete-btn" data-type="updates" data-index="' + index + '">Löschen</button>';
      container.appendChild(div);
    });
  }

  /* ── Delete Handler ────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.admin-delete-btn');
    if (!btn) return;

    var type = btn.getAttribute('data-type');
    var index = parseInt(btn.getAttribute('data-index'), 10);
    var key = type === 'gallery' ? 'miscanthus_gallery' : 'miscanthus_updates';

    var items = [];
    try {
      items = JSON.parse(localStorage.getItem(key)) || [];
    } catch (err) { /* ignore */ }

    items.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(items));
    renderManage();
  });

  /* ── Success Flash ─────────────────────────────────────── */
  function showSuccess(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

})();
