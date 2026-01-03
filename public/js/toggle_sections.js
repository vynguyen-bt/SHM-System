// Nút sổ/thu gọn tất cả mục cho toàn bộ sections
// Ghi chú: Không thay đổi logic riêng của các nút switchToPart*, chỉ điều khiển hiển thị đồng loạt

(function(){
  // Lấy đúng 6 mục (0→5), bao gồm VR theo phản hồi người dùng
  // 0: partB1, 1: partA, 2: partB, 3: partB4, 4: partB3, 5: partVR
  function getTopLevelSectionBodies() {
    var ids = ['partB1', 'partA', 'partB', 'partB4', 'partB3', 'partVR'];

    function findTopLevelBody(el) {
      // Đi lên đến khi gặp .body-part mà parent là .main-part
      var node = el;
      while (node) {
        if (
          node.classList && node.classList.contains('body-part') &&
          node.parentElement && node.parentElement.classList && node.parentElement.classList.contains('main-part')
        ) {
          return node;
        }
        node = node.parentElement;
      }
      // Fallback: lấy gần nhất .body-part
      return el.closest ? el.closest('.body-part') : el;
    }

    var list = [];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      var topBody = findTopLevelBody(el);
      if (topBody) list.push(topBody);
    });

    // Loại bỏ trùng lặp
    var unique = [];
    var seen = new Set();
    list.forEach(function(el){ if (!seen.has(el)) { seen.add(el); unique.push(el); } });
    return unique;
  }

  // Lấy các phần tử nội dung (theo ID yêu cầu)
  function getContentEls() {
    var ids = ['partB1', 'partA', 'partB', 'partB4', 'partB3', 'partVR'];
    return ids
      .map(function(id){ return document.getElementById(id); })
      .filter(function(el){ return !!el; });
  }

  // Kiểm tra tất cả đã mở hay chưa
  function areAllOpen(sections) {
    if (!sections || sections.length === 0) return false;
    var allBodiesOpen = sections.every(el => window.getComputedStyle(el).display !== 'none');
    var contents = getContentEls();
    var allContentsOpen = contents.every(el => window.getComputedStyle(el).display !== 'none');
    return allBodiesOpen && allContentsOpen;
  }

  // Đặt hiển thị cho tất cả sections
  function setAll(sections, show) {
    // Hiển thị/ẩn top-level bodies
    sections.forEach(el => { el.style.display = show ? 'block' : 'none'; });
    // Đảm bảo mở cả nội dung bên trong khi expand
    if (show) {
      getContentEls().forEach(function(el){ el.style.display = 'block'; });
    }
  }

  // Cập nhật nhãn nút theo trạng thái
  function updateButtonLabel() {
    var btn = document.getElementById('toggle-all-sections-btn');
    if (!btn) return;
    var sections = getTopLevelSectionBodies();
    var allOpen = areAllOpen(sections);
    window.__sectionsExpanded = allOpen;
    btn.textContent = allOpen ? 'Thu gọn tất cả mục' : 'Sổ ra tất cả mục';
  }

  // Hàm toggle công khai
  window.toggleAllSections = function() {
    try {
      var sections = getTopLevelSectionBodies();
      var toExpand = !areAllOpen(sections);
      setAll(sections, toExpand);
      window.__sectionsExpanded = toExpand;
      updateButtonLabel();
    } catch (e) {
      console.error('❌ Lỗi khi sổ/thu gọn tất cả mục:', e);
      alert('Không thể thay đổi trạng thái các mục. Vui lòng thử lại.');
    }
  };

  // Khởi tạo nhãn + gắn theo dõi các nút tiêu đề khi DOM sẵn sàng
  function initToggleUI() {
    updateButtonLabel();

    // Theo dõi các hàm switchToPart* để khi người dùng mở/đóng từng mục, nhãn nút vẫn đúng
    var fnNames = ['switchToPartB1','switchToPartA','switchToPartB','switchToPartB4','switchToPartB3'];
    fnNames.forEach(function(name){
      try {
        if (typeof window[name] === 'function' && !window[name].__wrappedForToggleAll) {
          var original = window[name];
          var wrapped = function() {
            var ret = original.apply(this, arguments);
            // Đợi DOM cập nhật rồi cập nhật nhãn
            setTimeout(updateButtonLabel, 0);
            return ret;
          };
          wrapped.__wrappedForToggleAll = true;
          window[name] = wrapped;
        }
      } catch (e) { /* ignore */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggleUI);
  } else {
    initToggleUI();
  }
})();

