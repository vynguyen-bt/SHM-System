// Debug script để test Damage.txt parsing và scaling

function debugDamageTxtParsing() {
  console.log('🔍 === DEBUGGING DAMAGE.TXT PARSING AND SCALING ===\n');
  
  // 1. Check file availability
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    
    // 2. Test parsing for different modes
    console.log('📋 1. TESTING MODE PARSING:');
    
    const testModes = [10, 12, 14, 17, 20];
    const modeUsed = window.strainEnergyResults?.modeUsed || 12;
    
    console.log(`📊 Current mode from Section 1: ${modeUsed}`);
    
    testModes.forEach(mode => {
      try {
        const modeData = parseModeShapeFile(damageContent, mode);
        const nodeCount = Object.keys(modeData).length;
        console.log(`Mode ${mode}: ${nodeCount} nodes`);
        
        if (nodeCount > 0) {
          const nodeIDs = Object.keys(modeData).map(id => parseInt(id)).sort((a, b) => a - b);
          const firstFiveNodes = nodeIDs.slice(0, 5);
          
          console.log(`   First 5 nodes: [${firstFiveNodes.join(', ')}]`);
          console.log(`   Values:`);
          firstFiveNodes.forEach(nodeID => {
            const value = modeData[nodeID];
            console.log(`      Node ${nodeID}: ${value} (${value.toExponential(3)})`);
          });
        }
      } catch (error) {
        console.log(`Mode ${mode}: Error - ${error.message}`);
      }
    });
    
    // 3. Test scaling for current mode
    console.log(`\n📋 2. TESTING SCALING FOR MODE ${modeUsed}:`);
    
    try {
      const damageData = parseModeShapeFile(damageContent, modeUsed);
      const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
      
      if (nodeIDs.length === 0) {
        console.log(`❌ No data found for mode ${modeUsed}`);
        return;
      }
      
      console.log(`📊 Total nodes: ${nodeIDs.length}`);
      console.log(`📊 Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
      
      // Show raw values for first 5 nodes
      console.log('\n📊 RAW VALUES (first 5 nodes):');
      const firstFive = nodeIDs.slice(0, 5);
      firstFive.forEach(nodeID => {
        const rawValue = damageData[nodeID];
        console.log(`   Node ${nodeID}: ${rawValue} (${rawValue.toExponential(6)})`);
      });
      
      // Test current scaling
      console.log('\n📊 CURRENT SCALING RESULTS:');
      testCurrentScaling(damageData, firstFive);
      
      // Test improved scaling
      console.log('\n📊 IMPROVED SCALING RESULTS:');
      testImprovedScaling(damageData, firstFive);
      
    } catch (error) {
      console.error(`❌ Error testing mode ${modeUsed}:`, error);
    }
  };
  
  reader.readAsText(file);
}

function testCurrentScaling(damageData, nodeIDs) {
  const modeShapeValues = nodeIDs.map(nodeID => Math.abs(damageData[nodeID] || 0));
  const maxModeValue = Math.max(...modeShapeValues);
  const minModeValue = Math.min(...modeShapeValues.filter(v => v > 0));
  
  console.log(`   Range: ${minModeValue.toExponential(3)} - ${maxModeValue.toExponential(3)}`);
  
  nodeIDs.forEach((nodeID, index) => {
    const rawValue = damageData[nodeID];
    const absValue = Math.abs(rawValue);
    
    // Current scaling logic
    const logScaled = Math.log10(absValue / minModeValue + 1) / Math.log10(maxModeValue / minModeValue + 1);
    const linearScaled = (absValue / maxModeValue) * 1000;
    
    let featureValue;
    if (absValue < minModeValue * 10) {
      featureValue = Math.max(logScaled * 0.1, 0.001);
    } else {
      featureValue = Math.min(Math.max(linearScaled, 0.001), 1.0);
    }
    
    console.log(`   U${index + 1} (Node ${nodeID}): ${rawValue.toExponential(6)} → ${featureValue.toFixed(6)}`);
  });
}

function testImprovedScaling(damageData, nodeIDs) {
  // Improved scaling: preserve relative magnitudes better
  const allValues = Object.values(damageData);
  const absValues = allValues.map(v => Math.abs(v));
  const maxAbs = Math.max(...absValues);
  const minAbs = Math.min(...absValues.filter(v => v > 0));
  
  console.log(`   Improved range: ${minAbs.toExponential(3)} - ${maxAbs.toExponential(3)}`);
  
  nodeIDs.forEach((nodeID, index) => {
    const rawValue = damageData[nodeID];
    const absValue = Math.abs(rawValue);
    
    // Improved scaling: simple normalization preserving relative magnitudes
    let scaledValue;
    if (absValue === 0) {
      scaledValue = 0.001; // Minimum for zero values
    } else {
      // Normalize to 0.001 - 1.0 range while preserving relative magnitudes
      scaledValue = 0.001 + (absValue / maxAbs) * 0.999;
    }
    
    console.log(`   U${index + 1} (Node ${nodeID}): ${rawValue.toExponential(6)} → ${scaledValue.toFixed(6)}`);
  });
}

function compareExpectedVsActual() {
  console.log('📊 === COMPARING EXPECTED VS ACTUAL CSV VALUES ===\n');
  
  // Expected values from Damage.txt (first 5 nodes for mode 12)
  const expectedRawValues = {
    1: 0.000162612101653345,
    2: -0.000156897623394039,
    3: 2.36620838888116E-06,
    4: -3.83791369962345E-06,
    18: 5.49961903489064E-06
  };
  
  // Actual values from TEST.csv
  const actualCsvValues = {
    1: 0.08892,
    2: 0.088822,
    3: 0.027522,
    4: 0.027177,
    5: 1 // This should be node 18
  };
  
  console.log('📋 EXPECTED RAW VALUES (from Damage.txt):');
  Object.entries(expectedRawValues).forEach(([nodeID, value]) => {
    console.log(`   Node ${nodeID}: ${value} (${value.toExponential(6)})`);
  });
  
  console.log('\n📋 ACTUAL CSV VALUES:');
  Object.entries(actualCsvValues).forEach(([index, value]) => {
    console.log(`   U${index}: ${value}`);
  });
  
  console.log('\n📋 ANALYSIS:');
  console.log('❌ Values completely different - scaling algorithm is wrong');
  console.log('❌ Node order may be incorrect');
  console.log('❌ Scaling produces values much larger than raw values');
  
  console.log('\n📋 RECOMMENDATIONS:');
  console.log('1. Use simpler scaling that preserves relative magnitudes');
  console.log('2. Verify node ordering matches expected sequence');
  console.log('3. Consider using raw values with minimal scaling');
}

function createImprovedScalingFunction() {
  console.log('🔧 === CREATING IMPROVED SCALING FUNCTION ===\n');
  
  const improvedScaling = `
// ✅ IMPROVED SCALING FUNCTION
function generateTestCsvFromDamageDataImproved(damageData, damagedElements, numDamageIndices, modeUsed) {
  console.log('🔄 === GENERATING TEST CSV WITH IMPROVED SCALING ===');
  
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  const featureCount = nodeIDs.length;
  
  // Create CSV header
  let csvContent = "Case";
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\\n";
  
  // Create test case
  csvContent += "0"; // Case number
  
  // Improved scaling: preserve relative magnitudes
  const allValues = Object.values(damageData);
  const absValues = allValues.map(v => Math.abs(v));
  const maxAbs = Math.max(...absValues);
  
  // Generate features with improved scaling
  for (let i = 0; i < featureCount; i++) {
    const nodeID = nodeIDs[i];
    const rawValue = damageData[nodeID];
    const absValue = Math.abs(rawValue);
    
    let scaledValue;
    if (absValue === 0) {
      scaledValue = 0.001;
    } else {
      // Simple normalization: scale to 0.001 - 1.0 range
      scaledValue = 0.001 + (absValue / maxAbs) * 0.999;
    }
    
    csvContent += "," + scaledValue.toFixed(6);
  }
  
  // Add DI values (existing logic)
  // ... DI generation code ...
  
  return csvContent;
}`;
  
  console.log(improvedScaling);
}

function createDamageTxtDebugReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 700px;
    max-height: 700px;
    background: white;
    border: 2px solid #dc3545;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #dc3545; text-align: center;">
      🔍 Damage.txt Parsing Debug
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Issue Identified:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #721c24; font-size: 13px;">
        <li>CSV values don't match raw Damage.txt values</li>
        <li>Scaling algorithm is too aggressive</li>
        <li>Node ordering may be incorrect</li>
        <li>Expected: -0.000162 → Got: 0.08892</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Debug Actions:</h4>
      
      <button onclick="debugDamageTxtParsing()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Debug Parsing & Scaling</button>
      
      <button onclick="compareExpectedVsActual()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 Compare Expected vs Actual</button>
      
      <button onclick="createImprovedScalingFunction()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Show Improved Scaling</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #6c757d; 
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
        💡 Check browser console for detailed debug results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugDamageTxtParsing = debugDamageTxtParsing;
  window.compareExpectedVsActual = compareExpectedVsActual;
  window.createImprovedScalingFunction = createImprovedScalingFunction;
  window.createDamageTxtDebugReport = createDamageTxtDebugReport;
}
