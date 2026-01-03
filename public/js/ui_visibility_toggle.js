// Tùy chọn hiển thị UI - Ẩn/hiện nhanh các nhóm mục, lưu trạng thái vào localStorage
// Comment: Viết bằng tiếng Việt theo yêu cầu

(function(){
  const KEYS = {
    actionButtons: 'shm.ui.hide.actionButtons',
    sec2Config: 'shm.ui.hide.sec2Config'
  };

  const FALLBACK_BUTTON_IDS = [
    'batch-download-btn',                 // Tải 5 ngưỡng
    'export-abc-csv-btn',                 // Xuất báo cáo CSV
    'export-all-modes-damage-list-btn',   // Xuất DS hư hỏng
    'download-2d-image-btn',              // Tải ảnh 2D

    // Các nút tải biểu đồ 3D (mọi mục/biến thể)
    // Section 1
    'download-3d-chart-btn-section1',
    'download-3d-chart-btn-section1-normalized',
    'download-3d-chart-btn-section1-both',
    'download-charts-btn',                // Multi-Mode 3D – Sec1
    'download-charts-test-csv-btn',       // Multi-3D TEST.csv – Sec1

    // Section 2
    'download-3d-chart-btn-section2',

    // Section 3
    'download-3d-chart-btn-section3',
    'download-charts-btn-section3'
  ];

  // Đọc mặc định từ SHM_CONFIG (nếu có) và ghi đè bởi localStorage khi đã từng tương tác
  function loadVisibilityPrefs() {
    const getBool = (v) => v === true || v === 'true';
    const cfg = (window.SHM_CONFIG && window.SHM_CONFIG.ui && window.SHM_CONFIG.ui.visibility) || {};
    const lsAB = localStorage.getItem(KEYS.actionButtons);
    const lsS2 = localStorage.getItem(KEYS.sec2Config);
    return {
      actionButtonsHidden: (lsAB === null ? !!cfg.actionButtonsHidden : getBool(lsAB)),
      sec2ConfigHidden: (lsS2 === null ? !!cfg.sec2ConfigHidden : getBool(lsS2))
    };
  }

  function saveVisibilityPrefs(prefs) {
    try {
      if (typeof prefs.actionButtonsHidden === 'boolean') {
        localStorage.setItem(KEYS.actionButtons, String(prefs.actionButtonsHidden));
      }
      if (typeof prefs.sec2ConfigHidden === 'boolean') {
        localStorage.setItem(KEYS.sec2Config, String(prefs.sec2ConfigHidden));
      }
    } catch (_) {}
  }

  // Ẩn/hiện theo id. Nếu không có container #action-buttons-container thì ẩn lẻ các nút fallback
  function setSectionVisibility(targetId, hidden) {
    const el = document.getElementById(targetId);
    if (el) {
      el.classList.toggle('is-hidden', !!hidden);
    } else if (targetId === 'action-buttons-container') {
      FALLBACK_BUTTON_IDS.forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.toggle('is-hidden', !!hidden);
      });
    }
  }

  function applyVisibilityPrefs() {
    const prefs = loadVisibilityPrefs();
    setSectionVisibility('action-buttons-container', prefs.actionButtonsHidden);
    setSectionVisibility('sec2-config-panel', prefs.sec2ConfigHidden);

    // Đồng bộ checkbox (nếu tồn tại)
    const chkAB = document.getElementById('chk-hide-action-buttons');
    const chkS2 = document.getElementById('chk-hide-sec2-config');
    if (chkAB) chkAB.checked = !!prefs.actionButtonsHidden;
    if (chkS2) chkS2.checked = !!prefs.sec2ConfigHidden;
  }

  function closeMenu() {
    const menu = document.getElementById('ui-visibility-menu');
    const btn = document.getElementById('ui-visibility-toggle-btn');
    if (menu) menu.style.display = 'none';
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    const menu = document.getElementById('ui-visibility-menu');
    const btn = document.getElementById('ui-visibility-toggle-btn');
    if (menu) menu.style.display = 'block';
    if (btn) btn.setAttribute('aria-expanded', 'true');
    // Focus checkbox đầu tiên để hỗ trợ bàn phím
    const first = document.getElementById('chk-hide-action-buttons');
    if (first) first.focus();
  }

  function initUIVisibilityControls() {
    // Áp dụng trạng thái lúc khởi tạo
    applyVisibilityPrefs();

    const btn = document.getElementById('ui-visibility-toggle-btn');
    const menu = document.getElementById('ui-visibility-menu');
    if (!btn || !menu) return;

    // Toggle mở/đóng bằng click
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMenu(); else openMenu();
    });

    // Hỗ trợ Enter/Space trên nút
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) closeMenu(); else openMenu();
      }
      if (e.key === 'Escape') closeMenu();
    });

    // Đóng khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== btn) closeMenu();
    });

    // Esc để đóng khi focus trong menu
    menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Checkbox events
    const chkAB = document.getElementById('chk-hide-action-buttons');
    const chkS2 = document.getElementById('chk-hide-sec2-config');

    if (chkAB) {
      chkAB.addEventListener('change', () => {
        const hidden = !!chkAB.checked;
        setSectionVisibility('action-buttons-container', hidden);
        saveVisibilityPrefs({ actionButtonsHidden: hidden });
      });
    }
    if (chkS2) {
      chkS2.addEventListener('change', () => {
        const hidden = !!chkS2.checked;
        setSectionVisibility('sec2-config-panel', hidden);
        saveVisibilityPrefs({ sec2ConfigHidden: hidden });
      });
    }
  }

  // Khởi tạo khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIVisibilityControls);
  } else {
    initUIVisibilityControls();
  }

  // Public API (nếu cần dùng nơi khác)
  window.initUIVisibilityControls = initUIVisibilityControls;
  window.loadVisibilityPrefs = loadVisibilityPrefs;
  window.saveVisibilityPrefs = saveVisibilityPrefs;
  window.setSectionVisibility = setSectionVisibility;
  window.applyVisibilityPrefs = applyVisibilityPrefs;
})();

