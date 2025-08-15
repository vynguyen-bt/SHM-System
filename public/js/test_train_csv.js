// Test TRAIN.csv generation

function testTrainingCaseFileParsing() {
  console.log('🧪 === TESTING TRAINING CASE FILE PARSING ===\n');
  
  // Test file name parsing
  const testFileNames = [
    'ID_2134-th0.2_2-00_20250814_220007',
    'ID_2134-th0.2_2-05_20250814_220218',
    'ID_2134-th0.2_2-10_20250814_220345',
    'ID_1234-th0.3_1-15_20250815_120000',
    'invalid_file_name.txt'
  ];
  
  console.log('📊 Testing file name parsing:');
  testFileNames.forEach(fileName => {
    const parsed = parseTrainingCaseFileName(fileName);
    if (parsed) {
      console.log(`   ✅ ${fileName}`);
      console.log(`      Element: ${parsed.elementID}, DI: ${parsed.diValue}`);
    } else {
      console.log(`   ❌ ${fileName} - Invalid format`);
    }
  });
}

function testTrainCsvStructure() {
  console.log('\n🧪 === TESTING TRAIN.CSV STRUCTURE ===\n');
  
  // Simulate training cases
  const mockTrainingCases = [
    {
      elementID: 2134,
      thickness1: 0.2,
      thickness2: 2,
      damageValue: 0,
      diValue: 0.00,
      fileName: 'ID_2134-th0.2_2-00_20250814_220007'
    },
    {
      elementID: 2134,
      thickness1: 0.2,
      thickness2: 2,
      damageValue: 5,
      diValue: 0.05,
      fileName: 'ID_2134-th0.2_2-05_20250814_220218'
    },
    {
      elementID: 2134,
      thickness1: 0.2,
      thickness2: 2,
      damageValue: 10,
      diValue: 0.10,
      fileName: 'ID_2134-th0.2_2-10_20250814_220345'
    }
  ];
  
  console.log('📊 Mock training cases:');
  mockTrainingCases.forEach((tc, index) => {
    console.log(`   ${index + 1}. ${tc.fileName} → DI = ${tc.diValue}`);
  });
  
  // Test DI value assignment
  const damagedElements = getDamagedElementsList();
  console.log(`\n📊 Damaged elements: [${damagedElements.join(', ')}]`);
  
  mockTrainingCases.forEach(tc => {
    const diValues = generateDIValuesForTrainingCase(tc, damagedElements);
    console.log(`📊 ${tc.fileName}:`);
    console.log(`   DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);
  });
}

function simulateTrainCsvGeneration() {
  console.log('\n🧪 === SIMULATING TRAIN.CSV GENERATION ===\n');
  
  // Check if we have the required functions
  if (typeof generateTrainCsv !== 'function') {
    console.log('❌ generateTrainCsv function not available');
    return;
  }
  
  // Check for damaged elements
  const damagedElements = getDamagedElementsList();
  if (damagedElements.length === 0) {
    console.log('⚠️ No damaged elements found - run Section 1 first');
    return;
  }
  
  console.log(`📊 Damaged elements: ${damagedElements.length}`);
  console.log(`📊 Elements: [${damagedElements.join(', ')}]`);
  
  // Check for training case files
  const trainingCases = getTrainingCaseFiles();
  console.log(`📊 Training case files: ${trainingCases.length}`);
  
  if (trainingCases.length === 0) {
    console.log('⚠️ No training case files found');
    console.log('💡 Load training case files first using "Load Training Cases" button');
    return;
  }
  
  trainingCases.forEach((tc, index) => {
    console.log(`   ${index + 1}. ${tc.fileName} → Element ${tc.elementID}, DI = ${tc.diValue}`);
  });
  
  // Simulate CSV structure
  console.log('\n📊 Expected TRAIN.csv structure:');
  
  // Get feature count
  getFeatureCountFromTestStructure().then(featureCount => {
    console.log(`📊 Features: ${featureCount} (U1 to U${featureCount})`);
    console.log(`📊 DI columns: ${damagedElements.length} (DI1 to DI${damagedElements.length})`);
    console.log(`📊 Training cases: ${trainingCases.length} rows`);
    
    console.log('\n📊 CSV Header:');
    let header = 'Case';
    for (let i = 1; i <= featureCount; i++) {
      header += ',U' + i;
    }
    for (let i = 1; i <= damagedElements.length; i++) {
      header += ',DI' + i;
    }
    console.log(`   ${header}`);
    
    console.log('\n📊 Sample rows:');
    trainingCases.slice(0, 3).forEach((tc, index) => {
      let row = `${index}`;
      
      // Features (simplified)
      for (let i = 1; i <= Math.min(5, featureCount); i++) {
        row += ',0.0001';
      }
      if (featureCount > 5) {
        row += ',...';
      }
      
      // DI values
      const diValues = generateDIValuesForTrainingCase(tc, damagedElements);
      diValues.forEach(di => {
        row += ',' + di.toFixed(4);
      });
      
      console.log(`   ${row}`);
    });
    
    console.log('\n✅ TRAIN.csv structure simulation complete');
  });
}

function createTrainCsvTestInterface() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 650px;
    max-height: 700px;
    background: white;
    border: 2px solid #17a2b8;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #17a2b8; text-align: center;">
      🧪 TRAIN.csv Generation Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Training Case Format:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #0c5460;">
        ID_2134-th0.2_2-00_20250814_220007 → DI = 0.00<br>
        ID_2134-th0.2_2-05_20250814_220218 → DI = 0.05<br>
        ID_2134-th0.2_2-10_20250814_220345 → DI = 0.10<br>
        <strong>Pattern: ID_[element]-th[val]_[val]-[damage]_[date]_[time]</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ TRAIN.csv Logic:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Same structure as TEST.csv (features + DI columns)</li>
        <li>Multiple training cases (rows)</li>
        <li>DI values from file names (05 → 0.05)</li>
        <li>Features from mode shape data or synthetic</li>
        <li>Element mapping to correct DI column</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testTrainingCaseFileParsing()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test File Name Parsing</button>
      
      <button onclick="testTrainCsvStructure()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 Test CSV Structure</button>
      
      <button onclick="simulateTrainCsvGeneration()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🎯 Simulate Generation</button>
      
      <button onclick="getTrainingCaseFiles(); console.log('Check console for current training files')" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📁 Check Current Files</button>
      
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
        💡 Check browser console for detailed test results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testTrainingCaseFileParsing = testTrainingCaseFileParsing;
  window.testTrainCsvStructure = testTrainCsvStructure;
  window.simulateTrainCsvGeneration = simulateTrainCsvGeneration;
  window.createTrainCsvTestInterface = createTrainCsvTestInterface;
}
