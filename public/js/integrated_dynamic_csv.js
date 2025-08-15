// Integrated Dynamic CSV Generator for SHM-BIM-FEM
// Combines enhanced TEST.csv and TRAIN.csv generation with dynamic DI detection

/**
 * Generate both enhanced CSV files with dynamic DI detection
 */
async function generateDynamicCSVFiles() {
  console.log('🚀 === GENERATING DYNAMIC CSV FILES ===');
  
  const progressDiv = createProgressIndicator();
  
  try {
    // Step 1: Validate prerequisites
    updateProgress(progressDiv, 10, 'Validating prerequisites...');
    await validateDynamicCSVPrerequisites();
    
    // Step 2: Generate enhanced TEST.csv
    updateProgress(progressDiv, 30, 'Generating enhanced TEST.csv...');
    const testCsv = await createEnhancedTestCsvContent();
    
    // Step 3: Generate enhanced TRAIN.csv
    updateProgress(progressDiv, 60, 'Generating enhanced TRAIN.csv...');
    let trainCsv;
    try {
      trainCsv = await createEnhancedTrainCsvContent();
    } catch (error) {
      if (error.message.includes('No training case files found')) {
        console.log('⚠️ No training case files found - generating sample TRAIN.csv');
        const simulationData = await parseSimulationFileForDynamicDI();
        trainCsv = await generateSampleTrainCsvStructure(simulationData);
      } else {
        throw error;
      }
    }
    
    // Step 4: Validate consistency
    updateProgress(progressDiv, 80, 'Validating CSV consistency...');
    const validation = validateDynamicCSVConsistency(testCsv, trainCsv);
    
    // Step 5: Download files
    updateProgress(progressDiv, 90, 'Downloading CSV files...');
    downloadCSVFile(testCsv, 'TEST_dynamic.csv');
    downloadCSVFile(trainCsv, 'TRAIN_dynamic.csv');
    
    // Step 6: Show results
    updateProgress(progressDiv, 100, 'Generation completed!');
    
    setTimeout(() => {
      progressDiv.remove();
      showDynamicCSVResults(testCsv, trainCsv, validation);
    }, 1000);
    
  } catch (error) {
    progressDiv.remove();
    console.error('❌ Dynamic CSV generation failed:', error);
    alert(`❌ Error generating dynamic CSV files:\n\n${error.message}\n\nCheck console for details.`);
  }
}

/**
 * Validate prerequisites for dynamic CSV generation
 */
async function validateDynamicCSVPrerequisites() {
  console.log('📋 Validating dynamic CSV prerequisites...');
  
  const issues = [];
  
  // Check Section 1 results
  if (!window.strainEnergyResults) {
    issues.push('Section 1 results not available - run Section 1 first');
  }
  
  // Check damaged elements
  try {
    const damagedElements = getDamagedElementsList();
    if (damagedElements.length === 0) {
      issues.push('No damaged elements found - run Section 1 first');
    }
  } catch (error) {
    issues.push('Cannot get damaged elements list');
  }
  
  // Check required files
  const requiredFiles = [
    { id: 'txt-file-damaged', name: 'Damage.txt' },
    { id: 'txt-file-simulation', name: 'Simulation.txt' }
  ];
  
  requiredFiles.forEach(file => {
    const input = document.getElementById(file.id);
    if (!input || !input.files || input.files.length === 0) {
      issues.push(`${file.name} file not loaded`);
    }
  });
  
  // Check Simulation.txt structure
  try {
    const simulationData = await parseSimulationFileForDynamicDI();
    if (simulationData.dynamicDICount === 0) {
      issues.push('No elements found in Simulation.txt');
    }
    console.log(`✅ Simulation.txt validation: ${simulationData.dynamicDICount} elements found`);
  } catch (error) {
    issues.push(`Simulation.txt parsing error: ${error.message}`);
  }
  
  if (issues.length > 0) {
    throw new Error(`Prerequisites validation failed:\n${issues.map(issue => `- ${issue}`).join('\n')}`);
  }
  
  console.log('✅ All prerequisites validated successfully');
}

/**
 * Validate consistency between dynamic TEST.csv and TRAIN.csv
 */
function validateDynamicCSVConsistency(testCsv, trainCsv) {
  console.log('🔍 Validating dynamic CSV consistency...');
  
  const validation = {
    structureValid: false,
    issues: [],
    warnings: []
  };
  
  try {
    const testLines = testCsv.split('\n').filter(line => line.trim().length > 0);
    const trainLines = trainCsv.split('\n').filter(line => line.trim().length > 0);
    
    if (testLines.length < 2) {
      validation.issues.push('TEST.csv has insufficient data');
      return validation;
    }
    
    if (trainLines.length < 2) {
      validation.issues.push('TRAIN.csv has insufficient data');
      return validation;
    }
    
    const testHeader = testLines[0];
    const trainHeader = trainLines[0];
    
    // Check header consistency
    if (testHeader !== trainHeader) {
      validation.issues.push('Headers are not identical between TEST.csv and TRAIN.csv');
    } else {
      validation.structureValid = true;
      console.log('✅ CSV headers are identical');
    }
    
    // Analyze structure
    const columns = testHeader.split(',');
    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));
    
    console.log(`📊 CSV structure: ${featureColumns.length} features + ${diColumns.length} DI columns`);
    
    // Check training data sufficiency
    const trainDataRows = trainLines.length - 1;
    if (trainDataRows === 0) {
      validation.warnings.push('TRAIN.csv has no training data');
    } else if (trainDataRows < 10) {
      validation.warnings.push(`TRAIN.csv has only ${trainDataRows} training cases (recommended: 50+)`);
    }
    
    console.log(`📊 Training data: ${trainDataRows} cases`);
    
  } catch (error) {
    validation.issues.push(`Validation error: ${error.message}`);
  }
  
  return validation;
}

/**
 * Show dynamic CSV generation results
 */
function showDynamicCSVResults(testCsv, trainCsv, validation) {
  const testLines = testCsv.split('\n').filter(line => line.trim().length > 0);
  const trainLines = trainCsv.split('\n').filter(line => line.trim().length > 0);
  
  const header = testLines[0].split(',');
  const featureColumns = header.filter(col => col.startsWith('U'));
  const diColumns = header.filter(col => col.startsWith('DI'));
  const trainCases = trainLines.length - 1;
  
  let message = '🎉 Dynamic CSV files generated successfully!\n\n';
  message += '📊 ENHANCED STRUCTURE:\n';
  message += `- Features: ${featureColumns.length} (from Damage.txt)\n`;
  message += `- DI columns: ${diColumns.length} (dynamic from Simulation.txt)\n`;
  message += `- Training cases: ${trainCases}\n\n`;
  
  message += '🔧 IMPROVEMENTS:\n';
  message += '- Dynamic DI column count based on Simulation.txt\n';
  message += '- THICKNESS-derived DI values for TEST.csv\n';
  message += '- File name-derived DI values for TRAIN.csv\n';
  message += '- Consistent structure between files\n\n';
  
  message += '📁 FILES DOWNLOADED:\n';
  message += '- TEST_dynamic.csv\n';
  message += '- TRAIN_dynamic.csv';

  if (trainCases === 0) {
    message += ' (sample data - no training files found)\n\n';
    message += '💡 TO ADD REAL TRAINING DATA:\n';
    message += '- Load training case files with format: ID_elementID-th0.2_2-XX_timestamp\n';
    message += '- Example: ID_2134-th0.2_2-05_20250814_220218\n\n';
  } else {
    message += '\n\n';
  }
  
  if (validation.structureValid) {
    message += '✅ Structure validation: PASSED\n';
    message += '🎯 Ready for AI training with enhanced data quality!';
  } else {
    message += '⚠️ Structure validation: ISSUES FOUND\n';
    message += 'Check console for details.';
  }
  
  if (validation.warnings.length > 0) {
    message += '\n\n⚠️ WARNINGS:\n';
    message += validation.warnings.map(warning => `- ${warning}`).join('\n');
  }
  
  alert(message);
}

/**
 * Create progress indicator
 */
function createProgressIndicator() {
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    padding: 20px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10001;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  progressDiv.innerHTML = `
    <h4 style="margin: 0 0 15px 0; color: #007BFF;">🚀 Generating Dynamic CSV Files</h4>
    <div style="width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden;">
      <div id="progress-bar" style="width: 0%; height: 100%; background: #007BFF; transition: width 0.3s;"></div>
    </div>
    <p id="progress-text" style="margin: 10px 0 0 0; color: #6c757d;">Initializing...</p>
  `;
  
  document.body.appendChild(progressDiv);
  return progressDiv;
}

/**
 * Update progress indicator
 */
function updateProgress(progressDiv, percentage, text) {
  const progressBar = progressDiv.querySelector('#progress-bar');
  const progressText = progressDiv.querySelector('#progress-text');
  
  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }
  
  if (progressText) {
    progressText.textContent = text;
  }
  
  console.log(`📊 Progress: ${percentage}% - ${text}`);
}

/**
 * Test dynamic CSV generation system
 */
async function testDynamicCSVSystem() {
  console.log('🧪 === TESTING DYNAMIC CSV SYSTEM ===');
  
  try {
    // Test prerequisites
    console.log('\n📋 Testing prerequisites...');
    await validateDynamicCSVPrerequisites();
    console.log('✅ Prerequisites validation passed');
    
    // Test Simulation.txt parsing
    console.log('\n📊 Testing Simulation.txt parsing...');
    const simulationData = await parseSimulationFileForDynamicDI();
    console.log(`✅ Simulation parsing: ${simulationData.dynamicDICount} elements found`);
    
    // Test TEST.csv generation
    console.log('\n🔧 Testing TEST.csv generation...');
    const testCsv = await createEnhancedTestCsvContent();
    console.log('✅ TEST.csv generation successful');
    
    // Test TRAIN.csv generation
    console.log('\n🔧 Testing TRAIN.csv generation...');
    const trainCsv = await createEnhancedTrainCsvContent();
    console.log('✅ TRAIN.csv generation successful');
    
    // Test consistency validation
    console.log('\n🔍 Testing consistency validation...');
    const validation = validateDynamicCSVConsistency(testCsv, trainCsv);
    console.log(`✅ Consistency validation: ${validation.structureValid ? 'PASSED' : 'FAILED'}`);
    
    console.log('\n🎉 Dynamic CSV system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Dynamic CSV system test failed:', error);
  }
}

/**
 * Compare dynamic vs original CSV generation
 */
async function compareDynamicVsOriginalCSV() {
  console.log('📊 === COMPARING DYNAMIC VS ORIGINAL CSV GENERATION ===');
  
  try {
    console.log('\n🚀 Testing dynamic generation...');
    const dynamicTest = await createEnhancedTestCsvContent();
    const dynamicTrain = await createEnhancedTrainCsvContent();
    
    console.log('\n🔧 Testing original generation...');
    let originalTest = '';
    let originalTrain = '';
    
    try {
      if (typeof createTestCsvContent === 'function') {
        originalTest = await createTestCsvContent();
      }
      if (typeof createTrainCsvContent === 'function') {
        const trainingCases = await findEnhancedTrainingCaseFiles();
        const damagedElements = getDamagedElementsList();
        const featureCount = await getFeatureCountFromDamageFile();
        originalTrain = await createTrainCsvContent(trainingCases, damagedElements, featureCount);
      }
    } catch (error) {
      console.log(`⚠️ Original generation error: ${error.message}`);
    }
    
    // Compare results
    console.log('\n📋 COMPARISON RESULTS:');
    
    if (dynamicTest && originalTest) {
      const dynamicTestHeader = dynamicTest.split('\n')[0].split(',');
      const originalTestHeader = originalTest.split('\n')[0].split(',');
      
      const dynamicDI = dynamicTestHeader.filter(col => col.startsWith('DI'));
      const originalDI = originalTestHeader.filter(col => col.startsWith('DI'));
      
      console.log(`TEST.csv DI columns:`);
      console.log(`   Dynamic: ${dynamicDI.length} (${dynamicDI.join(', ')})`);
      console.log(`   Original: ${originalDI.length} (${originalDI.join(', ')})`);
      console.log(`   Improvement: ${dynamicDI.length > originalDI.length ? '✅ More DI columns' : dynamicDI.length === originalDI.length ? '➖ Same' : '❌ Fewer DI columns'}`);
    }
    
    if (dynamicTrain && originalTrain) {
      const dynamicTrainLines = dynamicTrain.split('\n').filter(line => line.trim().length > 0);
      const originalTrainLines = originalTrain.split('\n').filter(line => line.trim().length > 0);
      
      console.log(`TRAIN.csv structure:`);
      console.log(`   Dynamic: ${dynamicTrainLines.length - 1} training cases`);
      console.log(`   Original: ${originalTrainLines.length - 1} training cases`);
      console.log(`   Consistency: ${dynamicTrainLines.length === originalTrainLines.length ? '✅ Same' : '❌ Different'}`);
    }
    
    console.log('\n💡 Dynamic CSV advantages:');
    console.log('- DI column count based on actual Simulation.txt content');
    console.log('- THICKNESS-derived DI values for TEST.csv');
    console.log('- File name-derived DI values for TRAIN.csv');
    console.log('- Guaranteed structure consistency between files');
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateDynamicCSVFiles = generateDynamicCSVFiles;
  window.validateDynamicCSVPrerequisites = validateDynamicCSVPrerequisites;
  window.validateDynamicCSVConsistency = validateDynamicCSVConsistency;
  window.showDynamicCSVResults = showDynamicCSVResults;
  window.testDynamicCSVSystem = testDynamicCSVSystem;
  window.compareDynamicVsOriginalCSV = compareDynamicVsOriginalCSV;
}
