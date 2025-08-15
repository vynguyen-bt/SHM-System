// Fix CSV generation để sử dụng raw values từ Damage.txt

function generateRawValuesCsv() {
  console.log('🔧 === GENERATING CSV WITH RAW VALUES FROM DAMAGE.TXT ===\n');
  
  // Check prerequisites
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    alert('⚠️ Vui lòng load file Damage.txt trước!');
    return;
  }
  
  const hasSection1 = window.strainEnergyResults && window.strainEnergyResults.z;
  if (!hasSection1) {
    console.log('❌ Section 1 results not available');
    alert('⚠️ Vui lòng chạy Section 1 trước!');
    return;
  }
  
  const modeUsed = window.strainEnergyResults.modeUsed || 12;
  const damagedElements = getDamagedElementsList();
  const numDamageIndices = damagedElements.length;
  
  console.log(`📊 Configuration:`);
  console.log(`   Mode: ${modeUsed}`);
  console.log(`   Damaged elements: [${damagedElements.join(', ')}]`);
  console.log(`   DI count: ${numDamageIndices}`);
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const content = event.target.result;
    
    // Parse damage data for the selected mode
    const damageData = parseModeShapeFile(content, modeUsed);
    
    if (Object.keys(damageData).length === 0) {
      console.log(`❌ No data found for mode ${modeUsed}`);
      alert(`❌ Không tìm thấy dữ liệu cho Mode ${modeUsed} trong Damage.txt`);
      return;
    }
    
    // Generate CSV with raw values
    const csvContent = createRawValuesCsvContent(damageData, damagedElements, numDamageIndices, modeUsed);
    
    // Show preview
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    const values = dataRow.split(',');
    
    console.log(`\n📊 Generated CSV analysis:`);
    console.log(`   Header: ${header}`);
    console.log(`   Data (first 100 chars): ${dataRow.substring(0, 100)}...`);
    
    // Show first 10 values
    console.log('\n📊 First 10 feature values (RAW):');
    for (let i = 1; i <= Math.min(10, values.length - numDamageIndices - 1); i++) {
      console.log(`   U${i}: ${values[i]}`);
    }
    
    // Verify against expected pattern
    console.log('\n📊 Verification against expected pattern:');
    const expectedValues = {
      10: [-0.000274954299179129, -0.000274167681433519, -3.08294757699798E-05, -3.02867085697983E-05, -0.000378805364910897],
      12: [0.000162612101653345, -0.000156897623394039, 2.36620838888116E-06, -3.83791369962345E-06, 5.49961903489064E-06]
    };
    
    if (expectedValues[modeUsed]) {
      const expected = expectedValues[modeUsed];
      console.log(`Expected for Mode ${modeUsed}:`);
      expected.forEach((expectedVal, index) => {
        const actualVal = parseFloat(values[index + 1]);
        const match = Math.abs(actualVal - expectedVal) < 1e-15;
        console.log(`   U${index + 1}: Expected ${expectedVal}, Got ${actualVal} ${match ? '✅' : '❌'}`);
      });
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_RAW_VALUES.csv';
    link.click();
    
    console.log('\n📁 Raw values CSV downloaded as TEST_RAW_VALUES.csv');
    
    alert(`✅ CSV với raw values đã được tạo!\n\n` +
          `📊 Mode: ${modeUsed}\n` +
          `📊 Values: Raw EigenVector_UZ từ Damage.txt\n` +
          `📊 File: TEST_RAW_VALUES.csv`);
  };
  
  reader.readAsText(file);
}

function createRawValuesCsvContent(damageData, damagedElements, numDamageIndices, modeUsed) {
  console.log('🔧 === CREATING CSV WITH RAW VALUES ===');
  console.log(`📊 Input: ${Object.keys(damageData).length} nodes, ${numDamageIndices} DI columns, mode ${modeUsed}`);

  // ✅ SORT NODES BY ID FOR CORRECT MAPPING
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  const featureCount = nodeIDs.length;
  
  console.log(`📊 Total nodes: ${featureCount}`);
  console.log(`📊 Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
  console.log(`📊 First 10 nodes: [${nodeIDs.slice(0, 10).join(', ')}]`);

  // ✅ VERIFY EXPECTED NODES ARE PRESENT
  const expectedNodes = [1, 2, 3, 4, 18];
  console.log('\n📊 Verifying expected nodes:');
  expectedNodes.forEach(nodeID => {
    const value = damageData[nodeID];
    if (value !== undefined) {
      console.log(`   ✅ Node ${nodeID}: ${value}`);
    } else {
      console.log(`   ❌ Node ${nodeID}: Missing!`);
    }
  });

  // Create CSV header: Case,U1,U2,...,UN,DI1,DI2,...,DIM
  let csvContent = "Case";
  
  // Add feature columns (U1-UN where N = total nodes)
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  
  // Add damage indices columns
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";

  // Create single test case (Case=0)
  csvContent += "0"; // Case number

  // ✅ USE RAW VALUES DIRECTLY (NO SCALING)
  console.log('\n📊 Using raw values (first 10):');
  for (let i = 0; i < featureCount; i++) {
    const nodeID = nodeIDs[i];
    const rawValue = damageData[nodeID];
    
    // Use raw value directly - no scaling
    const featureValue = rawValue;
    
    // Log first 10 for verification
    if (i < 10) {
      console.log(`   U${i + 1} (Node ${nodeID}): ${rawValue} (raw)`);
    }
    
    csvContent += "," + featureValue;
  }

  // ✅ GENERATE DI VALUES FROM SECTION 1 RESULTS
  console.log('\n📊 Damage indices generation:');
  const z = window.strainEnergyResults?.z || {};
  const Z0 = window.strainEnergyResults?.Z0 || 1.0;
  const maxZ = window.strainEnergyResults?.maxZ || 10.0;
  
  for (let i = 0; i < numDamageIndices; i++) {
    let damageValue = 0;
    
    if (i < damagedElements.length) {
      const elementID = damagedElements[i];
      const actualDamage = z[elementID];
      
      if (actualDamage !== undefined && !isNaN(actualDamage)) {
        if (actualDamage >= Z0) {
          damageValue = 0.1 + (actualDamage - Z0) / (maxZ - Z0) * 0.9;
          damageValue = Math.min(Math.max(damageValue, 0.1), 1.0);
        } else {
          damageValue = (actualDamage / Z0) * 0.1;
          damageValue = Math.min(Math.max(damageValue, 0), 0.1);
        }
        
        console.log(`   DI${i+1} (Element ${elementID}): ${damageValue.toFixed(4)} (from actual: ${actualDamage.toFixed(3)})`);
      } else {
        console.log(`   DI${i+1} (Element ${elementID}): ${damageValue.toFixed(4)} (no damage data)`);
      }
    }
    
    csvContent += "," + damageValue.toFixed(4);
  }
  csvContent += "\n";

  console.log(`\n✅ Generated raw values CSV with ${1 + featureCount + numDamageIndices} columns`);
  console.log(`📊 Structure: 1 Case + ${featureCount} Features (raw) + ${numDamageIndices} DI columns`);
  
  return csvContent;
}

function applyRawValuesFix() {
  console.log('🔧 === APPLYING RAW VALUES FIX TO SYSTEM ===\n');
  
  // Backup original function
  if (window.generateTestCsvFromDamageData) {
    window.generateTestCsvFromDamageData_backup = window.generateTestCsvFromDamageData;
    console.log('📦 Original function backed up');
  }
  
  // Replace with raw values version
  window.generateTestCsvFromDamageData = function(damageData, damagedElements, numDamageIndices, modeUsed) {
    console.log('🔧 === USING RAW VALUES CSV GENERATION ===');
    return createRawValuesCsvContent(damageData, damagedElements, numDamageIndices, modeUsed);
  };
  
  console.log('✅ System function replaced with raw values version');
  
  // Test the replacement
  console.log('\n🧪 Testing raw values fix...');
  testRawValuesFix();
}

function testRawValuesFix() {
  createTestCsvContent().then(csvContent => {
    console.log('✅ Raw values fix test completed');
    
    const lines = csvContent.split('\n');
    const dataRow = lines[1];
    const values = dataRow.split(',');
    
    console.log('📊 Raw values fix results (first 10):');
    for (let i = 1; i <= 10; i++) {
      console.log(`   U${i}: ${values[i]}`);
    }
    
    // Check if values are raw (not scaled)
    const firstValue = parseFloat(values[1]);
    const isRaw = Math.abs(firstValue) < 0.01; // Raw values should be small
    
    console.log(`\n📊 Raw values fix status: ${isRaw ? '🎉 SUCCESS' : '❌ STILL SCALED'}`);
    console.log(`📊 U1 value: ${firstValue} (should be raw EigenVector_UZ)`);
    
    if (isRaw) {
      alert('🎉 Raw values fix successful!\n\nCSV now uses raw EigenVector_UZ values from Damage.txt');
    } else {
      alert('❌ Raw values fix failed.\n\nValues are still scaled. Check console for details.');
    }
    
  }).catch(error => {
    console.error('❌ Raw values fix test failed:', error);
  });
}

function createRawValuesFixReport() {
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
      🔧 Raw Values CSV Fix
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📊 Expected Behavior:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #0c5460;">
        Mode 10: U1=-0.000274954299179129, U2=-0.000274167681433519<br>
        Mode 12: U1=0.000162612101653345, U2=-0.000156897623394039<br>
        <strong>Raw EigenVector_UZ values, no scaling</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Current Problem:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #721c24;">
        U1: 0.08892 (scaled, wrong)<br>
        U2: 0.088822 (scaled, wrong)<br>
        U5: 1 (scaling error)<br>
        <strong>Values are scaled instead of raw</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Raw Values Solution:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Use EigenVector_UZ values directly from Damage.txt</li>
        <li>No scaling or normalization applied</li>
        <li>U1 = Node 1 value, U2 = Node 2 value, etc.</li>
        <li>Preserve exact numerical precision</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Fix Actions:</h4>
      
      <button onclick="generateRawValuesCsv()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 Generate Raw Values CSV</button>
      
      <button onclick="applyRawValuesFix()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Apply Raw Values Fix</button>
      
      <button onclick="testRawValuesFix()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Raw Values Fix</button>
      
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
        💡 This will use exact EigenVector_UZ values from Damage.txt without any scaling
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateRawValuesCsv = generateRawValuesCsv;
  window.createRawValuesCsvContent = createRawValuesCsvContent;
  window.applyRawValuesFix = applyRawValuesFix;
  window.testRawValuesFix = testRawValuesFix;
  window.createRawValuesFixReport = createRawValuesFixReport;
}
