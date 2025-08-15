// TRAIN.csv generator từ training case files

function parseTrainingCaseFileName(fileName) {
  console.log(`📊 Parsing training case file: ${fileName}`);
  
  // Parse format: ID_2134-th0.2_2-05_20250814_220218
  const match = fileName.match(/ID_(\d+)-th([\d.]+)_([\d.]+)-([\d]+)_(\d{8})_(\d{6})/);
  
  if (match) {
    const [, elementID, thickness1, thickness2, damageValue, date, time] = match;
    
    const parsedData = {
      elementID: parseInt(elementID),
      thickness1: parseFloat(thickness1),
      thickness2: parseFloat(thickness2),
      damageValue: parseInt(damageValue),
      diValue: parseFloat('0.' + damageValue.padStart(2, '0')), // 05 → 0.05, 10 → 0.10
      date: date,
      time: time,
      fileName: fileName
    };
    
    console.log(`   ✅ Parsed: Element ${parsedData.elementID}, DI = ${parsedData.diValue}`);
    return parsedData;
  } else {
    console.log(`   ❌ Failed to parse: ${fileName}`);
    return null;
  }
}

function getTrainingCaseFiles() {
  console.log('📊 === GETTING TRAINING CASE FILES ===');

  // Get all file inputs that might contain training cases
  const fileInputs = [
    document.getElementById("txt-file-training"),
    document.getElementById("txt-file-healthy"),
    document.getElementById("txt-file-damaged"),
    document.getElementById("txt-file-simulation")
  ];
  
  const trainingCases = [];
  
  // Check for training case files in various inputs
  fileInputs.forEach((input, index) => {
    if (input && input.files) {
      Array.from(input.files).forEach(file => {
        const parsedCase = parseTrainingCaseFileName(file.name);
        if (parsedCase) {
          parsedCase.fileObject = file;
          trainingCases.push(parsedCase);
        }
      });
    }
  });
  
  // Sort by damage value for consistent ordering
  trainingCases.sort((a, b) => a.damageValue - b.damageValue);
  
  console.log(`✅ Found ${trainingCases.length} training case files:`);
  trainingCases.forEach((tc, index) => {
    console.log(`   ${index + 1}. ${tc.fileName} → DI = ${tc.diValue}`);
  });
  
  return trainingCases;
}

async function generateTrainCsv() {
  console.log('🔧 === GENERATING TRAIN.CSV ===\n');
  
  // Get training case files
  const trainingCases = getTrainingCaseFiles();
  
  if (trainingCases.length === 0) {
    console.log('❌ No training case files found');
    alert('❌ Không tìm thấy training case files!\n\nCần files có format: ID_2134-th0.2_2-05_20250814_220218');
    return;
  }
  
  // Get damaged elements list for DI structure
  const damagedElements = getDamagedElementsList();

  if (!damagedElements || damagedElements.length === 0) {
    console.log('❌ No damaged elements found - run Section 1 first');
    alert('❌ Không tìm thấy damaged elements!\n\nVui lòng chạy Section 1 trước để xác định các phần tử hư hỏng.');
    return;
  }

  const numDamageIndices = damagedElements.length;

  console.log(`📊 Training cases: ${trainingCases.length}`);
  console.log(`📊 DI columns: ${numDamageIndices}`);
  
  // Get feature count from TEST.csv structure
  const featureCount = await getFeatureCountFromTestStructure();
  
  console.log(`📊 Features: ${featureCount}`);
  
  // Generate TRAIN.csv content
  const trainCsvContent = await createTrainCsvContent(trainingCases, damagedElements, featureCount);
  
  // Download TRAIN.csv
  const blob = new Blob([trainCsvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'TRAIN.csv';
  link.click();
  
  console.log('✅ TRAIN.csv generated and downloaded');
  
  // Show preview
  const lines = trainCsvContent.split('\n');
  console.log(`📊 TRAIN.csv preview: ${lines.length} lines`);
  console.log(`📊 Header: ${lines[0]}`);
  console.log(`📊 First case: ${lines[1].substring(0, 100)}...`);
  
  // Removed alert notification for TRAIN.csv generation
}

async function getFeatureCountFromTestStructure() {
  // Try to get feature count from existing TEST.csv structure
  try {
    const testCsv = await createTestCsvContent();
    const lines = testCsv.split('\n');
    const header = lines[0];
    const columns = header.split(',');
    
    const featureColumns = columns.filter(col => col.startsWith('U'));
    console.log(`📊 Feature count from TEST.csv structure: ${featureColumns.length}`);
    
    return featureColumns.length;
  } catch (error) {
    console.log('⚠️ Could not get feature count from TEST.csv, using default');
    return 121; // Default based on previous CSV
  }
}

async function createTrainCsvContent(trainingCases, damagedElements, featureCount) {
  console.log('🔧 Creating TRAIN.csv content...');

  // Validate inputs
  if (!trainingCases || !Array.isArray(trainingCases)) {
    console.log('❌ Invalid trainingCases parameter');
    return '';
  }

  if (!damagedElements || !Array.isArray(damagedElements)) {
    console.log('❌ Invalid damagedElements parameter');
    return '';
  }

  if (!featureCount || featureCount <= 0) {
    console.log('❌ Invalid featureCount parameter');
    return '';
  }

  const numDamageIndices = damagedElements.length;
  
  // Create header (same as TEST.csv)
  let csvContent = "Case";
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";
  
  // Generate training cases
  for (let caseIndex = 0; caseIndex < trainingCases.length; caseIndex++) {
    const trainingCase = trainingCases[caseIndex];
    
    console.log(`📊 Processing case ${caseIndex + 1}: ${trainingCase.fileName}`);
    
    // Add case number
    csvContent += caseIndex;
    
    // Add features (U1-UN)
    const features = await generateFeaturesForTrainingCase(trainingCase, featureCount);
    features.forEach(feature => {
      csvContent += "," + feature;
    });
    
    // Add DI values
    const diValues = generateDIValuesForTrainingCase(trainingCase, damagedElements);
    diValues.forEach(di => {
      csvContent += "," + di.toFixed(4);
    });
    
    csvContent += "\n";
  }
  
  console.log(`✅ Generated TRAIN.csv with ${trainingCases.length} training cases`);
  
  return csvContent;
}

async function generateFeaturesForTrainingCase(trainingCase, featureCount) {
  console.log(`   Generating ${featureCount} features for ${trainingCase.fileName}`);
  
  // Try to read the training case file for actual mode shape data
  try {
    const fileContent = await readTrainingCaseFile(trainingCase.fileObject);
    
    // If file contains mode shape data, parse it
    const modeUsed = window.strainEnergyResults?.modeUsed || 12;
    const damageData = parseModeShapeFile(fileContent, modeUsed);
    
    if (Object.keys(damageData).length > 0) {
      console.log(`   ✅ Using actual mode shape data from file`);
      
      // Sort nodes for correct mapping
      const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
      const features = [];
      
      for (let i = 0; i < featureCount; i++) {
        if (i < nodeIDs.length) {
          const nodeID = nodeIDs[i];
          const rawValue = damageData[nodeID] || 0;
          features.push(rawValue);
        } else {
          features.push(0);
        }
      }
      
      return features;
    }
  } catch (error) {
    console.log(`   ⚠️ Could not read file content, using synthetic features`);
  }
  
  // Fallback: Generate synthetic features based on damage level
  console.log(`   Using synthetic features based on damage level ${trainingCase.diValue}`);
  
  const features = [];
  const baseDamageLevel = trainingCase.diValue;
  
  for (let i = 0; i < featureCount; i++) {
    // Generate features that correlate with damage level
    let feature;
    
    if (i < 5) {
      // First 5 features have stronger correlation with damage
      const baseValue = (i === 0) ? 0.0003 : (i === 1) ? -0.0003 : 0.00001;
      feature = baseValue * (1 + baseDamageLevel * 10) + (Math.random() - 0.5) * 0.00001;
    } else {
      // Other features have smaller random variations
      feature = (Math.random() - 0.5) * 0.0001 * (1 + baseDamageLevel);
    }
    
    features.push(feature);
  }
  
  return features;
}

function generateDIValuesForTrainingCase(trainingCase, damagedElements) {
  // Validate inputs
  if (!trainingCase || !trainingCase.fileName) {
    console.log('   ❌ Invalid trainingCase parameter');
    return [0];
  }

  if (!damagedElements || !Array.isArray(damagedElements)) {
    console.log('   ❌ Invalid damagedElements parameter');
    return [0];
  }

  console.log(`   Generating DI values for ${trainingCase.fileName}`);

  const numDamageIndices = damagedElements.length;
  const diValues = new Array(numDamageIndices).fill(0);
  
  // Find which DI column corresponds to this training case's element
  const elementIndex = damagedElements.findIndex(elem => elem === trainingCase.elementID);
  
  if (elementIndex !== -1) {
    diValues[elementIndex] = trainingCase.diValue;
    console.log(`   ✅ Set DI${elementIndex + 1} = ${trainingCase.diValue} for Element ${trainingCase.elementID}`);
  } else {
    console.log(`   ⚠️ Element ${trainingCase.elementID} not in damaged elements list`);
    // Set first DI as fallback
    if (numDamageIndices > 0) {
      diValues[0] = trainingCase.diValue;
      console.log(`   ⚠️ Fallback: Set DI1 = ${trainingCase.diValue}`);
    }
  }
  
  return diValues;
}

function readTrainingCaseFile(fileObject) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(fileObject);
  });
}

function createTrainCsvInterface() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    max-height: 700px;
    background: white;
    border: 2px solid #28a745;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #28a745; text-align: center;">
      🔧 TRAIN.csv Generator
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">📋 Training Case Format:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #155724;">
        ID_2134-th0.2_2-00_20250814_220007<br>
        ID_2134-th0.2_2-05_20250814_220218<br>
        ID_2134-th0.2_2-10_20250814_220345<br>
        <strong>Format: ID_[element]-th[val]_[val]-[damage]_[date]_[time]</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">🎯 TRAIN.csv Structure:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #0c5460; font-size: 13px;">
        <li>Same feature count as TEST.csv (U1, U2, U3...)</li>
        <li>Same DI columns as TEST.csv (DI1, DI2, DI3...)</li>
        <li>Multiple training cases (rows)</li>
        <li>DI values from file names (05 → 0.05)</li>
        <li>Features from actual mode shape data or synthetic</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Generator Actions:</h4>
      
      <button onclick="generateTrainCsv()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 12px 20px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      ">🔧 GENERATE TRAIN.CSV</button>
      
      <button onclick="getTrainingCaseFiles(); console.log('Check console for training case files')" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 Check Training Cases</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">❌ Close</button>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Load training case files first, then generate TRAIN.csv
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

function loadTrainingFiles() {
  console.log('📁 === LOADING TRAINING FILES ===');

  const trainingInput = document.getElementById("txt-file-training");
  if (!trainingInput) {
    alert('❌ Training file input not found!');
    return;
  }

  // Trigger file selection
  trainingInput.click();

  // Add event listener for file selection
  trainingInput.onchange = function(event) {
    const files = event.target.files;
    console.log(`📁 Selected ${files.length} files`);

    let trainingCaseCount = 0;
    let validFiles = [];

    Array.from(files).forEach(file => {
      const parsedCase = parseTrainingCaseFileName(file.name);
      if (parsedCase) {
        trainingCaseCount++;
        validFiles.push(file.name);
      }
    });

    console.log(`✅ Found ${trainingCaseCount} valid training case files`);

    if (trainingCaseCount > 0) {
      alert(`✅ Loaded ${trainingCaseCount} training case files!\n\n` +
            `Valid files:\n${validFiles.slice(0, 5).join('\n')}` +
            `${validFiles.length > 5 ? '\n... and ' + (validFiles.length - 5) + ' more' : ''}\n\n` +
            `Click "Generate TRAIN.csv" to create training data.`);
    } else {
      alert(`❌ No valid training case files found!\n\n` +
            `Expected format: ID_2134-th0.2_2-05_20250814_220218\n\n` +
            `Please select files with correct naming format.`);
    }
  };
}

// Export functions
if (typeof window !== 'undefined') {
  window.parseTrainingCaseFileName = parseTrainingCaseFileName;
  window.getTrainingCaseFiles = getTrainingCaseFiles;
  window.generateTrainCsv = generateTrainCsv;
  window.createTrainCsvInterface = createTrainCsvInterface;
  window.loadTrainingFiles = loadTrainingFiles;
}
