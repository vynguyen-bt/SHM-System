// Comprehensive debug script để trace data flow từ Damage.txt → CSV

function debugCsvDataFlow() {
  console.log('🔍 === DEBUGGING CSV DATA FLOW ===\n');
  
  // 1. Check prerequisites
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
  console.log(`📊 Mode used: ${modeUsed}`);
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    
    console.log('📋 STEP 1: RAW FILE CONTENT ANALYSIS');
    analyzeRawFileContent(damageContent, modeUsed);
    
    console.log('\n📋 STEP 2: PARSING FUNCTION TEST');
    const parsedData = testParsingFunction(damageContent, modeUsed);
    
    console.log('\n📋 STEP 3: NODE ORDERING VERIFICATION');
    const orderedNodes = verifyNodeOrdering(parsedData);
    
    console.log('\n📋 STEP 4: SCALING ALGORITHM TEST');
    testScalingAlgorithm(parsedData, orderedNodes);
    
    console.log('\n📋 STEP 5: CSV GENERATION TRACE');
    traceCsvGeneration(parsedData, orderedNodes);
    
    console.log('\n📋 STEP 6: ACTUAL VS EXPECTED COMPARISON');
    compareActualVsExpected();
  };
  
  reader.readAsText(file);
}

function analyzeRawFileContent(content, mode) {
  const lines = content.trim().split('\n');
  console.log(`📊 Total lines: ${lines.length}`);
  
  // Find all entries for the specific mode
  const modeEntries = [];
  for (let i = 1; i < lines.length; i++) { // Skip header
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 3 && parseInt(parts[1]) === mode) {
      modeEntries.push({
        nodeID: parseInt(parts[0]),
        mode: parseInt(parts[1]),
        eigenValue: parseFloat(parts[2]),
        rawLine: lines[i]
      });
    }
  }
  
  console.log(`📊 Found ${modeEntries.length} entries for mode ${mode}`);
  
  // Show first 10 entries
  console.log('📊 First 10 entries for this mode:');
  modeEntries.slice(0, 10).forEach((entry, index) => {
    console.log(`   ${index + 1}. Node ${entry.nodeID}: ${entry.eigenValue.toExponential(6)}`);
  });
  
  // Check for expected nodes
  const expectedNodes = [1, 2, 3, 4, 18];
  console.log('\n📊 Expected nodes verification:');
  expectedNodes.forEach(nodeID => {
    const entry = modeEntries.find(e => e.nodeID === nodeID);
    if (entry) {
      console.log(`   ✅ Node ${nodeID}: ${entry.eigenValue.toExponential(6)}`);
    } else {
      console.log(`   ❌ Node ${nodeID}: Not found`);
    }
  });
  
  return modeEntries;
}

function testParsingFunction(content, mode) {
  console.log(`🔄 Testing parseModeShapeFile() for mode ${mode}...`);
  
  try {
    const parsedData = parseModeShapeFile(content, mode);
    const nodeCount = Object.keys(parsedData).length;
    
    console.log(`✅ Parsing successful: ${nodeCount} nodes`);
    
    // Verify specific nodes
    const expectedNodes = [1, 2, 3, 4, 18];
    console.log('📊 Parsed values for expected nodes:');
    expectedNodes.forEach(nodeID => {
      const value = parsedData[nodeID];
      if (value !== undefined) {
        console.log(`   Node ${nodeID}: ${value.toExponential(6)}`);
      } else {
        console.log(`   Node ${nodeID}: undefined`);
      }
    });
    
    return parsedData;
  } catch (error) {
    console.error(`❌ Parsing failed: ${error.message}`);
    return {};
  }
}

function verifyNodeOrdering(parsedData) {
  const nodeIDs = Object.keys(parsedData).map(id => parseInt(id)).sort((a, b) => a - b);
  
  console.log(`📊 Total nodes after sorting: ${nodeIDs.length}`);
  console.log(`📊 Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
  console.log(`📊 First 20 nodes: [${nodeIDs.slice(0, 20).join(', ')}]`);
  
  // Check for gaps in node sequence
  const gaps = [];
  for (let i = 1; i < Math.min(20, nodeIDs.length); i++) {
    const current = nodeIDs[i];
    const previous = nodeIDs[i - 1];
    if (current - previous > 1) {
      gaps.push(`${previous} → ${current}`);
    }
  }
  
  if (gaps.length > 0) {
    console.log(`⚠️ Node sequence gaps detected: ${gaps.join(', ')}`);
  } else {
    console.log(`✅ Node sequence is continuous (first 20)`);
  }
  
  return nodeIDs;
}

function testScalingAlgorithm(parsedData, nodeIDs) {
  const allValues = Object.values(parsedData);
  const absValues = allValues.map(v => Math.abs(v));
  const maxAbsValue = Math.max(...absValues);
  const minAbsValue = Math.min(...absValues.filter(v => v > 0));
  
  console.log(`📊 Value range: ${minAbsValue.toExponential(6)} - ${maxAbsValue.toExponential(6)}`);
  
  // Test scaling for first 10 nodes
  console.log('📊 Scaling test for first 10 nodes:');
  for (let i = 0; i < Math.min(10, nodeIDs.length); i++) {
    const nodeID = nodeIDs[i];
    const rawValue = parsedData[nodeID];
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

function traceCsvGeneration(parsedData, nodeIDs) {
  console.log('🔄 Tracing actual CSV generation process...');
  
  // Simulate the exact CSV generation logic
  const damagedElements = getDamagedElementsList();
  const numDamageIndices = damagedElements.length;
  
  console.log(`📊 Damaged elements: [${damagedElements.join(', ')}]`);
  console.log(`📊 DI count: ${numDamageIndices}`);
  
  // Test createTestCsvContent() function
  createTestCsvContent().then(csvContent => {
    console.log('✅ CSV generation completed');
    
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`📊 Header: ${header}`);
    console.log(`📊 Data row (first 100 chars): ${dataRow.substring(0, 100)}...`);
    
    // Parse and analyze the actual CSV values
    const columns = header.split(',');
    const values = dataRow.split(',');
    
    console.log('\n📊 Actual CSV values (first 10):');
    for (let i = 1; i <= Math.min(10, columns.length - numDamageIndices - 1); i++) {
      const columnName = columns[i];
      const value = values[i];
      console.log(`   ${columnName}: ${value}`);
    }
    
    // Compare with expected
    console.log('\n📊 Expected vs Actual comparison:');
    const expectedValues = {
      1: 0.000162612101653345,
      2: -0.000156897623394039,
      3: 2.36620838888116E-06,
      4: -3.83791369962345E-06,
      18: 5.49961903489064E-06
    };
    
    Object.entries(expectedValues).forEach(([nodeID, expectedRaw], index) => {
      const actualCsvValue = values[index + 1]; // Skip Case column
      const expectedScaled = calculateExpectedScaledValue(expectedRaw, parsedData);
      
      console.log(`   Node ${nodeID}:`);
      console.log(`      Raw expected: ${expectedRaw.toExponential(6)}`);
      console.log(`      Scaled expected: ${expectedScaled.toFixed(6)}`);
      console.log(`      Actual CSV: ${actualCsvValue}`);
      console.log(`      Match: ${Math.abs(parseFloat(actualCsvValue) - expectedScaled) < 0.001 ? '✅' : '❌'}`);
    });
    
  }).catch(error => {
    console.error('❌ CSV generation failed:', error);
  });
}

function calculateExpectedScaledValue(rawValue, allParsedData) {
  const allValues = Object.values(allParsedData);
  const maxAbsValue = Math.max(...allValues.map(v => Math.abs(v)));
  const absValue = Math.abs(rawValue);
  
  if (absValue === 0) {
    return 0.001;
  } else {
    return 0.001 + (absValue / maxAbsValue) * 0.999;
  }
}

function compareActualVsExpected() {
  console.log('📊 Current CSV values from user report:');
  const reportedValues = [0.08892, 0.088822, 0.027522, 0.027177, 1, 0.039927, 0.026544];
  
  reportedValues.forEach((value, index) => {
    console.log(`   U${index + 1}: ${value}`);
  });
  
  console.log('\n📊 Analysis of reported values:');
  console.log(`   Range: ${Math.min(...reportedValues)} - ${Math.max(...reportedValues)}`);
  console.log(`   U5 = 1: This suggests scaling error or wrong data source`);
  console.log(`   Values too large: Should be in 0.001-1.0 range with proper distribution`);
}

function createCsvDataFlowDebugReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 800px;
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
      🔍 CSV Data Flow Debug
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Current Issue:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #721c24;">
        Expected: U1=Node1, U2=Node2, U3=Node3...<br>
        Actual: U1=0.08892, U2=0.088822, U5=1 (wrong!)<br>
        Problem: Data extraction or scaling error
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">🔍 Debug Steps:</h4>
      <ol style="margin: 5px 0; padding-left: 20px; color: #0c5460; font-size: 13px;">
        <li>Analyze raw Damage.txt content</li>
        <li>Test parseModeShapeFile() function</li>
        <li>Verify node ordering and sorting</li>
        <li>Test scaling algorithm</li>
        <li>Trace CSV generation process</li>
        <li>Compare actual vs expected values</li>
      </ol>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Debug Actions:</h4>
      
      <button onclick="debugCsvDataFlow()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Full Data Flow Debug</button>
      
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
        💡 Check browser console for detailed debug trace
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugCsvDataFlow = debugCsvDataFlow;
  window.createCsvDataFlowDebugReport = createCsvDataFlowDebugReport;
}
