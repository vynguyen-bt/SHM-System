// Immediate test script để kiểm tra toggle functions

function immediateToggleTest() {
  console.log('🚀 === IMMEDIATE TOGGLE TEST ===\n');
  
  // Test cases với thông tin chi tiết
  const tests = [
    {
      name: 'Section 0 - Mô phỏng hư hỏng',
      buttonSelector: 'button[onclick*="switchToPartB1"]',
      functionName: 'switchToPartB1',
      targetId: 'partB1'
    },
    {
      name: 'Section 1 - Chẩn đoán vị trí hư hỏng',
      buttonSelector: 'button[onclick*="switchToPartA"]',
      functionName: 'switchToPartA',
      targetId: 'partA'
    },
    {
      name: 'Section 2 - Chẩn đoán mức độ hư hỏng',
      buttonSelector: 'button[onclick*="switchToPartB()"]',
      functionName: 'switchToPartB',
      targetId: 'partB'
    },
    {
      name: 'Section 3 - Cải thiện kết quả chẩn đoán',
      buttonSelector: 'button[onclick*="switchToPartB3"]',
      functionName: 'switchToPartB3',
      targetId: 'partB3'
    },
    {
      name: 'Section 4 - Cải thiện độ chính xác chẩn đoán',
      buttonSelector: 'button[onclick*="switchToPartB4"]',
      functionName: 'switchToPartB4',
      targetId: 'partB4'
    }
  ];
  
  let allWorking = true;
  
  tests.forEach((test, index) => {
    console.log(`🧪 Testing ${test.name}:`);
    
    // 1. Check button exists
    const button = document.querySelector(test.buttonSelector);
    const buttonExists = !!button;
    console.log(`  Button found: ${buttonExists ? '✅' : '❌'}`);
    
    // 2. Check function exists
    const func = window[test.functionName];
    const funcExists = typeof func === 'function';
    console.log(`  Function exists: ${funcExists ? '✅' : '❌'}`);
    
    // 3. Check target element exists
    const target = document.getElementById(test.targetId);
    const targetExists = !!target;
    console.log(`  Target element exists: ${targetExists ? '✅' : '❌'}`);
    
    if (targetExists) {
      const initialDisplay = window.getComputedStyle(target).display;
      console.log(`  Initial display: ${initialDisplay}`);
      
      // 4. Test function manually
      if (funcExists) {
        try {
          console.log(`  🔧 Testing function...`);
          func(); // Call function
          
          const newDisplay = window.getComputedStyle(target).display;
          console.log(`  After function call: ${newDisplay}`);
          
          const worked = initialDisplay !== newDisplay;
          console.log(`  Function works: ${worked ? '✅' : '❌'}`);
          
          if (!worked) {
            allWorking = false;
            
            // Debug why it didn't work
            console.log(`  🔍 Debug info:`);
            console.log(`    Element classes: ${target.className}`);
            console.log(`    Element style.display: ${target.style.display}`);
            console.log(`    Computed display: ${window.getComputedStyle(target).display}`);
            
            // Check for CSS conflicts
            const allRules = [];
            for (let sheet of document.styleSheets) {
              try {
                for (let rule of sheet.cssRules) {
                  if (rule.selectorText && rule.selectorText.includes(test.targetId)) {
                    allRules.push(`${rule.selectorText}: ${rule.style.display}`);
                  }
                }
              } catch (e) {
                // Cross-origin stylesheet, skip
              }
            }
            console.log(`    CSS rules affecting element: ${allRules.join(', ') || 'none found'}`);
          } else {
            // Toggle back to original state
            func();
            console.log(`  Toggled back to: ${window.getComputedStyle(target).display}`);
          }
          
        } catch (error) {
          console.log(`  ❌ Function error: ${error.message}`);
          allWorking = false;
        }
      } else {
        allWorking = false;
      }
    } else {
      allWorking = false;
    }
    
    console.log('');
  });
  
  console.log(`🎯 Overall result: ${allWorking ? '✅ ALL WORKING' : '❌ ISSUES FOUND'}\n`);
  
  return allWorking;
}

function forceFixToggleIssues() {
  console.log('🔧 === FORCE FIX TOGGLE ISSUES ===\n');
  
  // 1. Remove any conflicting CSS
  const elementsToFix = ['partA', 'partB', 'partB1', 'partB3', 'partB4'];
  
  elementsToFix.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      // Clear any inline styles
      element.style.cssText = '';
      
      // Set initial hidden state
      element.style.display = 'none';
      
      console.log(`✅ Reset ${id} to display: none`);
    }
  });
  
  // 2. Add CSS override to ensure JavaScript can control display
  const style = document.createElement('style');
  style.textContent = `
    /* JavaScript toggle override - highest specificity */
    #partA[style*="display: block"], 
    #partB[style*="display: block"], 
    #partB1[style*="display: block"], 
    #partB3[style*="display: block"], 
    #partB4[style*="display: block"] {
      display: block !important;
    }
    
    #partA[style*="display: none"], 
    #partB[style*="display: none"], 
    #partB1[style*="display: none"], 
    #partB3[style*="display: none"], 
    #partB4[style*="display: none"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Added CSS override for JavaScript control');
  
  // 3. Test after fix
  setTimeout(() => {
    console.log('\n🧪 Testing after fix:');
    immediateToggleTest();
  }, 500);
}

function addClickListenersForDebug() {
  console.log('🖱️ === ADDING DEBUG CLICK LISTENERS ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    const onclick = button.getAttribute('onclick');
    
    // Add debug click listener
    button.addEventListener('click', function(event) {
      console.log(`\n🖱️ BUTTON CLICKED: "${text.substring(0, 40)}..."`);
      console.log(`OnClick attribute: ${onclick}`);
      
      // Try to execute onclick manually if it exists
      if (onclick) {
        try {
          console.log('🔧 Executing onclick manually...');
          eval(onclick);
          console.log('✅ OnClick executed successfully');
        } catch (error) {
          console.log(`❌ OnClick execution error: ${error.message}`);
        }
      }
    });
    
    console.log(`✅ Added debug listener to: "${text.substring(0, 30)}..."`);
  });
  
  console.log('\n✅ All buttons now have debug click listeners!');
  console.log('Try clicking buttons and check console for debug info.');
}

function createImmediateFixReport() {
  const testResult = immediateToggleTest();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    max-height: 600px;
    background: white;
    border: 3px solid ${testResult ? '#28a745' : '#dc3545'};
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const statusColor = testResult ? '#28a745' : '#dc3545';
  const statusText = testResult ? 'ALL BUTTONS WORKING!' : 'BUTTONS NOT WORKING';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: ${statusColor}; text-align: center;">
      🔧 Toggle Functions Status
    </h3>
    
    <div style="text-align: center; margin: 20px 0;">
      <div style="
        display: inline-block;
        padding: 15px 25px;
        background: ${statusColor};
        color: white;
        border-radius: 25px;
        font-weight: bold;
        font-size: 16px;
      ">
        ${statusText}
      </div>
    </div>
    
    ${!testResult ? `
      <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
        <h4 style="margin: 0 0 10px 0; color: #721c24;">🚨 Issues Found:</h4>
        <p style="margin: 0; color: #721c24; font-size: 13px;">
          Some toggle functions are not working. Use the buttons below to diagnose and fix the issues.
        </p>
      </div>
    ` : `
      <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
        <h4 style="margin: 0 0 10px 0; color: #155724;">✅ All Good!</h4>
        <p style="margin: 0; color: #155724; font-size: 13px;">
          All toggle functions are working correctly. You can now click buttons to open/close sections.
        </p>
      </div>
    `}
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Quick Actions:</h4>
      
      <button onclick="immediateToggleTest()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🧪 Test Functions</button>
      
      <button onclick="forceFixToggleIssues()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔧 Force Fix</button>
      
      <button onclick="addClickListenersForDebug()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🖱️ Debug Clicks</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">❌ Close</button>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Check browser console for detailed debug information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
  
  return testResult;
}

// Export functions
if (typeof window !== 'undefined') {
  window.immediateToggleTest = immediateToggleTest;
  window.forceFixToggleIssues = forceFixToggleIssues;
  window.addClickListenersForDebug = addClickListenersForDebug;
  window.createImmediateFixReport = createImmediateFixReport;
}
