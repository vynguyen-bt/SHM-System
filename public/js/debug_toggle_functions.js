// Debug script để kiểm tra tại sao toggle functions không hoạt động

function debugToggleFunctions() {
  console.log('🔧 === DEBUG TOGGLE FUNCTIONS ===\n');
  
  const testCases = [
    { 
      buttonText: '0. Mô phỏng hư hỏng',
      functionName: 'switchToPartB1',
      elementId: 'partB1',
      onclick: 'switchToPartB1()'
    },
    { 
      buttonText: '1. Chẩn đoán vị trí hư hỏng kết cấu',
      functionName: 'switchToPartA',
      elementId: 'partA',
      onclick: 'switchToPartA()'
    },
    { 
      buttonText: '2. Chẩn đoán mức độ hư hỏng kết cấu',
      functionName: 'switchToPartB',
      elementId: 'partB',
      onclick: 'switchToPartB(); processFilestrain(); processFileTest();'
    },
    { 
      buttonText: '3. Cải thiện kết quả chẩn đoán kết cấu',
      functionName: 'switchToPartB3',
      elementId: 'partB3',
      onclick: 'switchToPartB3();processDataX();'
    },
    { 
      buttonText: '4. Cải thiện độ chính xác chẩn đoán kết cấu',
      functionName: 'switchToPartB4',
      elementId: 'partB4',
      onclick: 'switchToPartB4();processDataX();'
    }
  ];
  
  testCases.forEach((test, index) => {
    console.log(`🔘 Testing ${test.buttonText}:`);
    
    // 1. Check if button exists
    const button = document.querySelector(`button[onclick*="${test.functionName}"]`);
    console.log(`  Button found: ${button ? '✅' : '❌'}`);
    if (button) {
      console.log(`  Button onclick: ${button.getAttribute('onclick')}`);
    }
    
    // 2. Check if function exists
    const func = window[test.functionName];
    console.log(`  Function exists: ${typeof func === 'function' ? '✅' : '❌'}`);
    
    // 3. Check if target element exists
    const element = document.getElementById(test.elementId);
    console.log(`  Target element found: ${element ? '✅' : '❌'}`);
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      console.log(`  Current display: ${computedStyle.display}`);
      console.log(`  Style.display: ${element.style.display}`);
    }
    
    // 4. Test function manually
    if (typeof func === 'function' && element) {
      console.log(`  🧪 Testing function manually...`);
      const beforeDisplay = window.getComputedStyle(element).display;
      
      try {
        func(); // Call the function
        const afterDisplay = window.getComputedStyle(element).display;
        console.log(`  Before: ${beforeDisplay} → After: ${afterDisplay}`);
        
        const worked = beforeDisplay !== afterDisplay;
        console.log(`  Function works: ${worked ? '✅' : '❌'}`);
        
        // Toggle back
        if (worked) {
          func();
          console.log(`  Toggled back to: ${window.getComputedStyle(element).display}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log('');
  });
  
  // Check CSS rules that might interfere
  console.log('🎨 === CSS INTERFERENCE CHECK ===\n');
  
  testCases.forEach(test => {
    const element = document.getElementById(test.elementId);
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const hasImportantDisplay = element.style.cssText.includes('display') && element.style.cssText.includes('!important');
      
      console.log(`${test.elementId}:`);
      console.log(`  Computed display: ${computedStyle.display}`);
      console.log(`  Inline style: ${element.style.display || 'none'}`);
      console.log(`  Has !important: ${hasImportantDisplay ? '⚠️ YES' : '✅ NO'}`);
      console.log('');
    }
  });
}

function testButtonClicks() {
  console.log('🖱️ === TEST BUTTON CLICKS ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    const onclick = button.getAttribute('onclick');
    
    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 40)}..."`);
    console.log(`  OnClick: ${onclick}`);
    
    // Add click event listener for debugging
    button.addEventListener('click', function(event) {
      console.log(`🖱️ Button clicked: ${text.substring(0, 30)}...`);
      console.log(`  Event fired: ✅`);
      console.log(`  OnClick will execute: ${onclick}`);
    });
    
    console.log(`  Click listener added: ✅`);
    console.log('');
  });
  
  console.log('✅ All buttons now have debug click listeners!');
  console.log('Click any button to see debug info in console.');
}

function fixToggleIssues() {
  console.log('🔧 === FIXING TOGGLE ISSUES ===\n');
  
  // Remove any CSS rules that force display: none !important
  const elementsToFix = ['partA', 'partB', 'partB1', 'partB3', 'partB4'];
  
  elementsToFix.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Remove any inline !important display rules
      element.style.removeProperty('display');
      
      // Set initial hidden state without !important
      element.style.display = 'none';
      
      console.log(`✅ Fixed ${elementId} - removed !important, set to none`);
    } else {
      console.log(`❌ Element ${elementId} not found`);
    }
  });
  
  // Test functions after fix
  console.log('\n🧪 Testing functions after fix...');
  setTimeout(() => {
    debugToggleFunctions();
  }, 500);
}

function createToggleDebugReport() {
  // Run debug first
  debugToggleFunctions();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 500px;
    max-height: 600px;
    background: white;
    border: 2px solid #dc3545;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #dc3545;">Toggle Functions Debug Report</h3>
    <p><strong>Issue:</strong> Buttons not opening sections when clicked</p>
    
    <div style="margin: 15px 0;">
      <h4 style="margin: 10px 0 5px 0;">Possible Causes:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        <li>CSS display: none !important overriding JavaScript</li>
        <li>JavaScript functions not defined or not working</li>
        <li>Target elements not found in DOM</li>
        <li>Event listeners not attached properly</li>
        <li>CSS rules conflicting with toggle behavior</li>
      </ul>
    </div>
    
    <div style="margin: 15px 0;">
      <h4 style="margin: 10px 0 5px 0;">Debug Actions:</h4>
      
      <button onclick="debugToggleFunctions()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Debug Functions</button>
      
      <button onclick="testButtonClicks()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test Button Clicks</button>
      
      <button onclick="fixToggleIssues()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Fix Issues</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Close</button>
    </div>
    
    <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
      <h4 style="margin: 0 0 5px 0; font-size: 12px;">Quick Test:</h4>
      <p style="margin: 0; font-size: 11px; color: #666;">
        1. Click "Debug Functions" and check console<br>
        2. Click "Test Button Clicks" then try clicking buttons<br>
        3. Click "Fix Issues" if problems found<br>
        4. Check console for detailed debug information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugToggleFunctions = debugToggleFunctions;
  window.testButtonClicks = testButtonClicks;
  window.fixToggleIssues = fixToggleIssues;
  window.createToggleDebugReport = createToggleDebugReport;
}
