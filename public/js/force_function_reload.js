// Force function reload and testing script

function forceFunctionReload() {
  console.log('🔄 === FORCE FUNCTION RELOAD ===\n');
  
  // 1. Check current function availability
  console.log('📋 1. CURRENT FUNCTION STATUS:');
  
  const requiredFunctions = [
    'processFilestrain',
    'trainAndPredict', 
    'createTestCsvContent',
    'initializeSection2',
    'autoGenerateTestCsv',
    'checkSection2Prerequisites',
    'downloadCsvFile',
    'getDamagedElementsList',
    'switchToPartB'
  ];
  
  const missingFunctions = [];
  
  requiredFunctions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    console.log(`${available ? '✅' : '❌'} ${funcName}: ${available ? 'Available' : 'Missing'}`);
    if (!available) {
      missingFunctions.push(funcName);
    }
  });
  
  // 2. Force re-export functions
  console.log('\n📋 2. FORCE RE-EXPORT FUNCTIONS:');
  
  if (typeof exportTrainPredictFunctions === 'function') {
    console.log('🔄 Re-exporting trainPredict.js functions...');
    exportTrainPredictFunctions();
  } else {
    console.log('⚠️ exportTrainPredictFunctions not available');
  }
  
  if (typeof exportTestShmFunctions === 'function') {
    console.log('🔄 Re-exporting TestShm.js functions...');
    exportTestShmFunctions();
  } else {
    console.log('⚠️ exportTestShmFunctions not available');
  }
  
  // 3. Re-check function availability
  console.log('\n📋 3. POST-RELOAD FUNCTION STATUS:');
  
  const stillMissing = [];
  
  requiredFunctions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    console.log(`${available ? '✅' : '❌'} ${funcName}: ${available ? 'Available' : 'Still Missing'}`);
    if (!available) {
      stillMissing.push(funcName);
    }
  });
  
  // 4. Manual function assignment if needed
  if (stillMissing.length > 0) {
    console.log('\n📋 4. MANUAL FUNCTION ASSIGNMENT:');
    
    // Try to find functions in global scope or other objects
    stillMissing.forEach(funcName => {
      console.log(`🔍 Searching for ${funcName}...`);
      
      // Check if function exists but not in window
      if (typeof eval(`typeof ${funcName}`) === 'function') {
        console.log(`✅ Found ${funcName}, assigning to window`);
        window[funcName] = eval(funcName);
      } else {
        console.log(`❌ ${funcName} not found anywhere`);
      }
    });
  }
  
  // 5. Final status
  console.log('\n📊 === FINAL STATUS ===');
  
  const finalMissing = requiredFunctions.filter(funcName => typeof window[funcName] !== 'function');
  
  if (finalMissing.length === 0) {
    console.log('🎉 ALL FUNCTIONS NOW AVAILABLE!');
    return true;
  } else {
    console.log(`❌ Still missing: ${finalMissing.join(', ')}`);
    return false;
  }
}

function testSection2WorkflowAfterReload() {
  console.log('🧪 === TESTING SECTION 2 WORKFLOW AFTER RELOAD ===\n');
  
  // 1. Force reload functions
  const reloadSuccess = forceFunctionReload();
  
  if (!reloadSuccess) {
    console.log('❌ Cannot test workflow - functions still missing');
    return;
  }
  
  // 2. Test prerequisites
  console.log('\n📋 TESTING PREREQUISITES:');
  
  if (typeof checkSection2Prerequisites === 'function') {
    const prerequisites = checkSection2Prerequisites();
    console.log(`📊 Prerequisites: ${prerequisites.valid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`📊 Message: ${prerequisites.message}`);
    
    if (!prerequisites.valid) {
      console.log('\n📋 PREREQUISITES GUIDANCE:');
      console.log('1. Load SElement.txt, Healthy.txt, Damage.txt files');
      console.log('2. Run Section 1 (Xác định vị trí hư hỏng)');
      console.log('3. Wait for strain energy calculation to complete');
      console.log('4. Then test Section 2');
      return;
    }
  } else {
    console.log('❌ checkSection2Prerequisites still not available');
    return;
  }
  
  // 3. Test CSV generation
  console.log('\n📋 TESTING CSV GENERATION:');
  
  if (typeof createTestCsvContent === 'function') {
    console.log('🔄 Testing createTestCsvContent...');
    
    createTestCsvContent().then(csvContent => {
      console.log('✅ CSV generation successful');
      console.log(`📊 CSV length: ${csvContent.length} characters`);
      
      const lines = csvContent.split('\n');
      const header = lines[0];
      const columns = header.split(',');
      
      console.log(`📊 Structure: ${lines.length} lines, ${columns.length} columns`);
      console.log(`📊 Features: ${columns.filter(col => col.startsWith('U')).length}`);
      console.log(`📊 DI columns: ${columns.filter(col => col.startsWith('DI')).length}`);
      
      // Test auto generation
      console.log('\n📋 TESTING AUTO GENERATION:');
      
      if (typeof autoGenerateTestCsv === 'function') {
        console.log('✅ autoGenerateTestCsv available - ready for Section 2 button test');
      } else {
        console.log('❌ autoGenerateTestCsv still not available');
      }
      
    }).catch(error => {
      console.error('❌ CSV generation failed:', error);
    });
  } else {
    console.log('❌ createTestCsvContent still not available');
  }
}

function createForceReloadReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 500px;
    max-height: 600px;
    background: white;
    border: 2px solid #ffc107;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #ffc107; text-align: center;">
      🔄 Force Function Reload
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Function Loading Issues:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #856404; font-size: 13px;">
        <li>Some functions may not be available due to script loading timing</li>
        <li>This tool forces re-export of all functions</li>
        <li>Use when getting "function not defined" errors</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Reload Actions:</h4>
      
      <button onclick="forceFunctionReload()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Force Reload Functions</button>
      
      <button onclick="testSection2WorkflowAfterReload()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Workflow After Reload</button>
      
      <button onclick="location.reload()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔄 Full Page Reload</button>
      
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
        💡 Check browser console for detailed reload results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.forceFunctionReload = forceFunctionReload;
  window.testSection2WorkflowAfterReload = testSection2WorkflowAfterReload;
  window.createForceReloadReport = createForceReloadReport;
}
