let dataLines = [];

document
  .getElementById("folder-input")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    let fileMap = {};

    for (let file of files) {
      fileMap[file.name] = file;
    }

    let missingFiles = [];

    if (fileMap["SElement.txt"]) {
      loadFile(fileMap["SElement.txt"], "txt-file-delta-x");
    } else {
      missingFiles.push("SElement.txt");
    }

    if (fileMap["Healthy.txt"]) {
      loadFile(fileMap["Healthy.txt"], "txt-file-non-damaged");
    } else {
      missingFiles.push("Healthy.txt");
    }

    if (fileMap["Damage.txt"]) {
      loadFile(fileMap["Damage.txt"], "txt-file-damaged");
    } else {
      missingFiles.push("Damage.txt");
    }

    if (fileMap["TEST.txt"]) {
      loadFile(fileMap["TEST.txt"], "fileInputTest");
    } else {
      missingFiles.push("TEST.txt");
    }

    if (fileMap["TRAIN.csv"]) {
      loadFile(fileMap["TRAIN.csv"], "trainFile");
    } else {
      missingFiles.push("TRAIN.csv");
    }

    if (fileMap["TEST.csv"]) {
      loadFile(fileMap["TEST.csv"], "testFile");
    } else {
      missingFiles.push("TEST.csv");
    }

    let trainFiles = Object.keys(fileMap).filter((name) =>
      /TRAIN\d+\.txt$/i.test(name)
    );
    if (trainFiles.length === 0) {
      missingFiles.push("TRAIN.txt files");
    } else {
      loadTrainFiles(trainFiles);
    }
  });

function loadFile(file, inputId) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const input = document.getElementById(inputId);
    if (!input) {
      alert("Lỗi: Không tìm thấy phần tử đầu vào cho " + inputId);
      return;
    }
    const dataTransfer = new DataTransfer();
    const newFile = new File([file], file.name, { type: file.type });
    dataTransfer.items.add(newFile);
    input.files = dataTransfer.files;

    if (inputId === "txt-file-delta-x") {
      readDeltaX();
      readDeltaX2();
    }
  };
  reader.onerror = function () {
    alert("Lỗi khi đọc tệp " + file.name);
  };
  reader.readAsText(file);
}

function readDeltaX() {
  const fileInput = document.getElementById("txt-file-delta-x");
  if (!fileInput.files[0]) {
    alert("Vui lòng tải lên tệp TXT chứa chiều dài phần tử!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    const lines = event.target.result.trim().split("\n");
    if (lines.length > 0) {
      const lastColumnValue = lines[0].trim().split(/\s+/).pop();
      deltaX = parseFloat(lastColumnValue.replace(",", "."));
    }
  };
  reader.readAsText(fileInput.files[0]);
}

function readDeltaX2() {
  const inputFile = document.getElementById("txt-file-delta-x");
  const file = inputFile.files[0];
  if (!file) {
    alert("Vui lòng chọn tệp để đọc!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const fileContent = event.target.result;
    dataLines = fileContent
      .split("\n")
      .map((line) => line.trim().split(/\s+/))
      .filter((line) => line.length >= 4)
      .map((line) => {
        line[3] = line[3].replace(",", ".");
        return line;
      });
  };
  reader.onerror = function () {
    alert("Lỗi khi đọc tệp SElement.txt");
  };
  reader.readAsText(file);
}

function exportValue() {
  const index1 = parseInt(document.getElementById("survey-index").value);
  const damageValue1 = document.getElementById("damage-value").value;
  const index2 = parseInt(document.getElementById("survey-index2").value);
  const damageValue2 = document.getElementById("damage-value2").value;

  if (isNaN(index1)) {
    alert("Phần tử khảo sát 1 không hợp lệ! Giá trị nhập vào không phải số.");
    return;
  }
  if (index1 < 1 || index1 > dataLines.length) {
    alert(`Phần tử khảo sát 1 phải nằm trong khoảng 1 đến ${dataLines.length}`);
    return;
  }
  if (
    damageValue1 === "" ||
    isNaN(damageValue1) ||
    damageValue1 < 0 ||
    damageValue1 > 100
  ) {
    alert("Vui lòng nhập mức độ hư hỏng hợp lệ cho phần tử 1 (từ 0 đến 100)!");
    return;
  }

  let value = `${dataLines[index1 - 1][0]} ${damageValue1}`;

  if (
    !isNaN(index2) &&
    index2 >= 1 &&
    index2 <= dataLines.length &&
    damageValue2 !== "" &&
    !isNaN(damageValue2) &&
    damageValue2 >= 0 &&
    damageValue2 <= 100
  ) {
    value += ` ${dataLines[index2 - 1][0]} ${damageValue2}`;
  }

  const blob = new Blob([value], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Simulation.txt";
  link.click();
}

document
  .getElementById("txt-file-delta-x")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      dataLines = e.target.result
        .trim()
        .split("\n")
        .map((line) => line.trim().split(/\s+/));
    };
    reader.readAsText(file);
  });
