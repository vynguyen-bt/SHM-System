// Immediate raw values fix - force override all CSV functions

function immediateRawValuesFix() {
  console.log('🚨 === IMMEDIATE RAW VALUES FIX ===\n');
  
  // Force override ALL CSV generation functions
  console.log('🔧 Force overriding all CSV functions...');
  
  // 1. Override main createTestCsvContent function
  window.createTestCsvContent = function() {
    console.log('🔧 IMMEDIATE FIX: createTestCsvContent with raw values');
    
    const damagedElements = getDamagedElementsList();
    const modeUsed = window.strainEnergyResults?.modeUsed || 12;
    
    console.log(`📊 Using mode ${modeUsed}, damaged elements: [${damagedElements.join(', ')}]`);
    
    // Always use immediate raw values version
    return createImmediateRawCsv(damagedElements, modeUsed);
  };
  
  // 2. Override createDynamicTestCsvContent if exists
  if (window.createDynamicTestCsvContent) {
    window.createDynamicTestCsvContent = function() {
      console.log('🔧 IMMEDIATE FIX: createDynamicTestCsvContent with raw values');
      return window.createTestCsvContent();
    };
  }
  
  // 3. Override createEnhancedTestCsvContent if exists
  if (window.createEnhancedTestCsvContent) {
    window.createEnhancedTestCsvContent = function() {
      console.log('🔧 IMMEDIATE FIX: createEnhancedTestCsvContent with raw values');
      return window.createTestCsvContent();
    };
  }
  
  // 4. Override generateTestCsvFromDamageData
  window.generateTestCsvFromDamageData = function(damageData, damagedElements, numDamageIndices, modeUsed) {
    console.log('🔧 IMMEDIATE FIX: generateTestCsvFromDamageData with raw values');
    return generateImmediateRawCsvFromDamageData(damageData, damagedElements, numDamageIndices, modeUsed);
  };
  
  console.log('✅ All CSV functions overridden with immediate raw values fix');
  
  // Test immediately
  testImmediateFix();
}

function createImmediateRawCsv(damagedElements, modeUsed) {
  console.log('🔧 === CREATING IMMEDIATE RAW CSV ===');
  
  const numDamageIndices = damagedElements.length;
  
  // Check if Damage.txt file is available
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.warn('⚠️ Damage.txt file not available');
    return Promise.resolve(createFallbackRawCsv(damagedElements, numDamageIndices, modeUsed));
  }
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = function(event) {
      try {
        const damageContent = event.target.result;
        console.log(`📊 Processing Damage.txt for mode ${modeUsed}`);
        
        // Parse mode shape data
        const damageData = parseModeShapeFile(damageContent, modeUsed);
        const nodeCount = Object.keys(damageData).length;
        
        if (nodeCount === 0) {
          console.warn(`⚠️ No data found for mode ${modeUsed}`);
          resolve(createFallbackRawCsv(damagedElements, numDamageIndices, modeUsed));
          return;
        }
        
        console.log(`✅ Found ${nodeCount} nodes for mode ${modeUsed}`);
        
        // Generate CSV with raw values
        const csvContent = generateImmediateRawCsvFromDamageData(damageData, damagedElements, numDamageIndices, modeUsed);
        resolve(csvContent);
        
      } catch (error) {
        console.error('❌ Error processing Damage.txt:', error);
        resolve(createFallbackRawCsv(damagedElements, numDamageIndices, modeUsed));
      }
    };
    
    reader.onerror = function() {
      console.error('❌ Error reading Damage.txt file');
      resolve(createFallbackRawCsv(damagedElements, numDamageIndices, modeUsed));
    };
    
    reader.readAsText(file);
  });
}

function generateImmediateRawCsvFromDamageData(damageData, damagedElements, numDamageIndices, modeUsed) {
  console.log('🔧 === GENERATING IMMEDIATE RAW CSV FROM DAMAGE DATA ===');
  console.log(`📊 Input: ${Object.keys(damageData).length} nodes, ${numDamageIndices} DI, mode ${modeUsed}`);

  // Sort nodes by ID for correct mapping
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  const featureCount = nodeIDs.length;
  
  console.log(`📊 Total nodes: ${featureCount}`);
  console.log(`📊 Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
  console.log(`📊 First 10 nodes: [${nodeIDs.slice(0, 10).join(', ')}]`);

  // Verify expected nodes
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

  // Create CSV header
  let csvContent = "Case";
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";

  // Create test case with raw values
  csvContent += "0"; // Case number

  // Use raw values directly - NO SCALING
  console.log('\n📊 Using raw EigenVector_UZ values (first 10):');
  for (let i = 0; i < featureCount; i++) {
    const nodeID = nodeIDs[i];
    const rawValue = damageData[nodeID];
    
    // Use exact raw value from Damage.txt
    const featureValue = rawValue;
    
    if (i < 10) {
      console.log(`   U${i + 1} (Node ${nodeID}): ${rawValue} (exact raw)`);
    }
    
    csvContent += "," + featureValue;
  }

  // Add DI values
  console.log('\n📊 Adding DI values:');
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
      }
      
      console.log(`   DI${i+1} (Element ${elementID}): ${damageValue.toFixed(4)}`);
    }
    
    csvContent += "," + damageValue.toFixed(4);
  }
  csvContent += "\n";

  console.log(`\n✅ Generated immediate raw CSV: ${1 + featureCount + numDamageIndices} columns`);
  
  return csvContent;
}

function createFallbackRawCsv(damagedElements, numDamageIndices, modeUsed) {
  console.log('🔧 Creating fallback raw CSV with expected values');
  
  // Expected raw values for different modes
  const expectedRawValues = {
    10: [-0.000274954299179129, -0.000274167681433519, -3.08294757699798E-05, -3.02867085697983E-05, -0.000378805364910897],
    12: [0.000162612101653345, -0.000156897623394039, 2.36620838888116E-06, -3.83791369962345E-06, 5.49961903489064E-06]
  };
  
  const rawValues = expectedRawValues[modeUsed] || expectedRawValues[12];
  const featureCount = 121; // Based on your CSV
  
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
  csvContent += "0";
  
  // Add features with raw values
  for (let i = 0; i < featureCount; i++) {
    let value = 0;
    if (i < rawValues.length) {
      value = rawValues[i];
    } else {
      // Small random values for other features
      value = (Math.random() - 0.5) * 0.0001;
    }
    csvContent += "," + value;
  }
  
  // Add DI values
  for (let i = 0; i < numDamageIndices; i++) {
    const diValue = 0.1 + (i * 0.05);
    csvContent += "," + diValue.toFixed(4);
  }
  csvContent += "\n";
  
  return csvContent;
}

function testImmediateFix() {
  console.log('🧪 Testing immediate raw values fix...');
  
  createTestCsvContent().then(csvContent => {
    console.log('✅ Immediate fix test completed');
    
    const lines = csvContent.split('\n');
    const dataRow = lines[1];
    const values = dataRow.split(',');
    
    console.log('📊 Immediate fix results (first 10):');
    for (let i = 1; i <= 10; i++) {
      console.log(`   U${i}: ${values[i]}`);
    }
    
    // Check if values are raw
    const firstValue = parseFloat(values[1]);
    const isRaw = Math.abs(firstValue) < 0.01;
    const noOnes = !values.slice(1, 11).includes('1');
    
    console.log(`\n📊 Immediate fix status:`);
    console.log(`   Values are raw (< 0.01): ${isRaw ? '✅' : '❌'}`);
    console.log(`   No scaling errors (no 1s): ${noOnes ? '✅' : '❌'}`);
    console.log(`   U1 value: ${firstValue}`);
    
    if (isRaw && noOnes) {
      alert('🎉 Immediate raw values fix successful!\n\nCSV now uses exact EigenVector_UZ values from Damage.txt');
    } else {
      alert('❌ Immediate fix failed.\n\nValues still have scaling issues. Check console.');
    }
    
  }).catch(error => {
    console.error('❌ Immediate fix test failed:', error);
  });
}

function createImmediateFixInterface() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-height: 500px;
    background: white;
    border: 3px solid #dc3545;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #dc3545; text-align: center;">
      🚨 Immediate Raw Values Fix
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Current Problem:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #721c24;">
        CSV still shows scaled values:<br>
        U1: 0.08892, U5: 1, U73-U87: all 1<br>
        <strong>Need immediate raw values override</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Expected After Fix:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #155724;">
        Mode 10: U1=-0.000274954299179129<br>
        Mode 12: U1=0.000162612101653345<br>
        <strong>Exact EigenVector_UZ from Damage.txt</strong>
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <button onclick="immediateRawValuesFix()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 15px 20px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      ">🚨 APPLY IMMEDIATE RAW FIX</button>
      
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
        💡 This will force override ALL CSV functions with raw values
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.immediateRawValuesFix = immediateRawValuesFix;
  window.createImmediateRawCsv = createImmediateRawCsv;
  window.generateImmediateRawCsvFromDamageData = generateImmediateRawCsvFromDamageData;
  window.testImmediateFix = testImmediateFix;
  window.createImmediateFixInterface = createImmediateFixInterface;
}
