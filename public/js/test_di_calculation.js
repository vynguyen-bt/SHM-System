// Test DI calculation with example scenarios

function testDICalculationWithExamples() {
  console.log('🧪 === TESTING DI CALCULATION WITH EXAMPLES ===\n');
  
  // Example scenario from requirements
  console.log('📊 Example Scenario:');
  console.log('   Element 45: 3.15% damage');
  console.log('   Element 55: 5.69% damage (highest)');
  console.log('   Expected: Element 55 → DI2 = 0.05, others = 0');
  
  // Test simulation file parsing
  parseSimulationFile().then(simulationData => {
    console.log(`\n📊 Simulation data loaded: ${Object.keys(simulationData).length} elements`);
    
    // Test specific elements
    const testElements = [45, 55, 2134];
    console.log('\n📊 Test elements in simulation data:');
    testElements.forEach(elementID => {
      if (simulationData[elementID]) {
        const info = simulationData[elementID];
        console.log(`   ✅ Element ${elementID}: ${info.thickness} → DI = ${info.diValue}`);
      } else {
        console.log(`   ❌ Element ${elementID}: Not found`);
      }
    });
    
    // Test with current Section 1 results
    console.log('\n📊 Current Section 1 results:');
    const damagedElements = getDamagedElementsWithPercentages();
    
    if (damagedElements.length === 0) {
      console.log('⚠️ No damaged elements found - run Section 1 first');
      return;
    }
    
    console.log(`📊 Found ${damagedElements.length} damaged elements:`);
    damagedElements.forEach((elem, index) => {
      console.log(`   ${index + 1}. Element ${elem.elementID}: ${elem.damagePercentage.toFixed(2)}% damage`);
    });
    
    // Calculate DI values
    const diValues = calculateCorrectDIValues(damagedElements, simulationData);
    
    console.log('\n📊 Calculated DI values:');
    diValues.forEach((value, index) => {
      console.log(`   DI${index + 1}: ${value.toFixed(4)} ${value > 0 ? '← from highest damage element' : ''}`);
    });
    
    // Test CSV generation
    console.log('\n📊 Testing CSV generation with correct DI...');
    testCsvWithCorrectDI(damagedElements, simulationData);
    
  }).catch(error => {
    console.error('❌ Error testing DI calculation:', error);
  });
}

function testCsvWithCorrectDI(damagedElements, simulationData) {
  // Check if we have damage data
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('⚠️ Damage.txt not loaded - cannot test CSV generation');
    return;
  }
  
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    try {
      const content = event.target.result;
      const damageData = parseModeShapeFile(content, modeUsed);
      
      if (Object.keys(damageData).length === 0) {
        console.log('⚠️ No damage data for current mode');
        return;
      }
      
      // Generate CSV with correct DI
      generateCsvWithCorrectDI(damageData, getDamagedElementsList(), modeUsed).then(csvContent => {
        console.log('✅ CSV with correct DI generated');
        
        const lines = csvContent.split('\n');
        const header = lines[0];
        const dataRow = lines[1];
        const values = dataRow.split(',');
        
        // Find DI columns
        const columns = header.split(',');
        const diColumns = columns.filter(col => col.startsWith('DI'));
        const diStartIndex = columns.length - diColumns.length;
        
        console.log(`📊 CSV structure: ${columns.length} total columns, ${diColumns.length} DI columns`);
        console.log('\n📊 DI values in generated CSV:');
        
        diColumns.forEach((col, index) => {
          const value = parseFloat(values[diStartIndex + index]);
          console.log(`   ${col}: ${value.toFixed(4)} ${value > 0 ? '← non-zero' : ''}`);
        });
        
        // Verify logic
        const nonZeroDI = diColumns.filter((col, index) => parseFloat(values[diStartIndex + index]) > 0);
        console.log(`\n📊 Verification:`);
        console.log(`   Non-zero DI columns: ${nonZeroDI.length} (should be 1 for highest damage element)`);
        console.log(`   Zero DI columns: ${diColumns.length - nonZeroDI.length}`);
        
        if (nonZeroDI.length === 1) {
          console.log('✅ DI logic correct: Only highest damage element has non-zero DI');
        } else {
          console.log('⚠️ DI logic may need adjustment');
        }
        
      }).catch(error => {
        console.error('❌ Error generating CSV with correct DI:', error);
      });
      
    } catch (error) {
      console.error('❌ Error processing damage data:', error);
    }
  };
  
  reader.readAsText(file);
}

function simulateDICalculationExample() {
  console.log('🎯 === SIMULATING EXAMPLE SCENARIO ===\n');
  
  // Simulate the example scenario
  const exampleDamagedElements = [
    { elementID: 45, damagePercentage: 3.15, actualDamage: 2.5 },
    { elementID: 55, damagePercentage: 5.69, actualDamage: 3.2 }
  ];
  
  const exampleSimulationData = {
    45: { thickness: 'th0.2_2-03', targetValue: '03', diValue: 0.03 },
    55: { thickness: 'th0.2_2-05', targetValue: '05', diValue: 0.05 },
    2134: { thickness: 'th0.2_2-05', targetValue: '05', diValue: 0.05 }
  };
  
  console.log('📊 Example damaged elements:');
  exampleDamagedElements.forEach((elem, index) => {
    console.log(`   ${index + 1}. Element ${elem.elementID}: ${elem.damagePercentage}% damage`);
  });
  
  console.log('\n📊 Example simulation data:');
  Object.entries(exampleSimulationData).forEach(([elementID, info]) => {
    console.log(`   Element ${elementID}: ${info.thickness} → DI = ${info.diValue}`);
  });
  
  // Calculate DI values
  const diValues = calculateCorrectDIValues(exampleDamagedElements, exampleSimulationData);
  
  console.log('\n📊 Calculated DI values:');
  diValues.forEach((value, index) => {
    const elementID = exampleDamagedElements[index]?.elementID;
    console.log(`   DI${index + 1} (Element ${elementID}): ${value.toFixed(4)}`);
  });
  
  console.log('\n📊 Expected result:');
  console.log('   DI1 (Element 45): 0.0000 (not highest damage)');
  console.log('   DI2 (Element 55): 0.0500 (highest damage, from th0.2_2-05)');
  
  const isCorrect = diValues[0] === 0 && diValues[1] === 0.05;
  console.log(`\n📊 Result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
}

function createDITestInterface() {
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
      🧪 DI Calculation Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ DI Logic Implementation:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Parse Section 1 results for damaged elements</li>
        <li>Sort by damage percentage (descending)</li>
        <li>Find highest damage element in Simulation.txt</li>
        <li>Extract THICKNESS value (e.g., th0.2_2-05)</li>
        <li>Convert to DI (05 → 0.05)</li>
        <li>Assign to corresponding DI column, others = 0</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">📊 Test Scenario:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #856404;">
        Element 45: 3.15% damage<br>
        Element 55: 5.69% damage (highest)<br>
        Simulation.txt: Element 55 → th0.2_2-05<br>
        Expected: DI1=0, DI2=0.05
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testDICalculationWithExamples()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Current DI Calculation</button>
      
      <button onclick="simulateDICalculationExample()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🎯 Simulate Example Scenario</button>
      
      <button onclick="createDIValuesTestInterface()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📊 DI Values Test Interface</button>
      
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
        💡 Check browser console for detailed DI calculation results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testDICalculationWithExamples = testDICalculationWithExamples;
  window.testCsvWithCorrectDI = testCsvWithCorrectDI;
  window.simulateDICalculationExample = simulateDICalculationExample;
  window.createDITestInterface = createDITestInterface;
}
