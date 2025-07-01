function processFilestrain() {
  const input = document.getElementById("folder-input");
  const modeNumber = parseInt(document.getElementById("mode-number").value);
  const trainValue = parseFloat(document.getElementById("train-value").value);
  const stepValue = parseFloat(document.getElementById("step-value").value);
  const elementY = parseInt(document.getElementById("element-y").value);

  let fileList = Array.from(input.files).filter((file) =>
    /^TrainingCases1_Result_\d+(\.txt)?$/i.test(file.name)
  );

  fileList.sort((a, b) => {
    const numA = parseInt(a.name.match(/(\d+)(?=\.txt?$)/)[0]);
    const numB = parseInt(b.name.match(/(\d+)(?=\.txt?$)/)[0]);
    return numA - numB;
  });

  let dataMatrix = [];
  let nodeOrder = [];
  let caseIndex = 0;
  let modeDataList = [];

  if (fileList.length === 0) {
    alert("Không tìm thấy file TrainingCases hợp lệ trong thư mục!");
    return;
  }

  let filePromises = fileList.map((file) => {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = function (event) {
        let lines = event.target.result.split("\n");
        let modeData = {};
        lines.forEach((line) => {
          let parts = line.trim().split(/\s+/);
          if (parts.length === 3) {
            let node = parts[0];
            let mode = parseInt(parts[1]);
            let value = parseFloat(parts[2].replace(",", "."));
            if (mode === modeNumber) {
              modeData[node] = value;
              if (!nodeOrder.includes(node)) {
                nodeOrder.push(node);
              }
            }
          }
        });
        modeDataList.push(modeData);
        resolve();
      };
      reader.readAsText(file);
    });
  });

  Promise.all(filePromises).then(() => {
    let currentDiValue = 0;

    modeDataList.forEach((modeData) => {
      let row = [caseIndex++];

      nodeOrder.forEach((node) => {
        row.push(modeData[node] !== undefined ? modeData[node] : 0);
      });

      let diArray = new Array(10).fill(0);
      diArray[elementY - 1] = currentDiValue;
      row.push(...diArray);
      dataMatrix.push(row);

      currentDiValue += stepValue / 100;
      if (currentDiValue > 0.5) {
        currentDiValue = 0.05;
      }
    });

    exportToCSV(
      dataMatrix,
      [
        "Case",
        ...nodeOrder.map((_, i) => "U" + (i + 1)),
        ...Array(10)
          .fill()
          .map((_, i) => "DI" + (i + 1)),
      ],
      "TRAIN.csv"
    );
  });
}

function exportToCSV(data, headers, filename) {
  let csvContent = headers.join(",") + "\n";
  csvContent += data.map((row) => row.join(",")).join("\n");
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let link = document.createElement("a");
  let url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function processFileTest() {
  const fileInput = document.getElementById("fileInputTest");
  const mode = document.getElementById("mode-number").value.trim();

  if (!fileInput || !fileInput.files.length) {
    alert("Vui lòng chọn file TEST.txt");
    return;
  }
  if (!mode || isNaN(mode)) {
    alert("Vui lòng nhập Mode hợp lệ!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const lines = event.target.result.split("\n");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length === 3) {
        const modeStr = parts[1].trim();
        if (modeStr === mode) {
          data.push(parts[2].replace(",", "."));
        }
      }
    }

    if (data.length === 0) {
      alert("Không có dữ liệu phù hợp với Mode đã nhập!");
      return;
    }

    const header =
      "Case,U1,U2,U3,U4,U5,U6,U7,U8,U9,U10,U11,DI1,DI2,DI3,DI4,DI5,DI6,DI7,DI8,DI9,DI10\n";
    const row = "0," + data.join(",") + ",0,0,0.3,0,0,0,0,0,0,0\n";
    const csvContent = header + row;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TEST.csv";
    link.click();
  };

  reader.readAsText(file);
}

function trainAndPredict() {
  trainModel();
  setTimeout(() => {
    predict();
  }, 10000);
}
