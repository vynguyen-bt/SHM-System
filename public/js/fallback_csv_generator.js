// Fallback CSV Generator for SHM-BIM-FEM
// Provides graceful fallbacks when training files or other data is missing

/**
 * Generate fallback CSV files when some data is missing
 */
async function generateFallbackCSVFiles() {
  console.log('🔄 === GENERATING FALLBACK CSV FILES ===');
  
  const progressDiv = createFallbackProgressIndicator();
  
  try {
    // Step 1: Check what data is available
    updateFallbackProgress(progressDiv, 10, 'Checking available data...');
    const availability = await checkDataAvailability();

    // Step 2: Generate TEST.csv (always possible with fallbacks)
    updateFallbackProgress(progressDiv, 30, 'Generating TEST.csv...');
    const testCsv = await generateFallbackTestCSV(availability);

    // Step 3: Generate TRAIN.csv (with fallbacks)
    updateFallbackProgress(progressDiv, 60, 'Generating TRAIN.csv...');
    const trainCsv = await generateFallbackTrainCSV(availability);

    // Step 4: Download files
    updateFallbackProgress(progressDiv, 90, 'Downloading CSV files...');
    downloadFallbackCSVFile(testCsv, 'TEST_fallback.csv');
    downloadFallbackCSVFile(trainCsv, 'TRAIN_fallback.csv');
    
    // Step 5: Show results
    updateFallbackProgress(progressDiv, 100, 'Generation completed!');
    
    setTimeout(() => {
      progressDiv.remove();
      showFallbackCSVResults(testCsv, trainCsv, availability);
    }, 1000);
    
  } catch (error) {
    progressDiv.remove();
    console.error('❌ Fallback CSV generation failed:', error);
    alert(`❌ Error generating fallback CSV files:\n\n${error.message}\n\nCheck console for details.`);
  }
}

/**
 * Check what data is available for CSV generation
 */
async function checkDataAvailability() {
  console.log('📋 Checking data availability...');
  
  const availability = {
    section1Results: false,
    damagedElements: [],
    damageFile: false,
    simulationFile: false,
    simulationData: null,
    trainingFiles: [],
    featureCount: 121 // Default
  };
  
  // Check Section 1 results
  if (window.strainEnergyResults) {
    availability.section1Results = true;
    console.log('✅ Section 1 results available');
    
    try {
      availability.damagedElements = getDamagedElementsList();
      console.log(`✅ Damaged elements: ${availability.damagedElements.length}`);
    } catch (error) {
      console.log('⚠️ Could not get damaged elements list');
    }
  } else {
    console.log('❌ Section 1 results not available');
  }
  
  // Check Damage.txt file
  const damageFile = document.getElementById('txt-file-damaged');
  if (damageFile && damageFile.files && damageFile.files.length > 0) {
    availability.damageFile = true;
    console.log('✅ Damage.txt file available');
    
    try {
      const damageData = await readDamageFileForFeatures();
      availability.featureCount = Object.keys(damageData).length;
      console.log(`✅ Feature count: ${availability.featureCount}`);
    } catch (error) {
      console.log('⚠️ Could not read Damage.txt, using default feature count');
    }
  } else {
    console.log('❌ Damage.txt file not available');
  }
  
  // Check Simulation.txt file
  const simulationFile = document.getElementById('txt-file-simulation');
  if (simulationFile && simulationFile.files && simulationFile.files.length > 0) {
    availability.simulationFile = true;
    console.log('✅ Simulation.txt file available');
    
    try {
      availability.simulationData = await parseSimulationFileForDynamicDI();
      console.log(`✅ Simulation data: ${availability.simulationData.dynamicDICount} elements`);
    } catch (error) {
      console.log('⚠️ Could not parse Simulation.txt');
    }
  } else {
    console.log('❌ Simulation.txt file not available');
  }
  
  // Check training case files
  try {
    availability.trainingFiles = await findEnhancedTrainingCaseFiles();
    console.log(`${availability.trainingFiles.length > 0 ? '✅' : '⚠️'} Training files: ${availability.trainingFiles.length}`);
  } catch (error) {
    console.log('⚠️ Could not check training files');
  }
  
  return availability;
}

/**
 * Generate fallback TEST.csv
 */
async function generateFallbackTestCSV(availability) {
  console.log('🔧 Generating fallback TEST.csv...');
  
  let featureCount = availability.featureCount;
  let diCount = 1; // Default to 1 DI column
  let diValues = [0.1]; // Default DI value
  
  // Determine DI count and values with improved fallback logic
  if (availability.simulationData) {
    diCount = availability.simulationData.dynamicDICount;
    console.log(`Using dynamic DI count: ${diCount}`);

    if (availability.damagedElements.length > 0) {
      try {
        // Try dynamic DI mapping
        const diMapping = createDynamicDIMapping(availability.damagedElements, availability.simulationData);
        diValues = generateDynamicTestDIValues(diMapping, diCount);

        // Check if any DI values were assigned
        const nonZeroDI = diValues.filter(val => val > 0).length;
        if (nonZeroDI === 0) {
          console.log('⚠️ No DI values assigned, using fallback');
          diValues[0] = 0.1; // Assign to first DI as fallback
        }
      } catch (error) {
        console.log('⚠️ Dynamic DI mapping failed, using fallback:', error.message);
        diValues = new Array(diCount).fill(0);
        diValues[0] = 0.1; // First DI gets default value
      }
    } else {
      // Use default values
      diValues = new Array(diCount).fill(0);
      diValues[0] = 0.1; // First DI gets default value
    }
  } else if (availability.damagedElements.length > 0) {
    diCount = availability.damagedElements.length;
    diValues = new Array(diCount).fill(0);
    diValues[0] = 0.1; // First DI gets default value
    console.log(`Using damaged elements count: ${diCount}`);
  }
  
  // Generate features
  let features;
  if (availability.damageFile) {
    try {
      const damageData = await readDamageFileForFeatures();
      features = extractAndNormalizeFeatures(damageData);
    } catch (error) {
      console.log('⚠️ Could not extract features from Damage.txt, using synthetic');
      features = generateSyntheticFeatures(featureCount);
    }
  } else {
    console.log('⚠️ No Damage.txt file, using synthetic features');
    features = generateSyntheticFeatures(featureCount);
  }
  
  // Generate CSV content
  const csvContent = generateFallbackCSVContent(features, diValues, 'TEST');
  
  console.log(`✅ Fallback TEST.csv generated: ${featureCount} features, ${diCount} DI columns`);
  return csvContent;
}

/**
 * Generate fallback TRAIN.csv
 */
async function generateFallbackTrainCSV(availability) {
  console.log('🔧 Generating fallback TRAIN.csv...');
  
  let featureCount = availability.featureCount;
  let diCount = 1; // Default to 1 DI column
  
  // Determine DI count
  if (availability.simulationData) {
    diCount = availability.simulationData.dynamicDICount;
  } else if (availability.damagedElements.length > 0) {
    diCount = availability.damagedElements.length;
  }
  
  // Generate header
  const header = generateDynamicCSVHeader(featureCount, diCount);
  let csvContent = header + "\n";
  
  // Generate training cases
  if (availability.trainingFiles.length > 0) {
    console.log(`Using ${availability.trainingFiles.length} actual training files`);
    
    // Use actual training files
    for (let i = 0; i < availability.trainingFiles.length; i++) {
      const trainingCase = availability.trainingFiles[i];
      const syntheticFeatures = generateSyntheticFeaturesForTraining(featureCount, trainingCase.diValue);
      
      let diValues;
      if (availability.simulationData) {
        diValues = generateDynamicTrainDIValues(trainingCase, availability.simulationData);
      } else {
        diValues = new Array(diCount).fill(0);
        diValues[0] = trainingCase.diValue; // Assign to first DI
      }
      
      const csvRow = generateTrainingCaseRow(i, syntheticFeatures, diValues);
      csvContent += csvRow + "\n";
    }
  } else {
    console.log('No training files found, generating synthetic training cases');
    
    // Generate synthetic training cases
    const syntheticCases = [
      { diValue: 0.05, elementIndex: 0 },
      { diValue: 0.10, elementIndex: Math.min(1, diCount - 1) },
      { diValue: 0.15, elementIndex: Math.min(2, diCount - 1) }
    ];
    
    for (let i = 0; i < syntheticCases.length; i++) {
      const syntheticCase = syntheticCases[i];
      const syntheticFeatures = generateSyntheticFeaturesForTraining(featureCount, syntheticCase.diValue);
      
      const diValues = new Array(diCount).fill(0);
      diValues[syntheticCase.elementIndex] = syntheticCase.diValue;
      
      const csvRow = generateTrainingCaseRow(i, syntheticFeatures, diValues);
      csvContent += csvRow + "\n";
    }
  }
  
  console.log(`✅ Fallback TRAIN.csv generated: ${featureCount} features, ${diCount} DI columns`);
  return csvContent;
}

/**
 * Generate synthetic features
 */
function generateSyntheticFeatures(featureCount) {
  const features = [];
  
  for (let i = 0; i < featureCount; i++) {
    // Generate small random values similar to actual EigenVector data
    const baseValue = (Math.random() - 0.5) * 0.0001;
    const scaledValue = baseValue * 1000; // Apply scaling
    features.push(scaledValue);
  }
  
  return features;
}

/**
 * Generate fallback CSV content
 */
function generateFallbackCSVContent(features, diValues, type) {
  const featureCount = features.length;
  const diCount = diValues.length;
  
  // Generate header
  const header = generateDynamicCSVHeader(featureCount, diCount);
  
  // Generate data row
  let dataRow = "0"; // Case number
  
  // Add features
  features.forEach(feature => {
    dataRow += "," + feature.toFixed(8);
  });
  
  // Add DI values
  diValues.forEach(di => {
    dataRow += "," + di.toFixed(4);
  });
  
  return header + "\n" + dataRow + "\n";
}

/**
 * Show fallback CSV results
 */
function showFallbackCSVResults(testCsv, trainCsv, availability) {
  const testLines = testCsv.split('\n').filter(line => line.trim().length > 0);
  const trainLines = trainCsv.split('\n').filter(line => line.trim().length > 0);
  
  const header = testLines[0].split(',');
  const featureColumns = header.filter(col => col.startsWith('U'));
  const diColumns = header.filter(col => col.startsWith('DI'));
  const trainCases = trainLines.length - 1;
  
  let message = '🔄 Fallback CSV files generated successfully!\n\n';
  message += '📊 STRUCTURE:\n';
  message += `- Features: ${featureColumns.length}\n`;
  message += `- DI columns: ${diColumns.length}\n`;
  message += `- Training cases: ${trainCases}\n\n`;
  
  message += '🔧 DATA SOURCES USED:\n';
  message += `- Section 1 results: ${availability.section1Results ? '✅' : '❌ (fallback)'}\n`;
  message += `- Damage.txt: ${availability.damageFile ? '✅' : '❌ (synthetic)'}\n`;
  message += `- Simulation.txt: ${availability.simulationFile ? '✅' : '❌ (default)'}\n`;
  message += `- Training files: ${availability.trainingFiles.length > 0 ? '✅' : '❌ (synthetic)'}\n\n`;
  
  message += '📁 FILES DOWNLOADED:\n';
  message += '- TEST_fallback.csv\n';
  message += '- TRAIN_fallback.csv\n\n';
  
  if (!availability.section1Results || !availability.damageFile || !availability.simulationFile) {
    message += '💡 TO IMPROVE DATA QUALITY:\n';
    if (!availability.section1Results) message += '- Run Section 1 to get actual damaged elements\n';
    if (!availability.damageFile) message += '- Load Damage.txt file for real features\n';
    if (!availability.simulationFile) message += '- Load Simulation.txt for dynamic DI detection\n';
    if (availability.trainingFiles.length === 0) message += '- Load training case files for real training data\n';
    message += '\n';
  }
  
  message += '✅ Files are ready for AI training (with fallback data where needed)!';
  
  alert(message);
}

/**
 * Download CSV file with fallback implementation
 */
function downloadFallbackCSVFile(csvContent, filename) {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`✅ Downloaded: ${filename}`);
    } else {
      console.log('❌ Download not supported in this browser');
    }
  } catch (error) {
    console.error(`❌ Error downloading ${filename}:`, error);
  }
}

/**
 * Create progress indicator for fallback generation
 */
function createFallbackProgressIndicator() {
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    padding: 20px;
    background: white;
    border: 2px solid #28a745;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10001;
    font-family: Arial, sans-serif;
    text-align: center;
  `;

  progressDiv.innerHTML = `
    <h4 style="margin: 0 0 15px 0; color: #28a745;">🔄 Generating Fallback CSV Files</h4>
    <div style="width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden;">
      <div id="fallback-progress-bar" style="width: 0%; height: 100%; background: #28a745; transition: width 0.3s;"></div>
    </div>
    <p id="fallback-progress-text" style="margin: 10px 0 0 0; color: #6c757d;">Initializing...</p>
  `;

  document.body.appendChild(progressDiv);
  return progressDiv;
}

/**
 * Update progress indicator for fallback generation
 */
function updateFallbackProgress(progressDiv, percentage, text) {
  const progressBar = progressDiv.querySelector('#fallback-progress-bar');
  const progressText = progressDiv.querySelector('#fallback-progress-text');

  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }

  if (progressText) {
    progressText.textContent = text;
  }

  console.log(`📊 Fallback Progress: ${percentage}% - ${text}`);
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateFallbackCSVFiles = generateFallbackCSVFiles;
  window.checkDataAvailability = checkDataAvailability;
  window.generateFallbackTestCSV = generateFallbackTestCSV;
  window.generateFallbackTrainCSV = generateFallbackTrainCSV;
  window.generateSyntheticFeatures = generateSyntheticFeatures;
  window.showFallbackCSVResults = showFallbackCSVResults;
  window.downloadFallbackCSVFile = downloadFallbackCSVFile;
  window.createFallbackProgressIndicator = createFallbackProgressIndicator;
  window.updateFallbackProgress = updateFallbackProgress;
}
