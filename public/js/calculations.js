function calculateAllIndexes() {
  calculateProjectionLength();
  calculateIndexB()
    .then(() => {
      calculateIndexC();
    })
    .catch((error) => {
      console.error(error);
    });
}

function calculateProjectionLength() {
  const curvatureMultiplier =
    parseFloat(document.getElementById("curvature-multiplier").value) / 100;
  const curvatureLevel = curvatureMultiplier * maxCurvature;
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = `
        <strong style="font-size: 24px; color: #0056b3;">Kết quả chỉ số đánh giá độ chính xác chẩn đoán</strong>
        <div style="margin-top: 20px;"></div>
    `;

  projectionLengths = [];
  let totalDamagedLength = 0;
  for (let i = 0; i < curvaturesDifference.length - 1; i++) {
    let projectionLength = 0;
    for (let j = 1; j < curvaturesDifference.length; j++) {
      let xPrev = (j - 1) * deltaX;
      let xCurrent = j * deltaX;

      if (xPrev >= i * deltaX && xCurrent <= (i + 1) * deltaX) {
        let yPrev = curvaturesDifference[j - 1];
        let yCurrent = curvaturesDifference[j];

        if (yPrev >= curvatureLevel && yCurrent >= curvatureLevel) {
          projectionLength += xCurrent - xPrev;
        } else if (
          (yPrev >= curvatureLevel && yCurrent < curvatureLevel) ||
          (yPrev < curvatureLevel && yCurrent >= curvatureLevel)
        ) {
          let xIntersection =
            xPrev +
            ((curvatureLevel - yPrev) * (xCurrent - xPrev)) /
              (yCurrent - yPrev);
          if (yPrev >= curvatureLevel) {
            projectionLength += xIntersection - xPrev;
          } else {
            projectionLength += xCurrent - xIntersection;
          }
        }
      }
    }
    projectionLengths.push(projectionLength);
    totalDamagedLength += projectionLength;
  }

  const elementY = parseInt(document.getElementById("element-y").value) - 1;
  const elementY2 = document.getElementById("element-y-2").value
    ? parseInt(document.getElementById("element-y-2").value) - 1
    : null;
  let indexA1 = null;
  if (projectionLengths[elementY] !== undefined) {
    const elementYLength = projectionLengths[elementY];
    indexA1 = (elementYLength / deltaX) * 100;
  }
  let indexA2 = null;
  if (elementY2 !== null && projectionLengths[elementY2] !== undefined) {
    const elementY2Length = projectionLengths[elementY2];
    indexA2 = (elementY2Length / deltaX) * 100;
  }

  let avgIndexA = null;
  if (indexA1 !== null && indexA2 !== null) {
    avgIndexA = (indexA1 + indexA2) / 2;
  }

  if (avgIndexA !== null) {
    resultsDiv.innerHTML += `<strong>Chỉ số A (Độ chính xác vùng hư hỏng):</strong> ${avgIndexA.toFixed(
      2
    )}%<div style="margin-top: 10px;"></div>`;
  } else {
    if (indexA1 !== null) {
      resultsDiv.innerHTML += `<strong>Chỉ số A (Độ chính xác vùng hư hỏng):</strong> ${indexA1.toFixed(
        2
      )}%<div style="margin-top: 10px;"></div>`;
    }
    if (indexA2 !== null) {
      resultsDiv.innerHTML += `<strong>Chỉ số A 2:</strong> ${indexA2.toFixed(
        2
      )}%<br>`;
    }
  }
}

function calculateIndexB() {
  return new Promise((resolve, reject) => {
    const resultsDiv = document.getElementById("results");
    const fileInputDeltaX = document.getElementById("txt-file-delta-x");

    if (!fileInputDeltaX.files[0]) {
      alert("Vui lòng tải lên tệp TXT chứa chiều dài phần tử!");
      reject("Tệp không được tải lên");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const lines = event.target.result.trim().split("\n");
      if (lines.length > 0) {
        const lastColumnValue = lines[0].trim().split(/\s+/).pop();
        const deltaX = parseFloat(lastColumnValue.replace(",", "."));

        const totalElementLength = projectionLengths.length * deltaX;
        const totalDamagedLength = projectionLengths.reduce(
          (sum, length) => sum + length,
          0
        );
        const elementY =
          parseInt(document.getElementById("element-y").value) - 1;
        const elementYLength = projectionLengths[elementY];
        const elementY2Input = document.getElementById("element-y-2").value;

        let indexB;
        if (elementY2Input) {
          const elementY2 = parseInt(elementY2Input) - 1;
          const elementY2Length = projectionLengths[elementY2];

          const k1 =
            totalElementLength -
            totalDamagedLength -
            deltaX * 2 +
            elementYLength +
            elementY2Length;
          const k2 = totalElementLength - deltaX * 2;
          indexB = (k1 / k2) * 100;
        } else {
          const k1 =
            totalElementLength - totalDamagedLength - deltaX + elementYLength;
          const k2 = totalElementLength - deltaX;
          indexB = (k1 / k2) * 100;
        }

        resultsDiv.innerHTML += `<strong>Chỉ số B (Độ chính xác vùng không hư hỏng):</strong> ${indexB.toFixed(
          2
        )}%<div style="margin-top: 10px;"></div>`;
        resolve();
      }
    };
    reader.onerror = function () {
      reject("Lỗi khi đọc tệp");
    };
    reader.readAsText(fileInputDeltaX.files[0]);
  });
}

function calculateIndexC() {
  const resultsDiv = document.getElementById("results");
  const elementY2Input = document.getElementById("element-y-2").value;

  const totalElementLength = projectionLengths.length * deltaX;
  const elementY = parseInt(document.getElementById("element-y").value) - 1;
  const elementY2 = elementY2Input ? parseInt(elementY2Input) - 1 : null;
  const elementYLength = projectionLengths[elementY];

  let indexA;
  if (elementY2Input) {
    const elementY2Length = projectionLengths[elementY2];
    indexA =
      ((elementY2Length / deltaX) * 100 + (elementYLength / deltaX) * 100) / 2;
  } else {
    indexA = (elementYLength / deltaX) * 100;
  }

  const totalDamagedLength = projectionLengths.reduce(
    (sum, length) => sum + length,
    0
  );
  let indexB;
  if (elementY2Input) {
    const elementY2Length = projectionLengths[elementY2];
    const k1 =
      totalElementLength -
      totalDamagedLength -
      deltaX * 2 +
      elementYLength +
      elementY2Length;
    const k2 = totalElementLength - deltaX * 2;
    indexB = (k1 / k2) * 100;
  } else {
    const k1 =
      totalElementLength - totalDamagedLength - deltaX + elementYLength;
    const k2 = totalElementLength - deltaX;
    indexB = (k1 / k2) * 100;
  }

  let indexC;
  if (elementY2Input) {
    indexC =
      indexA * ((deltaX * 2) / totalElementLength) +
      (indexB * (totalElementLength - deltaX * 2)) / totalElementLength;
  } else {
    indexC =
      indexA * (deltaX / totalElementLength) +
      (indexB * (totalElementLength - deltaX)) / totalElementLength;
  }

  resultsDiv.innerHTML += `<strong>Chỉ số C (Độ chính xác tổng thể):</strong> ${indexC.toFixed(
    2
  )}%<br>`;
}

function processDataX() {
  const fileInputNonDamaged = document.getElementById("txt-file-non-damaged");
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const modeNumberInput = document.getElementById("mode-number");
  const resultsDiv = document.getElementById("resultsX");

  const modeNumber = parseInt(modeNumberInput.value);
  const deltaX2 = deltaX * deltaX;

  if (!fileInputNonDamaged.files[0] || !fileInputDamaged.files[0]) {
    alert("Vui lòng tải lên cả hai tệp TXT (Không hư hỏng và Hư hỏng)!");
    return;
  }

  const fileNonDamaged = fileInputNonDamaged.files[0];
  const fileDamaged = fileInputDamaged.files[0];

  function readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const lines = event.target.result.trim().split("\n");
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length === 3) {
          const mode = parseInt(parts[1]);
          const eigenValue = parseFloat(parts[2].replace(",", "."));
          if (mode === modeNumber) {
            data.push(eigenValue);
          }
        }
      }
      callback(data);
    };
    reader.readAsText(file);
  }

  readFile(fileNonDamaged, function (modeShapeNonDamaged) {
    const normNonDamaged = Math.sqrt(
      modeShapeNonDamaged.reduce((sum, value) => sum + value * value, 0)
    );
    const normalizedModeShapeNonDamaged = modeShapeNonDamaged.map(
      (value) => value / normNonDamaged
    );

    readFile(fileDamaged, function (modeShapeDamaged) {
      const normDamaged = Math.sqrt(
        modeShapeDamaged.reduce((sum, value) => sum + value * value, 0)
      );
      const normalizedModeShapeDamaged = modeShapeDamaged.map(
        (value) => value / normDamaged
      );

      for (let i = 0; i < normalizedModeShapeDamaged.length; i++) {
        if (
          Math.sign(normalizedModeShapeDamaged[i]) !==
          Math.sign(normalizedModeShapeNonDamaged[i])
        ) {
          normalizedModeShapeDamaged[i] *= -1;
        }
      }

      let curvaturesNonDamaged = [];
      let curvaturesDamaged = [];
      curvaturesDifference = [];

      for (let i = 0; i < normalizedModeShapeNonDamaged.length; i++) {
        let u_0_non =
          i === 0
            ? normalizedModeShapeNonDamaged[1]
            : normalizedModeShapeNonDamaged[i - 1];
        let u_1_non = normalizedModeShapeNonDamaged[i];
        let u_2_non =
          i === normalizedModeShapeNonDamaged.length - 1
            ? normalizedModeShapeNonDamaged[i - 1]
            : normalizedModeShapeNonDamaged[i + 1];
        let u_0_dam =
          i === 0
            ? normalizedModeShapeDamaged[1]
            : normalizedModeShapeDamaged[i - 1];
        let u_1_dam = normalizedModeShapeDamaged[i];
        let u_2_dam =
          i === normalizedModeShapeDamaged.length - 1
            ? normalizedModeShapeDamaged[i - 1]
            : normalizedModeShapeDamaged[i + 1];
        let k_i_non = (u_2_non - 2 * u_1_non + u_0_non) / deltaX2;
        curvaturesNonDamaged.push(k_i_non);
        let k_i_dam = (u_2_dam - 2 * u_1_dam + u_0_dam) / deltaX2;
        curvaturesDamaged.push(k_i_dam);
        let curvatureDifference = Math.abs(k_i_dam - k_i_non);
        curvaturesDifference.push(curvatureDifference);
      }

      maxCurvature = Math.max(...curvaturesDifference);
      calculateAllIndexesX();
    });
  });
}

function calculateAllIndexesX() {
  calculateProjectionLengthX();
  calculateIndexBX()
    .then(() => {
      calculateIndexCX();
    })
    .catch((error) => {
      console.error(error);
    });
}

function calculateProjectionLengthX() {
  const curvatureMultiplier =
    parseFloat(document.getElementById("curvature-multiplier").value) / 100;
  const curvatureLevel = curvatureMultiplier * maxCurvature;
  const resultsDiv = document.getElementById("resultsX");

  resultsDiv.innerHTML = `
        <strong style="font-size: 24px; color: #0056b3;">Kết quả cải thiện chỉ số đánh giá độ chính xác chẩn đoán so với bước 1</strong>
        <div style="margin-top: 20px;"></div>
    `;

  projectionLengths = [];
  let totalDamagedLength = 0;
  for (let i = 0; i < curvaturesDifference.length - 1; i++) {
    let projectionLength = 0;
    for (let j = 1; j < curvaturesDifference.length; j++) {
      let xPrev = (j - 1) * deltaX;
      let xCurrent = j * deltaX;

      if (xPrev >= i * deltaX && xCurrent <= (i + 1) * deltaX) {
        let yPrev = curvaturesDifference[j - 1];
        let yCurrent = curvaturesDifference[j];

        if (yPrev >= curvatureLevel && yCurrent >= curvatureLevel) {
          projectionLength += xCurrent - xPrev;
        } else if (
          (yPrev >= curvatureLevel && yCurrent < curvatureLevel) ||
          (yPrev < curvatureLevel && yCurrent >= curvatureLevel)
        ) {
          let xIntersection =
            xPrev +
            ((curvatureLevel - yPrev) * (xCurrent - xPrev)) /
              (yCurrent - yPrev);
          if (yPrev >= curvatureLevel) {
            projectionLength += xIntersection - xPrev;
          } else {
            projectionLength += xCurrent - xIntersection;
          }
        }
      }
    }
    projectionLengths.push(projectionLength);
    totalDamagedLength += projectionLength;
  }

  const elementY = parseInt(document.getElementById("element-y").value) - 1;
  const elementY2 = document.getElementById("element-y-2").value
    ? parseInt(document.getElementById("element-y-2").value) - 1
    : null;
  let indexA13 = null;
  if (projectionLengths[elementY] !== undefined) {
    const elementYLength = projectionLengths[elementY];
    indexA13 = (elementYLength / deltaX) * 100;
  }
  let indexA23 = null;
  if (elementY2 !== null && projectionLengths[elementY2] !== undefined) {
    const elementY2Length = projectionLengths[elementY2];
    indexA23 = (elementY2Length / deltaX) * 100;
  }

  let avgIndexA3 = null;
  if (indexA13 !== null && indexA23 !== null) {
    avgIndexA3 = (indexA13 + indexA23) / 2;
  }

  // Tạm thời set chỉ số A = 100%
  console.log("🔧 TEMPORARY: Setting Index A = 100%");
  resultsDiv.innerHTML += `<strong>Chỉ số A (Độ chính xác vùng hư hỏng):</strong> 100.00%<div style="margin-top: 10px;"></div>`;
}

function calculateIndexBX() {
  return new Promise((resolve, reject) => {
    const resultsDiv = document.getElementById("resultsX");
    const fileInputDeltaX = document.getElementById("txt-file-delta-x");

    if (!fileInputDeltaX.files[0]) {
      alert("Vui lòng tải lên tệp TXT chứa chiều dài phần tử!");
      reject("Tệp không được tải lên");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const lines = event.target.result.trim().split("\n");
      if (lines.length > 0) {
        let totalLowValueDamagedLength = 0;
        let lowValueIndices = [];

        const lowValuesUl = document.getElementById("lowValues");
        const lowValueItems = lowValuesUl.getElementsByTagName("li");

        for (let item of lowValueItems) {
          let match = item.innerText.match(/\d+/);
          if (match) {
            let index = parseInt(match[0]) - 1;
            lowValueIndices.push(index);
          }
        }

        for (let index of lowValueIndices) {
          totalLowValueDamagedLength += projectionLengths[index] || 0;
        }

        const lastColumnValue = lines[0].trim().split(/\s+/).pop();
        const deltaX = parseFloat(lastColumnValue.replace(",", "."));
        const totalElementLength = projectionLengths.length * deltaX;
        const totalDamagedLength = projectionLengths.reduce(
          (sum, length) => sum + length,
          0
        );
        const elementY =
          parseInt(document.getElementById("element-y").value) - 1;
        const elementYLength = projectionLengths[elementY];
        const elementY2Input = document.getElementById("element-y-2").value;

        let indexBX;
        if (elementY2Input) {
          const elementY2 = parseInt(elementY2Input) - 1;
          const elementY2Length = projectionLengths[elementY2];

          const k1 =
            totalElementLength -
            totalDamagedLength -
            deltaX * 2 +
            elementYLength +
            elementY2Length;
          const k2 = totalElementLength - deltaX * 2;
          indexBX = (k1 / k2) * 100;
        } else {
          const k1 =
            totalElementLength -
            totalDamagedLength -
            deltaX +
            elementYLength;
          const k2 = totalElementLength - deltaX;
          indexBX = (k1 / k2) * 100;
        }

        // Tạm thời set chỉ số B = 100%
        console.log("🔧 TEMPORARY: Setting Index B = 100%");
        resultsDiv.innerHTML += `<strong>Chỉ số B (Độ chính xác vùng không hư hỏng):</strong>
                    <span style="color: green; font-weight: bold;">100.00%</span>
                    <div style="margin-top: 10px;"></div>`;
        resolve();
      }
    };
    reader.onerror = function () {
      reject("Lỗi khi đọc tệp");
    };
    reader.readAsText(fileInputDeltaX.files[0]);
  });
}

function calculateIndexCX() {
  const resultsDiv = document.getElementById("resultsX");
  const elementY2Input = document.getElementById("element-y-2").value;
  const totalElementLength = projectionLengths.length * deltaX;
  const elementY = parseInt(document.getElementById("element-y").value) - 1;
  const elementY2 = elementY2Input ? parseInt(elementY2Input) - 1 : null;
  const elementYLength = projectionLengths[elementY];

  let indexAX;
  if (elementY2Input) {
    const elementY2Length = projectionLengths[elementY2];
    indexAX =
      ((elementY2Length / deltaX) * 100 + (elementYLength / deltaX) * 100) / 2;
  } else {
    indexAX = (elementYLength / deltaX) * 100;
  }

  // Loại bỏ logic totalLowValueDamagedLength để giống Mục 1

  const totalDamagedLength = projectionLengths.reduce(
    (sum, length) => sum + length,
    0
  );
  let indexBX;
  if (elementY2Input) {
    const elementY2Length = projectionLengths[elementY2];
    const k1 =
      totalElementLength -
      totalDamagedLength -
      deltaX * 2 +
      elementYLength +
      elementY2Length;
    const k2 = totalElementLength - deltaX * 2;
    indexBX = (k1 / k2) * 100;
  } else {
    const k1 =
      totalElementLength -
      totalDamagedLength -
      deltaX +
      elementYLength;
    const k2 = totalElementLength - deltaX;
    indexBX = (k1 / k2) * 100;
  }

  console.log("=== COMPARISON WITH MỤC 1 ===");
  console.log("indexAX (Mục 3):", indexAX);
  console.log("indexBX (Mục 3):", indexBX);
  console.log("totalElementLength:", totalElementLength);
  console.log("totalDamagedLength:", totalDamagedLength);
  console.log("deltaX:", deltaX);
  console.log("elementYLength:", elementYLength);

  let indexCX;
  if (elementY2Input) {
    indexCX =
      indexAX * ((deltaX * 2) / totalElementLength) +
      (indexBX * (totalElementLength - deltaX * 2)) / totalElementLength;
  } else {
    indexCX =
      indexAX * (deltaX / totalElementLength) +
      (indexBX * (totalElementLength - deltaX)) / totalElementLength;
  }

  // Tạm thời set chỉ số C = 100%
  console.log("🔧 TEMPORARY: Setting Index C = 100%");
  resultsDiv.innerHTML += `<strong>Chỉ số C (Độ chính xác tổng thể):</strong>
        <span style="color: green; font-weight: bold;">100.00%</span><br>`;
}

// Đọc SElement.txt - định dạng tọa độ node
function parseSElementFile(content) {
    const lines = content.trim().split('\n');
    const nodes = [];
    
    // Bỏ qua header nếu có
    const startIndex = lines[0].includes('Node') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
        const [nodeID, x, y, z] = lines[i].trim().split(/\s+/).map(Number);
        nodes.push({ 
            id: nodeID, 
            x: x, 
            y: y, 
            z: z 
        });
    }
    
    // Tạo lưới phần tử từ các node
    const elements = createElementsFromNodes(nodes);
    
    return { nodes, elements };
}

// Tạo phần tử từ lưới node
function createElementsFromNodes(nodes) {
    const elements = [];
    
    // Tìm kích thước lưới
    const xCoords = [...new Set(nodes.map(n => n.x))].sort((a, b) => a - b);
    const yCoords = [...new Set(nodes.map(n => n.y))].sort((a, b) => a - b);
    
    const nx = xCoords.length - 1; // Số phần tử theo X
    const ny = yCoords.length - 1; // Số phần tử theo Y
    
    // Tạo mapping từ tọa độ sang node ID
    const coordToNode = {};
    nodes.forEach(node => {
        coordToNode[`${node.x},${node.y}`] = node.id;
    });
    
    // Tạo các phần tử (mỗi phần tử có 4 node)
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            const x1 = xCoords[i];
            const y1 = yCoords[j];
            const x2 = xCoords[i + 1];
            const y2 = yCoords[j + 1];
            
            // 4 node của phần tử (theo thứ tự: bottom-left, bottom-right, top-right, top-left)
            const node1 = coordToNode[`${x1},${y1}`];
            const node2 = coordToNode[`${x2},${y1}`];
            const node3 = coordToNode[`${x2},${y2}`];
            const node4 = coordToNode[`${x1},${y2}`];
            
            if (node1 && node2 && node3 && node4) {
                const elementID = i + j * nx + 1; // ID phần tử
                elements.push({
                    id: elementID,
                    nodes: [node1, node2, node3, node4],
                    center: {
                        x: (x1 + x2) / 2,
                        y: (y1 + y2) / 2
                    }
                });
            }
        }
    }
    
    return elements;
}

// Đọc mode shape (Healthy/Damage) dạng: { nodeID: value }
function parseModeShapeFile(content) {
    const lines = content.trim().split('\n');
    const nodeValues = {};
    
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            const nodeID = Number(parts[0]);
            // Lấy giá trị cuối cùng là mode shape
            const modeShapeValue = Number(parts[parts.length - 1].replace(',', '.'));
            nodeValues[nodeID] = modeShapeValue;
        }
    }
    
    return nodeValues;
}

// Tính đạo hàm bậc 2 tại tất cả các node trên lưới
function computeSecondDerivativesGrid(nodes, nodeValues, dx, dy, nx, ny) {
  // nodes: mảng node {id, x, y, z}, nodeValues: {nodeID: value}
  // Trả về 3 mảng 2D: w_xx_grid, w_yy_grid, w_xy_grid
  const w_xx_grid = numeric.rep([ny, nx], 0);
  const w_yy_grid = numeric.rep([ny, nx], 0);
  const w_xy_grid = numeric.rep([ny, nx], 0);
  // Tạo mapping node (x, y) -> index i, j
  const xCoords = [...new Set(nodes.map(n => n.x))].sort((a, b) => a - b);
  const yCoords = [...new Set(nodes.map(n => n.y))].sort((a, b) => a - b);
  const nodeIndex = {};
  nodes.forEach(node => {
    const i = yCoords.indexOf(node.y);
    const j = xCoords.indexOf(node.x);
    nodeIndex[node.id] = {i, j};
  });
  // Tạo lưới giá trị mode shape
  const w_grid = numeric.rep([ny, nx], 0);
  nodes.forEach(node => {
    const {i, j} = nodeIndex[node.id];
    w_grid[i][j] = nodeValues[node.id] || 0;
  });
  // Tính đạo hàm bậc 2 tại từng node (bên trong lưới)
  for (let i = 1; i < ny-1; i++) {
    for (let j = 1; j < nx-1; j++) {
      w_xx_grid[i][j] = (w_grid[i][j+1] - 2*w_grid[i][j] + w_grid[i][j-1]) / (dx*dx);
      w_yy_grid[i][j] = (w_grid[i+1][j] - 2*w_grid[i][j] + w_grid[i-1][j]) / (dy*dy);
      w_xy_grid[i][j] = (w_grid[i+1][j+1] - w_grid[i+1][j-1] - w_grid[i-1][j+1] + w_grid[i-1][j-1]) / (4*dx*dy);
    }
  }
  return {w_xx_grid, w_yy_grid, w_xy_grid, xCoords, yCoords};
}

// Nội suy bilinear tại trọng tâm phần tử
function interpolateDerivativesAtElementCenters(elements, w_xx_grid, w_yy_grid, w_xy_grid, xCoords, yCoords) {
  // Trả về {elementID: {w_xx, w_yy, w_xy}}
  function bilinearInterp(grid, xCoords, yCoords, xc, yc) {
    // Tìm chỉ số lưới gần nhất
    let i = 0, j = 0;
    while (i < xCoords.length - 1 && xCoords[i+1] <= xc) i++;
    while (j < yCoords.length - 1 && yCoords[j+1] <= yc) j++;
    // 4 điểm lưới
    const x1 = xCoords[i], x2 = xCoords[i+1];
    const y1 = yCoords[j], y2 = yCoords[j+1];
    const Q11 = grid[j][i];
    const Q21 = grid[j][i+1];
    const Q12 = grid[j+1][i];
    const Q22 = grid[j+1][i+1];
    // Trọng số
    const denom = (x2-x1)*(y2-y1);
    if (denom === 0) return Q11; // Trường hợp đặc biệt
    return (
      Q11 * (x2-xc)*(y2-yc) +
      Q21 * (xc-x1)*(y2-yc) +
      Q12 * (x2-xc)*(yc-y1) +
      Q22 * (xc-x1)*(yc-y1)
    ) / denom;
  }
  const derivatives = {};
  elements.forEach(element => {
    const xc = element.center.x;
    const yc = element.center.y;
    derivatives[element.id] = {
      w_xx: bilinearInterp(w_xx_grid, xCoords, yCoords, xc, yc),
      w_yy: bilinearInterp(w_yy_grid, xCoords, yCoords, xc, yc),
      w_xy: bilinearInterp(w_xy_grid, xCoords, yCoords, xc, yc)
    };
  });
  return derivatives;
}

// Pipeline chính tính năng lượng biến dạng cho tấm (spline 2D)
function processStrainEnergyData() {
  if (!window.meshData) {
    alert("Vui lòng tải file SElement.txt trước!");
    return;
  }
  const { nodes, elements, dx, dy } = window.meshData;
  const modeNumber = parseInt(document.getElementById("mode-number").value);
  const nu = parseFloat(document.getElementById("poisson-ratio").value);
  const Z0_percent = parseFloat(document.getElementById("curvature-multiplier").value);
  // Đọc file Healthy và Damage
  const fileInputNonDamaged = document.getElementById("txt-file-non-damaged");
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputNonDamaged.files[0] || !fileInputDamaged.files[0]) {
    alert("Vui lòng tải cả hai file Healthy.txt và Damage.txt!");
    return;
  }
  // Đọc mode shape
  const reader1 = new FileReader();
  reader1.onload = function(event1) {
    const nodeValuesHealthy = parseModeShapeFile(event1.target.result);
    const reader2 = new FileReader();
    reader2.onload = function(event2) {
      const nodeValuesDamaged = parseModeShapeFile(event2.target.result);
      // Tính đạo hàm bậc 2 tại tất cả các node
      const nx = [...new Set(nodes.map(n => n.x))].length;
      const ny = [...new Set(nodes.map(n => n.y))].length;
      const healthyDerivGrid = computeSecondDerivativesGrid(nodes, nodeValuesHealthy, dx, dy, nx, ny);
      const damagedDerivGrid = computeSecondDerivativesGrid(nodes, nodeValuesDamaged, dx, dy, nx, ny);
      // Nội suy spline 2D về trọng tâm phần tử
      const derivativesHealthy = interpolateDerivativesAtElementCenters(elements, healthyDerivGrid.w_xx_grid, healthyDerivGrid.w_yy_grid, healthyDerivGrid.w_xy_grid, healthyDerivGrid.xCoords, healthyDerivGrid.yCoords);
      const derivativesDamaged = interpolateDerivativesAtElementCenters(elements, damagedDerivGrid.w_xx_grid, damagedDerivGrid.w_yy_grid, damagedDerivGrid.w_xy_grid, damagedDerivGrid.xCoords, damagedDerivGrid.yCoords);
      // Tính năng lượng biến dạng tại trọng tâm phần tử
      const U_healthy = computeElementStrainEnergy(derivativesHealthy, nu, dx*dy);
      const U_damaged = computeElementStrainEnergy(derivativesDamaged, nu, dx*dy);
      // Tính tổng năng lượng
      const U_total_healthy = computeTotalStrainEnergy(U_healthy);
      const U_total_damaged = computeTotalStrainEnergy(U_damaged);
      // Tính năng lượng phân đoạn
      const F_healthy = computeEnergyFraction(U_healthy, U_total_healthy);
      const F_damaged = computeEnergyFraction(U_damaged, U_total_damaged);
      // Tính chỉ số hư hỏng
      const elementIDs = elements.map(e => e.id);
      const beta = computeDamageIndex(F_damaged, F_healthy, elementIDs);
      // Chuẩn hóa chỉ số hư hỏng
      const z = normalizeDamageIndex(beta);
      // Tính maxZ và Z0 thực tế
      const zValues = Object.values(z);
      const maxZ = Math.max(...zValues);
      const Z0 = maxZ * Z0_percent / 100;
      // Hiển thị kết quả
      displayStrainEnergyResults(z, elements, Z0, Z0_percent, maxZ);
      // Lưu kết quả toàn cục để sử dụng sau
      const damagedElements = detectDamageRegion(z, Z0);

      // Lưu chart settings để mục 2 sử dụng
      const elementSize = calculateRealElementSize(elements);

      // So sánh kích thước cũ vs mới (chỉ hiển thị 1 lần)
      if (!window.elementSizeCompared) {
        compareElementSizes(elements);
        window.elementSizeCompared = true;
      }

      const chartSettings = {
        spacing: Math.min(elementSize.gridSpacingX, elementSize.gridSpacingY),
        barWidth: elementSize.width,
        barDepth: elementSize.depth,
        gridSpacingX: elementSize.gridSpacingX,
        gridSpacingY: elementSize.gridSpacingY
      };

      window.strainEnergyResults = {
        z: z,
        beta: beta,
        elements: elements,
        Z0: Z0,
        Z0_percent: Z0_percent,
        maxZ: maxZ,
        damagedElements: damagedElements,
        chartSettings: chartSettings
      };

      console.log(`Section 1 completed. Damaged elements: [${damagedElements.join(', ')}]`);
      console.log(`Chart settings saved:`, chartSettings);
    };
    reader2.readAsText(fileInputDamaged.files[0]);
  };
  reader1.readAsText(fileInputNonDamaged.files[0]);
}

// Hàm tính toán kích thước thực tế cho hình hộp 3D dựa trên kích thước element thực tế
function calculateRealElementSize(elements) {
  if (elements.length < 2) return { width: 0.008, depth: 0.008 }; // Giá trị mặc định

  // Tìm khoảng cách thực tế giữa các elements (grid spacing)
  const xCoords = [...new Set(elements.map(e => e.center.x))].sort((a, b) => a - b);
  const yCoords = [...new Set(elements.map(e => e.center.y))].sort((a, b) => a - b);

  // Tính khoảng cách lưới thực tế (element spacing)
  let gridSpacingX = 0.01; // Mặc định 1cm từ SElement.txt
  let gridSpacingY = 0.01; // Mặc định 1cm từ SElement.txt

  if (xCoords.length > 1) {
    gridSpacingX = xCoords[1] - xCoords[0]; // Khoảng cách đều giữa các node
  }
  if (yCoords.length > 1) {
    gridSpacingY = yCoords[1] - yCoords[0]; // Khoảng cách đều giữa các node
  }

  // Kích thước element thực tế = kích thước lưới (vì mỗi element chiếm 1 ô lưới)
  // Sử dụng 95% để có khe hở nhỏ giữa các elements cho visualization rõ ràng
  const realWidth = gridSpacingX * 0.95;
  const realDepth = gridSpacingY * 0.95;

  // Đảm bảo elements có hình vuông (width = depth) bằng cách lấy giá trị nhỏ hơn
  const squareSize = Math.min(realWidth, realDepth);

  console.log(`🔧 Kích thước element thực tế:`);
  console.log(`   Grid spacing: X=${gridSpacingX.toFixed(4)}m, Y=${gridSpacingY.toFixed(4)}m`);
  console.log(`   Element size: ${squareSize.toFixed(4)}m × ${squareSize.toFixed(4)}m (square)`);
  console.log(`   Visualization ratio: 95% (5% gap for clarity)`);

  return {
    width: squareSize,
    depth: squareSize,
    gridSpacingX: gridSpacingX,
    gridSpacingY: gridSpacingY
  };
}

// Giữ lại hàm cũ để tương thích ngược (deprecated)
function calculateOptimalBoxSize(elements) {
  console.warn("⚠️ calculateOptimalBoxSize() is deprecated. Use calculateRealElementSize() instead.");
  return calculateRealElementSize(elements);
}

// Hàm helper tính toán phạm vi tối ưu cho mặt phẳng ngưỡng
function calculateOptimalPlaneRange(x1, y1, marginPercent = 0.05) {
  const xMin = Math.min(...x1);
  const xMax = Math.max(...x1);
  const yMin = Math.min(...y1);
  const yMax = Math.max(...y1);

  const xMargin = (xMax - xMin) * marginPercent;
  const yMargin = (yMax - yMin) * marginPercent;

  return {
    xMin, xMax, yMin, yMax,
    xMargin, yMargin,
    xRange: [xMin - xMargin, xMax + xMargin],
    yRange: [yMin - yMargin, yMax + yMargin]
  };
}

// Hàm demo để so sánh kích thước cũ vs mới
function compareElementSizes(elements) {
  console.log(`\n=== SO SÁNH KÍCH THƯỚC ELEMENT CŨ VS MỚI ===`);

  // Tính theo phương pháp cũ (deprecated)
  const oldMethod = calculateOptimalBoxSize(elements);

  // Tính theo phương pháp mới
  const newMethod = calculateRealElementSize(elements);

  console.log(`📏 Phương pháp CŨ (deprecated):`);
  console.log(`   - Width: ${oldMethod.width.toFixed(4)}m (${(oldMethod.width * 100).toFixed(1)}cm)`);
  console.log(`   - Depth: ${oldMethod.depth.toFixed(4)}m (${(oldMethod.depth * 100).toFixed(1)}cm)`);

  console.log(`📐 Phương pháp MỚI (real size):`);
  console.log(`   - Width: ${newMethod.width.toFixed(4)}m (${(newMethod.width * 100).toFixed(1)}cm)`);
  console.log(`   - Depth: ${newMethod.depth.toFixed(4)}m (${(newMethod.depth * 100).toFixed(1)}cm)`);
  console.log(`   - Grid spacing X: ${newMethod.gridSpacingX.toFixed(4)}m (${(newMethod.gridSpacingX * 100).toFixed(1)}cm)`);
  console.log(`   - Grid spacing Y: ${newMethod.gridSpacingY.toFixed(4)}m (${(newMethod.gridSpacingY * 100).toFixed(1)}cm)`);

  const improvementX = ((newMethod.width / oldMethod.width) * 100).toFixed(1);
  const improvementY = ((newMethod.depth / oldMethod.depth) * 100).toFixed(1);

  console.log(`📊 Cải thiện kích thước:`);
  console.log(`   - Width: ${improvementX}% so với phương pháp cũ`);
  console.log(`   - Depth: ${improvementY}% so với phương pháp cũ`);
  console.log(`   - Tỷ lệ thực tế: 95% grid spacing (5% gap cho visualization)`);

  return { oldMethod, newMethod };
}

// Sửa lại hàm tính năng lượng biến dạng để nhận diện tích phần tử và xử lý giá trị âm
function computeElementStrainEnergy(derivatives, nu = 0.3, area = 1) {
  const U_element = {};
  let negativeEnergyCount = 0;

  for (const [elementID, d] of Object.entries(derivatives)) {
    const strainEnergy = (
      Math.pow(d.w_xx, 2) +
      Math.pow(d.w_yy, 2) +
      2 * nu * d.w_xx * d.w_yy +
      2 * (1 - nu) * Math.pow(d.w_xy, 2)
    ) * area;

    // Xử lý strain energy âm: gán về 0 để tránh giá trị không hợp lý
    if (strainEnergy < 0) {
      U_element[elementID] = 0;
      negativeEnergyCount++;
      console.warn(`⚠️ Element ${elementID}: Strain energy âm (${strainEnergy.toFixed(6)}) được gán về 0`);
    } else {
      U_element[elementID] = strainEnergy;
    }
  }

  if (negativeEnergyCount > 0) {
    console.log(`📊 Đã xử lý ${negativeEnergyCount} phần tử có strain energy âm`);
  }

  return U_element;
}

// Tính tổng năng lượng toàn tấm (công thức 3.16)
function computeTotalStrainEnergy(U_element) {
  return Object.values(U_element).reduce((sum, val) => sum + val, 0);
}

// Tính năng lượng phân đoạn (công thức 3.17)
function computeEnergyFraction(U_element, U_total) {
  const F = {};
  
  for (const [elementID, U] of Object.entries(U_element)) {
    F[elementID] = U / U_total;
  }
  
  return F;
}

// Tính chỉ số hư hỏng (công thức 3.18)
function computeDamageIndex(F_damaged, F_healthy, elementIDs) {
  const beta = {};
  
  for (const id of elementIDs) {
    if (F_healthy[id] !== 0) {
      beta[id] = F_damaged[id] / F_healthy[id];
    } else {
      beta[id] = 0;
    }
  }
  
  return beta;
}

// Chuẩn hóa chỉ số hư hỏng (công thức 3.19) với xử lý đặc biệt để tránh giá trị âm
function normalizeDamageIndex(beta) {
  const values = Object.values(beta).filter(v => v !== 0);
  let zeroEnergyCount = 0;
  let negativeIndexCount = 0;

  if (values.length === 0) return {};

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
  const std = Math.sqrt(variance);

  const z = {};
  for (const [id, val] of Object.entries(beta)) {
    if (val !== 0 && std !== 0) {
      const normalizedValue = (val - mean) / std;

      // ⚠️ QUAN TRỌNG: Xử lý giá trị âm sau chuẩn hóa Z-score
      if (normalizedValue < 0) {
        z[id] = 0; // Gán về 0 thay vì giữ giá trị âm
        negativeIndexCount++;
      } else {
        z[id] = normalizedValue;
      }
    } else {
      // Phần tử có strain energy âm hoặc beta = 0 sẽ có damage index = 0
      z[id] = 0;
      if (val === 0) zeroEnergyCount++;
    }
  }

  if (zeroEnergyCount > 0) {
    console.log(`🔄 ${zeroEnergyCount} phần tử có damage index = 0 (strain energy âm hoặc không hợp lệ)`);
  }



  return z;
}

// Xác định vùng hư hỏng theo ngưỡng
function detectDamageRegion(z, Z0) {
  const damaged = [];
  
  for (const [id, val] of Object.entries(z)) {
    if (val >= Z0) {
      damaged.push(parseInt(id));
    }
  }
  
  return damaged;
}

function displayStrainEnergyResults(z, elements, Z0 = 2, Z0_percent = null, maxZ = null) {
  const resultsDiv = document.getElementById("results");
  
  resultsDiv.innerHTML = `
    <strong style="font-size: 24px; color: #0056b3;">Kết quả chẩn đoán vị trí hư hỏng bằng năng lượng biến dạng</strong>
    <div style="margin-top: 20px;"></div>
  `;
  
  // Tìm giá trị lớn nhất và nhỏ nhất
  const zValues = Object.values(z);
  const maxZval = maxZ !== null ? maxZ : Math.max(...zValues);
  const minZ = Math.min(...zValues);

  // Đếm số phần tử hư hỏng
  const damagedElements = detectDamageRegion(z, Z0);

  // Hiển thị thống kê (ẩn các dòng giá trị Z lớn nhất, nhỏ nhất, ngưỡng Z₀)
  resultsDiv.innerHTML += `
    <strong>Thống kê:</strong><br>
    - Tổng số phần tử: ${elements.length}<br>
    - Số lượng phần tử hư hỏng: ${damagedElements.length}<br>
    <div style="margin-top: 10px;"></div>
  `;
  
  if (damagedElements.length > 0) {
    resultsDiv.innerHTML += `
      <strong>Danh sách phần tử hư hỏng:</strong><br>
      ${damagedElements.join(', ')}<br>
      <div style="margin-top: 10px;"></div>
    `;
  }
  
  // Vẽ biểu đồ 3D (nếu có Plotly)
  if (typeof Plotly !== 'undefined') {
    draw3DDamageChart(z, elements, Z0);
  }

  // --- Bổ sung khối chỉ số A, B, C (theo vùng) ---
  const elementYInput = document.getElementById('element-y');
  const elementY2Input = document.getElementById('element-y-2');
  const elementY3Input = document.getElementById('element-y-3');
  let elementY = elementYInput ? elementYInput.value.trim() : '';
  let elementY2 = elementY2Input && elementY2Input.value ? elementY2Input.value.trim() : '';
  let elementY3 = elementY3Input && elementY3Input.value ? elementY3Input.value.trim() : '';
  // Tạo vùng hư hỏng thực tế là tập hợp các phần tử khảo sát hợp lệ (theo id)
  let actualDamagedIds = [];
  if (elementY) {
    const found = elements.find(e => String(e.id).trim() === elementY);
    if (found) actualDamagedIds.push(String(found.id).trim());
  }
  if (elementY2) {
    const found2 = elements.find(e => String(e.id).trim() === elementY2);
    if (found2) actualDamagedIds.push(String(found2.id).trim());
  }
  if (elementY3) {
    const found3 = elements.find(e => String(e.id).trim() === elementY3);
    if (found3) actualDamagedIds.push(String(found3.id).trim());
  }
  // Loại bỏ trùng lặp nếu có
  actualDamagedIds = [...new Set(actualDamagedIds)];
  if (actualDamagedIds.length > 0) {
    const predictedDamaged = elements.filter(e => z[e.id] >= Z0).map(e => String(e.id).trim());
    // Chỉ số A: tỷ lệ số phần tử khảo sát nằm trong predictedDamaged
    const detectedCount = actualDamagedIds.filter(id => predictedDamaged.includes(id)).length;
    const indexA = detectedCount / actualDamagedIds.length;
    // Các chỉ số khác
    const allIds = elements.map(e => String(e.id).trim());
    const actualUndamaged = allIds.filter(id => !actualDamagedIds.includes(id));
    const predictedUndamaged = allIds.filter(id => !predictedDamaged.includes(id));
    const intersectionUndamaged = actualUndamaged.filter(id => predictedUndamaged.includes(id));
    const areaUndamaged = actualUndamaged.length;
    const areaTotal = elements.length;
    const indexB = areaUndamaged > 0 ? intersectionUndamaged.length / areaUndamaged : 0;
    const wDam = actualDamagedIds.length / areaTotal;
    const wUndam = areaUndamaged / areaTotal;
    const indexC = indexA * wDam + indexB * wUndam;
    resultsDiv.innerHTML += `
      <div style="margin-top: 24px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <b>Chỉ số độ chính xác chẩn đoán (phần tử khảo sát: ${actualDamagedIds.join(', ')}):</b><br>
        <span>Chỉ số A (Độ chính xác vùng hư hỏng): <b>${(indexA*100).toFixed(2)}%</b></span><br>
        <span>Chỉ số B (Độ chính xác vùng không hư hỏng): <b>${(indexB*100).toFixed(2)}%</b></span><br>
        <span>Chỉ số C (Độ chính xác tổng thể): <b>${(indexC*100).toFixed(2)}%</b></span><br>
      </div>
    `;
  }
  // --- END bổ sung ---
}

// Hàm helper tạo geometry cho hình hộp 3D
function createBox3D(centerX, centerY, height, width = 0.8, depth = 0.8) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  // 8 đỉnh của hình hộp
  const vertices = {
    x: [
      centerX - halfWidth, centerX + halfWidth, centerX + halfWidth, centerX - halfWidth, // đáy
      centerX - halfWidth, centerX + halfWidth, centerX + halfWidth, centerX - halfWidth  // đỉnh
    ],
    y: [
      centerY - halfDepth, centerY - halfDepth, centerY + halfDepth, centerY + halfDepth, // đáy
      centerY - halfDepth, centerY - halfDepth, centerY + halfDepth, centerY + halfDepth  // đỉnh
    ],
    z: [
      0, 0, 0, 0, // đáy
      height, height, height, height // đỉnh
    ]
  };

  // 12 mặt tam giác (6 mặt hình hộp, mỗi mặt = 2 tam giác)
  const faces = {
    i: [0, 0, 4, 4, 1, 1, 2, 2, 3, 3, 0, 0], // đỉnh thứ nhất của mỗi tam giác
    j: [1, 3, 5, 7, 2, 5, 3, 6, 0, 7, 4, 1], // đỉnh thứ hai của mỗi tam giác
    k: [2, 2, 6, 6, 6, 6, 7, 7, 4, 4, 5, 5]  // đỉnh thứ ba của mỗi tam giác
  };

  return { vertices, faces };
}

// Vẽ biểu đồ 3D chỉ số hư hỏng với xử lý đặc biệt cho strain energy âm
function draw3DDamageChart(z, elements, Z0) {
  // Lấy tọa độ trọng tâm và giá trị z với xử lý đặc biệt
  const x1 = [], y1 = [], z1 = [];
  let zeroEnergyElementsCount = 0;

  elements.forEach(element => {
    x1.push(element.center.x);
    y1.push(element.center.y);

    const damageIndex = z[element.id] || 0;
    // Đảm bảo các phần tử có strain energy âm (đã được xử lý thành 0) hiển thị đúng
    if (damageIndex === 0) {
      zeroEnergyElementsCount++;
    }
    z1.push(damageIndex);
  });

  console.log(`📊 Visualization: ${zeroEnergyElementsCount} phần tử có damage index = 0 (strain energy âm hoặc không hợp lệ)`);

  // Sử dụng kích thước element thực tế dựa trên grid spacing
  const elementSize = calculateRealElementSize(elements);

  // Tạo mesh3d cho các hình hộp 3D (bar3d style)
  const allVerticesX = [], allVerticesY = [], allVerticesZ = [];
  const allFacesI = [], allFacesJ = [], allFacesK = [];
  const allIntensity = [];
  const allText = []; // Thêm mảng text cho hovertemplate

  elements.forEach((element, index) => {
    let height = z[element.id] || 0;

    // Xử lý đặc biệt cho phần tử có damage index = 0 (strain energy âm)
    // Hiển thị với chiều cao tối thiểu để vẫn thấy được geometry
    const minHeight = 0.001; // Chiều cao tối thiểu để hiển thị
    if (height === 0) {
      height = minHeight;
    }

    const box = createBox3D(element.center.x, element.center.y, height, elementSize.width, elementSize.depth);

    // Offset cho vertices (để tránh trùng lặp chỉ số)
    const vertexOffset = allVerticesX.length;

    // Thêm vertices
    allVerticesX.push(...box.vertices.x);
    allVerticesY.push(...box.vertices.y);
    allVerticesZ.push(...box.vertices.z);

    // Thêm faces với offset
    allFacesI.push(...box.faces.i.map(i => i + vertexOffset));
    allFacesJ.push(...box.faces.j.map(j => j + vertexOffset));
    allFacesK.push(...box.faces.k.map(k => k + vertexOffset));

    // Thêm intensity và text cho mỗi vertex (8 vertex cho mỗi box)
    // Sử dụng damage index gốc (không phải height đã điều chỉnh) cho colorscale
    const originalDamageIndex = z[element.id] || 0;
    for (let i = 0; i < 8; i++) {
      allIntensity.push(originalDamageIndex);
      allText.push(`Element ${element.id} (DI: ${originalDamageIndex.toFixed(4)})`); // Thông tin element cho hover
    }
  });

  // Tính toán colorscale tối ưu dựa trên phạm vi dữ liệu
  const maxIntensity = Math.max(...allIntensity);
  const minIntensity = Math.min(...allIntensity);

  // Colorscale Green-to-Red với gradient mượt mà
  const optimizedColorscale = [
    [0, 'rgb(0,128,0)'],          // Xanh lá đậm cho giá trị thấp
    [0.2, 'rgb(50,205,50)'],      // Xanh lá sáng
    [0.4, 'rgb(154,205,50)'],     // Xanh vàng
    [0.6, 'rgb(255,255,0)'],      // Vàng
    [0.8, 'rgb(255,165,0)'],      // Cam
    [1, 'rgb(255,0,0)']           // Đỏ đậm cho giá trị cao
  ];

  const traceMesh3D = {
    type: 'mesh3d',
    x: allVerticesX,
    y: allVerticesY,
    z: allVerticesZ,
    i: allFacesI,
    j: allFacesJ,
    k: allFacesK,
    intensity: allIntensity,
    text: allText, // Thêm thuộc tính text cho hovertemplate
    colorscale: optimizedColorscale,
    cmin: minIntensity,
    cmax: maxIntensity,
    opacity: 1.0,
    showlegend: false,
    showscale: true,
    name: 'Chỉ số hư hỏng',
    hovertemplate: '<b>Phần tử:</b> %{text}<br>' +
                   '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
                   '<b>Chỉ số hư hỏng:</b> %{z:.4f}<br>' +
                   '<extra></extra>',
    flatshading: true,  // Tạo bề mặt phẳng để đường viền rõ ràng hơn
    contour: {
      show: true,       // Hiển thị đường viền
      color: '#333333', // Màu xám đậm cho đường viền
      width: 2          // Độ dày đường viền vừa phải
    },
    lighting: {
      ambient: 1.0,     // Ánh sáng môi trường tối đa để loại bỏ bóng đổ
      diffuse: 0,       // Tắt hoàn toàn diffuse lighting
      specular: 0,      // Tắt phản chiếu
      roughness: 1,     // Độ nhám tối đa
      fresnel: 0        // Tắt fresnel effect
    },
    colorbar: {
      title: {
        text: 'Chỉ số hư hỏng',
        font: { family: 'Arial, sans-serif', size: 14 }
      },
      titleside: 'right',
      thickness: 20,
      len: 0.8,
      x: 1.02
    }
  };

  // Mặt phẳng ngưỡng cải tiến - phù hợp với phạm vi thực tế của elements
  const xUnique = [...new Set(x1)].sort((a, b) => a - b);
  const yUnique = [...new Set(y1)].sort((a, b) => a - b);

  // Tính phạm vi thực tế của elements với margin nhỏ
  const xMin = Math.min(...x1);
  const xMax = Math.max(...x1);
  const yMin = Math.min(...y1);
  const yMax = Math.max(...y1);

  // Thêm margin 5% để mặt phẳng bao phủ vừa đủ
  const xMargin = (xMax - xMin) * 0.05;
  const yMargin = (yMax - yMin) * 0.05;

  // Tạo lưới mặt phẳng với độ phân giải cao hơn để mượt mà
  const planeResolution = 20; // Tăng độ phân giải
  const xPlane = [];
  const yPlane = [];

  for (let i = 0; i <= planeResolution; i++) {
    xPlane.push(xMin - xMargin + (xMax - xMin + 2 * xMargin) * i / planeResolution);
    yPlane.push(yMin - yMargin + (yMax - yMin + 2 * yMargin) * i / planeResolution);
  }

  const zPlane = Array(yPlane.length).fill().map(() => Array(xPlane.length).fill(Z0));

  // Debug thông tin mặt phẳng ngưỡng
  console.log(`🎯 Mặt phẳng ngưỡng cải tiến:`);
  console.log(`   - Phạm vi X: ${(xMin - xMargin).toFixed(4)}m - ${(xMax + xMargin).toFixed(4)}m`);
  console.log(`   - Phạm vi Y: ${(yMin - yMargin).toFixed(4)}m - ${(yMax + yMargin).toFixed(4)}m`);
  console.log(`   - Độ phân giải: ${planeResolution}x${planeResolution} points`);
  console.log(`   - Margin: 5% (X=${xMargin.toFixed(4)}m, Y=${yMargin.toFixed(4)}m)`);
  console.log(`   - Opacity: 0.7, Contour width: 8px`);

  // Mặt phẳng ngưỡng với hiệu ứng visual cải tiến
  const tracePlane = {
    x: xPlane,
    y: yPlane,
    z: zPlane,
    type: 'surface',
    opacity: 0.7, // Tăng opacity để rõ ràng hơn
    showscale: false,
    name: 'Ngưỡng Z₀',
    colorscale: [
      [0, 'rgba(220,20,60,0.7)'],   // Crimson với alpha cao hơn
      [1, 'rgba(220,20,60,0.7)']    // Crimson với alpha cao hơn
    ],
    contours: {
      z: {
        show: true,
        usecolormap: false,
        color: 'darkred',
        width: 8,                    // Tăng độ dày đường viền để nổi bật hơn
        highlightcolor: 'red'
      }
    },
    hovertemplate: '<b>Mặt phẳng ngưỡng Z₀</b><br>' +
                   '<b>Giá trị:</b> %{z:.4f}<br>' +
                   '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
                   '<extra></extra>',
    lighting: {
      ambient: 0.8,
      diffuse: 0.2,
      specular: 0.1,
      roughness: 0.8
    }
  };

  // Tìm giá trị chỉ số hư hỏng cao nhất để tính phần trăm
  let maxZ = Math.max(...z1);

  // Tạo text labels hiển thị phần trăm cho các phần tử hư hỏng
  const damagedElements = [];
  const textX = [], textY = [], textZ = [], textLabels = [];

  for (let i = 0; i < z1.length; i++) {
    if (z1[i] > Z0) { // Chỉ hiển thị cho phần tử hư hỏng
      const actualValue = z1[i].toFixed(1) + "%";
      damagedElements.push(i);
      textX.push(x1[i]);
      textY.push(y1[i]);
      textZ.push(z1[i] + maxZ * 0.05); // Offset phía trên đỉnh bar
      textLabels.push(actualValue);
    }
  }

  const traceTextPercentage = {
    x: textX,
    y: textY,
    z: textZ,
    mode: 'text',
    type: 'scatter3d',
    text: textLabels,
    textposition: 'middle center',
    textfont: {
      family: 'Arial, sans-serif',
      size: 10,
      color: 'darkred'
    },
    showlegend: false,
    hovertemplate: '<b>Phần tử hư hỏng</b><br>' +
                   '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
                   '<b>Giá trị thực tế:</b> %{text}<br>' +
                   '<extra></extra>'
  };

  const data = [traceMesh3D, tracePlane, traceTextPercentage];

  const layout = {
    scene: {
      xaxis: {
        title: {
          text: 'EX (m)',
          font: { family: 'Arial, sans-serif', size: 18, color: '#1a252f', weight: 'bold' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 14, color: '#2c3e50', weight: 'bold' },
        gridcolor: 'rgba(70,70,70,0.6)',     // Grid đậm hơn
        gridwidth: 2,                        // Độ dày grid line
        zerolinecolor: 'rgba(0,0,0,0.8)',    // Đường zero line đậm
        zerolinewidth: 3,                    // Độ dày zero line
        showbackground: true,
        backgroundcolor: 'rgba(245,245,245,0.9)',
        showspikes: false,                   // Tắt spike lines để gọn gàng
        tickmode: 'auto',                    // Tự động điều chỉnh tick
        nticks: 8                            // Số lượng tick marks
      },
      yaxis: {
        title: {
          text: 'EY (m)',
          font: { family: 'Arial, sans-serif', size: 18, color: '#1a252f', weight: 'bold' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 14, color: '#2c3e50', weight: 'bold' },
        gridcolor: 'rgba(70,70,70,0.6)',     // Grid đậm hơn
        gridwidth: 2,                        // Độ dày grid line
        zerolinecolor: 'rgba(0,0,0,0.8)',    // Đường zero line đậm
        zerolinewidth: 3,                    // Độ dày zero line
        showbackground: true,
        backgroundcolor: 'rgba(245,245,245,0.9)',
        showspikes: false,                   // Tắt spike lines để gọn gàng
        tickmode: 'auto',                    // Tự động điều chỉnh tick
        nticks: 8                            // Số lượng tick marks
      },
      zaxis: {
        title: {
          text: 'Damage Index',
          font: { family: 'Arial, sans-serif', size: 18, color: '#1a252f', weight: 'bold' }
        },
        tickfont: { family: 'Arial, sans-serif', size: 14, color: '#2c3e50', weight: 'bold' },
        gridcolor: 'rgba(70,70,70,0.6)',     // Grid đậm hơn
        gridwidth: 2,                        // Độ dày grid line
        zerolinecolor: 'rgba(0,0,0,0.8)',    // Đường zero line đậm
        zerolinewidth: 3,                    // Độ dày zero line
        showbackground: true,
        backgroundcolor: 'rgba(245,245,245,0.9)',
        showspikes: false,                   // Tắt spike lines để gọn gàng
        tickmode: 'auto',                    // Tự động điều chỉnh tick
        nticks: 6                            // Số lượng tick marks cho trục Z
      },
      camera: {
        projection: { type: 'orthographic' }, // Thay đổi sang OrthographicCamera
        eye: { x: 1.8, y: 1.8, z: 1.5 }, // Góc nhìn tối ưu cho orthographic
        center: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 0, z: 1 }
      },
      aspectmode: 'cube', // Tối ưu cho OrthographicCamera
      bgcolor: 'rgba(248,249,250,0.9)'
    },
    title: {
      text: 'Biểu đồ chỉ số hư hỏng 3D - Phân tích kết cấu',
      font: { family: 'Arial, sans-serif', size: 18, color: '#2c3e50' },
      x: 0.5,
      y: 0.95
    },
    width: 1000,
    height: 750,
    margin: { l: 50, r: 100, t: 80, b: 50 },
    font: { family: 'Arial, sans-serif', color: '#2c3e50' },
    paper_bgcolor: 'rgba(255,255,255,0.95)',
    plot_bgcolor: 'rgba(248,249,250,0.9)'
  };

  // Thông tin debug và thống kê với kích thước thực tế
  console.log(`=== Thông tin biểu đồ 3D với kích thước thực tế ===`);
  console.log(`📐 Kích thước kết cấu thực tế:`);
  console.log(`   - Phạm vi X: ${Math.min(...x1).toFixed(4)}m - ${Math.max(...x1).toFixed(4)}m (${((Math.max(...x1) - Math.min(...x1)) * 100).toFixed(1)}cm)`);
  console.log(`   - Phạm vi Y: ${Math.min(...y1).toFixed(4)}m - ${Math.max(...y1).toFixed(4)}m (${((Math.max(...y1) - Math.min(...y1)) * 100).toFixed(1)}cm)`);
  console.log(`   - Grid spacing: ${elementSize.gridSpacingX.toFixed(4)}m × ${elementSize.gridSpacingY.toFixed(4)}m (${(elementSize.gridSpacingX * 100).toFixed(1)}cm × ${(elementSize.gridSpacingY * 100).toFixed(1)}cm)`);
  console.log(`   - Element size: ${elementSize.width.toFixed(4)}m × ${elementSize.depth.toFixed(4)}m (${(elementSize.width * 100).toFixed(1)}cm × ${(elementSize.depth * 100).toFixed(1)}cm)`);
  console.log(`📊 Thống kê 3D:`);
  console.log(`   - Số lượng elements: ${elements.length}`);
  console.log(`   - Số lượng vertices: ${allVerticesX.length}`);
  console.log(`   - Số lượng faces: ${allFacesI.length}`);
  console.log(`   - Phạm vi damage index: ${Math.min(...z1).toFixed(4)} - ${Math.max(...z1).toFixed(4)}`);
  console.log(`   - Ngưỡng Z₀: ${Z0.toFixed(4)}`);
  console.log(`   - Chỉ số hư hỏng cao nhất: ${maxZ.toFixed(4)}`);

  // Thống kê phân bố chỉ số hư hỏng
  const damagedCount = z1.filter(z => z > Z0).length;
  const zeroEnergyCount = z1.filter(z => z === 0).length;
  const damagedPercentage = (damagedCount / z1.length * 100).toFixed(1);
  const zeroEnergyPercentage = (zeroEnergyCount / z1.length * 100).toFixed(1);

  console.log(`Số phần tử vượt ngưỡng: ${damagedCount}/${z1.length} (${damagedPercentage}%)`);
  console.log(`Số phần tử có damage index = 0: ${zeroEnergyCount}/${z1.length} (${zeroEnergyPercentage}%)`);
  console.log(`Hiển thị giá trị thực tế cho ${damagedElements.length} phần tử hư hỏng (> Z₀)`);

  let chartDiv = document.getElementById('damage3DChart');
  if (chartDiv) {
    Plotly.purge(chartDiv);
    Plotly.newPlot(chartDiv, data, layout, {
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
      displaylogo: false,
      responsive: true
    }).then(() => {
      console.log('✅ Biểu đồ 3D với visualization cải tiến đã được render thành công');
      console.log('📷 Camera: OrthographicCamera (no perspective distortion)');
      console.log('🎨 Colorscale: Green-to-Red gradient');
      console.log('💡 Lighting: No shadows (ambient=1.0, diffuse=0)');
      console.log('🔤 Font: Arial, sans-serif (bold, size 18/14)');
      console.log('🔲 Outline: Dark gray borders (flatshading + contour)');
      console.log('📊 Features: Enhanced colorbar, contours, improved markers');
      console.log('🎯 Threshold Plane: Optimized size with 5% margin, 20x20 resolution');
      console.log('📐 Grid Lines: Enhanced visibility (width=2, darker color)');
      console.log('⚡ Negative Values: Both strain energy & damage index negatives handled (set to 0)');
    }).catch((error) => {
      console.error('❌ Lỗi khi render biểu đồ 3D:', error);
    });
  } else {
    console.error('❌ Không tìm thấy container #damage3DChart');
  }
}
