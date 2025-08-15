// Test script để verify Damage.txt parsing chính xác

function testDamageTxtParsing() {
  console.log('🔍 === TESTING DAMAGE.TXT PARSING ACCURACY ===\n');
  
  // Check file availability
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    
    // Test parsing for mode 12 (example from user data)
    console.log('📋 1. TESTING MODE 12 PARSING:');
    
    const mode12Data = parseModeShapeFile(damageContent, 12);
    const nodeIDs = Object.keys(mode12Data).map(id => parseInt(id)).sort((a, b) => a - b);
    
    console.log(`📊 Total nodes for mode 12: ${nodeIDs.length}`);
    console.log(`📊 Node ID range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
    
    // Verify specific nodes from user's example data
    const expectedValues = {
      1: 0.000162612101653345,
      2: -0.000156897623394039,
      3: 2.36620838888116E-06,
      4: -3.83791369962345E-06,
      18: 5.49961903489064E-06,
      35734: 2.11323272548279E-05,
      35736: 1.00780586625656E-06
    };
    
    console.log('\n📊 VERIFICATION OF SPECIFIC NODES:');
    Object.entries(expectedValues).forEach(([nodeID, expectedValue]) => {
      const parsedValue = mode12Data[nodeID];
      const match = parsedValue !== undefined && Math.abs(parsedValue - expectedValue) < 1e-15;
      
      console.log(`   Node ${nodeID}:`);
      console.log(`      Expected: ${expectedValue.toExponential(6)}`);
      console.log(`      Parsed:   ${parsedValue ? parsedValue.toExponential(6) : 'undefined'}`);
      console.log(`      Match:    ${match ? '✅' : '❌'}`);
    });
    
    // Test node ordering
    console.log('\n📋 2. TESTING NODE ORDERING:');
    
    const firstTenNodes = nodeIDs.slice(0, 10);
    console.log(`📊 First 10 nodes: [${firstTenNodes.join(', ')}]`);
    console.log(`📊 Values:`);
    firstTenNodes.forEach(nodeID => {
      const value = mode12Data[nodeID];
      console.log(`      Node ${nodeID}: ${value.toExponential(6)}`);
    });
    
    // Test CSV generation with correct ordering
    console.log('\n📋 3. TESTING CSV GENERATION WITH CORRECT ORDERING:');
    testCsvGenerationWithCorrectOrdering(mode12Data, nodeIDs);
    
    // Test all modes
    console.log('\n📋 4. TESTING ALL MODES:');
    testAllModes(damageContent);
  };
  
  reader.readAsText(file);
}

function testCsvGenerationWithCorrectOrdering(modeData, nodeIDs) {
  console.log('🔄 Testing CSV generation with correct node ordering...');
  
  // Simulate CSV generation logic
  const maxAbsValue = Math.max(...Object.values(modeData).map(v => Math.abs(v)));
  
  console.log(`📊 Max absolute value: ${maxAbsValue.toExponential(6)}`);
  
  // Show first 10 features as they would appear in CSV
  console.log('📊 First 10 CSV features (U1-U10):');
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
}

function testAllModes(damageContent) {
  const testModes = [10, 12, 14, 17, 20];
  
  testModes.forEach(mode => {
    try {
      const modeData = parseModeShapeFile(damageContent, mode);
      const nodeCount = Object.keys(modeData).length;
      
      if (nodeCount > 0) {
        const nodeIDs = Object.keys(modeData).map(id => parseInt(id)).sort((a, b) => a - b);
        const values = nodeIDs.map(id => modeData[id]);
        const maxAbs = Math.max(...values.map(v => Math.abs(v)));
        const minAbs = Math.min(...values.filter(v => v !== 0).map(v => Math.abs(v)));
        
        console.log(`   Mode ${mode}: ${nodeCount} nodes, range: ${minAbs.toExponential(3)} - ${maxAbs.toExponential(3)}`);
      } else {
        console.log(`   Mode ${mode}: No data found`);
      }
    } catch (error) {
      console.log(`   Mode ${mode}: Error - ${error.message}`);
    }
  });
}

function verifyDamageTxtFormat() {
  console.log('📋 === VERIFYING DAMAGE.TXT FORMAT ===\n');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const content = event.target.result;
    const lines = content.trim().split('\n');
    
    console.log(`📊 Total lines: ${lines.length}`);
    
    // Check header
    const header = lines[0];
    console.log(`📊 Header: "${header}"`);
    
    const expectedHeader = 'Node_ID\tMode\tEigenVector_UZ';
    const headerMatch = header.includes('Node_ID') && header.includes('Mode') && header.includes('EigenVector_UZ');
    console.log(`📊 Header format: ${headerMatch ? '✅ Correct' : '❌ Incorrect'}`);
    
    // Check first few data lines
    console.log('\n📊 First 10 data lines:');
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      const line = lines[i];
      const parts = line.trim().split(/\s+/);
      
      if (parts.length >= 3) {
        const nodeID = parts[0];
        const mode = parts[1];
        const eigenValue = parts[2];
        
        console.log(`   Line ${i}: Node ${nodeID}, Mode ${mode}, Value ${eigenValue}`);
      } else {
        console.log(`   Line ${i}: Invalid format - ${line}`);
      }
    }
    
    // Check data distribution by mode
    console.log('\n📊 Data distribution by mode:');
    const modeCount = {};
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 3) {
        const mode = parts[1];
        modeCount[mode] = (modeCount[mode] || 0) + 1;
      }
    }
    
    Object.entries(modeCount).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([mode, count]) => {
      console.log(`   Mode ${mode}: ${count} entries`);
    });
  };
  
  reader.readAsText(file);
}

function createCorrectCsvFromDamageTxt() {
  console.log('🔧 === CREATING CORRECT CSV FROM DAMAGE.TXT ===\n');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  const damagedElements = getDamagedElementsList();
  
  console.log(`📊 Using mode: ${modeUsed}`);
  console.log(`📊 Damaged elements: [${damagedElements.join(', ')}]`);
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const content = event.target.result;
    
    // Parse mode data
    const modeData = parseModeShapeFile(content, modeUsed);
    const nodeIDs = Object.keys(modeData).map(id => parseInt(id)).sort((a, b) => a - b);
    
    if (nodeIDs.length === 0) {
      console.log(`❌ No data found for mode ${modeUsed}`);
      return;
    }
    
    console.log(`✅ Found ${nodeIDs.length} nodes for mode ${modeUsed}`);
    
    // Generate correct CSV
    const csvContent = generateCorrectCsvContent(modeData, nodeIDs, damagedElements);
    
    // Show preview
    const lines = csvContent.split('\n');
    console.log(`📊 Generated CSV: ${lines.length} lines`);
    console.log(`📊 Header: ${lines[0]}`);
    console.log(`📊 Data (first 80 chars): ${lines[1].substring(0, 80)}...`);
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_CORRECTED.csv';
    link.click();
    
    console.log('✅ Corrected CSV downloaded as TEST_CORRECTED.csv');
  };
  
  reader.readAsText(file);
}

function generateCorrectCsvContent(modeData, nodeIDs, damagedElements) {
  const featureCount = nodeIDs.length;
  const numDamageIndices = damagedElements.length;
  
  // Create header
  let csvContent = "Case";
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";
  
  // Create data row
  csvContent += "0"; // Case number
  
  // Calculate scaling
  const maxAbsValue = Math.max(...Object.values(modeData).map(v => Math.abs(v)));
  
  // Add features in correct node order
  nodeIDs.forEach(nodeID => {
    const rawValue = modeData[nodeID];
    const absValue = Math.abs(rawValue);
    
    let scaledValue;
    if (absValue === 0) {
      scaledValue = 0.001;
    } else {
      scaledValue = 0.001 + (absValue / maxAbsValue) * 0.999;
    }
    
    csvContent += "," + scaledValue.toFixed(6);
  });
  
  // Add DI values
  const z = window.strainEnergyResults?.z || {};
  const Z0 = window.strainEnergyResults?.Z0 || 1.0;
  const maxZ = window.strainEnergyResults?.maxZ || 10.0;
  
  damagedElements.forEach(elementID => {
    let damageValue = 0;
    const actualDamage = z[elementID];
    
    if (actualDamage !== undefined && !isNaN(actualDamage)) {
      if (actualDamage >= Z0) {
        damageValue = 0.1 + (actualDamage - Z0) / (maxZ - Z0) * 0.9;
        damageValue = Math.min(Math.max(damageValue, 0.1), 1.0);
      } else {
        damageValue = (actualDamage / Z0) * 0.1;
        damageValue = Math.min(Math.max(damageValue, 0), 0.1);
      }
    }
    
    csvContent += "," + damageValue.toFixed(4);
  });
  
  csvContent += "\n";
  
  return csvContent;
}

function createDamageTxtParsingTestReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    max-height: 700px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #007BFF; text-align: center;">
      🔍 Damage.txt Parsing Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Format Requirements:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #0c5460; font-size: 13px;">
        <li>Header: Node_ID, Mode, EigenVector_UZ</li>
        <li>Data: Tab or space separated values</li>
        <li>Node ordering: Sorted by Node_ID ascending</li>
        <li>Mode filtering: Extract specific mode values</li>
        <li>Value preservation: Maintain UZ magnitudes</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="verifyDamageTxtFormat()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📋 Verify File Format</button>
      
      <button onclick="testDamageTxtParsing()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Test Parsing Accuracy</button>
      
      <button onclick="createCorrectCsvFromDamageTxt()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Generate Correct CSV</button>
      
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
        💡 Check browser console for detailed parsing results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testDamageTxtParsing = testDamageTxtParsing;
  window.verifyDamageTxtFormat = verifyDamageTxtFormat;
  window.createCorrectCsvFromDamageTxt = createCorrectCsvFromDamageTxt;
  window.createDamageTxtParsingTestReport = createDamageTxtParsingTestReport;
}
