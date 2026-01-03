// Utility toàn cục: điều chỉnh độ sáng màu RGB, dùng bởi highlight/shading thủ công
if (typeof window !== 'undefined' && !window.adjustColorBrightness) {
  window.adjustColorBrightness = function(rgbStr, factor) {
    try {
      const m = String(rgbStr).match(/rgb\((\d+),(\d+),(\d+)\)/);
      if (!m) return rgbStr;
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
      const r = clamp(parseInt(m[1], 10) * factor);
      const g = clamp(parseInt(m[2], 10) * factor);
      const b = clamp(parseInt(m[3], 10) * factor);
      return `rgb(${r},${g},${b})`;
    } catch (e) {
      return rgbStr;
    }
  };
}

/**
 * Draws a 3D bar chart with a specific style inspired by a Matplotlib example.
 * @param {string} containerId - The ID of the div element to render the chart in.
 * @param {Object} data - The data for the chart, containing z values and elements.
 * @param {string} title - The title of the chart.
 */
function drawStyled3DBarChart(containerId, chartData, title, options = {}) {
  // Thêm tuỳ chọn kéo dãn trục Z mà không đổi phạm vi (range)
  const { showPercentages = true, highlightElements = null, zAxisRange = [0, 25], zAspect = 1.0 } = options; // zAspect: hệ số chiều cao trục Z trong layout.aspectratio

  const isSec1 = (containerId === 'new3DChart_section1' || containerId === 'normalized3DChart_section1');

  const { z, elements, Z0 } = chartData;

  if (!z || !elements) {
    console.error('Invalid data provided to drawStyled3DBarChart');
    return;
  }

  // 1. Prepare data and coordinates
  const elementSize = calculateRealElementSize(elements);

  // Determine grid dimensions (nx, ny)
  const xCoordsSet = new Set(elements.map(e => e.center.x));
  const yCoordsSet = new Set(elements.map(e => e.center.y));
  const nx = xCoordsSet.size;
  const ny = yCoordsSet.size;

  // Recalculate layout based on perfect grid positioning
  const gridWidth = (nx - 1) * elementSize.width;
  const gridDepth = (ny - 1) * elementSize.depth;
  const extendedRangeX = [-elementSize.width / 2, gridWidth + elementSize.width / 2];
  const extendedRangeY = [-elementSize.depth / 2, gridDepth + elementSize.depth / 2];

  const x_coords = [], y_coords = [], z_values = [];
  elements.forEach((element, index) => {
    // Re-calculate position based on grid index to ensure no gaps
    const colIndex = index % nx;
    const rowIndex = Math.floor(index / nx);
    const newX = colIndex * elementSize.width;
    const newY = rowIndex * elementSize.depth;

    x_coords.push(newX);
    y_coords.push(newY);
    z_values.push(z[element.id] || 0);
  });

  // 2. Create 3D bars (mesh3d trace)
  const allVerticesX = [], allVerticesY = [], allVerticesZ = [];
  const allFacesI = [], allFacesJ = [], allFacesK = [];
  const allFaceColors = []; // Use facecolor for individual bar coloring
  const lineX = [], lineY = [], lineZ = []; // For outlines

  // Custom Green-to-Red colorscale and helper
  const greenToRedScale = [
      { val: 0, rgb: [0, 128, 0] },    // Green
      { val: 0.5, rgb: [255, 255, 0] }, // Yellow
      { val: 1, rgb: [255, 0, 0] }      // Red
  ];

  function getColor(value, max) {
      const p = Math.min(Math.max(value / max, 0), 1);
      for (let i = 0; i < greenToRedScale.length - 1; i++) {
          if (p >= greenToRedScale[i].val && p <= greenToRedScale[i+1].val) {
              const t = (p - greenToRedScale[i].val) / (greenToRedScale[i+1].val - greenToRedScale[i].val);
              const r = Math.round(greenToRedScale[i].rgb[0] * (1 - t) + greenToRedScale[i+1].rgb[0] * t);
              const g = Math.round(greenToRedScale[i].rgb[1] * (1 - t) + greenToRedScale[i+1].rgb[1] * t);
              const b = Math.round(greenToRedScale[i].rgb[2] * (1 - t) + greenToRedScale[i+1].rgb[2] * t);
              return `rgb(${r},${g},${b})`;
          }
      }
      return `rgb(${greenToRedScale[0].rgb.join(',')})`;
  }

  const zValuesArr = Object.values(z).map(v => Number(v) || 0);
  const zMax = Math.max(...zValuesArr, 0);
  const zMin = Math.min(...zValuesArr, 0);
  const dz = Math.max(1e-6, zMax - zMin);

  elements.forEach((element, index) => {
    const height = z[element.id] || 0;
    const x = x_coords[index];
    const y = y_coords[index];
    const box = createBox3D(x, y, height, elementSize.width, elementSize.depth);

    const vertexOffset = allVerticesX.length;
    allVerticesX.push(...box.vertices.x);
    allVerticesY.push(...box.vertices.y);
    allVerticesZ.push(...box.vertices.z);

    allFacesI.push(...box.faces.i.map(i => i + vertexOffset));
    allFacesJ.push(...box.faces.j.map(j => j + vertexOffset));
    allFacesK.push(...box.faces.k.map(k => k + vertexOffset));

    const color = getColor(height, zMax);
    for (let i = 0; i < 12; i++) { // A box has 12 faces (6 sides * 2 triangles)
        allFaceColors.push(color);
    }

    // Add outline data for the box
    const { x: vx, y: vy, z: vz } = box.vertices;
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // bottom
        [4, 5], [5, 6], [6, 7], [7, 4], // top
        [0, 4], [1, 5], [2, 6], [3, 7]  // vertical
    ];

    edges.forEach(([start, end]) => {
        lineX.push(vx[start], vx[end], null);
        lineY.push(vy[start], vy[end], null);
        lineZ.push(vz[start], vz[end], null);
    });
  });












































































  const traceBars = {
    type: 'mesh3d',
    x: allVerticesX,
    y: allVerticesY,
    z: allVerticesZ,
    i: allFacesI,
    j: allFacesJ,
    k: allFacesK,
    facecolor: allFaceColors, // Use facecolor instead of intensity
    colorbar: {
      title: 'Chỉ số hư hỏng',
      len: 0.7,
      thickness: 20,






      tickvals: [0, zMax / 2, zMax],
      ticktext: ['Low', 'Mid', 'High']
    },
    name: 'Chỉ số hư hỏng',
    showscale: false, // Hide the default scale, we'll use a custom one if needed
    flatshading: true,
    lighting: {
      ambient: 1,
      diffuse: 0,
      specular: 0,
      roughness: 0,
      fresnel: 0
    }
  };

  const traces = [traceBars];

  const traceOutlines = {
    type: 'scatter3d',
    mode: 'lines',
    x: lineX,
    y: lineY,
    z: lineZ,
    line: {
        color: 'black',
        width: 2
    },
    showlegend: false
  };
  traces.push(traceOutlines);

  // Ẩn colorbar trong Mục 3 để khớp export; các mục khác giữ nguyên (nếu cần)
  {
    const colorbarTrace = {
        x: [null], y: [null], z: [null],
        type: 'scatter3d',
        mode: 'markers',
        marker: {
            opacity: 0,
            color: [0, zMax],
            colorscale: [
                [0, 'rgb(0,128,0)'],
                [0.5, 'rgb(255,255,0)'],
                [1, 'rgb(255,0,0)']
            ],
            colorbar: {
                title: 'Chỉ số hư hỏng',
                len: 0.7,
                thickness: 20
            }
        },
        showlegend: false
    };
  // Giữ nhãn dạng trace text cho mục khác (1,2) để không ảnh hưởng phạm vi ngoài Mục 3
  if (!isSec3 && showPercentages) {
    const textX = [], textY = [], textZ = [], textLabels = [];
    const threshold = (chartData.Z0 !== undefined) ? chartData.Z0 : 0;
    elements.forEach((element, i) => {
      const val = Number(z[element.id]) || 0;
      const shouldHighlight = !highlightElements || highlightElements.includes(element.id);
      if (val >= threshold && shouldHighlight) {
        textX.push(x_coords[i]);
        textY.push(y_coords[i]);
        textZ.push(val + 0.5);
        textLabels.push(`${val.toFixed(2)}%`);
      }
    });
    const traceLabels = {
      type: 'scatter3d',
      x: textX,
      y: textY,
      z: textZ,
      mode: 'text',
      text: textLabels,
      textfont: { family: 'Times New Roman', size: 10, color: 'black' },
      showlegend: false
    };
    traces.push(traceLabels);
  }

    traces.push(colorbarTrace);
  }



  // 3. Tạo nhãn phần trăm
  // Hàm dựng annotations theo threshold
  function buildSec3Annotations(thresholdAbs) {
    const annotations = [];
    const ratio = 0.07;
    const approxDtick = dz / 5;
    const dtick = (layout && layout.scene && layout.scene.zaxis && Number(layout.scene.zaxis.dtick)) || approxDtick;
    const zOffset = Math.max(dz * ratio, (isFinite(dtick) ? dtick * 0.6 : 0));
    const yShiftPx = -12;

    elements.forEach((element, i) => {
      const val = Number(z[element.id]) || 0;
      const shouldHighlight = !highlightElements || highlightElements.includes(element.id);
      if (val >= thresholdAbs && shouldHighlight) {
        annotations.push({
          x: x_coords[i],
          y: y_coords[i],
          z: val + zOffset,
          text: `${val.toFixed(2)}%`,
          showarrow: true,
          arrowhead: 0,
          arrowsize: 0.5,
          arrowwidth: 0,
          arrowcolor: 'rgba(0,0,0,0)',
          ax: 0,
          ay: -16,
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
    return annotations;
  }

  // 4. Định nghĩa layout và camera
  const layout = {
    title: { text: title, font: { family: 'Times New Roman', size: 20, weight: 'bold' } },
    scene: {
      xaxis: { title: 'EX', autorange: 'reversed' },
      yaxis: { title: 'EY' },
      zaxis: { title: 'Chỉ số hư hỏng', range: zAxisRange },
      aspectratio: { x: 1, y: 1, z: zAspect },
      camera: { up: { x: 0, y: 0, z: 1 }, center: { x: 0, y: 0, z: 0 }, eye: { x: -1.5, y: -2, z: 1.5 } }
    },
    margin: { l: 0, r: 0, b: 0, t: 40 }
  };
    const setAxis = (ax, titleText) => {
      ax = ax || {};
      ax.tickfont = { size: 12, color: '#000', family: '"Times New Roman", serif' };
      ax.title = typeof ax.title === 'string' ? { text: ax.title } : (ax.title || {});
      ax.title.text = ax.title.text || titleText;
      ax.title.font = { size: 24, color: '#000', family: '"Times New Roman", serif' };
      return ax;
    };
    layout.scene.xaxis = setAxis(layout.scene.xaxis, 'EX');
    layout.scene.yaxis = setAxis(layout.scene.yaxis, 'EY');
    layout.scene.zaxis = Object.assign(setAxis(layout.scene.zaxis, 'Chỉ số hư hỏng'), { range: zAxisRange });
  }

  // 5. Render the chart

  // --- Synchronized Threshold Plane and Highlighting Logic ---
  // Đồng bộ font/kích cỡ chữ cho Mục 1 (không đổi camera/margin/colorbar)
  if (isSec1) {
    try {
      layout.font = Object.assign({}, layout.font, { family: '"Times New Roman", serif', color: '#000' });
      const applyAxisFonts = (ax, titleText) => {
        if (!ax) ax = {};
        ax.tickfont = { size: 12, color: '#000', family: '"Times New Roman", serif' };
        ax.title = typeof ax.title === 'string' ? { text: ax.title } : (ax.title || {});
        ax.title.text = ax.title.text || titleText;
        ax.title.font = { size: 24, color: '#000', family: '"Times New Roman", serif' };
        return ax;
      };
      layout.scene.xaxis = applyAxisFonts(layout.scene.xaxis, 'EX');
      layout.scene.yaxis = applyAxisFonts(layout.scene.yaxis, 'EY');
      layout.scene.zaxis = applyAxisFonts(layout.scene.zaxis, 'Chỉ số hư hỏng');
    } catch (_) {}
  }

  const thresholdSlider = document.getElementById('threshold-slider');
  const thresholdValueSpan = document.getElementById('threshold-value');
  const z0Input = document.getElementById('curvature-multiplier');



  // Set slider's max value based on actual data
  thresholdSlider.max = zMax;

  function updateThreshold(absoluteValue) {
    // Update threshold
    {
      try {
        // Xoá mọi trace surface nếu còn tồn tại
        let planeIndex = traces.findIndex(t => t && t.type === 'surface');
        while (planeIndex > -1) {
          traces.splice(planeIndex, 1);
          planeIndex = traces.findIndex(t => t && t.type === 'surface');
        }
        // Dựng annotations khớp ảnh export
        layout.scene = layout.scene || {};
        layout.scene.annotations = buildSec3Annotations(absoluteValue);
      } catch(_) {}
    } else {
      updateThresholdPlane(absoluteValue);
    }
    updateHighlighting(absoluteValue);
    Plotly.react(containerId, traces, layout);
  }

  function updateThresholdPlane(value) {
    const zValue = parseFloat(value);
    const xRange = layout.scene.xaxis.range || extendedRangeX;
    const yRange = layout.scene.yaxis.range || extendedRangeY;
    const thresholdPlane = {
        z: [[zValue, zValue], [zValue, zValue]], x: xRange, y: yRange,
        showscale: false, type: 'surface', opacity: 0.5, colorscale: [['0', 'rgb(200, 200, 200)'], ['1', 'rgb(200, 200, 200)']]
    };
    const planeIndex = traces.findIndex(trace => trace.type === 'surface');
    if (planeIndex > -1) { traces[planeIndex] = thresholdPlane; } else { traces.push(thresholdPlane); }
  }

  function updateHighlighting(value) {
    const threshold = parseFloat(value);
    const barTrace = traces.find(trace => trace.type === 'mesh3d');
    if (!barTrace) return;

    // Lưu facecolor gốc nếu chưa có (đã là màu theo mức độ hư hỏng từng mặt)
    if (!barTrace.originalFacecolor) {
        barTrace.originalFacecolor = [...barTrace.facecolor];
    }

    // Logic mới:
    // - Các phần tử >= ngưỡng: giữ nguyên màu gốc (đã theo mức độ hư hỏng)
    // - Các phần tử < ngưỡng: làm mờ (giảm sáng) để bớt nổi bật
    const newFaceColors = [...barTrace.originalFacecolor];
    elements.forEach((element, index) => {
        const height = z[element.id] || 0;
        const baseIdx = index * 12;
        for (let f = 0; f < 12; f++) {
          const orig = barTrace.originalFacecolor[baseIdx + f] || 'rgb(128,128,128)';
          newFaceColors[baseIdx + f] = (height >= threshold)
            ? orig
            : ((window && window.adjustColorBrightness) ? window.adjustColorBrightness(orig, 0.9) : orig); // làm mờ 10% cho phần tử dưới ngưỡng
        }
    });
    barTrace.facecolor = newFaceColors;
  }

  // Event listeners
  z0Input.addEventListener('input', function() {
      const percentage = parseFloat(this.value);
      if (isNaN(percentage)) return;
      const absoluteValue = (percentage / 100) * zMax;
      thresholdSlider.value = absoluteValue;
      thresholdValueSpan.textContent = absoluteValue.toFixed(3);
      updateThreshold(absoluteValue);
  });

  thresholdSlider.addEventListener('input', function() {
      const absoluteValue = parseFloat(this.value);
      if (isNaN(absoluteValue)) return;
      const percentage = (absoluteValue / zMax) * 100;
      z0Input.value = percentage.toFixed(1);
      thresholdValueSpan.textContent = absoluteValue.toFixed(3);
      updateThreshold(absoluteValue);
  });

  // Initial setup
  function initializeThreshold() {
      const initialPercentage = parseFloat(z0Input.value);
      const initialAbsoluteValue = (initialPercentage / 100) * zMax;
      thresholdSlider.value = initialAbsoluteValue;
      thresholdValueSpan.textContent = initialAbsoluteValue.toFixed(3);
      updateThreshold(initialAbsoluteValue);
  }

  initializeThreshold();

  Plotly.newPlot(containerId, traces, layout);

  // Hiển thị nút download sau khi biểu đồ được render
  // Xác định section number từ container ID
  const sectionMatch = containerId.match(/section(\d)/);
  if (sectionMatch) {
    const sectionNumber = parseInt(sectionMatch[1]);
    const isNormalized = (sectionNumber === 1) && containerId === 'normalized3DChart_section1';
    console.log(`📊 Chart rendered for Section ${sectionNumber}${isNormalized ? ' (normalized)' : ''}, showing download button`);

    // Gọi hàm từ download_3d_chart.js nếu có
    if (typeof showDownloadButton === 'function') {
      if (isNormalized) {
        showDownloadButton(1, 'normalized');
      } else {
        showDownloadButton(sectionNumber, 'default');
      }
    } else {
      console.warn('⚠️ showDownloadButton function not available yet');
    }
  }
}

