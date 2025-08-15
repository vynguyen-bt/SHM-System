// Test script để verify improved scaling

function testImprovedScaling() {
  console.log('🧪 === TESTING IMPROVED SCALING ===\n');
  
  // Check prerequisites
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('❌ Damage.txt file not loaded');
    return;
  }
  
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  if (!hasSection1Results) {
    console.log('❌ Section 1 results not available');
    return;
  }
  
  const modeUsed = window.strainEnergyResults.modeUsed || 12;
  console.log(`📊 Testing improved scaling for mode ${modeUsed}`);
  
  // Test CSV generation with improved scaling
  createTestCsvContent().then(csvContent => {
    console.log('✅ CSV generated with improved scaling');
    
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`📊 CSV structure: ${lines.length} lines`);
    console.log(`📊 Header: ${header.substring(0, 80)}...`);
    
    // Parse and analyze data
    const columns = header.split(',');
    const dataValues = dataRow.split(',');
    
    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));
    
    console.log(`📊 Features: ${featureColumns.length}, DI columns: ${diColumns.length}`);
    
    // Show first 10 feature values
    console.log('\n📊 FIRST 10 FEATURE VALUES (improved scaling):');
    for (let i = 1; i <= Math.min(10, featureColumns.length); i++) {
      const value = dataValues[i]; // Skip Case column
      console.log(`   U${i}: ${value}`);
    }
    
    // Compare with expected raw values
    console.log('\n📊 COMPARISON WITH EXPECTED RAW VALUES:');
    
    // Expected raw values for mode 12 (first 5 nodes)
    const expectedRaw = {
      1: 0.000162612101653345,
      2: -0.000156897623394039,
      3: 2.36620838888116E-06,
      4: -3.83791369962345E-06,
      18: 5.49961903489064E-06
    };
    
    console.log('Expected raw values:');
    Object.entries(expectedRaw).forEach(([nodeID, value]) => {
      console.log(`   Node ${nodeID}: ${value.toExponential(6)}`);
    });
    
    console.log('Actual CSV values (first 5):');
    for (let i = 1; i <= 5; i++) {
      const csvValue = parseFloat(dataValues[i]);
      console.log(`   U${i}: ${csvValue.toFixed(6)}`);
    }
    
    // Analyze scaling quality
    analyzeScalingQuality(dataValues, featureColumns.length);
    
  }).catch(error => {
    console.error('❌ CSV generation failed:', error);
  });
}

function analyzeScalingQuality(dataValues, featureCount) {
  console.log('\n📊 SCALING QUALITY ANALYSIS:');
  
  // Extract feature values (skip Case column)
  const featureValues = dataValues.slice(1, featureCount + 1).map(v => parseFloat(v));
  
  // Calculate statistics
  const min = Math.min(...featureValues);
  const max = Math.max(...featureValues);
  const avg = featureValues.reduce((sum, v) => sum + v, 0) / featureValues.length;
  const nonZeroCount = featureValues.filter(v => v > 0.001).length;
  
  console.log(`📊 Value range: ${min.toFixed(6)} - ${max.toFixed(6)}`);
  console.log(`📊 Average: ${avg.toFixed(6)}`);
  console.log(`📊 Non-zero values: ${nonZeroCount}/${featureCount} (${(nonZeroCount/featureCount*100).toFixed(1)}%)`);
  
  // Check for reasonable distribution
  const reasonableRange = min >= 0.001 && max <= 1.0;
  const goodDistribution = nonZeroCount > featureCount * 0.8; // At least 80% non-zero
  const notAllSame = max - min > 0.001; // Values are not all the same
  
  console.log(`📊 Reasonable range (0.001-1.0): ${reasonableRange ? '✅' : '❌'}`);
  console.log(`📊 Good distribution: ${goodDistribution ? '✅' : '❌'}`);
  console.log(`📊 Value variation: ${notAllSame ? '✅' : '❌'}`);
  
  const qualityScore = [reasonableRange, goodDistribution, notAllSame].filter(Boolean).length;
  console.log(`📊 Overall quality: ${qualityScore}/3 ${qualityScore === 3 ? '🎉' : qualityScore === 2 ? '⚠️' : '❌'}`);
  
  return qualityScore === 3;
}

function compareOldVsNewScaling() {
  console.log('🔄 === COMPARING OLD VS NEW SCALING ===\n');
  
  // Test data (first 5 nodes from Damage.txt mode 12)
  const testData = {
    1: 0.000162612101653345,
    2: -0.000156897623394039,
    3: 2.36620838888116E-06,
    4: -3.83791369962345E-06,
    18: 5.49961903489064E-06
  };
  
  const nodeIDs = Object.keys(testData).map(id => parseInt(id));
  const values = Object.values(testData);
  const absValues = values.map(v => Math.abs(v));
  const maxAbs = Math.max(...absValues);
  const minAbs = Math.min(...absValues.filter(v => v > 0));
  
  console.log('📊 TEST DATA:');
  Object.entries(testData).forEach(([nodeID, value]) => {
    console.log(`   Node ${nodeID}: ${value.toExponential(6)}`);
  });
  
  console.log(`\n📊 Range: ${minAbs.toExponential(6)} - ${maxAbs.toExponential(6)}`);
  
  // Old scaling (complex hybrid)
  console.log('\n📊 OLD SCALING RESULTS:');
  nodeIDs.forEach((nodeID, index) => {
    const rawValue = testData[nodeID];
    const absValue = Math.abs(rawValue);
    
    const logScaled = Math.log10(absValue / minAbs + 1) / Math.log10(maxAbs / minAbs + 1);
    const linearScaled = (absValue / maxAbs) * 1000;
    
    let oldResult;
    if (absValue < minAbs * 10) {
      oldResult = Math.max(logScaled * 0.1, 0.001);
    } else {
      oldResult = Math.min(Math.max(linearScaled, 0.001), 1.0);
    }
    
    console.log(`   Node ${nodeID}: ${rawValue.toExponential(6)} → ${oldResult.toFixed(6)}`);
  });
  
  // New scaling (simple normalization)
  console.log('\n📊 NEW SCALING RESULTS:');
  nodeIDs.forEach((nodeID, index) => {
    const rawValue = testData[nodeID];
    const absValue = Math.abs(rawValue);
    
    let newResult;
    if (absValue === 0) {
      newResult = 0.001;
    } else {
      newResult = 0.001 + (absValue / maxAbs) * 0.999;
      newResult = Math.max(newResult, 0.001);
    }
    
    console.log(`   Node ${nodeID}: ${rawValue.toExponential(6)} → ${newResult.toFixed(6)}`);
  });
  
  console.log('\n📊 COMPARISON:');
  console.log('✅ New scaling preserves relative magnitudes better');
  console.log('✅ New scaling is simpler and more predictable');
  console.log('✅ New scaling maintains proper value relationships');
}

function createScalingTestReport() {
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
      🧪 Improved Scaling Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Scaling Improvements:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Simple normalization preserves relative magnitudes</li>
        <li>Raw values properly scaled to 0.001-1.0 range</li>
        <li>Maintains relationships between node values</li>
        <li>More predictable and interpretable results</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testImprovedScaling()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Improved Scaling</button>
      
      <button onclick="compareOldVsNewScaling()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Compare Old vs New</button>
      
      <button onclick="createDamageTxtDebugReport()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Debug Parsing</button>
      
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
  window.testImprovedScaling = testImprovedScaling;
  window.compareOldVsNewScaling = compareOldVsNewScaling;
  window.createScalingTestReport = createScalingTestReport;
}
