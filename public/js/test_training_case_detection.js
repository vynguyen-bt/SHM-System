// Test Training Case Detection for SHM-BIM-FEM
// Tests parsing of actual training case file names

function testTrainingCaseDetection() {
  console.log('🧪 === TESTING TRAINING CASE DETECTION ===\n');
  
  // Test with actual file names from user
  const testFileNames = [
    'ID_2134-th0.2_2-00_20250814_220007',
    'ID_2134-th0.2_2-05_20250814_220218', 
    'ID_2134-th0.2_2-10_20250814_220345',
    'ID_2134-th0.2_2-15_20250814_220519'
  ];
  
  console.log('📋 Testing actual training case file names:');
  
  testFileNames.forEach((fileName, index) => {
    console.log(`\n${index + 1}. Testing: ${fileName}`);
    
    if (typeof parseTrainingCaseFileNameForDI === 'function') {
      const result = parseTrainingCaseFileNameForDI(fileName);
      
      if (result) {
        console.log(`   ✅ Parsed successfully:`);
        console.log(`      Element ID: ${result.elementID}`);
        console.log(`      Damage Value: ${result.damageValue}`);
        console.log(`      DI Value: ${result.diValue}`);
        console.log(`      Pattern: ${result.pattern}`);
      } else {
        console.log(`   ❌ Failed to parse`);
      }
    } else {
      console.log(`   ❌ parseTrainingCaseFileNameForDI function not available`);
    }
  });
  
  // Test expected results
  console.log('\n📊 Expected Results:');
  console.log('   ID_2134-th0.2_2-00_... → Element 2134, DI = 0.00');
  console.log('   ID_2134-th0.2_2-05_... → Element 2134, DI = 0.05');
  console.log('   ID_2134-th0.2_2-10_... → Element 2134, DI = 0.10');
  console.log('   ID_2134-th0.2_2-15_... → Element 2134, DI = 0.15');
  
  // Test if files would be found in file inputs
  console.log('\n🔍 Testing file input detection...');
  testFileInputDetection(testFileNames);
}

function testFileInputDetection(testFileNames) {
  const fileInputs = [
    'txt-file-training',
    'txt-file-healthy', 
    'txt-file-damaged',
    'txt-file-simulation'
  ];
  
  fileInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input && input.files) {
      console.log(`\n📁 ${inputId}: ${input.files.length} files`);
      
      Array.from(input.files).forEach(file => {
        const isTrainingCase = testFileNames.some(testName => 
          file.name.includes('ID_2134') && file.name.includes('-th0.2_2-')
        );
        
        if (isTrainingCase) {
          console.log(`   ✅ Found training case: ${file.name}`);
          
          // Test parsing
          if (typeof parseTrainingCaseFileNameForDI === 'function') {
            const result = parseTrainingCaseFileNameForDI(file.name);
            if (result) {
              console.log(`      → Element ${result.elementID}, DI = ${result.diValue}`);
            }
          }
        } else if (file.name.includes('ID_') || file.name.includes('-th')) {
          console.log(`   ⚠️ Potential training case: ${file.name}`);
        }
      });
    } else {
      console.log(`\n📁 ${inputId}: No files loaded`);
    }
  });
}

function simulateTrainingCaseFiles() {
  console.log('🎭 === SIMULATING TRAINING CASE FILES ===\n');
  
  const simulatedFiles = [
    { name: 'ID_2134-th0.2_2-00_20250814_220007', elementID: 2134, diValue: 0.00 },
    { name: 'ID_2134-th0.2_2-05_20250814_220218', elementID: 2134, diValue: 0.05 },
    { name: 'ID_2134-th0.2_2-10_20250814_220345', elementID: 2134, diValue: 0.10 },
    { name: 'ID_2134-th0.2_2-15_20250814_220519', elementID: 2134, diValue: 0.15 }
  ];
  
  console.log('📊 Simulating TRAIN.csv generation with these files...');
  
  // Simulate CSV generation
  let csvContent = 'Case,U1,U2,U3,U4,U5,DI1\n'; // Simple structure for demo
  
  simulatedFiles.forEach((file, index) => {
    // Generate synthetic features
    const features = [];
    for (let i = 0; i < 5; i++) {
      const baseValue = (Math.random() - 0.5) * 0.0001;
      const damageScale = 1 + (file.diValue * 10);
      const scaledValue = (baseValue * damageScale * 1000);
      features.push(scaledValue.toFixed(8));
    }
    
    // Create CSV row
    const row = `${index},${features.join(',')},${file.diValue.toFixed(4)}`;
    csvContent += row + '\n';
    
    console.log(`   Case ${index}: Element ${file.elementID}, DI = ${file.diValue}`);
  });
  
  console.log('\n📋 Generated TRAIN.csv structure:');
  console.log(csvContent);
  
  return csvContent;
}

function testDynamicDIMapping() {
  console.log('🔗 === TESTING DYNAMIC DI MAPPING ===\n');
  
  // Simulate Simulation.txt data
  const mockSimulationData = {
    elementData: {
      2134: { elementID: 2134, thickness: 'th0.2_2-05', diValue: 0.05 }
    },
    uniqueElementIDs: [2134],
    dynamicDICount: 1
  };
  
  // Simulate damaged elements from Section 1
  const mockDamagedElements = [2134];
  
  console.log('📊 Mock data:');
  console.log(`   Simulation elements: [${mockSimulationData.uniqueElementIDs.join(', ')}]`);
  console.log(`   Damaged elements: [${mockDamagedElements.join(', ')}]`);
  console.log(`   Dynamic DI count: ${mockSimulationData.dynamicDICount}`);
  
  // Test DI mapping
  if (typeof createDynamicDIMapping === 'function') {
    console.log('\n🔗 Testing DI mapping...');
    const mapping = createDynamicDIMapping(mockDamagedElements, mockSimulationData);
    
    console.log('✅ DI Mapping Result:');
    mapping.forEach(map => {
      console.log(`   Element ${map.elementID}: ${map.thickness} → ${map.diColumn} = ${map.diValue}`);
    });
  } else {
    console.log('❌ createDynamicDIMapping function not available');
  }
  
  // Test training case mapping
  console.log('\n📊 Testing training case mapping...');
  const trainingCases = [
    { elementID: 2134, diValue: 0.00, fileName: 'ID_2134-th0.2_2-00_...' },
    { elementID: 2134, diValue: 0.05, fileName: 'ID_2134-th0.2_2-05_...' },
    { elementID: 2134, diValue: 0.10, fileName: 'ID_2134-th0.2_2-10_...' },
    { elementID: 2134, diValue: 0.15, fileName: 'ID_2134-th0.2_2-15_...' }
  ];
  
  trainingCases.forEach(tc => {
    if (typeof generateDynamicTrainDIValues === 'function') {
      const diValues = generateDynamicTrainDIValues(tc, mockSimulationData);
      console.log(`   ${tc.fileName} → DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);
    }
  });
}

function generateTrainingCaseCSVPreview() {
  console.log('📊 === GENERATING TRAINING CASE CSV PREVIEW ===\n');
  
  const trainingCases = [
    { elementID: 2134, diValue: 0.00, fileName: 'ID_2134-th0.2_2-00_20250814_220007' },
    { elementID: 2134, diValue: 0.05, fileName: 'ID_2134-th0.2_2-05_20250814_220218' },
    { elementID: 2134, diValue: 0.10, fileName: 'ID_2134-th0.2_2-10_20250814_220345' },
    { elementID: 2134, diValue: 0.15, fileName: 'ID_2134-th0.2_2-15_20250814_220519' }
  ];
  
  console.log('🔧 Simulating enhanced TRAIN.csv generation...');
  
  // Simulate feature count (from Damage.txt)
  const featureCount = 121; // Typical value
  const diCount = 1; // Element 2134 maps to DI1
  
  // Generate header
  let header = 'Case';
  for (let i = 1; i <= featureCount; i++) {
    header += ',U' + i;
  }
  for (let i = 1; i <= diCount; i++) {
    header += ',DI' + i;
  }
  
  console.log(`📋 CSV Structure: ${featureCount} features + ${diCount} DI columns`);
  console.log(`Header: ${header.substring(0, 50)}...`);
  
  // Generate sample rows
  console.log('\n📊 Sample training cases:');
  trainingCases.forEach((tc, index) => {
    let row = index.toString();
    
    // Add sample features
    for (let i = 0; i < 5; i++) { // Show first 5 features
      const baseValue = (Math.random() - 0.5) * 0.0001;
      const damageScale = 1 + (tc.diValue * 10);
      const scaledValue = baseValue * damageScale * 1000;
      row += ',' + scaledValue.toFixed(8);
    }
    row += ',...'; // Indicate more features
    
    // Add DI value
    row += ',' + tc.diValue.toFixed(4);
    
    console.log(`   Case ${index}: ${row}`);
    console.log(`      Source: ${tc.fileName}`);
  });
  
  console.log('\n✅ This structure would be compatible with AI training!');
  console.log('💡 All training cases map to same element (2134) but different damage levels');
}

function createTrainingCaseTestInterface() {
  const interfaceDiv = document.createElement('div');
  interfaceDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 600px;
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
  
  interfaceDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #28a745; text-align: center;">
      🧪 Training Case Detection Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">📁 Your Training Case Files:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #155724;">
        • ID_2134-th0.2_2-00_20250814_220007<br>
        • ID_2134-th0.2_2-05_20250814_220218<br>
        • ID_2134-th0.2_2-10_20250814_220345<br>
        • ID_2134-th0.2_2-15_20250814_220519
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">🎯 Expected Parsing Results:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #0c5460;">
        • Element 2134, DI = 0.00 (0% damage)<br>
        • Element 2134, DI = 0.05 (5% damage)<br>
        • Element 2134, DI = 0.10 (10% damage)<br>
        • Element 2134, DI = 0.15 (15% damage)
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">🔧 Test Actions:</h4>
      
      <button onclick="testTrainingCaseDetection()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test File Name Parsing</button>
      
      <button onclick="simulateTrainingCaseFiles()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🎭 Simulate CSV Generation</button>
      
      <button onclick="testDynamicDIMapping()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔗 Test DI Mapping</button>
      
      <button onclick="generateTrainingCaseCSVPreview()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 Generate CSV Preview</button>
      
      <button onclick="this.remove()" style="
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
  
  document.body.appendChild(interfaceDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testTrainingCaseDetection = testTrainingCaseDetection;
  window.testFileInputDetection = testFileInputDetection;
  window.simulateTrainingCaseFiles = simulateTrainingCaseFiles;
  window.testDynamicDIMapping = testDynamicDIMapping;
  window.generateTrainingCaseCSVPreview = generateTrainingCaseCSVPreview;
  window.createTrainingCaseTestInterface = createTrainingCaseTestInterface;
}
