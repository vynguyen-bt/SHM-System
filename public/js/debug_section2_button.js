// Debug script để test Section 2 button functionality

function debugSection2Button() {
  console.log('🔧 === DEBUGGING SECTION 2 BUTTON FUNCTIONALITY ===\n');
  
  // 1. Test button existence và onclick
  console.log('📋 1. BUTTON EXISTENCE CHECK:');
  
  const section2Buttons = document.querySelectorAll('button');
  let section2Button = null;
  
  section2Buttons.forEach(button => {
    if (button.textContent.includes('Chẩn đoán mức độ hư hỏng kết cấu')) {
      section2Button = button;
    }
  });
  
  if (section2Button) {
    console.log('✅ Section 2 button found');
    console.log(`📊 Button onclick: ${section2Button.getAttribute('onclick')}`);
    console.log(`📊 Button title: ${section2Button.getAttribute('title')}`);
  } else {
    console.log('❌ Section 2 button not found');
    return;
  }
  
  // 2. Test functions called by button
  console.log('\n📋 2. FUNCTION AVAILABILITY CHECK:');
  
  const functions = [
    'switchToPartB',
    'processFilestrain', 
    'initializeSection2',
    'autoGenerateTestCsv',
    'checkSection2Prerequisites',
    'createTestCsvContent',
    'downloadCsvFile'
  ];
  
  functions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    console.log(`${exists ? '✅' : '❌'} ${funcName}: ${exists ? 'Available' : 'Missing'}`);
  });
  
  // 3. Test prerequisites
  console.log('\n📋 3. PREREQUISITES CHECK:');
  
  const prerequisites = checkSection2Prerequisites();
  console.log(`📊 Prerequisites valid: ${prerequisites.valid ? '✅' : '❌'}`);
  console.log(`📊 Message: ${prerequisites.message}`);
  
  if (prerequisites.valid && prerequisites.details) {
    console.log('📊 Details:');
    Object.entries(prerequisites.details).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }
  
  // 4. Test CSV generation workflow
  console.log('\n📋 4. CSV GENERATION WORKFLOW TEST:');
  
  if (prerequisites.valid) {
    console.log('🔄 Testing CSV generation...');
    
    createTestCsvContent().then(csvContent => {
      console.log('✅ CSV generation successful');
      
      const lines = csvContent.split('\n');
      const header = lines[0];
      const columns = header.split(',');
      
      console.log(`📊 CSV structure: ${lines.length} lines, ${columns.length} columns`);
      console.log(`📊 Header: ${header.substring(0, 80)}...`);
      
      // Test download functionality
      console.log('🔄 Testing download functionality...');
      try {
        // Don't actually download, just test blob creation
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        console.log(`✅ Blob creation successful: ${blob.size} bytes`);
        
        const url = URL.createObjectURL(blob);
        console.log(`✅ URL creation successful: ${url.substring(0, 50)}...`);
        URL.revokeObjectURL(url); // Clean up
        
      } catch (error) {
        console.error('❌ Download test failed:', error);
      }
      
    }).catch(error => {
      console.error('❌ CSV generation failed:', error);
    });
  } else {
    console.log('⚠️ Cannot test CSV generation - prerequisites not met');
  }
  
  // 5. Test button click simulation
  console.log('\n📋 5. BUTTON CLICK SIMULATION:');
  
  console.log('🔄 Simulating button click...');
  try {
    // Test individual functions
    console.log('   Testing switchToPartB()...');
    if (typeof switchToPartB === 'function') {
      // Don't actually call it to avoid UI changes
      console.log('   ✅ switchToPartB function available');
    }
    
    console.log('   Testing processFilestrain()...');
    if (typeof processFilestrain === 'function') {
      console.log('   ✅ processFilestrain function available');
    }
    
    console.log('   Testing initializeSection2()...');
    if (typeof initializeSection2 === 'function') {
      console.log('   ✅ initializeSection2 function available');
    }
    
  } catch (error) {
    console.error('❌ Button click simulation failed:', error);
  }
}

function testSection2AutoCsvGeneration() {
  console.log('🧪 === TESTING SECTION 2 AUTO CSV GENERATION ===\n');
  
  // Test the complete auto generation workflow
  console.log('📋 Testing complete auto generation workflow...');
  
  const prerequisites = checkSection2Prerequisites();
  
  if (prerequisites.valid) {
    console.log('✅ Prerequisites met, testing auto generation...');
    
    autoGenerateTestCsv();
    
  } else {
    console.log('⚠️ Prerequisites not met, cannot test auto generation');
    console.log(`📊 Issue: ${prerequisites.message}`);
    
    // Provide guidance
    console.log('\n📋 TO FIX PREREQUISITES:');
    
    if (!window.strainEnergyResults) {
      console.log('1. ✅ Load SElement.txt, Healthy.txt, Damage.txt files');
      console.log('2. ✅ Run Section 1 (Xác định vị trí hư hỏng)');
      console.log('3. ✅ Wait for strain energy calculation to complete');
    }
    
    const fileInputDamaged = document.getElementById("txt-file-damaged");
    if (!fileInputDamaged || !fileInputDamaged.files[0]) {
      console.log('4. ✅ Ensure Damage.txt file is loaded');
    }
    
    if (!window.meshData) {
      console.log('5. ✅ Ensure SElement.txt file is loaded');
    }
  }
}

function simulateSection2ButtonClick() {
  console.log('🎯 === SIMULATING SECTION 2 BUTTON CLICK ===\n');
  
  console.log('🔄 Step 1: switchToPartB()');
  try {
    switchToPartB();
    console.log('✅ switchToPartB() executed successfully');
  } catch (error) {
    console.error('❌ switchToPartB() failed:', error);
  }
  
  console.log('🔄 Step 2: processFilestrain()');
  try {
    processFilestrain();
    console.log('✅ processFilestrain() executed successfully');
  } catch (error) {
    console.error('❌ processFilestrain() failed:', error);
  }
  
  console.log('🔄 Step 3: Waiting for initializeSection2() (automatic)');
  setTimeout(() => {
    console.log('📊 initializeSection2() should have been called automatically');
    console.log('📊 autoGenerateTestCsv() should have been triggered');
  }, 1000);
}

function createSection2ButtonDebugReport() {
  // Create visual debug report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 500px;
    max-height: 600px;
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
  
  const prerequisites = checkSection2Prerequisites();
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #dc3545; text-align: center;">
      🔧 Section 2 Button Debug
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: ${prerequisites.valid ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: ${prerequisites.valid ? '#155724' : '#721c24'};">
        ${prerequisites.valid ? '✅' : '❌'} Prerequisites Status
      </h4>
      <p style="margin: 0; font-size: 13px;">
        ${prerequisites.message}
      </p>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Debug Actions:</h4>
      
      <button onclick="debugSection2Button()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔧 Full Debug Check</button>
      
      <button onclick="testSection2AutoCsvGeneration()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test Auto CSV Generation</button>
      
      <button onclick="simulateSection2ButtonClick()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🎯 Simulate Button Click</button>
      
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
        💡 Check browser console for detailed debug information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugSection2Button = debugSection2Button;
  window.testSection2AutoCsvGeneration = testSection2AutoCsvGeneration;
  window.simulateSection2ButtonClick = simulateSection2ButtonClick;
  window.createSection2ButtonDebugReport = createSection2ButtonDebugReport;
}
