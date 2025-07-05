let curvaturesDifference = [];
let deltaX, maxCurvature;
let projectionLengths = [];
// Đã bỏ chartInstance vì không còn vẽ biểu đồ hiệu độ cong

function processData() {
  const fileInputNonDamaged = document.getElementById("txt-file-non-damaged");
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const modeNumberInput = document.getElementById("mode-number");
  const resultsDiv = document.getElementById("results");

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

      // Bỏ phần vẽ biểu đồ hiệu độ cong
      calculateAllIndexes();
    });
  });
}
