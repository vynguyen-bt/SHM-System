// Comprehensive verification script for Section 2 fixes

function verifySection2Fixes() {
  console.log('🔧 === VERIFYING SECTION 2 FIXES ===\n');
  
  const results = {
    functionsAvailable: {},
    syntaxErrors: [],
    buttonFunctionality: {},
    csvGeneration: {},
    overallStatus: 'UNKNOWN'
  };
  
  // 1. Verify function availability
  console.log('📋 1. FUNCTION AVAILABILITY CHECK:');
  
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
  
  requiredFunctions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    results.functionsAvailable[funcName] = available;
    console.log(`${available ? '✅' : '❌'} ${funcName}: ${available ? 'Available' : 'Missing'}`);
  });
  
  // 2. Test button onclick functionality
  console.log('\n📋 2. BUTTON ONCLICK FUNCTIONALITY:');
  
  const section2Button = document.querySelector('button[onclick*="switchToPartB"]');
  if (section2Button) {
    const onclick = section2Button.getAttribute('onclick');
    console.log(`✅ Section 2 button found`);
    console.log(`📊 Onclick: ${onclick}`);
    
    // Parse onclick functions
    const onclickFunctions = onclick.split(';').map(f => f.trim().replace(/\(\).*/, ''));
    results.buttonFunctionality.onclickFunctions = onclickFunctions;
    
    onclickFunctions.forEach(funcName => {
      const available = typeof window[funcName] === 'function';
      console.log(`${available ? '✅' : '❌'} ${funcName}(): ${available ? 'Available' : 'Missing'}`);
    });
  } else {
    console.log('❌ Section 2 button not found');
    results.buttonFunctionality.buttonFound = false;
  }
  
  // 3. Test CSV generation workflow
  console.log('\n📋 3. CSV GENERATION WORKFLOW:');
  
  if (typeof createTestCsvContent === 'function') {
    console.log('✅ createTestCsvContent function available');
    
    // Test prerequisites
    const prerequisites = checkSection2Prerequisites();
    results.csvGeneration.prerequisites = prerequisites;
    console.log(`📊 Prerequisites: ${prerequisites.valid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`📊 Message: ${prerequisites.message}`);
    
    if (prerequisites.valid) {
      console.log('🔄 Testing CSV generation...');
      
      createTestCsvContent().then(csvContent => {
        console.log('✅ CSV generation successful');
        results.csvGeneration.successful = true;
        results.csvGeneration.csvLength = csvContent.length;
        
        const lines = csvContent.split('\n');
        const header = lines[0];
        const columns = header.split(',');
        
        console.log(`📊 CSV: ${lines.length} lines, ${columns.length} columns`);
        results.csvGeneration.structure = {
          lines: lines.length,
          columns: columns.length,
          features: columns.filter(col => col.startsWith('U')).length,
          diColumns: columns.filter(col => col.startsWith('DI')).length
        };
        
        // Test download functionality
        try {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          console.log('✅ Blob creation successful');
          results.csvGeneration.downloadReady = true;
        } catch (error) {
          console.log('❌ Blob creation failed:', error);
          results.csvGeneration.downloadReady = false;
        }
        
        // Final assessment
        assessOverallStatus(results);
        
      }).catch(error => {
        console.log('❌ CSV generation failed:', error);
        results.csvGeneration.successful = false;
        results.csvGeneration.error = error.message;
        assessOverallStatus(results);
      });
    } else {
      console.log('⚠️ Cannot test CSV generation - prerequisites not met');
      results.csvGeneration.successful = false;
      results.csvGeneration.reason = 'Prerequisites not met';
      assessOverallStatus(results);
    }
  } else {
    console.log('❌ createTestCsvContent function not available');
    results.csvGeneration.successful = false;
    results.csvGeneration.reason = 'Function not available';
    assessOverallStatus(results);
  }
  
  return results;
}

function assessOverallStatus(results) {
  console.log('\n📊 === OVERALL ASSESSMENT ===');
  
  const functionsWorking = Object.values(results.functionsAvailable).filter(Boolean).length;
  const totalFunctions = Object.keys(results.functionsAvailable).length;
  const functionScore = functionsWorking / totalFunctions;
  
  console.log(`📊 Functions: ${functionsWorking}/${totalFunctions} (${(functionScore * 100).toFixed(0)}%)`);
  
  const csvWorking = results.csvGeneration.successful === true;
  console.log(`📊 CSV Generation: ${csvWorking ? '✅ Working' : '❌ Not Working'}`);
  
  const buttonWorking = results.buttonFunctionality.buttonFound !== false;
  console.log(`📊 Button Functionality: ${buttonWorking ? '✅ Working' : '❌ Not Working'}`);
  
  // Overall status
  if (functionScore >= 0.9 && csvWorking && buttonWorking) {
    results.overallStatus = 'ALL_FIXES_WORKING';
    console.log('🎉 ALL FIXES WORKING - Section 2 should work correctly!');
  } else if (functionScore >= 0.7) {
    results.overallStatus = 'MOSTLY_WORKING';
    console.log('⚠️ MOSTLY WORKING - Some minor issues remain');
  } else {
    results.overallStatus = 'ISSUES_REMAIN';
    console.log('❌ ISSUES REMAIN - Major problems need fixing');
  }
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  
  if (functionScore < 0.9) {
    console.log('🔧 Fix missing function exports in script files');
  }
  
  if (!csvWorking) {
    console.log('🔧 Check CSV generation prerequisites and error handling');
  }
  
  if (!buttonWorking) {
    console.log('🔧 Verify button onclick attributes and function calls');
  }
  
  if (results.overallStatus === 'ALL_FIXES_WORKING') {
    console.log('✅ Ready to test Section 2 button click!');
  }
}

function testSection2ButtonClick() {
  console.log('🎯 === TESTING SECTION 2 BUTTON CLICK ===\n');
  
  const prerequisites = checkSection2Prerequisites();
  
  if (!prerequisites.valid) {
    console.log('⚠️ Prerequisites not met for testing button click');
    console.log(`📊 Issue: ${prerequisites.message}`);
    console.log('\n📋 TO PREPARE FOR TESTING:');
    console.log('1. Load SElement.txt, Healthy.txt, Damage.txt files');
    console.log('2. Run Section 1 (Xác định vị trí hư hỏng)');
    console.log('3. Wait for strain energy calculation to complete');
    console.log('4. Then test Section 2 button click');
    return;
  }
  
  console.log('✅ Prerequisites met, testing button click...');
  
  // Simulate button click workflow
  console.log('🔄 Step 1: switchToPartB()');
  try {
    switchToPartB();
    console.log('✅ switchToPartB() executed');
  } catch (error) {
    console.error('❌ switchToPartB() failed:', error);
  }
  
  console.log('🔄 Step 2: processFilestrain()');
  try {
    processFilestrain();
    console.log('✅ processFilestrain() executed');
  } catch (error) {
    console.error('❌ processFilestrain() failed:', error);
  }
  
  console.log('🔄 Step 3: Waiting for initializeSection2() auto-trigger...');
  setTimeout(() => {
    console.log('📊 initializeSection2() should have triggered autoGenerateTestCsv()');
    console.log('📊 Check if TEST.csv file was downloaded');
  }, 1000);
}

function createSection2FixVerificationReport() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
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
      🔧 Section 2 Fix Verification
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Fixes Applied:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Fixed SyntaxError: Identifier 'header' already declared</li>
        <li>Added explicit global function exports</li>
        <li>Enhanced initializeSection2() with auto CSV generation</li>
        <li>Added comprehensive error handling</li>
        <li>Created autoGenerateTestCsv() function</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Verification Actions:</h4>
      
      <button onclick="verifySection2Fixes()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Verify All Fixes</button>
      
      <button onclick="testSection2ButtonClick()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🎯 Test Button Click</button>
      
      <button onclick="checkSection2Prerequisites()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">📋 Check Prerequisites</button>
      
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
        💡 Check browser console for detailed verification results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.verifySection2Fixes = verifySection2Fixes;
  window.testSection2ButtonClick = testSection2ButtonClick;
  window.createSection2FixVerificationReport = createSection2FixVerificationReport;
}
