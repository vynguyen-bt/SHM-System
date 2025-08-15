// Fix CSV generation để đảm bảo correct mapping từ Damage.txt

function generateCorrectedTestCsv(damageData, damagedElements, numDamageIndices, modeUsed) {
  console.log('🔧 === GENERATING CORRECTED TEST CSV ===');
  console.log(`📊 Input: ${Object.keys(damageData).length} nodes, ${numDamageIndices} DI columns, mode ${modeUsed}`);

  // ✅ CRITICAL FIX: Use sorted node IDs for correct mapping
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  const totalNodes = nodeIDs.length;
  
  console.log(`📊 Total nodes: ${totalNodes}`);
  console.log(`📊 Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
  console.log(`📊 First 10 nodes: [${nodeIDs.slice(0, 10).join(', ')}]`);

  // ✅ VERIFY EXPECTED NODES ARE PRESENT
  const expectedNodes = [1, 2, 3, 4, 18];
  console.log('\n📊 Verifying expected nodes:');
  expectedNodes.forEach(nodeID => {
    const value = damageData[nodeID];
    if (value !== undefined) {
      console.log(`   ✅ Node ${nodeID}: ${value.toExponential(6)}`);
    } else {
      console.log(`   ❌ Node ${nodeID}: Missing!`);
    }
  });

  // Create CSV header: Case,U1,U2,...,UN,DI1,DI2,...,DIM
  let csvContent = "Case";
  
  // Add feature columns (U1-UN where N = total nodes)
  for (let i = 1; i <= totalNodes; i++) {
    csvContent += ",U" + i;
  }
  
  // Add damage indices columns
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";

  // Create single test case (Case=0)
  csvContent += "0"; // Case number

  // ✅ CALCULATE PROPER SCALING
  const allValues = Object.values(damageData);
  const absValues = allValues.map(v => Math.abs(v));
  const maxAbsValue = Math.max(...absValues);
  const minAbsValue = Math.min(...absValues.filter(v => v > 0));
  
  console.log(`\n📊 Value statistics:`);
  console.log(`   Max absolute: ${maxAbsValue.toExponential(6)}`);
  console.log(`   Min absolute: ${minAbsValue.toExponential(6)}`);
  console.log(`   Range ratio: ${(maxAbsValue / minAbsValue).toFixed(2)}`);

  // ✅ GENERATE FEATURES WITH CORRECT NODE MAPPING
  console.log('\n📊 Feature generation (first 10):');
  for (let i = 0; i < totalNodes; i++) {
    const nodeID = nodeIDs[i];
    const rawValue = damageData[nodeID];
    const absValue = Math.abs(rawValue);
    
    let scaledValue;
    if (absValue === 0) {
      scaledValue = 0.001;
    } else {
      // Simple linear scaling to 0.001-1.0 range
      scaledValue = 0.001 + (absValue / maxAbsValue) * 0.999;
      scaledValue = Math.max(scaledValue, 0.001);
    }
    
    // Log first 10 for verification
    if (i < 10) {
      console.log(`   U${i + 1} (Node ${nodeID}): ${rawValue.toExponential(6)} → ${scaledValue.toFixed(6)}`);
    }
    
    csvContent += "," + scaledValue.toFixed(6);
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

  console.log(`\n✅ Generated corrected CSV with ${1 + totalNodes + numDamageIndices} columns`);
  console.log(`📊 Structure: 1 Case + ${totalNodes} Features + ${numDamageIndices} DI columns`);
  
  return csvContent;
}

function testCorrectedCsvGeneration() {
  console.log('🧪 === TESTING CORRECTED CSV GENERATION ===\n');
  
  // Check prerequisites
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const hasSection1 = window.strainEnergyResults && window.strainEnergyResults.z;
  if (!hasSection1) {
    console.log('❌ Section 1 results not available');
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
    
    // Parse damage data
    const damageData = parseModeShapeFile(content, modeUsed);
    
    if (Object.keys(damageData).length === 0) {
      console.log(`❌ No data found for mode ${modeUsed}`);
      return;
    }
    
    // Generate corrected CSV
    const correctedCsv = generateCorrectedTestCsv(damageData, damagedElements, numDamageIndices, modeUsed);
    
    // Analyze the result
    const lines = correctedCsv.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`\n📊 Generated CSV analysis:`);
    console.log(`   Lines: ${lines.length}`);
    console.log(`   Header: ${header.substring(0, 80)}...`);
    console.log(`   Data (first 100 chars): ${dataRow.substring(0, 100)}...`);
    
    // Parse and show first 10 values
    const values = dataRow.split(',');
    console.log('\n📊 First 10 feature values:');
    for (let i = 1; i <= 10; i++) {
      console.log(`   U${i}: ${values[i]}`);
    }
    
    // Compare with expected pattern
    console.log('\n📊 Expected vs Actual comparison:');
    const expectedPattern = {
      1: 'highest (Node 1 has largest magnitude)',
      2: 'second highest (Node 2)',
      3: 'very small (Node 3)',
      4: 'very small (Node 4)',
      5: 'depends on Node 18 position'
    };
    
    Object.entries(expectedPattern).forEach(([index, description]) => {
      const actualValue = parseFloat(values[index]);
      console.log(`   U${index}: ${actualValue.toFixed(6)} (${description})`);
    });
    
    // Download corrected CSV
    const blob = new Blob([correctedCsv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_CORRECTED.csv';
    link.click();
    
    console.log('\n📁 Corrected CSV downloaded as TEST_CORRECTED.csv');
  };
  
  reader.readAsText(file);
}

function replaceCsvGenerationFunction() {
  console.log('🔧 === REPLACING CSV GENERATION FUNCTION ===\n');
  
  // Replace the existing function with corrected version
  if (typeof window !== 'undefined') {
    // Backup original function
    window.generateTestCsvFromDamageData_original = window.generateTestCsvFromDamageData;
    
    // Replace with corrected version
    window.generateTestCsvFromDamageData = generateCorrectedTestCsv;
    
    console.log('✅ CSV generation function replaced with corrected version');
    console.log('📊 Original function backed up as generateTestCsvFromDamageData_original');
    
    // Test the replacement
    console.log('\n🧪 Testing replacement...');
    testCorrectedCsvGeneration();
  }
}

function createCsvFixReport() {
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
      🔧 CSV Generation Fix
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Fixes Applied:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Correct node ID sorting and mapping</li>
        <li>Proper U1→Node1, U2→Node2 correspondence</li>
        <li>Fixed scaling algorithm preserving magnitudes</li>
        <li>Verified expected nodes presence</li>
        <li>Enhanced logging for debugging</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Expected Results:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #856404;">
        U1: ~0.999 (Node 1, highest magnitude)<br>
        U2: ~0.964 (Node 2, second highest)<br>
        U3: ~0.015 (Node 3, very small)<br>
        U4: ~0.024 (Node 4, small)<br>
        U5: Variable (depends on Node 18 position)
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Fix Actions:</h4>
      
      <button onclick="testCorrectedCsvGeneration()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Corrected Generation</button>
      
      <button onclick="replaceCsvGenerationFunction()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Apply Fix to System</button>
      
      <button onclick="debugCsvDataFlow()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Debug Data Flow</button>
      
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
        💡 Check browser console for detailed fix results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateCorrectedTestCsv = generateCorrectedTestCsv;
  window.testCorrectedCsvGeneration = testCorrectedCsvGeneration;
  window.replaceCsvGenerationFunction = replaceCsvGenerationFunction;
  window.createCsvFixReport = createCsvFixReport;
}
