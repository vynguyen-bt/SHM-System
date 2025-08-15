// Test script cho compact left-aligned layout

function testCompactLayout() {
  console.log('🎯 === TEST COMPACT LEFT-ALIGNED LAYOUT ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  console.log(`📊 Testing ${buttons.length} navigation buttons:\n`);
  
  const expectedDimensions = {
    width: 320,
    height: 40,
    padding: '8px 16px',
    margin: '12px 0px 0px auto',       /* Right alignment with margin-left: auto */
    fontSize: '16px',
    lineHeight: '1.3',
    textAlign: 'left',                 /* Left-aligned text inside button */
    display: 'block'
  };
  
  let allPassed = true;
  const results = [];
  
  buttons.forEach((button, index) => {
    const style = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    const text = button.textContent.trim();
    
    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 40)}..."`);
    
    const tests = [
      {
        name: 'Width',
        expected: expectedDimensions.width,
        actual: Math.round(rect.width),
        tolerance: 2,
        unit: 'px'
      },
      {
        name: 'Height', 
        expected: expectedDimensions.height,
        actual: Math.round(rect.height),
        tolerance: 2,
        unit: 'px'
      },
      {
        name: 'Padding',
        expected: expectedDimensions.padding,
        actual: style.padding,
        tolerance: 0,
        unit: ''
      },
      {
        name: 'Font Size',
        expected: expectedDimensions.fontSize,
        actual: style.fontSize,
        tolerance: 0,
        unit: ''
      },
      {
        name: 'Text Align',
        expected: expectedDimensions.textAlign,
        actual: style.textAlign,
        tolerance: 0,
        unit: ''
      },
      {
        name: 'Display',
        expected: expectedDimensions.display,
        actual: style.display,
        tolerance: 0,
        unit: ''
      }
    ];
    
    const buttonResults = {
      index: index + 1,
      text: text.substring(0, 30),
      passed: true,
      tests: []
    };
    
    tests.forEach(test => {
      let passed = false;
      
      if (test.tolerance > 0) {
        // Numeric comparison with tolerance
        const diff = Math.abs(test.actual - test.expected);
        passed = diff <= test.tolerance;
      } else {
        // Exact string comparison
        passed = test.actual === test.expected;
      }
      
      const status = passed ? '✅' : '❌';
      console.log(`  ${test.name}: ${status} (${test.actual}${test.unit} vs ${test.expected}${test.unit})`);
      
      buttonResults.tests.push({
        name: test.name,
        passed: passed,
        expected: test.expected,
        actual: test.actual,
        unit: test.unit
      });
      
      if (!passed) {
        buttonResults.passed = false;
        allPassed = false;
      }
    });
    
    results.push(buttonResults);
    console.log('');
  });
  
  // Summary
  console.log('📋 === LAYOUT TEST SUMMARY ===\n');
  console.log(`Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
  
  if (!allPassed) {
    console.log('❌ Failed Tests:');
    results.forEach(result => {
      if (!result.passed) {
        console.log(`  Button ${result.index} (${result.text}...):`);
        result.tests.forEach(test => {
          if (!test.passed) {
            console.log(`    ${test.name}: ${test.actual}${test.unit} (expected: ${test.expected}${test.unit})`);
          }
        });
      }
    });
  }
  
  return { allPassed, results, expectedDimensions };
}

function measureButtonPositions() {
  console.log('📐 === BUTTON POSITION ANALYSIS ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect();
    const style = window.getComputedStyle(button);
    const text = button.textContent.trim();
    
    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 30)}..."`);
    console.log(`  Position: left=${rect.left.toFixed(1)}px, top=${rect.top.toFixed(1)}px`);
    console.log(`  Size: ${rect.width.toFixed(1)}px x ${rect.height.toFixed(1)}px`);
    console.log(`  Margin: ${style.margin}`);
    console.log(`  Text Align: ${style.textAlign}`);
    console.log('');
  });
  
  // Check left alignment
  const leftPositions = Array.from(buttons).map(btn => btn.getBoundingClientRect().left);
  const minLeft = Math.min(...leftPositions);
  const maxLeft = Math.max(...leftPositions);
  const leftDiff = maxLeft - minLeft;
  
  console.log(`📊 Left Alignment Analysis:`);
  console.log(`  Leftmost position: ${minLeft.toFixed(1)}px`);
  console.log(`  Rightmost position: ${maxLeft.toFixed(1)}px`);
  console.log(`  Difference: ${leftDiff.toFixed(1)}px`);
  console.log(`  Alignment: ${leftDiff < 5 ? '✅ Well aligned' : '❌ Misaligned'}`);
}

function applyCompactLayoutFix() {
  console.log('🔧 === APPLYING COMPACT LAYOUT FIX ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  const compactStyle = {
    width: '320px',
    height: '40px',
    minWidth: '320px',
    maxWidth: '320px',
    minHeight: '40px',
    maxHeight: '40px',
    padding: '8px 16px',
    margin: '12px 0 0 auto',           /* Right alignment */
    fontSize: '16px',
    lineHeight: '1.3',
    backgroundColor: '#0056b3',
    color: 'white',
    fontWeight: '600',
    borderRadius: '4px',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'block',
    textAlign: 'left',                 /* Left-aligned text inside button */
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  };
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    console.log(`🔧 Fixing Button ${index + 1}: "${text.substring(0, 30)}..."`);
    
    // Apply compact style
    Object.keys(compactStyle).forEach(prop => {
      button.style.setProperty(prop, compactStyle[prop], 'important');
    });
  });
  
  console.log('✅ Compact layout applied to all buttons!');
  
  // Test results
  setTimeout(() => {
    console.log('\n🔍 Testing results after fix:');
    testCompactLayout();
    measureButtonPositions();
  }, 500);
}

function createCompactLayoutReport() {
  const testResult = testCompactLayout();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    max-height: 600px;
    background: white;
    border: 2px solid ${testResult.allPassed ? '#28a745' : '#dc3545'};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const statusColor = testResult.allPassed ? '#28a745' : '#dc3545';
  const statusText = testResult.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: ${statusColor};">Compact Layout Test Report</h3>
    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
    <p><strong>Expected Dimensions:</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px; font-size: 12px;">
      <li>Width: 320px (fixed)</li>
      <li>Height: 40px (compact)</li>
      <li>Padding: 8px 16px</li>
      <li>Text Align: left</li>
      <li>Display: block</li>
    </ul>
    
    <div style="margin: 15px 0;">
      <button onclick="testCompactLayout()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Run Test</button>
      
      <button onclick="measureButtonPositions()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Check Positions</button>
      
      <button onclick="applyCompactLayoutFix()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Apply Fix</button>
      
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
    
    <p style="margin-top: 15px; font-size: 11px; color: #666;">
      Check browser console for detailed test results.
    </p>
  `;
  
  document.body.appendChild(reportDiv);
  
  return testResult;
}

// Export functions
if (typeof window !== 'undefined') {
  window.testCompactLayout = testCompactLayout;
  window.measureButtonPositions = measureButtonPositions;
  window.applyCompactLayoutFix = applyCompactLayoutFix;
  window.createCompactLayoutReport = createCompactLayoutReport;
}
