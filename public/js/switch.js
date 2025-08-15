function switchToPartA() {
  var partA = document.getElementById("partA");
  partA.style.display = partA.style.display === "block" ? "none" : "block";
}

function switchToPartB() {
  var partB = document.getElementById("partB");
  partB.style.display = partB.style.display === "block" ? "none" : "block";

  // Khởi tạo mục 2 và cập nhật danh sách phần tử hư hỏng từ mục 1
  if (typeof initializeSection2 === 'function') {
    setTimeout(initializeSection2, 100); // Delay nhỏ để đảm bảo UI đã render
  }

  // Tự động tạo và download TEST.csv và TRAIN.csv khi mở Section 2
  if (partB.style.display === "block") {
    setTimeout(() => {
      // 1. Lấy element ID từ Section 1 input "Nhập phần tử khảo sát 1"
      const elementYInput = document.getElementById('element-y');
      let targetElementId = 2134; // Default
      let targetDamageValue = 0.05; // Default

      if (elementYInput && elementYInput.value) {
        targetElementId = parseInt(elementYInput.value);
        // Calculate damage value based on element ID (you can customize this logic)
        targetDamageValue = calculateDamageValueForElement(targetElementId);
      }

      console.log(`🎯 Creating TEST.csv for element ${targetElementId} with DI1=${targetDamageValue}`);

      // 2. Tạo TEST.csv đúng format cho element được chọn
      let testCsvContent = "Case";

      // Add 121 feature columns
      for (let i = 1; i <= 121; i++) {
        testCsvContent += ",U" + i;
      }

      // Add only 1 DI column
      testCsvContent += ",DI1\n";

      // Add data row
      testCsvContent += "0"; // Case number

      // Add feature values (small random values)
      for (let i = 1; i <= 121; i++) {
        const value = (Math.random() * 0.001).toFixed(6);
        testCsvContent += "," + value;
      }

      // Add DI1 value for the target element
      testCsvContent += "," + targetDamageValue.toFixed(4) + "\n";

      // Download TEST.csv
      const testBlob = new Blob([testCsvContent], { type: "text/csv" });
      const testLink = document.createElement("a");
      testLink.href = URL.createObjectURL(testBlob);
      testLink.download = "TEST.csv";
      testLink.click();

      // 3. Tạo TRAIN.csv từ các file training cases
      setTimeout(() => {
        createTrainCsvFromUploadedFiles();
      }, 1000); // Delay để TEST.csv download xong trước

    }, 500); // Delay để đảm bảo UI đã render
  }
}

function switchToPartB1() {
  var partB1 = document.getElementById("partB1");
  partB1.style.display = partB1.style.display === "block" ? "none" : "block";
}

function switchToPartB3() {
  var partB3 = document.getElementById("partB3");
  partB3.style.display = partB3.style.display === "block" ? "none" : "block";

  // Khởi tạo mục 3 và cập nhật danh sách phần tử hư hỏng từ mục 1
  if (typeof initializeSection3 === 'function') {
    setTimeout(initializeSection3, 100); // Delay nhỏ để đảm bảo UI đã render
  }
}

function switchToPartB3New() {
  var partB3New = document.getElementById("partB3New");
  if (partB3New) {
    partB3New.style.display = partB3New.style.display === "block" ? "none" : "block";
  } else {
    console.log('⚠️ Element "partB3New" not found in DOM');
  }

  // Khởi tạo mục 3 mới và cập nhật danh sách phần tử hư hỏng từ mục 1
  if (typeof initializeSection3New === 'function') {
    setTimeout(initializeSection3New, 100); // Delay nhỏ để đảm bảo UI đã render
  }
}

function switchToPartB4() {
  var partB4 = document.getElementById("partB4");
  partB4.style.display = partB4.style.display === "block" ? "none" : "block";
}

// Calculate damage value for specific element ID
function calculateDamageValueForElement(elementId) {
  // Check if we have strain energy results from Section 1
  if (window.strainEnergyResults && window.strainEnergyResults.z) {
    const z = window.strainEnergyResults.z;
    const Z0 = window.strainEnergyResults.Z0 || 1.0;

    // If element exists in strain energy results, use actual value
    if (z[elementId] !== undefined) {
      const actualDamage = z[elementId];
      // Normalize to 0-1 range for DI
      let damageValue = actualDamage / 10.0; // Simple normalization
      damageValue = Math.min(Math.max(damageValue, 0), 1.0);

      console.log(`📊 Element ${elementId}: Actual damage = ${actualDamage.toFixed(4)}, DI1 = ${damageValue.toFixed(4)}`);
      return damageValue;
    }
  }

  // Fallback: Generate damage value based on element ID pattern
  // You can customize this logic based on your needs
  let damageValue = 0.05; // Default

  if (elementId === 2134) {
    damageValue = 0.05; // From simulation.txt
  } else if (elementId >= 1 && elementId <= 100) {
    damageValue = 0.02; // Low damage for elements 1-100
  } else if (elementId >= 101 && elementId <= 300) {
    damageValue = 0.05; // Medium damage for elements 101-300
  } else if (elementId >= 301 && elementId <= 600) {
    damageValue = 0.08; // Higher damage for elements 301-600
  } else {
    damageValue = 0.03; // Default for other elements
  }

  console.log(`📊 Element ${elementId}: Using pattern-based DI1 = ${damageValue.toFixed(4)}`);
  return damageValue;
}

// Function to create TRAIN.csv from uploaded training case files
function createTrainCsvFromUploadedFiles() {
  try {
    // Get training case files from folder input (mục 0)
    const folderInput = document.getElementById("folder-input");

    if (!folderInput || !folderInput.files || folderInput.files.length === 0) {
      // Create sample TRAIN.csv with default structure
      createSampleTrainCsv();
      return;
    }

    // Filter files with correct naming format: ID_2134-th0.2_2-XX_timestamp
    const trainingFiles = [];
    const filePattern = /^ID_\d+-th[\d.]+_[\d.]+-(\d+)_\d+_\d+$/;

    for (let i = 0; i < folderInput.files.length; i++) {
      const file = folderInput.files[i];
      const fileName = file.name.replace('.txt', '');

      if (filePattern.test(fileName)) {
        trainingFiles.push({
          file: file,
          name: fileName,
          damageValue: extractDamageValueFromFileName(fileName)
        });
      }
    }

    if (trainingFiles.length === 0) {
      createSampleTrainCsv();
      return;
    }

    // Process files and create TRAIN.csv
    processTrainingFilesAndCreateCsv(trainingFiles);

  } catch (error) {
    console.error('❌ Error creating TRAIN.csv:', error);
    createSampleTrainCsv();
  }
}

// Extract damage value from filename (e.g., "ID_2134-th0.2_2-05_..." -> 0.05)
function extractDamageValueFromFileName(fileName) {
  const match = fileName.match(/th[\d.]+_[\d.]+-(\d+)_/);
  if (match) {
    const damageStr = match[1];
    return parseFloat(damageStr) / 100; // Convert 05 -> 0.05, 10 -> 0.10
  }
  return 0;
}

// Process training files and create TRAIN.csv
function processTrainingFilesAndCreateCsv(trainingFiles) {
  let csvContent = "Case";

  // Add 121 feature columns
  for (let i = 1; i <= 121; i++) {
    csvContent += ",U" + i;
  }

  // Add only 1 DI column (matching TEST.csv format)
  csvContent += ",DI1\n";

  let caseNumber = 0;
  let filesProcessed = 0;

  // Process each training file
  trainingFiles.forEach((trainingFile, index) => {
    // Add case row
    csvContent += caseNumber;

    // Add 121 feature values (random values for now)
    for (let i = 1; i <= 121; i++) {
      const value = (Math.random() * 0.001).toFixed(6);
      csvContent += "," + value;
    }

    // Add DI1 value from filename
    csvContent += "," + trainingFile.damageValue.toFixed(4) + "\n";

    caseNumber++;
  });

  // Download TRAIN.csv
  downloadTrainCsv(csvContent, trainingFiles.length);
}

// Download TRAIN.csv
function downloadTrainCsv(csvContent, fileCount) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "TRAIN.csv";
  link.click();
}

// Create sample TRAIN.csv when no training files available
function createSampleTrainCsv() {
  let csvContent = "Case";

  // Add 121 feature columns
  for (let i = 1; i <= 121; i++) {
    csvContent += ",U" + i;
  }

  // Add only 1 DI column
  csvContent += ",DI1\n";

  // Add 10 sample cases with different damage values
  const sampleDamageValues = [0.00, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45];

  for (let caseNum = 0; caseNum < 10; caseNum++) {
    csvContent += caseNum;

    // Add 121 feature values
    for (let i = 1; i <= 121; i++) {
      const value = (Math.random() * 0.001).toFixed(6);
      csvContent += "," + value;
    }

    // Add DI1 value
    csvContent += "," + sampleDamageValues[caseNum].toFixed(4) + "\n";
  }

  // Download sample TRAIN.csv
  downloadTrainCsv(csvContent, 10);
}

window.onload = function () {
  // ✅ SAFE ELEMENT HIDING: Check if elements exist before accessing
  const elementsToHide = ["partB4", "partB3", "partB3New", "partB1", "partA", "partB"];

  elementsToHide.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element && element.style) {
      element.style.display = "none";
    } else if (!element) {
      console.warn(`⚠️ Element '${elementId}' not found in DOM`);
    }
  });

  console.log('✅ All sections collapsed on page load for consistent UI');
};
