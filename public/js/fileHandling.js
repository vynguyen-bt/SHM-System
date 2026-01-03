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

    if (fileMap["Simulation.txt"]) {
      loadFile(fileMap["Simulation.txt"], "txt-file-simulation");
    } else {
      missingFiles.push("Simulation.txt");
    }

    // ✅ REMOVED: TEST.txt dependency - Section 2 now uses Damage.txt
    // TEST.txt is no longer needed as Section 2 uses Damage.txt directly
    console.log('ℹ️ TEST.txt not required - Section 2 uses Damage.txt from Section 1');

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

    // ✅ Gọi cập nhật dropdown Mode ngay sau khi gán file vào input
    if (typeof window.scheduleUpdateModeDropdown === 'function' &&
        (inputId === 'txt-file-non-damaged' || inputId === 'txt-file-damaged')) {
      window.scheduleUpdateModeDropdown();
    }

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
    
    // Parse SElement.txt với định dạng mới (tọa độ node)
    if (typeof parseSElementFile === 'undefined') {
      console.error('❌ parseSElementFile function not found. Make sure calculations.js is loaded first.');
      alert('Error: parseSElementFile function not found. Please refresh the page.');
      return;
    }
    const { nodes, elements } = parseSElementFile(fileContent);
    
    // Lưu thông tin lưới toàn cục
    window.meshData = {
      nodes: nodes,
      elements: elements,
      dx: 0.01, // Bước lưới theo X
      dy: 0.01  // Bước lưới theo Y
    };
    
    // Cập nhật dataLines cho tương thích với code cũ
    dataLines = elements.map(element => [
      element.id.toString(),
      element.nodes[0].toString(),
      element.nodes[1].toString(),
      element.nodes[2].toString(),
      element.nodes[3].toString()
    ]);
    
    console.log(`Đã đọc ${nodes.length} node và tạo ${elements.length} phần tử`);
  };
  reader.onerror = function () {
    alert("Lỗi khi đọc tệp SElement.txt");
  };
  reader.readAsText(file);
}

function exportValue() {
  console.log('🚀 === SECTION 0: EXPORTING SIMULATION DATA (NEW FORMAT) ===');

  // Get input values
  const index1 = parseInt(document.getElementById("survey-index").value);
  const damageValue1 = parseFloat(document.getElementById("damage-value").value);
  const index2 = parseInt(document.getElementById("survey-index2").value);
  const damageValue2 = parseFloat(document.getElementById("damage-value2").value);
  const index3 = parseInt(document.getElementById("survey-index3").value);
  const damageValue3 = parseFloat(document.getElementById("damage-value3").value);

  console.log(`📊 Input values: Element1=${index1}, Damage1=${damageValue1}%, Element2=${index2}, Damage2=${damageValue2}%, Element3=${index3}, Damage3=${damageValue3}%`);

  // Validation for Element 1 (required)
  if (isNaN(index1)) {
    alert("Phần tử khảo sát 1 không hợp lệ! Giá trị nhập vào không phải số.");
    return;
  }
  if (index1 < 1 || (dataLines.length > 0 && index1 > dataLines.length)) {
    alert(`Phần tử khảo sát 1 phải nằm trong khoảng 1 đến ${dataLines.length || 'N/A'}`);
    return;
  }
  if (
    isNaN(damageValue1) ||
    damageValue1 < 0 ||
    damageValue1 > 100 ||
    !Number.isInteger(damageValue1)
  ) {
    alert("Vui lòng nhập mức độ hư hỏng hợp lệ cho phần tử 1 (số nguyên từ 0 đến 100)!");
    return;
  }

  // Helper function to format damage level to 2 digits
  function formatDamageLevel(damage) {
    return damage.toString().padStart(2, '0');
  }

  // Helper function to get element ID
  function getElementId(index) {
    if (dataLines.length > 0 && index <= dataLines.length) {
      return dataLines[index - 1][0];
    }
    return index; // Fallback to use index as ID if no dataLines
  }

  // Build output content in new format
  let outputLines = [];

  // Element 1 (required)
  const elementId1 = getElementId(index1);
  const formattedDamage1 = formatDamageLevel(damageValue1);
  outputLines.push(`ID: ${elementId1}`);
  outputLines.push(`MATERIAL: CONCRETE_DI_${formattedDamage1}`);

  console.log(`✅ Element 1: ID=${elementId1}, MATERIAL=CONCRETE_DI_${formattedDamage1}`);

  // Element 2 (optional)
  if (
    !isNaN(index2) &&
    index2 >= 1 &&
    (dataLines.length === 0 || index2 <= dataLines.length) &&
    !isNaN(damageValue2) &&
    damageValue2 >= 0 &&
    damageValue2 <= 100 &&
    Number.isInteger(damageValue2)
  ) {
    const elementId2 = getElementId(index2);
    const formattedDamage2 = formatDamageLevel(damageValue2);
    outputLines.push(`ID: ${elementId2}`);
    outputLines.push(`MATERIAL: CONCRETE_DI_${formattedDamage2}`);

    console.log(`✅ Element 2: ID=${elementId2}, MATERIAL=CONCRETE_DI_${formattedDamage2}`);
  }

  // Element 3 (optional)
  if (
    !isNaN(index3) &&
    index3 >= 1 &&
    (dataLines.length === 0 || index3 <= dataLines.length) &&
    !isNaN(damageValue3) &&
    damageValue3 >= 0 &&
    damageValue3 <= 100 &&
    Number.isInteger(damageValue3)
  ) {
    const elementId3 = getElementId(index3);
    const formattedDamage3 = formatDamageLevel(damageValue3);
    outputLines.push(`ID: ${elementId3}`);
    outputLines.push(`MATERIAL: CONCRETE_DI_${formattedDamage3}`);

    console.log(`✅ Element 3: ID=${elementId3}, MATERIAL=CONCRETE_DI_${formattedDamage3}`);
  }

  // Join all lines with newlines
  const outputContent = outputLines.join('\n');

  console.log('📄 Final output content:');
  console.log(outputContent);
  console.log(`📊 Total elements exported: ${outputLines.length / 2}`);

  // Create and download file
  const blob = new Blob([outputContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Simulation.txt";
  link.click();

  console.log('✅ Simulation.txt exported successfully with new format!');
  alert(`Đã xuất thành công ${outputLines.length / 2} phần tử mô phỏng vào file Simulation.txt với format mới!`);
}

// TEST FUNCTION: Test new export format for Section 0
function testSection0NewFormat() {
  console.log('🧪 === TESTING SECTION 0 NEW EXPORT FORMAT ===');

  // Test scenarios
  const testCases = [
    {
      name: 'Single Element',
      elementId: 2083,
      damageLevel: 5,
      expected: 'ID: 2083\nMATERIAL: CONCRETE_DI_05'
    },
    {
      name: 'Two Elements',
      elements: [
        { id: 2083, damage: 5 },
        { id: 2084, damage: 12 }
      ],
      expected: 'ID: 2083\nMATERIAL: CONCRETE_DI_05\nID: 2084\nMATERIAL: CONCRETE_DI_12'
    },
    {
      name: 'Three Elements',
      elements: [
        { id: 2083, damage: 5 },
        { id: 2084, damage: 12 },
        { id: 2085, damage: 25 }
      ],
      expected: 'ID: 2083\nMATERIAL: CONCRETE_DI_05\nID: 2084\nMATERIAL: CONCRETE_DI_12\nID: 2085\nMATERIAL: CONCRETE_DI_25'
    }
  ];

  // Test damage level formatting
  console.log('📊 Testing damage level formatting:');
  const testDamages = [0, 5, 10, 15, 25, 50, 100];
  testDamages.forEach(damage => {
    const formatted = damage.toString().padStart(2, '0');
    console.log(`   ${damage}% → CONCRETE_DI_${formatted}`);
  });

  // Test validation logic
  console.log('\n🔍 Testing validation logic:');
  const validationTests = [
    { damage: 5.5, valid: false, reason: 'Not integer' },
    { damage: -1, valid: false, reason: 'Below 0' },
    { damage: 101, valid: false, reason: 'Above 100' },
    { damage: 0, valid: true, reason: 'Valid minimum' },
    { damage: 100, valid: true, reason: 'Valid maximum' },
    { damage: 25, valid: true, reason: 'Valid middle value' }
  ];

  validationTests.forEach(test => {
    const isValid = !isNaN(test.damage) &&
                   test.damage >= 0 &&
                   test.damage <= 100 &&
                   Number.isInteger(test.damage);
    const status = isValid === test.valid ? '✅' : '❌';
    console.log(`   ${status} ${test.damage}% → ${test.reason}`);
  });

  console.log('\n🎯 Expected output examples:');
  console.log('Example 1 (Element 2083, 5% damage):');
  console.log('ID: 2083');
  console.log('MATERIAL: CONCRETE_DI_05');

  console.log('\nExample 2 (Two elements):');
  console.log('ID: 2083');
  console.log('MATERIAL: CONCRETE_DI_05');
  console.log('ID: 2084');
  console.log('MATERIAL: CONCRETE_DI_12');

  console.log('\n✅ Section 0 new format testing completed!');
  console.log('📋 Key features:');
  console.log('- ID: [ElementID] format');
  console.log('- MATERIAL: CONCRETE_DI_[XX] format');
  console.log('- 2-digit damage level padding');
  console.log('- Integer validation (0-100)');
  console.log('- Support for 1-3 elements');

  return testCases;
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
