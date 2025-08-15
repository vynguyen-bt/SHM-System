// Trace CSV generation để tìm function nào đang được gọi

function traceCsvGeneration() {
  console.log('🔍 === TRACING CSV GENERATION PATH ===\n');
  
  // Override functions để trace calls
  const originalCreateTestCsvContent = window.createTestCsvContent;
  const originalCreateDynamicTestCsvContent = window.createDynamicTestCsvContent;
  const originalCreateEnhancedTestCsvContent = window.createEnhancedTestCsvContent;
  const originalGenerateTestCsvFromDamageData = window.generateTestCsvFromDamageData;
  
  // Trace createTestCsvContent
  window.createTestCsvContent = function() {
    console.log('🔄 CALLED: createTestCsvContent()');
    
    const damagedElements = getDamagedElementsList();
    const modeUsed = window.strainEnergyResults?.modeUsed || 12;
    
    console.log(`📊 Parameters: mode=${modeUsed}, damaged=[${damagedElements.join(', ')}]`);
    
    // Check which path it takes
    const fileInputSimulation = document.getElementById("txt-file-simulation");
    const hasSimulationFile = fileInputSimulation && fileInputSimulation.files[0];
    
    if (hasSimulationFile) {
      console.log('📍 PATH: Using createDynamicTestCsvContent() (Simulation.txt available)');
      return originalCreateDynamicTestCsvContent.call(this);
    } else {
      console.log('📍 PATH: Using createEnhancedTestCsvContent() (no Simulation.txt)');
      return originalCreateEnhancedTestCsvContent.call(this);
    }
  };
  
  // Trace createDynamicTestCsvContent
  if (originalCreateDynamicTestCsvContent) {
    window.createDynamicTestCsvContent = function() {
      console.log('🔄 CALLED: createDynamicTestCsvContent()');
      return originalCreateDynamicTestCsvContent.call(this);
    };
  }
  
  // Trace createEnhancedTestCsvContent
  if (originalCreateEnhancedTestCsvContent) {
    window.createEnhancedTestCsvContent = function() {
      console.log('🔄 CALLED: createEnhancedTestCsvContent()');
      return originalCreateEnhancedTestCsvContent.call(this);
    };
  }
  
  // Trace generateTestCsvFromDamageData
  if (originalGenerateTestCsvFromDamageData) {
    window.generateTestCsvFromDamageData = function(damageData, damagedElements, numDamageIndices, modeUsed) {
      console.log('🔄 CALLED: generateTestCsvFromDamageData()');
      console.log(`📊 Parameters: ${Object.keys(damageData).length} nodes, ${numDamageIndices} DI, mode ${modeUsed}`);
      
      const result = originalGenerateTestCsvFromDamageData.call(this, damageData, damagedElements, numDamageIndices, modeUsed);
      
      // Analyze the result
      const lines = result.split('\n');
      const dataRow = lines[1];
      const values = dataRow.split(',');
      
      console.log('📊 Generated values (first 10):');
      for (let i = 1; i <= Math.min(10, values.length - 1); i++) {
        console.log(`   U${i}: ${values[i]}`);
      }
      
      return result;
    };
  }
  
  console.log('✅ Tracing functions installed. Now test CSV generation...');
  
  // Test CSV generation
  createTestCsvContent().then(csvContent => {
    console.log('\n📊 === FINAL RESULT ANALYSIS ===');
    
    const lines = csvContent.split('\n');
    const dataRow = lines[1];
    const values = dataRow.split(',');
    
    console.log('📊 Final CSV values (first 10):');
    for (let i = 1; i <= Math.min(10, values.length - 1); i++) {
      console.log(`   U${i}: ${values[i]}`);
    }
    
    // Check for the problematic values
    const problematicValues = [0.08892, 0.088822, 0.027522, 0.027177, 1];
    const isProblematic = problematicValues.every((val, index) => 
      Math.abs(parseFloat(values[index + 1]) - val) < 0.001
    );
    
    console.log(`\n📊 Still has problematic values: ${isProblematic ? '❌ YES' : '✅ NO'}`);
    
    if (isProblematic) {
      console.log('❌ The fix is not working - old function is still being called');
      console.log('🔧 Need to identify which function is generating wrong values');
    } else {
      console.log('✅ Fix is working - values are now correct');
    }
    
    // Restore original functions
    window.createTestCsvContent = originalCreateTestCsvContent;
    if (originalCreateDynamicTestCsvContent) {
      window.createDynamicTestCsvContent = originalCreateDynamicTestCsvContent;
    }
    if (originalCreateEnhancedTestCsvContent) {
      window.createEnhancedTestCsvContent = originalCreateEnhancedTestCsvContent;
    }
    if (originalGenerateTestCsvFromDamageData) {
      window.generateTestCsvFromDamageData = originalGenerateTestCsvFromDamageData;
    }
    
    console.log('🔄 Original functions restored');
    
  }).catch(error => {
    console.error('❌ CSV generation failed during tracing:', error);
  });
}

function findProblematicFunction() {
  console.log('🔍 === FINDING PROBLEMATIC FUNCTION ===\n');
  
  // Check all CSV-related functions
  const csvFunctions = [
    'createTestCsvContent',
    'createDynamicTestCsvContent', 
    'createEnhancedTestCsvContent',
    'generateTestCsvFromDamageData',
    'createTestCsvContentFallback',
    'generateDynamicTestCsv'
  ];
  
  console.log('📊 Available CSV functions:');
  csvFunctions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${funcName}`);
  });
  
  // Check if there are multiple versions of functions
  console.log('\n📊 Checking for function conflicts:');
  
  if (window.generateTestCsvFromDamageData && window.generateCorrectedTestCsv) {
    console.log('⚠️ Both generateTestCsvFromDamageData and generateCorrectedTestCsv exist');
    console.log('🔧 Should replace the problematic one');
  }
  
  // Test each function individually if possible
  console.log('\n📊 Testing individual functions...');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (fileInputDamaged && fileInputDamaged.files[0]) {
    const file = fileInputDamaged.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const content = event.target.result;
      const modeUsed = window.strainEnergyResults?.modeUsed || 12;
      const damageData = parseModeShapeFile(content, modeUsed);
      const damagedElements = getDamagedElementsList();
      const numDamageIndices = damagedElements.length;
      
      if (Object.keys(damageData).length > 0) {
        console.log('\n🧪 Testing generateTestCsvFromDamageData directly:');
        
        try {
          const result = generateTestCsvFromDamageData(damageData, damagedElements, numDamageIndices, modeUsed);
          const lines = result.split('\n');
          const values = lines[1].split(',');
          
          console.log('📊 Direct function result (first 5):');
          for (let i = 1; i <= 5; i++) {
            console.log(`   U${i}: ${values[i]}`);
          }
          
          // Check if this is the problematic function
          const isProblematic = parseFloat(values[5]) === 1;
          console.log(`📊 This function generates U5=1: ${isProblematic ? '❌ YES' : '✅ NO'}`);
          
        } catch (error) {
          console.error('❌ Error testing generateTestCsvFromDamageData:', error);
        }
      }
    };
    
    reader.readAsText(file);
  }
}

function forceReplaceCsvFunction() {
  console.log('🔧 === FORCE REPLACING CSV FUNCTION ===\n');
  
  // Backup original
  if (window.generateTestCsvFromDamageData) {
    window.generateTestCsvFromDamageData_backup = window.generateTestCsvFromDamageData;
    console.log('📦 Original function backed up');
  }
  
  // Replace with corrected version
  window.generateTestCsvFromDamageData = function(damageData, damagedElements, numDamageIndices, modeUsed) {
    console.log('🔧 === USING CORRECTED CSV GENERATION ===');
    console.log(`📊 Input: ${Object.keys(damageData).length} nodes, ${numDamageIndices} DI, mode ${modeUsed}`);

    // Use the corrected function from fix_csv_generation.js
    if (typeof generateCorrectedTestCsv === 'function') {
      return generateCorrectedTestCsv(damageData, damagedElements, numDamageIndices, modeUsed);
    } else {
      console.error('❌ generateCorrectedTestCsv not available');
      return window.generateTestCsvFromDamageData_backup.call(this, damageData, damagedElements, numDamageIndices, modeUsed);
    }
  };
  
  console.log('✅ Function replaced with corrected version');
  
  // Test the replacement
  console.log('\n🧪 Testing replacement...');
  testCsvFix();
}

function createCsvTracingReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 600px;
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
      🔍 CSV Generation Tracing
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Problem:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #721c24;">
        CSV still shows wrong values:<br>
        U1: 0.08892, U2: 0.088822, U5: 1<br>
        Fix not working - need to trace which function is called
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Tracing Actions:</h4>
      
      <button onclick="traceCsvGeneration()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Trace CSV Generation</button>
      
      <button onclick="findProblematicFunction()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Find Problematic Function</button>
      
      <button onclick="forceReplaceCsvFunction()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Force Replace Function</button>
      
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
        💡 Check browser console for detailed tracing results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.traceCsvGeneration = traceCsvGeneration;
  window.findProblematicFunction = findProblematicFunction;
  window.forceReplaceCsvFunction = forceReplaceCsvFunction;
  window.createCsvTracingReport = createCsvTracingReport;
}
