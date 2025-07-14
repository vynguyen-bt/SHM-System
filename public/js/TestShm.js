let myChart; // Biến toàn cục cho biểu đồ

// Hàm lấy danh sách phần tử hư hỏng từ kết quả mục 1
function getDamagedElementsList() {
  // Thử lấy dữ liệu từ kết quả strain energy (mục 1)
  if (window.strainEnergyResults && window.strainEnergyResults.z && window.strainEnergyResults.Z0) {
    const z = window.strainEnergyResults.z;
    const Z0 = window.strainEnergyResults.Z0;

    // Tìm các phần tử có damage index >= Z0
    const damagedElements = [];
    for (const [id, val] of Object.entries(z)) {
      if (val >= Z0) {
        damagedElements.push(parseInt(id));
      }
    }

    if (damagedElements.length > 0) {
      // Sử dụng thứ tự từ window.strainEnergyResults.damagedElements nếu có
      if (window.strainEnergyResults.damagedElements && window.strainEnergyResults.damagedElements.length > 0) {
        const orderedElements = window.strainEnergyResults.damagedElements;
        console.log(`Using exact order from section 1: [${orderedElements.join(', ')}]`);
        console.log(`Damage values: [${orderedElements.map(id => (z[id] || 0).toFixed(2)).join(', ')}]`);

        // Cập nhật hiển thị UI
        updateDamagedElementsDisplay(orderedElements, z);

        return orderedElements;
      } else {
        // Fallback: sắp xếp theo damage index giảm dần
        damagedElements.sort((a, b) => (z[b] || 0) - (z[a] || 0));

        console.log(`Using damaged elements from section 1 (sorted): [${damagedElements.join(', ')}]`);
        console.log(`Damage values: [${damagedElements.map(id => (z[id] || 0).toFixed(2)).join(', ')}]`);

        // Cập nhật hiển thị UI
        updateDamagedElementsDisplay(damagedElements, z);

        return damagedElements;
      }
    }
  }

  // Thử lấy từ global results khác nếu có
  if (window.globalResults && window.globalResults.damagedElements) {
    const elements = window.globalResults.damagedElements;
    console.log(`Using damaged elements from global results: [${elements.join(', ')}]`);
    updateDamagedElementsDisplay(elements);
    return elements;
  }

  // Fallback: sử dụng mặc định
  console.log('No data from section 1, using default: [284, 285, 286]');
  updateDamagedElementsDisplay([284, 285, 286], null, true);
  return [284, 285, 286];
}

// Hàm cập nhật hiển thị danh sách phần tử hư hỏng
function updateDamagedElementsDisplay(elements, damageValues = null, isDefault = false) {
  const displayElement = document.getElementById('damagedElementsText');
  if (!displayElement) return;

  if (isDefault) {
    displayElement.innerHTML = `
      <span style="color: #6c757d; font-style: italic;">
        Mặc định: ${elements.join(', ')} (chưa có dữ liệu từ mục 1)
      </span>
    `;
  } else {
    let displayText = `<strong>${elements.join(', ')}</strong>`;

    if (damageValues) {
      const damageInfo = elements.map(id =>
        `${id} (${(damageValues[id] || 0).toFixed(2)})`
      ).join(', ');
      displayText += `<br><small style="color: #6c757d;">Damage indices: ${damageInfo}</small>`;
    }

    displayElement.innerHTML = displayText;
  }
}

function trainModel() {
  const trainFile = document.getElementById('trainFile').files[0];
  const testFile = document.getElementById('testFile').files[0];

  // Kiểm tra xem có files được chọn không
  if (!trainFile || !testFile) {
    console.log('No files selected, trying to load default files...');
    loadDefaultFiles();
    return;
  }

  const formData = new FormData();
  formData.append('train_file', trainFile);
  formData.append('test_file', testFile);

  updateProgressBar(30);

  axios.post('http://localhost:5001/upload-files', formData)
    .then(response => {
      alert(response.data.message);
      updateProgressBar(100);
      setTimeout(resetProgressBar, 1000);
    })
    .catch(error => {
      console.error('Training error:', error);
      alert('Lỗi trong quá trình huấn luyện.');
      resetProgressBar();
    });
}

// Hàm load files mặc định
function loadDefaultFiles() {
  updateProgressBar(30);

  // Tạo FormData với files mặc định
  const formData = new FormData();

  // Fetch files từ server và upload
  Promise.all([
    fetch('/uploads/TRAIN.csv').then(r => r.blob()),
    fetch('/uploads/TEST.csv').then(r => r.blob())
  ])
  .then(([trainBlob, testBlob]) => {
    formData.append('train_file', trainBlob, 'TRAIN.csv');
    formData.append('test_file', testBlob, 'TEST.csv');

    return axios.post('http://localhost:5001/upload-files', formData);
  })
  .then(response => {
    console.log('Default files loaded successfully:', response.data);
    updateProgressBar(100);
    setTimeout(resetProgressBar, 1000);
  })
  .catch(error => {
    console.error('Error loading default files:', error);
    alert('Không thể tải files mặc định. Vui lòng chọn files thủ công.');
    resetProgressBar();
  });
}

function predict() {
  updateProgressBar(30);

  axios.post('http://localhost:5001/predict')
    .then(response => {
      const predictions = response.data.predictions;
      displayResults(predictions);
      updateChart(predictions[0]); 
      updateProgressBar(100);
      setTimeout(resetProgressBar, 1000);
    })
    .catch(error => {
      console.error('Prediction error:', error);
      alert('Lỗi trong quá trình dự đoán.');
      resetProgressBar();
    });
}

function displayResults(predictions) {
  const resultsBody = document.getElementById('resultsBody');
  const resultsTable = document.getElementById('resultsTable');
  const tableHead = resultsTable.querySelector('thead tr');

  // Lấy danh sách phần tử hư hỏng
  const damagedElements = getDamagedElementsList();
  const numElements = damagedElements.length;

  console.log(`Displaying results for ${numElements} elements: [${damagedElements.join(', ')}]`);

  // Cập nhật header của bảng động
  tableHead.innerHTML = '';
  damagedElements.forEach(elementId => {
    const th = document.createElement('th');
    th.textContent = `Phần tử ${elementId}`;
    tableHead.appendChild(th);
  });

  // Xóa dữ liệu cũ
  resultsBody.innerHTML = '';
  let lowValueElements = [];

  predictions.forEach((row, rowIndex) => {
    const rowElement = document.createElement('tr');

    // Hiển thị tất cả damage indices tương ứng với danh sách phần tử
    for (let i = 0; i < Math.min(numElements, row.length); i++) {
      const value = row[i] || 0;
      const cell = document.createElement('td');
      cell.textContent = value.toFixed(4);

      if (Math.abs(value) < 5) {
        lowValueElements.push(`Phần tử ${damagedElements[i]}`);
      }

      rowElement.appendChild(cell);
    }
    resultsBody.appendChild(rowElement);
  });

  document.getElementById('resultsTable').style.display = 'table';

  updateLowValuesList(lowValueElements);

  // Vẽ biểu đồ 3D cho dữ liệu dự đoán
  if (typeof Plotly !== 'undefined' && predictions.length > 0) {
    drawPrediction3DChart(predictions[0]);
  }
}

function updateLowValuesList(elements) {
  const lowValuesContainer = document.getElementById('lowValuesList');
  const lowValuesList = document.getElementById('lowValues');

  if (elements.length > 0) {
    lowValuesList.innerHTML = '';
    elements.forEach(element => {
      const listItem = document.createElement('li');
      listItem.textContent = element;
      lowValuesList.appendChild(listItem);
    });

    lowValuesContainer.style.display = 'block';
  } else {
    lowValuesContainer.style.display = 'none';
  }
}

function updateChart(data) {
  const ctx = document.getElementById('predictionChart').getContext('2d');

  if (myChart) {
    myChart.destroy();
  }

  // Lấy danh sách phần tử hư hỏng và tạo labels động
  const damagedElements = getDamagedElementsList();
  const numElements = damagedElements.length;

  const chartData = data.slice(0, numElements);
  const chartLabels = damagedElements.map(id => `Phần tử ${id}`);

  console.log(`Updating chart with ${numElements} elements: [${damagedElements.join(', ')}]`);

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Mức độ hư hỏng dự đoán (%)',
        data: chartData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Mức độ hư hỏng(%)',
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          },
          ticks: {
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          }
        }
      },
      plugins: {
        legend: {
          display: false // 
        }
      }
    },
    plugins: [
      {
        id: 'borderBox',
        beforeDraw: (chart) => {
          const { ctx, chartArea: { top, bottom, left, right } } = chart;
          ctx.save();
          ctx.strokeStyle = 'black';     // Viền đen
          ctx.lineWidth = 2;
          ctx.strokeRect(left, top, right - left, bottom - top);
          ctx.restore();
        }
      }
    ]
  });
}


function updateProgressBar(percentage) {
  const progressBar = document.getElementById('progress');
  document.getElementById('progressBar').style.display = 'block';
  progressBar.style.width = percentage + '%';
}

function resetProgressBar() {
  document.getElementById('progressBar').style.display = 'none';
  document.getElementById('progress').style.width = '0%';
}

// Hàm được gọi khi chuyển sang mục 2 để cập nhật hiển thị
function initializeSection2() {
  console.log('Initializing section 2 - loading damaged elements from section 1');

  // Kiểm tra dữ liệu có sẵn từ mục 1
  if (window.strainEnergyResults) {
    console.log('Found strain energy results from section 1:', window.strainEnergyResults);
  } else {
    console.log('No strain energy results found from section 1');
  }

  getDamagedElementsList(); // Cập nhật hiển thị danh sách phần tử hư hỏng
}

// Hàm test để tạo dữ liệu giả lập từ mục 1 (để test)
function createMockSection1Data() {
  window.strainEnergyResults = {
    z: {
      284: 2.5,
      285: 3.8,
      286: 1.9,
      287: 0.8,
      288: 0.3
    },
    Z0: 2.0,
    elements: [
      {id: 284}, {id: 285}, {id: 286}, {id: 287}, {id: 288}
    ],
    damagedElements: [284, 285, 286]
  };

  console.log('Created mock section 1 data for testing');
  getDamagedElementsList();
}

// Hàm tạo dữ liệu mặc định khi Section 1 chưa được thực hiện
function createDefaultSection1Data() {
  // Tạo dữ liệu elements mặc định với cấu trúc đầy đủ
  const defaultElements = [];
  for (let i = 1; i <= 600; i++) {
    // Tạo lưới 30x20 elements
    const row = Math.floor((i - 1) / 30);
    const col = (i - 1) % 30;
    defaultElements.push({
      id: i,
      center: {
        x: 0.005 + col * 0.01,  // Khoảng cách 0.01 giữa các elements
        y: 0.005 + row * 0.01
      }
    });
  }

  // Tạo dữ liệu z với tất cả elements = 0, chỉ có 3 elements mặc định có giá trị
  const defaultZ = {};
  defaultElements.forEach(el => {
    defaultZ[el.id] = 0;
  });

  // Gán giá trị cho 3 elements mặc định
  defaultZ[284] = 8.5;  // Giá trị cao hơn ngưỡng
  defaultZ[285] = 12.3; // Giá trị cao nhất
  defaultZ[286] = 9.1;  // Giá trị cao hơn ngưỡng

  const defaultZ0 = 7.5; // Ngưỡng
  const defaultMaxZ = 12.3;

  window.strainEnergyResults = {
    z: defaultZ,
    beta: defaultZ, // Sử dụng cùng giá trị
    elements: defaultElements,
    Z0: defaultZ0,
    Z0_percent: 60, // 60% của maxZ
    maxZ: defaultMaxZ,
    damagedElements: [284, 285, 286],
    chartSettings: {
      spacing: 0.01,
      barWidth: 0.008,
      barDepth: 0.008
    }
  };

  console.log('✅ Created default section 1 data with 600 elements');
  console.log('📊 Damaged elements: [284, 285, 286]');
  console.log('🎯 Z₀ threshold:', defaultZ0);
  console.log('📈 Max damage index:', defaultMaxZ);
}

// Hàm vẽ biểu đồ 3D cho dữ liệu dự đoán - Perfect visual consistency với mục 1
function drawPrediction3DChart(predictions) {
  console.log('Drawing 3D prediction chart with perfect visual consistency to section 1');
  console.log('AI Predictions:', predictions);

  // Kiểm tra dữ liệu từ mục 1
  if (!window.strainEnergyResults) {
    console.error('No section 1 data found. Cannot create consistent visualization.');
    console.log('Available global variables:', Object.keys(window).filter(key => key.includes('strain') || key.includes('energy') || key.includes('result')));

    // Tạo thông báo chi tiết hơn
    const message = `
⚠️ Không tìm thấy dữ liệu từ Mục 1!

Để sử dụng Mục 2, bạn cần:
1. Thực hiện Mục 1 (Phát hiện vị trí hư hỏng) trước
2. Upload files và nhấn "Tính toán năng lượng biến dạng"
3. Đợi biểu đồ 3D hiển thị thành công
4. Sau đó mới chuyển sang Mục 2

Hiện tại hệ thống sẽ sử dụng dữ liệu mặc định: [284, 285, 286]
    `;

    alert(message);

    // Sử dụng dữ liệu mặc định để tiếp tục
    console.log('Using default data for visualization...');
    createDefaultSection1Data();
  }

  // Sử dụng chính xác cấu trúc từ mục 1
  const elements = window.strainEnergyResults.elements;
  const originalZ0 = window.strainEnergyResults.Z0;
  const targetElements = window.strainEnergyResults.damagedElements; // Thứ tự chính xác từ mục 1

  console.log(`Using exact structure from section 1:`);
  console.log(`- ${elements.length} elements`);
  console.log(`- Damaged elements: [${targetElements.join(', ')}]`);
  console.log(`- Original Z₀: ${originalZ0.toFixed(2)}`);

  // Tạo dữ liệu z - khởi tạo tất cả phần tử với 0
  const z = {};
  elements.forEach(element => {
    z[element.id] = 0;
  });

  // Tìm element có AI prediction cao nhất
  let maxPredictionValue = 0;
  let maxPredictionElementId = null;
  let maxPredictionIndex = -1;

  for (let i = 0; i < Math.min(targetElements.length, predictions.length); i++) {
    const elementId = targetElements[i];
    const predictionValue = Math.max(0, predictions[i]);

    console.log(`Element ${elementId}: AI prediction = ${predictionValue.toFixed(2)}%`);

    if (predictionValue > maxPredictionValue) {
      maxPredictionValue = predictionValue;
      maxPredictionElementId = elementId;
      maxPredictionIndex = i;
    }
  }

  // Chỉ gán giá trị cho element có prediction cao nhất, tất cả khác = 0
  if (maxPredictionElementId !== null) {
    z[maxPredictionElementId] = maxPredictionValue;
    console.log(`🎯 Highest AI prediction: Element ${maxPredictionElementId} = ${maxPredictionValue.toFixed(2)}%`);
    console.log(`📊 All other elements set to 0 for simplified visualization`);
  }

  // Tính toán dựa trên element có prediction cao nhất
  const maxZ = maxPredictionValue > 0 ? maxPredictionValue : 5;

  // Sử dụng Z0 từ mục 1 để có consistency (cho reference, không hiển thị threshold plane)
  const Z0 = window.strainEnergyResults.Z0 || maxZ * 0.1;

  console.log(`📈 Max AI prediction: ${maxZ.toFixed(2)}%`);
  console.log(`📊 Reference Z₀ from section 1: ${Z0.toFixed(2)}% (not displayed)`);
  console.log(`🎯 Simplified visualization: Only 1 element with damage, ${elements.length - 1} elements at 0%`);

  // Vẽ biểu đồ 3D với perfect consistency
  drawPrediction3DDamageChart(z, elements, Z0);
}

// Hàm vẽ biểu đồ 3D damage chart cho dữ liệu dự đoán - Perfect visual consistency
function drawPrediction3DDamageChart(z, elements, Z0) {
  console.log(`Creating 3D chart with perfect visual consistency to section 1`);
  console.log(`- Total elements: ${elements.length}`);
  console.log(`- Elements with damage: ${Object.values(z).filter(v => v > 0).length}`);

  // Lấy tọa độ trọng tâm và giá trị z cho tất cả phần tử (giống hệt mục 1)
  const x1 = [], y1 = [], z1 = [];
  elements.forEach(element => {
    x1.push(element.center.x);
    y1.push(element.center.y);
    z1.push(z[element.id] || 0);
  });

  // Sử dụng chính xác chart settings từ mục 1
  let spacing, barWidth, barDepth;

  if (window.strainEnergyResults && window.strainEnergyResults.chartSettings) {
    const settings = window.strainEnergyResults.chartSettings;
    spacing = settings.spacing;
    barWidth = settings.barWidth;
    barDepth = settings.barDepth;
    console.log(`Using exact chart settings from section 1:`);
    console.log(`- Spacing: ${spacing}`);
    console.log(`- Bar width: ${barWidth}`);
    console.log(`- Bar depth: ${barDepth}`);
  } else {
    // Fallback: tính toán giống calculations.js
    const distances = [];
    for (let i = 1; i < elements.length; i++) {
      const dx = Math.abs(elements[i].center.x - elements[i-1].center.x);
      const dy = Math.abs(elements[i].center.y - elements[i-1].center.y);
      if (dx > 0) distances.push(dx);
      if (dy > 0) distances.push(dy);
    }
    spacing = distances.length > 0 ? Math.min(...distances) : 0.01;
    barWidth = spacing * 0.8;
    barDepth = spacing * 0.8;
    console.log(`Calculated fallback settings: spacing=${spacing}, barWidth=${barWidth}`);
  }

  // Sử dụng chính xác colorscale từ mục 1
  const optimizedColorscale = [
    [0, 'rgb(0,128,0)'],         // Xanh lá đậm
    [0.2, 'rgb(50,205,50)'],     // Xanh lá sáng
    [0.4, 'rgb(124,252,0)'],     // Xanh lá nhạt
    [0.6, 'rgb(255,255,0)'],     // Vàng
    [0.8, 'rgb(255,165,0)'],     // Cam
    [1, 'rgb(255,0,0)']          // Đỏ đậm cho giá trị cao
  ];

  // Tạo dữ liệu cho mesh3d (3D bars) - hiển thị TẤT CẢ 600 elements
  const allVerticesX = [], allVerticesY = [], allVerticesZ = [];
  const allFacesI = [], allFacesJ = [], allFacesK = [];
  const allIntensity = [];
  const allText = []; // Thêm text data cho hovertemplate

  let vertexOffset = 0;
  const activeDamageValues = z1.filter(val => val > 0);
  const minIntensity = 0; // Bắt đầu từ 0 để hiển thị tất cả elements
  const maxIntensity = activeDamageValues.length > 0 ? Math.max(...activeDamageValues) : 5;

  console.log(`📊 Creating 3D visualization for ALL ${elements.length} elements`);
  console.log(`📈 Damage range: ${minIntensity.toFixed(2)} - ${maxIntensity.toFixed(2)}`);
  console.log(`🎯 Elements with damage > 0: ${activeDamageValues.length}`);

  elements.forEach((element, idx) => {
    const height = Math.max(0.001, z1[idx]); // Minimum height để hiển thị tất cả elements

    // Hiển thị TẤT CẢ elements, không bỏ qua element nào

    const x = element.center.x;
    const y = element.center.y;

    // Tạo 8 đỉnh của hình hộp
    const vertices = [
      [x - barWidth/2, y - barDepth/2, 0],        // 0: bottom-left-front
      [x + barWidth/2, y - barDepth/2, 0],        // 1: bottom-right-front
      [x + barWidth/2, y + barDepth/2, 0],        // 2: bottom-right-back
      [x - barWidth/2, y + barDepth/2, 0],        // 3: bottom-left-back
      [x - barWidth/2, y - barDepth/2, height],   // 4: top-left-front
      [x + barWidth/2, y - barDepth/2, height],   // 5: top-right-front
      [x + barWidth/2, y + barDepth/2, height],   // 6: top-right-back
      [x - barWidth/2, y + barDepth/2, height]    // 7: top-left-back
    ];

    // Thêm vertices
    vertices.forEach(vertex => {
      allVerticesX.push(vertex[0]);
      allVerticesY.push(vertex[1]);
      allVerticesZ.push(vertex[2]);
      allIntensity.push(z1[idx]); // Sử dụng giá trị damage thực tế (có thể = 0)
      allText.push(`Element ${element.id}`); // Text cho hover
    });

    // 12 mặt tam giác (6 mặt hình hộp, mỗi mặt = 2 tam giác)
    const faces = [
      [0, 1, 2], [0, 2, 3], // bottom
      [4, 7, 6], [4, 6, 5], // top
      [0, 4, 5], [0, 5, 1], // front
      [2, 6, 7], [2, 7, 3], // back
      [1, 5, 6], [1, 6, 2], // right
      [0, 3, 7], [0, 7, 4]  // left
    ];

    faces.forEach(face => {
      allFacesI.push(face[0] + vertexOffset);
      allFacesJ.push(face[1] + vertexOffset);
      allFacesK.push(face[2] + vertexOffset);
    });

    vertexOffset += 8;
  });

  // Tạo customdata cho hover tooltips - TẤT CẢ elements
  const customData = [];
  elements.forEach((element, idx) => {
    // Thêm element ID cho mỗi vertex của element này (8 vertices)
    for (let v = 0; v < 8; v++) {
      customData.push(element.id);
    }
  });

  const traceMesh3D = {
    type: 'mesh3d',
    x: allVerticesX,
    y: allVerticesY,
    z: allVerticesZ,
    i: allFacesI,
    j: allFacesJ,
    k: allFacesK,
    intensity: allIntensity,
    text: allText, // Thêm text cho hovertemplate
    colorscale: optimizedColorscale,
    cmin: minIntensity,
    cmax: maxIntensity,
    opacity: 1.0,
    showlegend: false,
    showscale: true,
    name: 'Chỉ số hư hỏng dự đoán (AI)',
    hovertemplate: '<b>Element:</b> %{text}<br>' +
                   '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
                   '<b>AI Predicted Damage:</b> %{z:.2f}%<br>' +
                   '<extra></extra>',
    customdata: customData,
    flatshading: true,
    contour: {
      show: true,
      color: '#333333',
      width: 2
    },
    lighting: {
      ambient: 1.0,
      diffuse: 0.0,
      specular: 0.1,
      roughness: 0.3,
      fresnel: 0.2
    }
  };

  // Không tạo threshold plane cho visualization đơn giản hóa
  console.log(`🚫 Threshold plane removed for simplified visualization`);

  // Tạo text labels chỉ cho element có AI prediction cao nhất
  const textX = [], textY = [], textZ = [], textLabels = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const damageValue = z1[i];
    if (damageValue > 0) { // Chỉ có 1 element có damage > 0 (element có prediction cao nhất)
      textX.push(x1[i]);
      textY.push(y1[i]);
      textZ.push(damageValue + maxIntensity * 0.05);
      textLabels.push(`${damageValue.toFixed(1)}%`); // Format giống Section 1
    }
  }

  console.log(`📝 Text label created for ${textLabels.length} element (highest AI prediction only)`);

  const traceText = {
    x: textX,
    y: textY,
    z: textZ,
    mode: 'text',
    type: 'scatter3d',
    text: textLabels,
    textposition: 'middle center',
    textfont: {
      family: 'Arial, sans-serif',
      size: 10, // Giống mục 1
      color: 'darkred'
    },
    showlegend: false,
    hovertemplate: '<b>Phần tử hư hỏng (AI)</b><br>' +
                   '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
                   '<b>AI Prediction:</b> %{text}<br>' +
                   '<extra></extra>'
  };

  const data = [traceMesh3D, traceText]; // Xóa tracePlane cho visualization đơn giản

  // Tạo title cho visualization đơn giản hóa
  const elementsList = getDamagedElementsList();
  const highestElement = Object.keys(z).find(id => z[id] > 0);
  const highestValue = highestElement ? z[highestElement] : 0;

  // Tính toán range cho layout
  const minX = Math.min(...x1);
  const maxX = Math.max(...x1);
  const minY = Math.min(...y1);
  const maxY = Math.max(...y1);
  const margin = Math.max((maxX - minX), (maxY - minY)) * 0.05;

  const layout = {
    scene: {
      xaxis: {
        title: {
          text: 'EX (m)',
          font: { family: 'Arial, sans-serif', size: 16, color: '#2c3e50' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 12, color: '#34495e' },
        gridcolor: 'rgba(128,128,128,0.3)',
        showbackground: true,
        backgroundcolor: 'rgba(240,240,240,0.8)',
        range: [minX - margin, maxX + margin]
      },
      yaxis: {
        title: {
          text: 'EY (m)',
          font: { family: 'Arial, sans-serif', size: 16, color: '#2c3e50' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 12, color: '#34495e' },
        gridcolor: 'rgba(128,128,128,0.3)',
        showbackground: true,
        backgroundcolor: 'rgba(240,240,240,0.8)',
        range: [minY - margin, maxY + margin]
      },
      zaxis: {
        title: {
          text: 'AI Predicted Damage Index',
          font: { family: 'Arial, sans-serif', size: 16, color: '#2c3e50' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 12, color: '#34495e' },
        gridcolor: 'rgba(128,128,128,0.3)',
        showbackground: true,
        backgroundcolor: 'rgba(240,240,240,0.8)'
      },
      camera: {
        projection: { type: 'orthographic' }, // Thay đổi sang OrthographicCamera
        eye: { x: 1.5, y: 1.5, z: 1.2 }, // Góc nhìn tối ưu cho orthographic
        center: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 0, z: 1 }
      },
      aspectmode: 'cube',
      bgcolor: 'rgba(255,255,255,0.9)'
    },
    margin: { l: 0, r: 0, b: 0, t: 0 },
    font: { family: 'Arial, sans-serif' },
    paper_bgcolor: 'rgba(255,255,255,0.9)',
    plot_bgcolor: 'rgba(255,255,255,0.9)'
  };

  let chartDiv = document.getElementById('prediction3DChart');
  if (chartDiv) {
    Plotly.purge(chartDiv);
    Plotly.newPlot(chartDiv, data, layout, {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
      displaylogo: false,
      responsive: true,
      toImageButtonOptions: {
        format: 'png',
        filename: 'damage_prediction_3d',
        height: 800,
        width: 1200,
        scale: 2
      }
    }).then(() => {
      console.log('✅ Simplified 3D prediction chart rendered successfully');
      console.log('📊 === SECTION 2 SIMPLIFIED VISUALIZATION SUMMARY ===');
      console.log('📷 Camera: OrthographicCamera (no perspective distortion)');
      console.log(`📈 Total elements displayed: ${elements.length}`);
      console.log(`📊 Total vertices: ${allVerticesX.length}`);
      console.log(`📊 Total faces: ${allFacesI.length}`);
      console.log(`🎯 Elements with damage > 0: ${Object.values(z).filter(v => v > 0).length} (highest AI prediction only)`);
      console.log(`📝 Text labels shown: ${textLabels.length} (highest prediction element)`);
      console.log(`🚫 Threshold plane: Removed for simplified view`);
      console.log(`🎨 Colorscale: Green-to-Red gradient (identical to section 1)`);
      console.log(`💡 Lighting: No shadows (ambient=1.0, diffuse=0)`);
      console.log(`🔤 Font: Arial, sans-serif (synchronized with section 1)`);
      console.log(`🔲 Outline: Dark gray borders (flatshading + contour)`);
      console.log(`📊 Highest AI prediction: ${highestValue.toFixed(2)}% (Element ${highestElement || 'N/A'})`);
      console.log('🎯 Simplified visualization: Focus on most critical damage only');
    }).catch((error) => {
      console.error('❌ Lỗi khi render biểu đồ 3D dự đoán:', error);
    });
  } else {
    console.error('❌ Không tìm thấy container #prediction3DChart');
  }
}
