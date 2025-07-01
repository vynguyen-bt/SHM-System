let curvaturesDifference = [];
let deltaX, maxCurvature;
let projectionLengths = [];
let chartInstance = null;

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

      if (chartInstance) {
        chartInstance.destroy();
      }

      const xLabels = Array.from(
        { length: curvaturesDifference.length },
        (_, i) => (i * deltaX).toFixed(2)
      );
      var ctx = document.getElementById("curvatureChart").getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: xLabels,
          datasets: [
            {
              label: "Z(i)",
              data: curvaturesDifference,
              borderColor: "rgba(61, 133, 204,1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: "Chiều dài dầm (m)",
                font: {
                  family: "Times New Roman",
                  size: 17,
                  weight: "normal",
                },
                color: "black",
              },
              ticks: {
                font: {
                  family: "Times New Roman",
                  size: 16,
                  weight: "normal",
                },
                color: "black",
              },
            },
            y: {
              title: {
                display: true,
                text: "Z(i)",
                font: {
                  size: 17,
                  weight: "normal",
                },
                color: "black",
              },
              ticks: {
                font: {
                  size: 16,
                },
                color: "black",
              },
              beginAtZero: true,
            },
          },
          plugins: {
            annotation: {
              annotations: {
                ...[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].reduce(
                  (annotations, multiplier, index) => {
                    const yValue = multiplier * maxCurvature;
                    const colors = [
                      "rgba(75, 192, 192, 1)",
                      "rgba(255, 159, 64, 1)",
                      "rgba(153, 102, 255, 1)",
                      "rgba(255, 99, 132, 1)",
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 205, 86, 1)",
                      "rgba(153, 204, 255, 1)",
                    ];
                    annotations[`line-${multiplier}`] = {
                      type: "line",
                      yMin: yValue,
                      yMax: yValue,
                      borderColor: colors[index],
                      borderWidth: 2,
                      borderDash: [5, 5],
                      label: {
                        content: `${(multiplier * 100).toFixed(0)}% Zmax`,
                        enabled: true,
                        position: "top",
                        font: {
                          size: 18,
                          weight: "bold",
                        },
                        backgroundColor: colors[index],
                        color: "white",
                        padding: { top: 5, left: 10, right: 10, bottom: 5 },
                        xAdjust: 360,
                        yAdjust: -20,
                      },
                    };
                    return annotations;
                  },
                  {}
                ),
              },
            },
          },
          layout: {
            padding: {
              right: 140,
            },
          },
        },
      });

      calculateAllIndexes();
    });
  });
}
