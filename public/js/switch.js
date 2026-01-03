function switchToPartA() {
  var partA = document.getElementById("partA");
  partA.style.display = partA.style.display === "block" ? "none" : "block";
}


function switchToPartB1() {
  var partB1 = document.getElementById("partB1");
  partB1.style.display = partB1.style.display === "block" ? "none" : "block";
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
  // ✅ Ẩn các mục khác, nhưng để Mục 1 (partA) hiển thị sẵn
  const elementsToHide = ["partB1"]; // Chỉ ẩn partB1 nếu có

  elementsToHide.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element && element.style) {
      element.style.display = "none";
    }
  });

  // ✅ Hiển thị sẵn Mục 1
  const partA = document.getElementById("partA");
  if (partA && partA.style) {
    partA.style.display = "block";
  }

  // ✅ Khóa giá trị mặc định: Z0 = 40% và phần tử khảo sát 1 = 55
  try {
    const sel = document.getElementById('curvature-multiplier');
    if (sel) sel.value = '40';
    const inp = document.getElementById('element-y');
    if (inp) inp.value = '55';
  } catch (e) { /* no-op */ }
};
