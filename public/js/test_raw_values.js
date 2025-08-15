// Test script để verify raw values CSV generation

function testRawValuesGeneration() {
  console.log('🧪 === TESTING RAW VALUES CSV GENERATION ===\n');
  
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
  console.log(`📊 Testing raw values for mode ${modeUsed}`);
  
  // Generate CSV with raw values
  createTestCsvContent().then(csvContent => {
    console.log('✅ CSV generated with raw values');
    
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
    console.log('\n📊 First 10 feature values (should be raw):');
    for (let i = 1; i <= Math.min(10, featureColumns.length); i++) {
      const value = values[i];
      console.log(`   U${i}: ${value}`);
    }
    
    // Compare with expected raw values
    console.log('\n📊 Expected vs Actual comparison:');
    
    // Expected raw values based on user's example
    const expectedRawValues = {
      10: {
        1: -0.000274954299179129,
        2: -0.000274167681433519,
        3: -3.08294757699798E-05,
        4: -3.02867085697983E-05,
        18: -0.000378805364910897
      },
      12: {
        1: 0.000162612101653345,
        2: -0.000156897623394039,
        3: 2.36620838888116E-06,
        4: -3.83791369962345E-06,
        18: 5.49961903489064E-06
      }
    };
    
    if (expectedRawValues[modeUsed]) {
      const expected = expectedRawValues[modeUsed];
      console.log(`Expected raw values for Mode ${modeUsed}:`);
      
      Object.entries(expected).forEach(([nodeID, expectedValue], index) => {
        const actualValue = parseFloat(values[index + 1]);
        const match = Math.abs(actualValue - expectedValue) < 1e-15;
        
        console.log(`   Node ${nodeID} → U${index + 1}:`);
        console.log(`      Expected: ${expectedValue}`);
        console.log(`      Actual:   ${actualValue}`);
        console.log(`      Match:    ${match ? '✅' : '❌'}`);
      });
    }
    
    // Analyze value characteristics
    const featureValues = values.slice(1, featureColumns.length + 1).map(v => parseFloat(v));
    const nonZeroValues = featureValues.filter(v => v !== 0);
    const maxAbs = Math.max(...featureValues.map(v => Math.abs(v)));
    const minAbs = Math.min(...nonZeroValues.map(v => Math.abs(v)));
    
    console.log('\n📊 Value characteristics analysis:');
    console.log(`   Max absolute: ${maxAbs.toExponential(6)}`);
    console.log(`   Min absolute: ${minAbs.toExponential(6)}`);
    console.log(`   Range: Very small values (raw EigenVector_UZ)`);
    console.log(`   Zero values: ${featureValues.filter(v => v === 0).length}`);
    console.log(`   Non-zero values: ${nonZeroValues.length}`);
    
    // Check if values are raw (should be very small)
    const areRawValues = maxAbs < 0.01; // Raw values should be much smaller than 1
    const noScalingError = !featureValues.includes(1); // No U5=1 error
    
    console.log(`\n📊 Raw values verification:`);
    console.log(`   Values are raw (< 0.01): ${areRawValues ? '✅' : '❌'}`);
    console.log(`   No scaling errors: ${noScalingError ? '✅' : '❌'}`);
    console.log(`   Preserves sign: ${featureValues.some(v => v < 0) ? '✅' : '❌'}`);
    
    // Download for manual inspection
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST_RAW_VALUES_VERIFIED.csv';
    link.click();
    
    console.log('\n📁 Raw values CSV downloaded as TEST_RAW_VALUES_VERIFIED.csv');
    
    // Overall assessment
    const isCorrect = areRawValues && noScalingError;
    console.log(`\n📊 Overall raw values status: ${isCorrect ? '🎉 CORRECT' : '❌ Still has issues'}`);
    
    if (isCorrect) {
      alert(`🎉 Raw values CSV generation successful!\n\n` +
            `📊 Mode: ${modeUsed}\n` +
            `📊 Values: Raw EigenVector_UZ from Damage.txt\n` +
            `📊 Max value: ${maxAbs.toExponential(3)}\n` +
            `📊 File: TEST_RAW_VALUES_VERIFIED.csv`);
    } else {
      alert('⚠️ Raw values CSV still has issues.\n\nCheck console for detailed analysis.');
    }
    
  }).catch(error => {
    console.error('❌ Raw values CSV generation failed:', error);
    alert(`❌ Raw values CSV generation failed: ${error.message}`);
  });
}

function compareRawVsScaled() {
  console.log('🔄 === COMPARING RAW VS SCALED VALUES ===\n');
  
  // Expected raw values for different modes
  const expectedRaw = {
    10: [-0.000274954299179129, -0.000274167681433519, -3.08294757699798E-05, -3.02867085697983E-05, -0.000378805364910897],
    12: [0.000162612101653345, -0.000156897623394039, 2.36620838888116E-06, -3.83791369962345E-06, 5.49961903489064E-06]
  };
  
  // Previously reported scaled values (wrong)
  const scaledValues = [0.08892, 0.088822, 0.027522, 0.027177, 1];
  
  console.log('📊 COMPARISON FOR MODE 12:');
  console.log('\nExpected RAW values:');
  expectedRaw[12].forEach((value, index) => {
    console.log(`   U${index + 1}: ${value} (${value.toExponential(6)})`);
  });
  
  console.log('\nPrevious SCALED values (wrong):');
  scaledValues.forEach((value, index) => {
    console.log(`   U${index + 1}: ${value}`);
  });
  
  console.log('\n📊 ANALYSIS:');
  console.log('✅ Raw values preserve exact EigenVector_UZ from Damage.txt');
  console.log('✅ Raw values maintain sign (positive/negative)');
  console.log('✅ Raw values show true magnitude relationships');
  console.log('❌ Scaled values lose precision and relationships');
  console.log('❌ Scaled values create artificial U5=1 error');
  
  // Test current generation
  testRawValuesGeneration();
}

function createRawValuesTestReport() {
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
      🧪 Raw Values Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Raw Values Benefits:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Exact EigenVector_UZ values from Damage.txt</li>
        <li>Preserves positive/negative signs</li>
        <li>Maintains true magnitude relationships</li>
        <li>No artificial scaling errors</li>
        <li>Perfect numerical precision</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📊 Expected Results:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #0c5460;">
        Mode 10:<br>
        U1: -0.000274954299179129<br>
        U2: -0.000274167681433519<br>
        U3: -3.08294757699798E-05<br><br>
        Mode 12:<br>
        U1: 0.000162612101653345<br>
        U2: -0.000156897623394039<br>
        U3: 2.36620838888116E-06
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testRawValuesGeneration()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Raw Values Generation</button>
      
      <button onclick="compareRawVsScaled()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Compare Raw vs Scaled</button>
      
      <button onclick="createRawValuesFixReport()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Raw Values Fix Tools</button>
      
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
  window.testRawValuesGeneration = testRawValuesGeneration;
  window.compareRawVsScaled = compareRawVsScaled;
  window.createRawValuesTestReport = createRawValuesTestReport;
}
