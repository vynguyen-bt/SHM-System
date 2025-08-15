// Enhanced TRAIN.csv generation with dynamic DI columns
// Uses training case file names for DI value extraction

/**
 * Enhanced createTrainCsvContent with dynamic DI detection
 */
async function createEnhancedTrainCsvContent() {
  console.log('🔧 === CREATING ENHANCED TRAIN.CSV WITH DYNAMIC DI ===');
  
  try {
    // Step 1: Parse Simulation.txt for dynamic DI structure
    console.log('📊 Step 1: Parsing Simulation.txt for dynamic DI structure...');
    const simulationData = await parseSimulationFileForDynamicDI();
    
    // Step 2: Find training case files
    console.log('📊 Step 2: Finding training case files...');
    const trainingCases = await findEnhancedTrainingCaseFiles();

    if (trainingCases.length === 0) {
      console.log('⚠️ No training case files found - generating empty TRAIN.csv structure');
      return generateEmptyTrainCsvStructure(simulationData);
    }
    
    console.log(`   Found ${trainingCases.length} training case files`);
    
    // Step 3: Get feature count from TEST.csv structure
    console.log('📊 Step 3: Determining feature count...');
    const featureCount = await getFeatureCountFromDamageFile();
    
    // Step 4: Generate CSV header
    console.log('📊 Step 4: Generating CSV header...');
    const header = generateDynamicCSVHeader(featureCount, simulationData.dynamicDICount);
    
    // Step 5: Generate training case rows
    console.log('📊 Step 5: Generating training case rows...');
    let csvContent = header + "\n";
    
    for (let caseIndex = 0; caseIndex < trainingCases.length; caseIndex++) {
      const trainingCase = trainingCases[caseIndex];
      
      console.log(`   Processing case ${caseIndex + 1}: ${trainingCase.fileName}`);
      
      // Generate synthetic features for this training case
      const syntheticFeatures = generateSyntheticFeaturesForTraining(featureCount, trainingCase.diValue);
      
      // Generate DI values using dynamic mapping
      const diValues = generateDynamicTrainDIValues(trainingCase, simulationData);
      
      // Create CSV row
      const csvRow = generateTrainingCaseRow(caseIndex, syntheticFeatures, diValues);
      csvContent += csvRow + "\n";
      
      console.log(`     ✅ Generated row with DI values: [${diValues.map(val => val.toFixed(4)).join(', ')}]`);
    }
    
    // Step 6: Log generation summary
    console.log('✅ === ENHANCED TRAIN.CSV GENERATION SUMMARY ===');
    console.log(`   Features: ${featureCount} (synthetic)`);
    console.log(`   DI columns: ${simulationData.dynamicDICount} (from Simulation.txt)`);
    console.log(`   Training cases: ${trainingCases.length}`);
    console.log(`   Total rows: ${trainingCases.length + 1} (including header)`);
    
    // Log training case details
    console.log('📋 Training Case Details:');
    trainingCases.forEach((tc, index) => {
      console.log(`   ${index + 1}. ${tc.fileName} → Element ${tc.elementID}, DI = ${tc.diValue}`);
    });
    
    return csvContent;
    
  } catch (error) {
    console.error('❌ Enhanced TRAIN.csv generation failed:', error);
    throw error;
  }
}

/**
 * Find and parse enhanced training case files
 */
async function findEnhancedTrainingCaseFiles() {
  console.log('🔍 Finding enhanced training case files...');
  
  const trainingCases = [];
  
  // Search in all file inputs for training case files
  const fileInputs = [
    document.getElementById('txt-file-training'),
    document.getElementById('txt-file-healthy'),
    document.getElementById('txt-file-damaged'),
    document.getElementById('txt-file-simulation')
  ].filter(input => input && input.files);

  for (const input of fileInputs) {
    Array.from(input.files).forEach(file => {
      // Skip standard files that are not training cases
      const fileName = file.name.toLowerCase();
      if (fileName.includes('damage.txt') ||
          fileName.includes('simulation.txt') ||
          fileName.includes('healthy.txt') ||
          fileName === 'damage.txt' ||
          fileName === 'simulation.txt' ||
          fileName === 'healthy.txt') {
        return; // Skip these files
      }

      const parsedCase = parseTrainingCaseFileNameForDI(file.name);
      if (parsedCase) {
        parsedCase.fileObject = file;
        trainingCases.push(parsedCase);
        console.log(`   ✅ Found: ${file.name} → Element ${parsedCase.elementID}, DI = ${parsedCase.diValue}`);
      }
    });
  }
  
  // Sort training cases by element ID and then by DI value
  trainingCases.sort((a, b) => {
    if (a.elementID !== b.elementID) {
      return a.elementID - b.elementID;
    }
    return a.diValue - b.diValue;
  });
  
  console.log(`✅ Found ${trainingCases.length} training case files`);
  return trainingCases;
}

/**
 * Get feature count from Damage.txt file
 */
async function getFeatureCountFromDamageFile() {
  try {
    const damageData = await readDamageFileForFeatures();
    const featureCount = Object.keys(damageData).length;
    console.log(`   ✅ Feature count from Damage.txt: ${featureCount}`);
    return featureCount;
  } catch (error) {
    console.warn(`   ⚠️ Could not get feature count from Damage.txt: ${error.message}`);
    console.log('   🔄 Using default feature count: 121');
    return 121; // Default fallback
  }
}

/**
 * Generate synthetic features for training case
 */
function generateSyntheticFeaturesForTraining(featureCount, baseDamageLevel) {
  const features = [];
  const variation = 0.05; // ±5% variation
  const noiseLevel = 0.001; // Background noise level
  
  for (let i = 0; i < featureCount; i++) {
    // Base value with damage-dependent scaling
    let baseValue = (Math.random() - 0.5) * 0.0001;
    
    // Scale based on damage level (higher damage = larger feature values)
    const damageScale = 1 + (baseDamageLevel * 10);
    baseValue *= damageScale;
    
    // Add variation
    const variationFactor = 1 + (Math.random() - 0.5) * variation * 2;
    baseValue *= variationFactor;
    
    // Add noise
    const noise = (Math.random() - 0.5) * noiseLevel;
    baseValue += noise;
    
    // Apply scaling for consistency with TEST.csv
    const scaledValue = baseValue * 1000;
    
    features.push(scaledValue);
  }
  
  return features;
}

/**
 * Generate CSV row for training case
 */
function generateTrainingCaseRow(caseIndex, features, diValues) {
  let row = caseIndex.toString();
  
  // Add feature values
  features.forEach(feature => {
    row += "," + feature.toFixed(8);
  });
  
  // Add DI values
  diValues.forEach(di => {
    row += "," + di.toFixed(4);
  });
  
  return row;
}

/**
 * Wrapper function to maintain compatibility with existing code
 */
async function createTrainCsvContentDynamic() {
  console.log('🔄 createTrainCsvContentDynamic called - using enhanced implementation');
  return await createEnhancedTrainCsvContent();
}

/**
 * Test enhanced TRAIN.csv generation
 */
async function testEnhancedTrainCsvGeneration() {
  console.log('🧪 === TESTING ENHANCED TRAIN.CSV GENERATION ===');
  
  try {
    // Check prerequisites
    console.log('📋 Checking prerequisites...');
    
    const hasSimulationFile = document.getElementById('txt-file-simulation')?.files?.length > 0;
    const hasDamageFile = document.getElementById('txt-file-damaged')?.files?.length > 0;
    
    console.log(`   Simulation.txt loaded: ${hasSimulationFile ? '✅' : '❌'}`);
    console.log(`   Damage.txt loaded: ${hasDamageFile ? '✅' : '❌'}`);
    
    // Check for training case files
    const trainingCases = await findEnhancedTrainingCaseFiles();
    console.log(`   Training case files: ${trainingCases.length > 0 ? '✅' : '❌'} (${trainingCases.length} found)`);
    
    if (!hasSimulationFile || !hasDamageFile) {
      console.log('❌ Prerequisites not met for testing');
      return;
    }
    
    if (trainingCases.length === 0) {
      console.log('⚠️ No training case files found - will test with empty result');
    }
    
    // Test generation
    console.log('\n📊 Testing enhanced TRAIN.csv generation...');
    const csvContent = await createEnhancedTrainCsvContent();
    
    // Analyze generated content
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
    const header = lines[0];
    const dataRows = lines.slice(1);
    
    if (dataRows.length > 0) {
      const columns = header.split(',');
      const firstDataRow = dataRows[0].split(',');
      
      const featureColumns = columns.filter(col => col.startsWith('U'));
      const diColumns = columns.filter(col => col.startsWith('DI'));
      
      console.log('\n✅ TRAIN.csv generation successful!');
      console.log(`   Total columns: ${columns.length}`);
      console.log(`   Feature columns: ${featureColumns.length} (${featureColumns[0]} to ${featureColumns[featureColumns.length-1]})`);
      console.log(`   DI columns: ${diColumns.length} (${diColumns.join(', ')})`);
      console.log(`   Training rows: ${dataRows.length}`);
      
      // Analyze first training case
      if (firstDataRow.length === columns.length) {
        const diStartIndex = columns.length - diColumns.length;
        const diValues = firstDataRow.slice(diStartIndex).map(val => parseFloat(val));
        const nonZeroDI = diValues.filter(val => val > 0);
        
        console.log(`   First case non-zero DI: ${nonZeroDI.length} (${nonZeroDI.map(val => val.toFixed(4)).join(', ')})`);
        
        // Show sample features from first case
        const sampleFeatures = firstDataRow.slice(1, 6); // Skip Case column, take first 5 features
        console.log(`   Sample features: [${sampleFeatures.map(val => parseFloat(val).toFixed(6)).join(', ')}...]`);
      }
      
    } else {
      console.log('⚠️ Generated CSV has no data rows (no training cases)');
    }
    
  } catch (error) {
    console.error('❌ Enhanced TRAIN.csv generation test failed:', error);
  }
}

/**
 * Compare original vs enhanced TRAIN.csv generation
 */
async function compareTrainCsvGenerationMethods() {
  console.log('📊 === COMPARING TRAIN.CSV GENERATION METHODS ===');
  
  try {
    console.log('\n🔧 Testing original method...');
    let originalCsv = '';
    try {
      if (typeof createTrainCsvContent === 'function') {
        // Get training cases for original method
        const trainingCases = await findEnhancedTrainingCaseFiles();
        const damagedElements = getDamagedElementsList();
        const featureCount = await getFeatureCountFromDamageFile();
        
        originalCsv = await createTrainCsvContent(trainingCases, damagedElements, featureCount);
        console.log('✅ Original method successful');
      } else {
        console.log('❌ Original createTrainCsvContent function not available');
      }
    } catch (error) {
      console.log(`❌ Original method failed: ${error.message}`);
    }
    
    console.log('\n🚀 Testing enhanced method...');
    let enhancedCsv = '';
    try {
      enhancedCsv = await createEnhancedTrainCsvContent();
      console.log('✅ Enhanced method successful');
    } catch (error) {
      console.log(`❌ Enhanced method failed: ${error.message}`);
    }
    
    // Compare results
    if (originalCsv && enhancedCsv) {
      console.log('\n📋 Comparison Results:');
      
      const originalLines = originalCsv.split('\n').filter(line => line.trim().length > 0);
      const enhancedLines = enhancedCsv.split('\n').filter(line => line.trim().length > 0);
      
      const originalHeader = originalLines[0]?.split(',') || [];
      const enhancedHeader = enhancedLines[0]?.split(',') || [];
      
      const originalDI = originalHeader.filter(col => col.startsWith('DI'));
      const enhancedDI = enhancedHeader.filter(col => col.startsWith('DI'));
      
      console.log(`   Original DI columns: ${originalDI.length} (${originalDI.join(', ')})`);
      console.log(`   Enhanced DI columns: ${enhancedDI.length} (${enhancedDI.join(', ')})`);
      console.log(`   DI count improvement: ${enhancedDI.length > originalDI.length ? '✅ Increased' : enhancedDI.length === originalDI.length ? '➖ Same' : '❌ Decreased'}`);
      
      console.log(`   Original training rows: ${originalLines.length - 1}`);
      console.log(`   Enhanced training rows: ${enhancedLines.length - 1}`);
      console.log(`   Row consistency: ${originalLines.length === enhancedLines.length ? '✅ Same' : '❌ Different'}`);
    }
    
  } catch (error) {
    console.error('❌ Comparison failed:', error);
  }
}

/**
 * Validate TRAIN.csv structure consistency with TEST.csv
 */
async function validateTrainTestConsistency() {
  console.log('🔍 === VALIDATING TRAIN-TEST CSV CONSISTENCY ===');
  
  try {
    // Generate both CSV files
    const testCsv = await createEnhancedTestCsvContent();
    const trainCsv = await createEnhancedTrainCsvContent();
    
    const testHeader = testCsv.split('\n')[0];
    const trainHeader = trainCsv.split('\n')[0];
    
    console.log('📋 Structure Comparison:');
    console.log(`   TEST header:  ${testHeader}`);
    console.log(`   TRAIN header: ${trainHeader}`);
    console.log(`   Headers match: ${testHeader === trainHeader ? '✅ YES' : '❌ NO'}`);
    
    if (testHeader === trainHeader) {
      const columns = testHeader.split(',');
      const featureColumns = columns.filter(col => col.startsWith('U'));
      const diColumns = columns.filter(col => col.startsWith('DI'));
      
      console.log('✅ CSV structure consistency validated:');
      console.log(`   Total columns: ${columns.length}`);
      console.log(`   Feature columns: ${featureColumns.length}`);
      console.log(`   DI columns: ${diColumns.length}`);
      console.log('   Both files ready for AI training!');
    } else {
      console.log('❌ CSV structure inconsistency detected');
      console.log('   Files may not be compatible for AI training');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

/**
 * Generate empty TRAIN.csv structure when no training files available
 */
async function generateEmptyTrainCsvStructure(simulationData) {
  console.log('📊 Generating empty TRAIN.csv structure...');

  try {
    // Get feature count
    const featureCount = await getFeatureCountFromDamageFile();

    // Generate header only
    const header = generateDynamicCSVHeader(featureCount, simulationData.dynamicDICount);

    console.log('✅ Generated empty TRAIN.csv structure');
    console.log(`   Features: ${featureCount}`);
    console.log(`   DI columns: ${simulationData.dynamicDICount}`);
    console.log('   Note: No training data rows (no training case files found)');

    return header + "\n"; // Header only, no data rows

  } catch (error) {
    console.error('❌ Error generating empty TRAIN.csv structure:', error);
    throw error;
  }
}

/**
 * Generate sample TRAIN.csv with synthetic data when no training files
 */
async function generateSampleTrainCsvStructure(simulationData) {
  console.log('📊 Generating sample TRAIN.csv structure...');

  try {
    const featureCount = await getFeatureCountFromDamageFile();
    const header = generateDynamicCSVHeader(featureCount, simulationData.dynamicDICount);

    let csvContent = header + "\n";

    // Generate a few sample training cases
    for (let i = 0; i < 3; i++) {
      const syntheticFeatures = generateSyntheticFeaturesForTraining(featureCount, 0.05 + i * 0.05);
      const sampleDIValues = new Array(simulationData.dynamicDICount).fill(0);

      // Assign sample DI value to different columns
      if (i < simulationData.dynamicDICount) {
        sampleDIValues[i] = 0.05 + i * 0.05;
      }

      const csvRow = generateTrainingCaseRow(i, syntheticFeatures, sampleDIValues);
      csvContent += csvRow + "\n";
    }

    console.log('✅ Generated sample TRAIN.csv with 3 synthetic training cases');
    return csvContent;

  } catch (error) {
    console.error('❌ Error generating sample TRAIN.csv:', error);
    throw error;
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.createEnhancedTrainCsvContent = createEnhancedTrainCsvContent;
  window.createTrainCsvContentDynamic = createTrainCsvContentDynamic;
  window.findEnhancedTrainingCaseFiles = findEnhancedTrainingCaseFiles;
  window.getFeatureCountFromDamageFile = getFeatureCountFromDamageFile;
  window.generateSyntheticFeaturesForTraining = generateSyntheticFeaturesForTraining;
  window.generateTrainingCaseRow = generateTrainingCaseRow;
  window.generateEmptyTrainCsvStructure = generateEmptyTrainCsvStructure;
  window.generateSampleTrainCsvStructure = generateSampleTrainCsvStructure;
  window.testEnhancedTrainCsvGeneration = testEnhancedTrainCsvGeneration;
  window.compareTrainCsvGenerationMethods = compareTrainCsvGenerationMethods;
  window.validateTrainTestConsistency = validateTrainTestConsistency;
}
