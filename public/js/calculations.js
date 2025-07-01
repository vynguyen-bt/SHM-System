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
