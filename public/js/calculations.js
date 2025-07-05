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

  if (avgIndexA3 !== null) {
    resultsDiv.innerHTML += `<strong>Chỉ số A (Độ chính xác vùng hư hỏng):</strong> ${avgIndexA3.toFixed(
      2
    )}%<div style="margin-top: 10px;"></div>`;
  } else {
    if (indexA13 !== null) {
      resultsDiv.innerHTML += `<strong>Chỉ số A (Độ chính xác vùng hư hỏng):</strong> ${indexA13.toFixed(
        2
      )}%<div style="margin-top: 10px;"></div>`;
    }
    if (indexA23 !== null) {
      resultsDiv.innerHTML += `<strong>Chỉ số A 2:</strong> ${indexA23.toFixed(
        2
      )}%<br>`;
    }
  }
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
            elementY2Length +
            totalLowValueDamagedLength;
          const k2 = totalElementLength - deltaX * 2;
          indexBX = (k1 / k2) * 100;
        } else {
          const k1 =
            totalElementLength -
            totalDamagedLength -
            deltaX +
            elementYLength +
            totalLowValueDamagedLength;
          const k2 = totalElementLength - deltaX;
          indexBX = (k1 / k2) * 100;
        }

        resultsDiv.innerHTML += `<strong>Chỉ số B (Độ chính xác vùng không hư hỏng):</strong> 
                    <span style="color: green; font-weight: bold;">${indexBX.toFixed(
                      2
                    )}%</span>
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
      elementY2Length +
      totalLowValueDamagedLength;
    const k2 = totalElementLength - deltaX * 2;
    indexBX = (k1 / k2) * 100;
  } else {
    const k1 =
      totalElementLength -
      totalDamagedLength -
      deltaX +
      elementYLength +
      totalLowValueDamagedLength;
    const k2 = totalElementLength - deltaX;
    indexBX = (k1 / k2) * 100;
  }

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

  resultsDiv.innerHTML += `<strong>Chỉ số C (Độ chính xác tổng thể):</strong> 
        <span style="color: green; font-weight: bold;">${indexCX.toFixed(
          2
        )}%</span><br>`;
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
      window.strainEnergyResults = {
        z: z,
        beta: beta,
        elements: elements,
        Z0: Z0,
        Z0_percent: Z0_percent,
        maxZ: maxZ
      };
    };
    reader2.readAsText(fileInputDamaged.files[0]);
  };
  reader1.readAsText(fileInputNonDamaged.files[0]);
}

// Sửa lại hàm tính năng lượng biến dạng để nhận diện tích phần tử
function computeElementStrainEnergy(derivatives, nu = 0.3, area = 1) {
  const U_element = {};
  for (const [elementID, d] of Object.entries(derivatives)) {
    U_element[elementID] = (
      Math.pow(d.w_xx, 2) +
      Math.pow(d.w_yy, 2) +
      2 * nu * d.w_xx * d.w_yy +
      2 * (1 - nu) * Math.pow(d.w_xy, 2)
    ) * area;
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

// Chuẩn hóa chỉ số hư hỏng (công thức 3.19)
function normalizeDamageIndex(beta) {
  const values = Object.values(beta).filter(v => v !== 0);
  
  if (values.length === 0) return {};
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
  const std = Math.sqrt(variance);
  
  const z = {};
  for (const [id, val] of Object.entries(beta)) {
    if (val !== 0 && std !== 0) {
      z[id] = (val - mean) / std;
    } else {
      z[id] = 0;
    }
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
    <strong style="font-size: 24px; color: #0056b3;">Kết quả chẩn đoán hư hỏng bằng năng lượng biến dạng</strong>
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
  let elementY = elementYInput ? parseInt(elementYInput.value) : null;
  if (elementY && elementY >= 1 && elementY <= elements.length) {
    // Luôn so sánh id dưới dạng chuỗi đã trim để tránh lỗi kiểu dữ liệu hoặc ký tự lạ
    const actualDamagedId = String(elements[elementY - 1].id).trim();
    const predictedDamaged = elements.filter(e => z[e.id] >= Z0).map(e => String(e.id).trim());
    // Sửa lại chỉ số A: Nếu phần tử khảo sát nằm trong predictedDamaged thì A=1, ngược lại A=0
    const isDamagedDetected = predictedDamaged.includes(actualDamagedId);
    const indexA = isDamagedDetected ? 1 : 0;
    // Các chỉ số khác giữ nguyên
    const actualUndamaged = elements.map(e => String(e.id).trim()).filter(id => id !== actualDamagedId);
    const predictedUndamaged = elements.map(e => String(e.id).trim()).filter(id => !predictedDamaged.includes(id));
    const intersectionUndamaged = actualUndamaged.filter(id => predictedUndamaged.includes(id));
    const areaUndamaged = actualUndamaged.length;
    const areaTotal = elements.length;
    const indexB = areaUndamaged > 0 ? intersectionUndamaged.length / areaUndamaged : 0;
    const wDam = 1 / areaTotal;
    const wUndam = areaUndamaged / areaTotal;
    const indexC = indexA * wDam + indexB * wUndam;
    resultsDiv.innerHTML += `
      <div style="margin-top: 24px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <b>Chỉ số độ chính xác chẩn đoán (phần tử khảo sát: ${elementY}):</b><br>
        <span>Chỉ số A (Độ chính xác vùng hư hỏng): <b>${(indexA*100).toFixed(2)}%</b></span><br>
        <span>Chỉ số B (Độ chính xác vùng không hư hỏng): <b>${(indexB*100).toFixed(2)}%</b></span><br>
        <span>Chỉ số C (Độ chính xác tổng thể): <b>${(indexC*100).toFixed(2)}%</b></span><br>
      </div>
    `;
  }
  // --- END bổ sung ---
}

// Vẽ biểu đồ 3D chỉ số hư hỏng
function draw3DDamageChart(z, elements, Z0) {
  // Lấy tọa độ trọng tâm và giá trị z
  const x0 = [], y0 = [], z0 = [];
  const x1 = [], y1 = [], z1 = [];
  elements.forEach(element => {
    x0.push(element.center.x);
    y0.push(element.center.y);
    z0.push(0);
    x1.push(element.center.x);
    y1.push(element.center.y);
    z1.push(z[element.id] || 0);
  });

  // Tạo trace duy nhất cho tất cả cột (lines)
  const lineX = [], lineY = [], lineZ = [];
  for (let i = 0; i < x0.length; i++) {
    lineX.push(x0[i], x1[i], null);
    lineY.push(y0[i], y1[i], null);
    lineZ.push(z0[i], z1[i], null);
  }
  const traceLines = {
    x: lineX,
    y: lineY,
    z: lineZ,
    mode: 'lines',
    type: 'scatter3d',
    line: {
      color: 'rgba(50,50,200,0.85)',
      width: 10
    },
    showlegend: false
  };

  // Marker ở đỉnh cột
  const traceMarkers = {
    x: x1,
    y: y1,
    z: z1,
    mode: 'markers',
    type: 'scatter3d',
    marker: {
      size: 10,
      color: z1,
      colorscale: 'Viridis',
      opacity: 0.95
    },
    showlegend: false
  };

  // Mặt phẳng ngưỡng
  const xUnique = [...new Set(x1)].sort((a, b) => a - b);
  const yUnique = [...new Set(y1)].sort((a, b) => a - b);
  const zPlane = Array(yUnique.length).fill().map(() => Array(xUnique.length).fill(Z0));
  const tracePlane = {
    x: xUnique,
    y: yUnique,
    z: zPlane,
    type: 'surface',
    opacity: 0.4,
    showscale: false,
    name: 'Ngưỡng Z₀',
    colorscale: [[0, 'red'], [1, 'red']]
  };

  // Chú thích cột lớn nhất
  let maxIdx = 0, maxZ = z1[0];
  for (let i = 1; i < z1.length; i++) {
    if (z1[i] > maxZ) {
      maxZ = z1[i];
      maxIdx = i;
    }
  }
  const traceText = {
    x: [x1[maxIdx]],
    y: [y1[maxIdx]],
    z: [z1[maxIdx]],
    mode: 'text',
    type: 'scatter3d',
    text: ['Chỉ số hư hỏng lớn nhất'],
    textposition: 'top center',
    textfont: { color: 'blue', size: 16 },
    showlegend: false
  };

  const data = [traceLines, traceMarkers, tracePlane, traceText];

  const layout = {
    scene: {
      xaxis: { title: 'X (m)' },
      yaxis: { title: 'Y (m)' },
      zaxis: { title: 'Chỉ số hư hỏng' }
    },
    title: 'Biểu đồ chỉ số hư hỏng 3D dạng cột tối ưu hiệu suất',
    width: 800,
    height: 600
  };

  let chartDiv = document.getElementById('damage3DChart');
  if (chartDiv) {
    Plotly.purge(chartDiv);
    Plotly.newPlot(chartDiv, data, layout);
  }
}
