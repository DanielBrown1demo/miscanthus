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

  /* ── localStorage helpers ──────────────────────────────── */
  function getStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ── Escape HTML to prevent XSS ────────────────────────── */
  function esc(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
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
    updateStats();
    renderInbox();
    renderRecipients();
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
        if (tab === 'inbox') renderInbox();
        if (tab === 'recipients') renderRecipients();
        updateStats();
      });
    });
  });

  /* ── Stats Dashboard ───────────────────────────────────── */
  function updateStats() {
    var gallery = getStore('miscanthus_gallery');
    var updates = getStore('miscanthus_updates');
    var inbox = getStore('miscanthus_inbox');
    var recipients = getStore('miscanthus_recipients');

    var unreadCount = inbox.filter(function (m) { return m.read !== true; }).length;
    var activeRecipients = recipients.filter(function (r) { return r.active === true; }).length;

    var statPhotos = document.getElementById('statPhotos');
    var statUpdates = document.getElementById('statUpdates');
    var statInbox = document.getElementById('statInbox');
    var statRecipients = document.getElementById('statRecipients');

    if (statPhotos) statPhotos.textContent = gallery.length;
    if (statUpdates) statUpdates.textContent = updates.length;
    if (statInbox) statInbox.textContent = unreadCount;
    if (statRecipients) statRecipients.textContent = activeRecipients;
  }

  /* ── Upload Photo (enhanced) ───────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var uploadBtn = document.getElementById('uploadPhotoBtn');
    if (!uploadBtn) return;

    uploadBtn.addEventListener('click', function () {
      var fileInput = document.getElementById('photoFile');
      var title = document.getElementById('photoTitle');
      var description = document.getElementById('photoDescription');
      var category = document.getElementById('photoCategory');

      if (!fileInput || !fileInput.files.length) return;

      var titleVal = title ? title.value.trim() : '';
      var descVal = description ? description.value.trim() : '';
      var catVal = category ? category.value : '';

      var file = fileInput.files[0];
      var reader = new FileReader();

      reader.onload = function (e) {
        resizeImage(e.target.result, 1200, function (resized) {
          var gallery = getStore('miscanthus_gallery');

          gallery.push({
            image: resized,
            title: titleVal,
            description: descVal,
            category: catVal,
            date: new Date().toISOString()
          });

          setStore('miscanthus_gallery', gallery);

          fileInput.value = '';
          if (title) title.value = '';
          if (description) description.value = '';
          if (category) category.selectedIndex = 0;
          showSuccess('uploadSuccess');
          updateStats();
        });
      };

      reader.readAsDataURL(file);
    });
  });

  /* ── Resize Image via Canvas ───────────────────────────── */
  function resizeImage(dataUrl, maxSize, callback) {
    var img = new Image();
    img.onload = function () {
      var width = img.width;
      var height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
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

  /* ── Post Update (enhanced) ────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var postBtn = document.getElementById('postUpdateBtn');
    if (!postBtn) return;

    var dateInput = document.getElementById('postDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    postBtn.addEventListener('click', function () {
      var title = document.getElementById('postTitle').value.trim();
      var body = document.getElementById('postBody').value.trim();
      var category = document.getElementById('postCategory');
      var date = document.getElementById('postDate').value;

      if (!title || !body) return;

      var catVal = category ? category.value : '';

      var updates = getStore('miscanthus_updates');

      updates.push({
        title: title,
        body: body,
        category: catVal,
        date: date
      });

      setStore('miscanthus_updates', updates);

      document.getElementById('postTitle').value = '';
      document.getElementById('postBody').value = '';
      if (category) category.selectedIndex = 0;
      showSuccess('postSuccess');
      updateStats();
    });
  });

  /* ── Contact Inbox ─────────────────────────────────────── */
  function renderInbox() {
    var container = document.getElementById('inboxList');
    if (!container) return;

    var inbox = getStore('miscanthus_inbox');

    if (!inbox.length) {
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.9rem;">Keine Nachrichten vorhanden. / No messages yet.</p>';
      return;
    }

    container.innerHTML = '';
    inbox.forEach(function (item, index) {
      var wrapper = document.createElement('div');
      wrapper.className = 'admin-inbox-item' + (item.read !== true ? ' unread' : '');
      wrapper.setAttribute('data-inbox-index', index);

      var summary = document.createElement('div');
      summary.className = 'admin-inbox-summary';
      summary.innerHTML =
        '<div class="admin-inbox-sender">' +
          '<strong>' + esc(item.firstName) + ' ' + esc(item.lastName) + '</strong>' +
          (item.read !== true ? ' <span class="unread-badge">neu</span>' : '') +
        '</div>' +
        '<div class="admin-inbox-meta">' +
          esc(item.email || '') +
          (item.date ? ' &mdash; ' + esc(new Date(item.date).toLocaleDateString()) : '') +
        '</div>' +
        '<div class="admin-inbox-preview">' + esc((item.message || '').substring(0, 80)) + (item.message && item.message.length > 80 ? '...' : '') + '</div>';

      var detail = document.createElement('div');
      detail.className = 'admin-inbox-detail';
      detail.style.display = 'none';
      detail.innerHTML =
        '<table class="admin-inbox-table">' +
          '<tr><td><strong>Name:</strong></td><td>' + esc(item.firstName) + ' ' + esc(item.lastName) + '</td></tr>' +
          '<tr><td><strong>Email:</strong></td><td>' + esc(item.email || '') + '</td></tr>' +
          '<tr><td><strong>Telefon:</strong></td><td>' + esc(item.phone || '') + '</td></tr>' +
          '<tr><td><strong>Betriebsgröße:</strong></td><td>' + esc(item.farmSize || '') + '</td></tr>' +
          '<tr><td><strong>Rolle:</strong></td><td>' + esc(item.role || '') + '</td></tr>' +
          '<tr><td><strong>Datum:</strong></td><td>' + (item.date ? esc(new Date(item.date).toLocaleString()) : '') + '</td></tr>' +
        '</table>' +
        '<div class="admin-inbox-message"><strong>Nachricht:</strong><br>' + esc(item.message || '') + '</div>' +
        '<div class="admin-inbox-actions">' +
          '<button class="admin-inbox-mark-read" data-inbox-index="' + index + '">' + (item.read ? 'Als ungelesen markieren' : 'Als gelesen markieren') + '</button>' +
          '<button class="admin-inbox-delete" data-inbox-index="' + index + '">Löschen</button>' +
        '</div>';

      summary.addEventListener('click', function () {
        var isVisible = detail.style.display !== 'none';
        detail.style.display = isVisible ? 'none' : 'block';

        if (!isVisible && item.read !== true) {
          var currentInbox = getStore('miscanthus_inbox');
          if (currentInbox[index]) {
            currentInbox[index].read = true;
            setStore('miscanthus_inbox', currentInbox);
            wrapper.classList.remove('unread');
            var badge = summary.querySelector('.unread-badge');
            if (badge) badge.remove();
            updateStats();
          }
        }
      });

      wrapper.appendChild(summary);
      wrapper.appendChild(detail);
      container.appendChild(wrapper);
    });
  }

  /* ── Inbox action handlers (mark read / delete) ────────── */
  document.addEventListener('click', function (e) {
    var markBtn = e.target.closest('.admin-inbox-mark-read');
    if (markBtn) {
      var index = parseInt(markBtn.getAttribute('data-inbox-index'), 10);
      var inbox = getStore('miscanthus_inbox');
      if (inbox[index]) {
        inbox[index].read = !inbox[index].read;
        setStore('miscanthus_inbox', inbox);
        renderInbox();
        updateStats();
      }
      return;
    }

    var delBtn = e.target.closest('.admin-inbox-delete');
    if (delBtn) {
      var idx = parseInt(delBtn.getAttribute('data-inbox-index'), 10);
      var inboxDel = getStore('miscanthus_inbox');
      inboxDel.splice(idx, 1);
      setStore('miscanthus_inbox', inboxDel);
      renderInbox();
      updateStats();
      return;
    }
  });

  /* ── Notification Recipients ───────────────────────────── */
  function renderRecipients() {
    var container = document.getElementById('recipientsList');
    if (!container) return;

    var recipients = getStore('miscanthus_recipients');

    if (!recipients.length) {
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.9rem;">Keine Empfänger vorhanden. / No recipients yet.</p>';
      return;
    }

    container.innerHTML = '';
    recipients.forEach(function (item, index) {
      var div = document.createElement('div');
      div.className = 'admin-recipient-item' + (item.active ? ' active' : ' inactive');
      div.innerHTML =
        '<div class="admin-recipient-info">' +
          '<div class="admin-recipient-name">' + esc(item.name) + '</div>' +
          '<div class="admin-recipient-contact">' + esc(item.email || '') + (item.phone ? ' | ' + esc(item.phone) : '') + '</div>' +
        '</div>' +
        '<div class="admin-recipient-controls">' +
          '<label class="admin-toggle">' +
            '<input type="checkbox" class="admin-recipient-toggle" data-recipient-index="' + index + '"' + (item.active ? ' checked' : '') + '>' +
            '<span class="admin-toggle-slider"></span>' +
          '</label>' +
          '<button class="admin-recipient-delete" data-recipient-index="' + index + '">Löschen</button>' +
        '</div>';
      container.appendChild(div);
    });
  }

  /* ── Add Recipient ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var addBtn = document.getElementById('addRecipientBtn');
    if (!addBtn) return;

    addBtn.addEventListener('click', function () {
      var nameInput = document.getElementById('recipientName');
      var emailInput = document.getElementById('recipientEmail');
      var phoneInput = document.getElementById('recipientPhone');

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var phone = phoneInput ? phoneInput.value.trim() : '';

      if (!name || !email) return;

      var recipients = getStore('miscanthus_recipients');

      recipients.push({
        name: name,
        email: email,
        phone: phone,
        active: true
      });

      setStore('miscanthus_recipients', recipients);

      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (phoneInput) phoneInput.value = '';

      renderRecipients();
      updateStats();
    });
  });

  /* ── Recipient action handlers (toggle / delete) ───────── */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.admin-recipient-toggle');
    if (toggle) {
      var index = parseInt(toggle.getAttribute('data-recipient-index'), 10);
      var recipients = getStore('miscanthus_recipients');
      if (recipients[index]) {
        recipients[index].active = !recipients[index].active;
        setStore('miscanthus_recipients', recipients);
        renderRecipients();
        updateStats();
      }
      return;
    }

    var delBtn = e.target.closest('.admin-recipient-delete');
    if (delBtn) {
      var idx = parseInt(delBtn.getAttribute('data-recipient-index'), 10);
      var recipientsDel = getStore('miscanthus_recipients');
      recipientsDel.splice(idx, 1);
      setStore('miscanthus_recipients', recipientsDel);
      renderRecipients();
      updateStats();
      return;
    }
  });

  /* ── Manage Content (Settings tab) ─────────────────────── */
  function renderManage() {
    renderManagePhotos();
    renderManageUpdates();
  }

  function renderManagePhotos() {
    var container = document.getElementById('managePhotos');
    if (!container) return;

    var gallery = getStore('miscanthus_gallery');

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
          '<div class="admin-item__title">' + esc(item.title || 'Ohne Titel') + '</div>' +
          '<div class="admin-item__meta">' + esc(item.category || '') + '</div>' +
        '</div>' +
        '<button class="admin-delete-btn" data-type="gallery" data-index="' + index + '">Löschen</button>';
      container.appendChild(div);
    });
  }

  function renderManageUpdates() {
    var container = document.getElementById('manageUpdates');
    if (!container) return;

    var updates = getStore('miscanthus_updates');

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
          '<div class="admin-item__title">' + esc(item.title || 'Ohne Titel') + '</div>' +
          '<div class="admin-item__meta">' + esc(item.category || '') + ' &mdash; ' + esc(item.date || '') + '</div>' +
        '</div>' +
        '<button class="admin-delete-btn" data-type="updates" data-index="' + index + '">Löschen</button>';
      container.appendChild(div);
    });
  }

  /* ── Delete Handler (manage content) ───────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.admin-delete-btn');
    if (!btn) return;

    var type = btn.getAttribute('data-type');
    var index = parseInt(btn.getAttribute('data-index'), 10);
    var key = type === 'gallery' ? 'miscanthus_gallery' : 'miscanthus_updates';

    var items = getStore(key);
    items.splice(index, 1);
    setStore(key, items);
    renderManage();
    updateStats();
  });

  /* ── Notification Placeholders ─────────────────────────── */
  function sendNotifications(submission) {
    var recipients = getStore('miscanthus_recipients');
    var senderName = (submission.firstName || '') + ' ' + (submission.lastName || '');
    senderName = senderName.trim() || 'Unknown';

    recipients.forEach(function (recipient) {
      if (recipient.active !== true) return;

      if (recipient.email) {
        console.log('EMAIL: To ' + recipient.email + ', Subject: New contact from ' + senderName);
      }
      if (recipient.phone) {
        console.log('SMS: To ' + recipient.phone + ', Message: New contact form submission from ' + senderName);
      }
    });
  }

  /* Expose sendNotifications globally so main.js can call it */
  window.adminSendNotifications = sendNotifications;

  /* ── Success Flash ─────────────────────────────────────── */
  function showSuccess(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

})();
