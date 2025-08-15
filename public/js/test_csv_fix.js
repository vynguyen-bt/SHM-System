// Test script để verify CSV fix

function testCsvFix() {
  console.log('🧪 === TESTING CSV FIX ===\n');
  
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
  console.log(`📊 Testing fix for mode ${modeUsed}`);
  
  // Generate CSV with fixed function
  createTestCsvContent().then(csvContent => {
    console.log('✅ CSV generated with fixed function');
    
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`📊 CSV structure: ${lines.length} lines`);
    console.log(`📊 Header: ${header.substring(0, 80)}...`);
    
    // Parse and analyze values
    const columns = header.split(',');
    const values = dataRow.split(',');
    
    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));
    
    console.log(`📊 Features: ${featureColumns.length}, DI columns: ${diColumns.length}`);
    
    // Show first 10 feature values
    console.log('\n📊 First 10 feature values (FIXED):');
    for (let i = 1; i <= Math.min(10, featureColumns.length); i++) {
      const value = values[i];
      console.log(`   U${i}: ${value}`);
    }
    
    // Compare with expected pattern
    console.log('\n📊 Expected vs Actual comparison:');
    
    // Expected raw values for mode 12
    const expectedRaw = {
      1: 0.000162612101653345,
      2: -0.000156897623394039,
      3: 2.36620838888116E-06,
      4: -3.83791369962345E-06,
      18: 5.49961903489064E-06
    };
    
    // Calculate expected scaled values
    const maxExpected = Math.max(...Object.values(expectedRaw).map(v => Math.abs(v)));
    
    console.log('Expected pattern:');
    Object.entries(expectedRaw).forEach(([nodeID, rawValue], index) => {
      const absValue = Math.abs(rawValue);
      const expectedScaled = 0.001 + (absValue / maxExpected) * 0.999;
      const actualValue = parseFloat(values[index + 1]);
      
      console.log(`   Node ${nodeID} → U${index + 1}:`);
      console.log(`      Raw: ${rawValue.toExponential(6)}`);
      console.log(`      Expected scaled: ${expectedScaled.toFixed(6)}`);
      console.log(`      Actual CSV: ${actualValue.toFixed(6)}`);
      console.log(`      Match: ${Math.abs(actualValue - expectedScaled) < 0.01 ? '✅' : '❌'}`);
    });
    
    // Analyze value distribution
    const featureValues = values.slice(1, featureColumns.length + 1).map(v => parseFloat(v));
    const min = Math.min(...featureValues);
    const max = Math.max(...featureValues);
    const avg = featureValues.reduce((sum, v) => sum + v, 0) / featureValues.length;
    
    console.log('\n📊 Value distribution analysis:');
    console.log(`   Range: ${min.toFixed(6)} - ${max.toFixed(6)}`);
    console.log(`   Average: ${avg.toFixed(6)}`);
    console.log(`   Reasonable range: ${min >= 0.001 && max <= 1.0 ? '✅' : '❌'}`);
    console.log(`   Value variation: ${max - min > 0.1 ? '✅' : '❌'}`);
    
    // Check for the problematic U5=1 issue
    const u5Value = parseFloat(values[5]);
    console.log(`\n📊 U5 value check: ${u5Value}`);
    console.log(`   U5 = 1 issue: ${u5Value === 1 ? '❌ Still present' : '✅ Fixed'}`);
    
    // Download fixed CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_FIXED.csv';
    link.click();
    
    console.log('\n📁 Fixed CSV downloaded as TEST_FIXED.csv');
    
    // Overall assessment
    const isFixed = max <= 1.0 && min >= 0.001 && u5Value !== 1 && (max - min) > 0.1;
    console.log(`\n📊 Overall fix status: ${isFixed ? '🎉 FIXED' : '❌ Still has issues'}`);
    
    if (isFixed) {
      alert('🎉 CSV fix successful!\n\nValues now correctly reflect Damage.txt data with proper scaling.');
    } else {
      alert('⚠️ CSV still has issues.\n\nCheck console for detailed analysis.');
    }
    
  }).catch(error => {
    console.error('❌ CSV generation failed:', error);
    alert(`❌ CSV generation failed: ${error.message}`);
  });
}

function compareBeforeAfterFix() {
  console.log('🔄 === COMPARING BEFORE/AFTER FIX ===\n');
  
  console.log('📊 BEFORE FIX (reported values):');
  const beforeValues = [0.08892, 0.088822, 0.027522, 0.027177, 1, 0.039927, 0.026544];
  beforeValues.forEach((value, index) => {
    console.log(`   U${index + 1}: ${value}`);
  });
  
  console.log('\n📊 Issues with BEFORE values:');
  console.log('   ❌ U5 = 1 (scaling error)');
  console.log('   ❌ Values too similar (0.088892 vs 0.088822)');
  console.log('   ❌ No clear magnitude relationship');
  console.log('   ❌ Range issues');
  
  // Test current fix
  testCsvFix();
}

function createCsvFixTestReport() {
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
      🧪 CSV Fix Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Original Problem:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #721c24;">
        U1: 0.08892 (should be highest)<br>
        U2: 0.088822 (too similar to U1)<br>
        U3: 0.027522 (should be much smaller)<br>
        U4: 0.027177 (should be much smaller)<br>
        U5: 1 (ERROR! Scaling issue)<br>
        Problem: Wrong node mapping & scaling
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Expected After Fix:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #155724;">
        U1: ~0.999 (Node 1, highest magnitude)<br>
        U2: ~0.964 (Node 2, second highest)<br>
        U3: ~0.015 (Node 3, very small)<br>
        U4: ~0.024 (Node 4, small)<br>
        U5: Variable (depends on Node 18 position)<br>
        All values in 0.001-1.0 range
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testCsvFix()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test CSV Fix</button>
      
      <button onclick="compareBeforeAfterFix()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Compare Before/After</button>
      
      <button onclick="createCsvDataFlowDebugReport()" style="
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
        💡 Check browser console for detailed test results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testCsvFix = testCsvFix;
  window.compareBeforeAfterFix = compareBeforeAfterFix;
  window.createCsvFixTestReport = createCsvFixTestReport;
}
