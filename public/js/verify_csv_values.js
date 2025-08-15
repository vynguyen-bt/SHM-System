// Verify CSV values match expected Damage.txt data

function verifyCsvValues() {
  console.log('✅ === VERIFYING CSV VALUES AGAINST DAMAGE.TXT ===\n');
  
  // Expected values from user's Damage.txt example (Mode 12)
  const expectedMode12Values = {
    1: 0.000162612101653345,
    2: -0.000156897623394039,
    3: 2.36620838888116E-06,
    4: -3.83791369962345E-06,
    18: 5.49961903489064E-06,
    35734: 2.11323272548279E-05,
    35736: 1.00780586625656E-06
  };
  
  console.log('📊 Expected raw values from Damage.txt (Mode 12):');
  Object.entries(expectedMode12Values).forEach(([nodeID, value]) => {
    console.log(`   Node ${nodeID}: ${value.toExponential(6)}`);
  });
  
  // Check if we can parse the actual file
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('\n❌ Damage.txt file not loaded - cannot verify');
    return;
  }
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const content = event.target.result;
    
    // Parse mode 12 data
    const mode12Data = parseModeShapeFile(content, 12);
    
    console.log('\n📊 Parsed values from actual file:');
    Object.keys(expectedMode12Values).forEach(nodeID => {
      const parsedValue = mode12Data[nodeID];
      const expectedValue = expectedMode12Values[nodeID];
      const match = parsedValue !== undefined && Math.abs(parsedValue - expectedValue) < 1e-15;
      
      console.log(`   Node ${nodeID}:`);
      console.log(`      Expected: ${expectedValue.toExponential(6)}`);
      console.log(`      Parsed:   ${parsedValue ? parsedValue.toExponential(6) : 'undefined'}`);
      console.log(`      Match:    ${match ? '✅' : '❌'}`);
    });
    
    // Test CSV generation
    console.log('\n📊 Testing CSV generation with corrected parsing:');
    testCsvGeneration(mode12Data);
  };
  
  reader.readAsText(file);
}

function testCsvGeneration(modeData) {
  const nodeIDs = Object.keys(modeData).map(id => parseInt(id)).sort((a, b) => a - b);
  const maxAbsValue = Math.max(...Object.values(modeData).map(v => Math.abs(v)));
  
  console.log(`📊 Total nodes: ${nodeIDs.length}`);
  console.log(`📊 Max absolute value: ${maxAbsValue.toExponential(6)}`);
  console.log(`📊 Node ordering (first 10): [${nodeIDs.slice(0, 10).join(', ')}]`);
  
  // Show how first 10 values would be scaled
  console.log('\n📊 First 10 CSV values (U1-U10):');
  for (let i = 0; i < Math.min(10, nodeIDs.length); i++) {
    const nodeID = nodeIDs[i];
    const rawValue = modeData[nodeID];
    const absValue = Math.abs(rawValue);
    
    let scaledValue;
    if (absValue === 0) {
      scaledValue = 0.001;
    } else {
      scaledValue = 0.001 + (absValue / maxAbsValue) * 0.999;
    }
    
    console.log(`   U${i + 1} (Node ${nodeID}): ${rawValue.toExponential(6)} → ${scaledValue.toFixed(6)}`);
  }
  
  // Calculate expected scaled values for verification nodes
  console.log('\n📊 Expected scaled values for verification nodes:');
  const verificationNodes = [1, 2, 3, 4, 18];
  verificationNodes.forEach(nodeID => {
    if (modeData[nodeID] !== undefined) {
      const rawValue = modeData[nodeID];
      const absValue = Math.abs(rawValue);
      const scaledValue = absValue === 0 ? 0.001 : 0.001 + (absValue / maxAbsValue) * 0.999;
      
      console.log(`   Node ${nodeID}: ${rawValue.toExponential(6)} → ${scaledValue.toFixed(6)}`);
    }
  });
}

function generateAndCompareCsv() {
  console.log('🔄 === GENERATING AND COMPARING CSV ===\n');
  
  // Check prerequisites
  const hasSection1 = window.strainEnergyResults && window.strainEnergyResults.z;
  const hasFile = document.getElementById("txt-file-damaged")?.files[0];
  
  if (!hasSection1 || !hasFile) {
    console.log('❌ Prerequisites not met:');
    console.log(`   Section 1 results: ${hasSection1 ? '✅' : '❌'}`);
    console.log(`   Damage.txt file: ${hasFile ? '✅' : '❌'}`);
    return;
  }
  
  // Generate CSV with corrected parsing
  createTestCsvContent().then(csvContent => {
    console.log('✅ CSV generated successfully');
    
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`📊 CSV structure: ${lines.length} lines`);
    console.log(`📊 Header: ${header.substring(0, 80)}...`);
    
    // Parse data values
    const dataValues = dataRow.split(',');
    const caseValue = dataValues[0];
    
    console.log(`📊 Case: ${caseValue}`);
    console.log('\n📊 First 10 feature values:');
    for (let i = 1; i <= 10; i++) {
      const value = dataValues[i];
      console.log(`   U${i}: ${value}`);
    }
    
    // Compare with expected pattern
    console.log('\n📊 Value analysis:');
    const featureValues = dataValues.slice(1, 11).map(v => parseFloat(v));
    const min = Math.min(...featureValues);
    const max = Math.max(...featureValues);
    const avg = featureValues.reduce((sum, v) => sum + v, 0) / featureValues.length;
    
    console.log(`   Range: ${min.toFixed(6)} - ${max.toFixed(6)}`);
    console.log(`   Average: ${avg.toFixed(6)}`);
    console.log(`   All different: ${new Set(featureValues).size === featureValues.length ? '✅' : '❌'}`);
    
    // Download for manual inspection
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_VERIFIED.csv';
    link.click();
    
    console.log('📁 CSV downloaded as TEST_VERIFIED.csv for manual inspection');
    
  }).catch(error => {
    console.error('❌ CSV generation failed:', error);
  });
}

function createCsvVerificationReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
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
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #28a745; text-align: center;">
      ✅ CSV Values Verification
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">🎯 Verification Goals:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Parse Damage.txt with correct Node_ID ordering</li>
        <li>Extract UZ values for specific mode (e.g., Mode 12)</li>
        <li>Scale values preserving relative magnitudes</li>
        <li>Generate CSV with U1, U2, U3... matching Node 1, 2, 3...</li>
        <li>Verify against expected raw values</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📊 Expected Values (Mode 12):</h4>
      <div style="font-family: monospace; font-size: 12px; color: #0c5460;">
        Node 1: 1.626e-04<br>
        Node 2: -1.569e-04<br>
        Node 3: 2.366e-06<br>
        Node 4: -3.838e-06<br>
        Node 18: 5.500e-06
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Verification Actions:</h4>
      
      <button onclick="verifyCsvValues()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">✅ Verify CSV Values</button>
      
      <button onclick="generateAndCompareCsv()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Generate & Compare CSV</button>
      
      <button onclick="createDamageTxtParsingTestReport()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Detailed Parsing Test</button>
      
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
        💡 Check browser console for detailed verification results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.verifyCsvValues = verifyCsvValues;
  window.generateAndCompareCsv = generateAndCompareCsv;
  window.createCsvVerificationReport = createCsvVerificationReport;
}
