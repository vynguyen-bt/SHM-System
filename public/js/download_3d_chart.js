/**
 * Tính năng tải xuống biểu đồ 3D
 * Cho phép người dùng tải xuống biểu đồ 3D từ các Mục 1, 2, 3
 *
 * Tên file: Mode_{Mode_number}_Z0_{Z0_threshold}_section{section_number}_3d_chart.png
 * Ví dụ: Mode_12_Z0_1.50_section1_3d_chart.png
 */

/**
 * Tạo tên file dựa trên Mode và Z0 threshold
 * @param {number} sectionNumber - Số mục (1, 2, hoặc 3)
 * @returns {string} - Tên file được tạo
 */
// Lấy Mode và Z0% từ UI với fallback từ strainEnergyResults
function getModeZ0FromUIWithFallback() {
  let modeUsed = null;
  let z0Percent = null;

  try {
    const modeEl = document.getElementById('mode-number');
    const z0El = document.getElementById('curvature-multiplier');
    if (modeEl) {
      if (modeEl.value === 'combine') {
        modeUsed = 'combine';
      } else {
        const v = parseInt(modeEl.value, 10);
        if (!isNaN(v)) modeUsed = v;
      }
    }
    if (z0El) {
      const p = parseFloat(z0El.value);
      if (!isNaN(p)) {
        // Chuẩn hóa về [0, 100]
        z0Percent = Math.max(0, Math.min(100, p));
      }
    }
  } catch (_) {}

  // Fallback nếu UI không khả dụng/không hợp lệ
  if (modeUsed === null || modeUsed === undefined) {
    const m = window.strainEnergyResults?.modeUsed;
    if (m !== undefined && m !== null && !isNaN(parseInt(m, 10))) modeUsed = parseInt(m, 10);
  }
  if (z0Percent === null || z0Percent === undefined) {
    const z = window.strainEnergyResults?.Z0;
    if (z !== undefined && z !== null && !isNaN(parseFloat(z))) {
      // Giả sử Z0 có thể là phần trăm đã nhập sẵn; nếu không, vẫn dùng trực tiếp làm % để thể hiện theo yêu cầu fallback
      z0Percent = parseFloat(z);
    } else {
      z0Percent = 0;
    }
  }

  // Giá trị cuối cùng
  if ((modeUsed === null || modeUsed === undefined) || (modeUsed !== 'combine' && isNaN(modeUsed))) {
    modeUsed = 1;
  }
  if (z0Percent === null || z0Percent === undefined || isNaN(z0Percent)) z0Percent = 0;

  console.log(`[Debug] getModeZ0FromUIWithFallback final values: modeUsed=${modeUsed}, z0Percent=${z0Percent}`);
  return { modeUsed, z0Percent };
}

function generateChartFilename(sectionNumber) {
  try {
    // Ưu tiên lấy từ UI
    const { modeUsed, z0Percent } = getModeZ0FromUIWithFallback();
    // Không lấy chữ số thập phân cho Z0 trong tên file
    const z0Formatted = String(Math.round(parseFloat(z0Percent)));

    const filename = `Mode_${modeUsed}_Z0_${z0Formatted}_section${sectionNumber}_3d_chart.png`;
    console.log(`📄 Generating filename for Section ${sectionNumber}: Mode=${modeUsed}, Z0%=${z0Formatted} → ${filename}`);
    return filename;
  } catch (error) {
    console.error('❌ Lỗi khi tạo tên file:', error);
    return `section${sectionNumber}_3d_chart.png`;
  }
}

/**
 * Xác định container theo section và biến thể (default/normalized)
 */
function getChartContainerId(sectionNumber, variant = 'default') {
  if (sectionNumber === 1) {
    return variant === 'normalized' ? 'normalized3DChart_section1' : 'new3DChart_section1';
  }
  return null;
}

/**
 * Tải xuống biểu đồ 3D
 * @param {number} sectionNumber - Số mục (1, 2, hoặc 3)
 * @param {{variant?: 'default'|'normalized'}} options
 */
async function downloadChart3D(sectionNumber, options = {}) {
  const variant = options.variant || 'default';
  console.log(`🎯 Starting 3D chart download for Section ${sectionNumber} (variant=${variant})`);

  try {
    // Xác định container ID dựa trên section number + variant
    const chartContainerId = getChartContainerId(sectionNumber, variant);

    // Kiểm tra container tồn tại
    const chartContainer = document.getElementById(chartContainerId);
    if (!chartContainer || !chartContainer.data || !chartContainer.layout) {
      console.error(`❌ Container không hợp lệ hoặc chưa có biểu đồ Plotly: ${chartContainerId}`);
      alert('Không thể tải xuống biểu đồ. Vui lòng thử lại.');
      return;
    }

    console.log(`✅ Chart container found: ${chartContainerId}`);

    // Kiểm tra Plotly đã load
    if (!window.Plotly || typeof window.Plotly.downloadImage !== 'function') {
      console.error('❌ Plotly library không được load hoặc downloadImage không khả dụng');
      alert('Không thể tải xuống biểu đồ. Vui lòng thử lại.');
      return;
    }

    console.log('✅ Plotly library is available');

    // Tạo tên file
    const filename = generateChartFilename(sectionNumber);

    // Cấu hình export
    const exportConfig = {
      format: 'png',
      width: 600,
      height: 510,
      filename: filename
    };



    console.log('📊 Export configuration:', exportConfig);

    // Lấy Plotly div (đối tượng biểu đồ hiện tại)
    const plotDiv = chartContainer; // Plotly gán trực tiếp lên div container

    // Tạo một div ẩn để render bản sao không có colorbar
    const tmpDiv = document.createElement('div');
    tmpDiv.style.position = 'absolute';
    tmpDiv.style.left = '-10000px';
    tmpDiv.style.top = '0';
    tmpDiv.style.width = exportConfig.width + 'px';
    tmpDiv.style.height = exportConfig.height + 'px';
    document.body.appendChild(tmpDiv);

    // Clone data & layout từ biểu đồ hiện tại
    let clonedData = JSON.parse(JSON.stringify(plotDiv.data || []));
    const clonedLayout = JSON.parse(JSON.stringify(plotDiv.layout || {}));


    // Apply styling for export
    try {
      if (false) { // Section 3 removed
        // (1) Tick font 12px, #000; Title font giữ text, size=24, #000 cho mọi scene*
        const applyAxisFonts = (layout) => {
          const setAxis = (axis) => {
            if (!axis) return;
            axis.tickfont = axis.tickfont || {};
            axis.tickfont.size = 12;
            axis.tickfont.color = '#000';
            axis.tickfont.family = '"Times New Roman", serif';

            axis.title = axis.title || {};
            axis.title.font = axis.title.font || {};
            axis.title.font.size = 24;
            axis.title.font.color = '#000';
            axis.title.font.family = '"Times New Roman", serif';
          };
          Object.keys(layout || {}).forEach(k => {
            if (k === 'scene' || /^scene\d+$/.test(k)) {
              const sc = layout[k] = layout[k] || {};
              sc.xaxis = sc.xaxis || {};
              sc.yaxis = sc.yaxis || {};
              sc.zaxis = sc.zaxis || {};
              setAxis(sc.xaxis);
              setAxis(sc.yaxis);
              setAxis(sc.zaxis);
            }
          });
        };

        // (2) Nhãn phần trăm đỉnh cột: 24px, #000, nền trắng với viền
        const boostTextLabels = (data) => {
          if (!Array.isArray(data)) return;
          data.forEach(t => {
            const hasText = (t && (t.mode && String(t.mode).includes('text'))) || Array.isArray(t?.text);
            if (hasText) {
              t.textfont = {
                size: 24,
                color: '#000',
                family: '"Times New Roman", serif'
              };
            }
          });
        };

        // (2b) Chuyển trace text → scene.annotations để có nền/viền trong ảnh export
        const convertTextToAnnotations = (data, layout) => {
          try {
            if (!Array.isArray(data) || !layout) return;
            // Tìm scene key (scene, scene1, scene2, ...). Ưu tiên 'scene' nếu có
            const sceneKeys = Object.keys(layout).filter(k => k === 'scene' || /^scene\d+$/.test(k));
            if (sceneKeys.length === 0) return;

            // Ước lượng khoảng z để tính offset đẩy nhãn cao hơn đỉnh cột
            let zMin = Infinity, zMax = -Infinity;
            data.forEach(t => {
              const zs = Array.isArray(t?.z) ? t.z : [];
              for (let i = 0; i < zs.length; i++) {
                const v = Number(zs[i]);
                if (!isNaN(v)) { zMin = Math.min(zMin, v); zMax = Math.max(zMax, v); }
              }
            });
            if (!isFinite(zMin) || !isFinite(zMax)) { zMin = 0; zMax = 1; }
            let dz = Math.max(1e-6, (zMax - zMin));
            // Cho phép cấu hình offset qua SHM_CONFIG.sec3.labelZOffsetRatio (mặc định 7% phạm vi Z)
            const cfgRatio = Number(window?.SHM_CONFIG?.sec3?.labelZOffsetRatio);
            const ratio = (isFinite(cfgRatio) && cfgRatio > 0 && cfgRatio < 1) ? cfgRatio : 0.07;
            // Nếu có dtick trên zaxis, dùng max giữa ratio*dz và 0.6*dtick
            const sceneSampleKey = (Object.keys(layout).find(k => k === 'scene' || /^scene\d+$/.test(k))) || 'scene';
            const dtick = Number(layout?.[sceneSampleKey]?.zaxis?.dtick);
            const zOffset = Math.max(dz * ratio, isFinite(dtick) ? dtick * 0.6 : 0); // đẩy lên 7% hoặc 0.6*dtick, lấy lớn hơn
            // Pixel shift theo trục màn hình để đảm bảo thấy rõ
            const cfgYShift = (Number(window?.SHM_CONFIG?.sec3?.labelPixelYShift));
            const yShiftPx = (isFinite(cfgYShift) ? cfgYShift : -12);
            // Dùng annotation arrow (ẩn) để ép dịch theo pixel ổn định trong 3D
            const cfgAY = (Number(window?.SHM_CONFIG?.sec3?.labelPixelAY));
            const ayPx = (isFinite(cfgAY) ? cfgAY : -16); // âm là dịch lên
            const cfgAX = (Number(window?.SHM_CONFIG?.sec3?.labelPixelAX));
            const axPx = (isFinite(cfgAX) ? cfgAX : 0);

            // Gom tất cả annotations từ các trace có text
            const allAnnotations = [];
            const textTracesIdx = [];
            data.forEach((t, idx) => {
              const hasText = (t && (t.mode && String(t.mode).includes('text'))) || Array.isArray(t?.text);
              if (!hasText) return;
              const xs = Array.isArray(t.x) ? t.x : [];
              const ys = Array.isArray(t.y) ? t.y : [];
              const zs = Array.isArray(t.z) ? t.z : [];
              const texts = Array.isArray(t.text) ? t.text : [];
              const n = Math.min(xs.length, ys.length, zs.length, texts.length);
              if (n === 0) return;

              textTracesIdx.push(idx);

              for (let i = 0; i < n; i++) {
                const txt = (texts[i] != null) ? String(texts[i]) : '';
                const zVal = Number(zs[i]);
                const zLbl = isNaN(zVal) ? zVal : (zVal + zOffset);
                allAnnotations.push({
                  x: xs[i], y: ys[i], z: zLbl,
                  text: txt,
                  // Dùng arrow ẩn để dịch annotation theo pixel ổn định trong không gian 3D
                  showarrow: true,
                  arrowhead: 0,
                  arrowsize: 0.5,
                  arrowwidth: 0,
                  arrowcolor: 'rgba(0,0,0,0)',
                  ax: axPx,
                  ay: ayPx,
                  font: { size: 24, color: '#000', family: '"Times New Roman", serif' },
                  bgcolor: 'rgba(255,255,255,1)',
                  bordercolor: '#000',
                  borderwidth: 2,
                  borderpad: 3,
                  xanchor: 'center',
                  yanchor: 'bottom',
                  yshift: yShiftPx,
                  opacity: 1,
                  align: 'center'
                });
              }
            });

            if (allAnnotations.length === 0) return;

            // Gán annotations vào scene đầu tiên (thường chỉ có một)
            const sceneKey = sceneKeys[0];
            layout[sceneKey] = layout[sceneKey] || {};
            layout[sceneKey].annotations = allAnnotations;

            // Nới trục Z thêm một chút để không cắt nhãn ở đỉnh
            const sc = layout[sceneKey];
            sc.zaxis = sc.zaxis || {};
            if (Array.isArray(sc.zaxis.range) && sc.zaxis.range.length === 2) {
              const up = Math.max(Number(sc.zaxis.range[1]) || zMax, zMax + zOffset * 1.2);
              const lo = (Number(sc.zaxis.range[0]) || zMin);
              sc.zaxis.range = [lo, up];
              sc.zaxis.autorange = false;
            } else {
              sc.zaxis.range = [zMin, zMax + zOffset * 1.2];
              sc.zaxis.autorange = false;
            }

            // Ẩn text gốc để không vẽ đè
            textTracesIdx.forEach(i => {
              const t = data[i];
              if (!t) return;
              t.text = [];
              // Nếu có markers, cho trong suốt; nếu không, tạo marker trong suốt để giữ vị trí
              t.mode = (t.mode || '').replace('text', '').trim() || 'markers';
              t.marker = Object.assign({}, t.marker, { opacity: 0 });
            });
          } catch (e) {
            console.warn('⚠️ convertTextToAnnotations thất bại:', e?.message || e);
          }
        };

        // (3) Xóa chart title trong ảnh export
        if (clonedLayout && clonedLayout.title) {
          delete clonedLayout.title;
        }

        // (4) Giảm khoảng trắng: bỏ margin và cho scene chiếm full domain
        clonedLayout.autosize = false; // ép dùng margin/domain cấu hình thủ công
        clonedLayout.margin = { l: 0, r: 0, t: 0, b: 0, pad: 4 }; // Để lại 4px padding
        Object.keys(clonedLayout || {}).forEach(k => {
          if (k === 'scene' || /^scene\d+$/.test(k)) {
            const sc = clonedLayout[k] = clonedLayout[k] || {};
            sc.domain = { x: [0, 1], y: [0, 1] };
          }
        });

        // Thiết lập font mặc định Times New Roman ở cấp layout
        clonedLayout.font = Object.assign({}, clonedLayout.font, { family: '"Times New Roman", serif', color: '#000' });

        // Áp dụng các hàm styling
        applyAxisFonts(clonedLayout);
        // Thay vì chỉ tăng textfont, chúng ta chuyển sang annotations để có nền/viền
        convertTextToAnnotations(clonedData, clonedLayout);
      }
    } catch (e) {
      console.warn('⚠️ Không thể áp styling export:', e?.message || e);
    }


    // Loại bỏ colorbar: đặt showscale=false cho tất cả traces
    if (Array.isArray(clonedData)) {
      for (let i = 0; i < clonedData.length; i++) {
        const t = clonedData[i] = clonedData[i] || {};

        // Nếu trace dùng coloraxis chia sẻ, tắt ở trace và layout
        const ca = t.coloraxis;
        if (ca && typeof ca === 'string') {
          // Xoá liên kết coloraxis ở trace để tránh tái sinh colorbar
          delete t.coloraxis;
          if (!clonedLayout[ca]) clonedLayout[ca] = {};
          clonedLayout[ca].showscale = false;
          if (clonedLayout[ca].colorbar) delete clonedLayout[ca].colorbar;
        }

        // Tắt colorbar ở cấp trace
        t.showscale = false;
        if (t.colorbar) delete t.colorbar;

        // Tắt colorbar trong marker (nếu có)
        if (t.marker) {
          t.marker.showscale = false;
          if (t.marker.colorbar) delete t.marker.colorbar;
        }

        // Một số loại trace có thuộc tính cauto/cmin/cmax/contours.colorbar
        if (t.contours && t.contours.colorbar) delete t.contours.colorbar;

      }
    }

    // Bổ sung: Tắt và xoá tất cả coloraxis* ở cấp layout (phòng trường hợp không gắn qua trace)
    Object.keys(clonedLayout || {}).forEach(k => {
      if (k === 'coloraxis' || /^coloraxis\d+$/.test(k)) {
        // Đặt showscale=false và xoá colorbar, sau đó xoá key luôn để chắc chắn
        if (!clonedLayout[k]) clonedLayout[k] = {};
        clonedLayout[k].showscale = false;
        if (clonedLayout[k].colorbar) delete clonedLayout[k].colorbar;
      }
    });
    // Xoá hoàn toàn các key coloraxis* khỏi layout trước khi vẽ
    Object.keys({...clonedLayout}).forEach(k => {
      if (k === 'coloraxis' || /^coloraxis\d+$/.test(k)) {
        delete clonedLayout[k];
      }
    });

    // Đặt nền trắng và kích thước cho layout xuất ảnh
    clonedLayout.paper_bgcolor = '#ffffff';
    clonedLayout.plot_bgcolor = '#ffffff';
    clonedLayout.width = exportConfig.width;
    clonedLayout.height = exportConfig.height;

    // Bật camera orthographic CHỈ cho ảnh xuất (không ảnh hưởng UI)
    const applyOrthoToScene = (sceneObj) => {
      if (!sceneObj) return;
      sceneObj.camera = sceneObj.camera || {};
      sceneObj.camera.projection = { type: 'orthographic' };
    };
    // Áp dụng cho 'scene' và mọi 'sceneN' nếu có
    Object.keys(clonedLayout).forEach(k => {
      if (k === 'scene' || /^scene\d+$/.test(k)) {
        applyOrthoToScene(clonedLayout[k] = clonedLayout[k] || {});
      }
    });

    // Cập nhật tiêu đề trong ẢNH (không đổi UI): "Mode X – Z₀ = Y% (theo % Z tối đa)"
    if (sectionNumber !== 3) { try {
      const { modeUsed, z0Percent } = getModeZ0FromUIWithFallback();
      // Không lấy chữ số thập phân cho Z0 trong tiêu đề
      const z0Str = String(Math.round(parseFloat(z0Percent)));
      // Nếu là mode combine, dùng chữ "CB" cho gọn
      const modeForTitle = (modeUsed === 'combine') ? 'CB' : modeUsed;
      const titleText = `Mode ${modeForTitle} – Z₀ = ${z0Str}%${variant === 'normalized' ? ' – Chuẩn hóa' : ''}`;
      clonedLayout.title = clonedLayout.title || {};
      clonedLayout.title.text = titleText;
      // Căn giữa, di chuyển vị trí tiêu đề xuống một chút
      clonedLayout.title.x = 0.5;
      clonedLayout.title.xanchor = 'center';
      clonedLayout.title.y = 0.95; // gần sát mép trên (mặc định ~0.90)
      clonedLayout.title.yanchor = 'top';
      // Tăng kích thước chữ TIÊU ĐỀ trong ẢNH (không ảnh hưởng UI)
      clonedLayout.title.font = clonedLayout.title.font || {};
      const baseTitleSize = (typeof clonedLayout.title.font.size === 'number' && !isNaN(clonedLayout.title.font.size)) ? clonedLayout.title.font.size : 20;
      clonedLayout.title.font.size = Math.max(1, Math.round(baseTitleSize * 2));
    } catch (e) {
      console.warn('⚠️ Không thể áp tiêu đề tuỳ biến cho ảnh export:', e.message);
    }
    }


    // Render biểu đồ bản sao vào div ẩn và xuất ảnh
    // Helper: xoá mọi phần tử DOM liên quan đến colorbar trong tmpDiv
    const stripColorbarDOM = () => {
      try {
        // Xoá tất cả nhóm colorbar phổ biến mà Plotly tạo ra
        const selectors = [
          'g.colorbar',
          'g.gcolorbar',
          'g[class*="colorbar"]',
          'g[class*="gcolorbar"]',
          'g[class*="cb"]',
          '.colorbar',
          '.gcolorbar'
        ];
        selectors.forEach(sel => {
          tmpDiv.querySelectorAll(sel).forEach(el => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
          });
        });
      } catch (_) { /* ignore */ }
    };

    const makeImagePromise = (async () => {
      try {
        await window.Plotly.newPlot(tmpDiv, clonedData, clonedLayout, { staticPlot: true, displayModeBar: false });

        // Đợi một tick để DOM ổn định
        await new Promise(r => setTimeout(r, 30));

        // Đảm bảo lần cuối: tắt showscale cho tất cả traces sau khi render
        const nTraces = (tmpDiv.data && tmpDiv.data.length) ? tmpDiv.data.length : 0;
        if (nTraces > 0) {
          await window.Plotly.restyle(tmpDiv, { showscale: false }, [...Array(nTraces).keys()]);
        }
        // Tắt mọi coloraxis ở cấp layout (nếu có)
        const layoutUpdate = { paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff' };
        const layoutKeysToDelete = [];
        Object.keys(tmpDiv.layout || {}).forEach(k => {
          if (k === 'coloraxis' || /^coloraxis\d+$/.test(k)) {
            layoutUpdate[k] = { showscale: false };
            layoutKeysToDelete.push(k);
          }
        });
        await window.Plotly.relayout(tmpDiv, layoutUpdate);

        // Xoá triệt để phần tử DOM colorbar (nếu còn)
        stripColorbarDOM();

        // Xoá hẳn các coloraxis* khỏi layout để phòng trường hợp còn render colorbar
        layoutKeysToDelete.forEach(k => { try { delete tmpDiv.layout[k]; } catch(_){} });

        // Thêm lần gọi relayout để áp layout đã xoá coloraxis
        await window.Plotly.relayout(tmpDiv, {});

        const dataUrl = await window.Plotly.toImage(tmpDiv, { format: exportConfig.format, width: exportConfig.width, height: exportConfig.height });
        // Tải xuống bằng link tạm
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        try { window.Plotly.purge(tmpDiv); } catch (_) {}
        if (tmpDiv && tmpDiv.parentNode) tmpDiv.parentNode.removeChild(tmpDiv);
      }
    })();

    // Timeout 10 giây
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'));
      }, 10000);
    });

    // Race giữa export và timeout
    await Promise.race([makeImagePromise, timeoutPromise]);

    console.log(`✅ Chart downloaded successfully: ${filename}`);
    // Hiển thị thông báo thành công (tùy chọn)
    showDownloadSuccessMessage(filename);

  } catch (error) {
    console.error('❌ Error downloading chart:', error);

    // Xác định loại lỗi
    if (error.message === 'Timeout') {
      console.error('⏱️ Download timeout exceeded');
      alert('Quá thời gian chờ. Vui lòng thử lại.');
    } else {
      console.error('Network or permission error:', error.message);
      alert('Không thể tải xuống biểu đồ. Vui lòng thử lại.');
    }
  }
}

/**
 * Hiển thị thông báo thành công
 * @param {string} filename - Tên file đã tải xuống
 */
function showDownloadSuccessMessage(filename) {
  // Tạo toast notification
  const toastHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="margin-top: 10px;">
      <strong>✅ Thành công!</strong> Biểu đồ 3D đã được tải xuống: <code>${filename}</code>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Tìm container thích hợp để hiển thị thông báo
  const mainContainer = document.querySelector('.container');
  if (mainContainer) {
    const alertDiv = document.createElement('div');
    alertDiv.innerHTML = toastHTML;
    mainContainer.insertBefore(alertDiv.firstElementChild, mainContainer.firstChild);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      const alert = mainContainer.querySelector('.alert-success');
      if (alert) {
        alert.remove();
      }
    }, 5000);
  }
}

/**
 * Hiển thị nút download sau khi biểu đồ được render
 * @param {number} sectionNumber - Số mục (1, 2, hoặc 3)
 * @param {'default'|'normalized'} variant
 */
function showDownloadButton(sectionNumber, variant = 'default') {
  try {
    let buttonId = `download-3d-chart-btn-section${sectionNumber}`;
    if (sectionNumber === 1 && variant === 'normalized') {
      buttonId = 'download-3d-chart-btn-section1-normalized';
    }
    const button = document.getElementById(buttonId);

    if (button) {
      button.style.display = 'block';
      console.log(`✅ Download button shown for Section ${sectionNumber} (variant=${variant})`);
    } else {
      console.warn(`⚠️ Download button not found: ${buttonId}`);
    }

    // Nếu là Section 1: hiển thị luôn nút tải cả hai biểu đồ
    if (sectionNumber === 1) {
      const bothBtn = document.getElementById('download-3d-chart-btn-section1-both');
      if (bothBtn) bothBtn.style.display = 'block';
    }
  } catch (error) {
    console.error(`❌ Error showing download button:`, error);
  }
}

/**
 * Ẩn nút download
 * @param {number} sectionNumber - Số mục (1, 2, hoặc 3)
 * @param {'default'|'normalized'} variant
 */
function hideDownloadButton(sectionNumber, variant = 'default') {
  try {
    let buttonId = `download-3d-chart-btn-section${sectionNumber}`;
    if (sectionNumber === 1 && variant === 'normalized') {
      buttonId = 'download-3d-chart-btn-section1-normalized';
    }
    const button = document.getElementById(buttonId);

    if (button) {
      button.style.display = 'none';
      console.log(`✅ Download button hidden for Section ${sectionNumber} (variant=${variant})`);
    }
  } catch (error) {
    console.error(`❌ Error hiding download button:`, error);
  }
}

/**
 * Kiểm tra xem nút download có được hiển thị không
 * @param {number} sectionNumber - Số mục (1, 2, hoặc 3)
 * @param {'default'|'normalized'} variant
 * @returns {boolean} - True nếu nút đang hiển thị
 */
function isDownloadButtonVisible(sectionNumber, variant = 'default') {
  try {
    let buttonId = `download-3d-chart-btn-section${sectionNumber}`;
    if (sectionNumber === 1 && variant === 'normalized') {
      buttonId = 'download-3d-chart-btn-section1-normalized';
    }
    const button = document.getElementById(buttonId);

    if (button) {
      return button.style.display !== 'none';
    }
    return false;
  } catch (error) {
    console.error(`❌ Error checking button visibility:`, error);
    return false;
  }
}

// Tải cả hai biểu đồ 3D của Section 1 (gốc + chuẩn hóa)
async function downloadBothChartsSection1() {
  try {
    // Thử tải biểu đồ gốc trước
    await downloadChart3D(1, { variant: 'default' });
  } catch (e) {
    console.warn('⚠️ Không thể tải biểu đồ gốc Section 1:', e?.message || e);
  }

  // Nhỏ giọt 200ms để tránh xung đột canvas khi export liên tiếp
  await new Promise(r => setTimeout(r, 200));

  try {
    // Tiếp theo tải biểu đồ chuẩn hóa
    await downloadChart3D(1, { variant: 'normalized' });
  } catch (e) {
    console.warn('⚠️ Không thể tải biểu đồ chuẩn hóa Section 1:', e?.message || e);
  }
}

// Export functions to global scope
if (typeof window !== 'undefined') {
  window.downloadChart3D = downloadChart3D;
  window.downloadBothChartsSection1 = downloadBothChartsSection1;
  window.generateChartFilename = generateChartFilename;
  window.showDownloadButton = showDownloadButton;
  window.hideDownloadButton = hideDownloadButton;
  window.isDownloadButtonVisible = isDownloadButtonVisible;

  console.log('✅ 3D Chart Download module loaded');
}

