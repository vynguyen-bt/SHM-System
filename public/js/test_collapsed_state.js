// Test script để kiểm tra trạng thái collapsed của tất cả sections

function testCollapsedState() {
  console.log('📋 === TEST COLLAPSED STATE ===\n');
  
  const sections = [
    { id: 'partA', name: '1. Chẩn đoán vị trí hư hỏng kết cấu' },
    { id: 'partB', name: '2. Chẩn đoán mức độ hư hỏng kết cấu' },
    { id: 'partB1', name: '0. Mô phỏng hư hỏng' },
    { id: 'partB3', name: '3. Cải thiện kết quả chẩn đoán kết cấu' },
    { id: 'partB4', name: '4. Cải thiện độ chính xác chẩn đoán kết cấu' }
  ];
  
  console.log(`🔍 Checking ${sections.length} sections for collapsed state:\n`);
  
  let allCollapsed = true;
  const results = [];
  
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    
    if (!element) {
      console.log(`❌ Section '${section.id}' not found in DOM`);
      results.push({
        id: section.id,
        name: section.name,
        found: false,
        collapsed: false,
        display: 'not found'
      });
      allCollapsed = false;
      return;
    }
    
    const computedStyle = window.getComputedStyle(element);
    const isHidden = computedStyle.display === 'none' || element.style.display === 'none';
    
    const status = isHidden ? '✅ Collapsed' : '❌ Expanded';
    console.log(`${status} - ${section.name}`);
    console.log(`  Element ID: ${section.id}`);
    console.log(`  Display: ${computedStyle.display}`);
    console.log(`  Style.display: ${element.style.display}`);
    console.log('');
    
    results.push({
      id: section.id,
      name: section.name,
      found: true,
      collapsed: isHidden,
      display: computedStyle.display,
      styleDisplay: element.style.display
    });
    
    if (!isHidden) {
      allCollapsed = false;
    }
  });
  
  // Summary
  console.log('📊 === COLLAPSED STATE SUMMARY ===\n');
  console.log(`Overall Result: ${allCollapsed ? '✅ ALL SECTIONS COLLAPSED' : '❌ SOME SECTIONS EXPANDED'}\n`);
  
  if (!allCollapsed) {
    console.log('❌ Expanded Sections:');
    results.forEach(result => {
      if (result.found && !result.collapsed) {
        console.log(`  - ${result.name} (${result.id}): display = ${result.display}`);
      }
    });
    console.log('');
  }
  
  // Check corresponding buttons
  console.log('🔘 === BUTTON FUNCTIONALITY CHECK ===\n');
  
  const buttons = [
    { onclick: 'switchToPartA()', section: 'partA', name: '1. Chẩn đoán vị trí hư hỏng kết cấu' },
    { onclick: 'switchToPartB()', section: 'partB', name: '2. Chẩn đoán mức độ hư hỏng kết cấu' },
    { onclick: 'switchToPartB1()', section: 'partB1', name: '0. Mô phỏng hư hỏng' },
    { onclick: 'switchToPartB3()', section: 'partB3', name: '3. Cải thiện kết quả chẩn đoán kết cấu' },
    { onclick: 'switchToPartB4()', section: 'partB4', name: '4. Cải thiện độ chính xác chẩn đoán kết cấu' }
  ];
  
  buttons.forEach(button => {
    const functionName = button.onclick.replace('()', '');
    const functionExists = typeof window[functionName] === 'function';
    const status = functionExists ? '✅ Function exists' : '❌ Function missing';
    
    console.log(`${status} - ${functionName}() for ${button.name}`);
  });
  
  return {
    allCollapsed,
    results,
    expandedSections: results.filter(r => r.found && !r.collapsed)
  };
}

function testButtonFunctionality() {
  console.log('🔘 === TEST BUTTON FUNCTIONALITY ===\n');
  
  const testCases = [
    { func: 'switchToPartA', elementId: 'partA', name: 'Section 1' },
    { func: 'switchToPartB', elementId: 'partB', name: 'Section 2' },
    { func: 'switchToPartB1', elementId: 'partB1', name: 'Section 0' },
    { func: 'switchToPartB3', elementId: 'partB3', name: 'Section 3' },
    { func: 'switchToPartB4', elementId: 'partB4', name: 'Section 4' }
  ];
  
  testCases.forEach(test => {
    console.log(`🧪 Testing ${test.func}() for ${test.name}:`);
    
    const element = document.getElementById(test.elementId);
    if (!element) {
      console.log(`  ❌ Element '${test.elementId}' not found`);
      return;
    }
    
    const func = window[test.func];
    if (typeof func !== 'function') {
      console.log(`  ❌ Function '${test.func}' not found`);
      return;
    }
    
    // Test initial state (should be hidden)
    const initialDisplay = window.getComputedStyle(element).display;
    console.log(`  Initial state: ${initialDisplay}`);
    
    // Test toggle function
    try {
      func(); // Call the function
      const afterToggle = window.getComputedStyle(element).display;
      console.log(`  After toggle: ${afterToggle}`);
      
      // Toggle back
      func();
      const afterSecondToggle = window.getComputedStyle(element).display;
      console.log(`  After second toggle: ${afterSecondToggle}`);
      
      const works = initialDisplay === 'none' && afterToggle === 'block' && afterSecondToggle === 'none';
      console.log(`  Result: ${works ? '✅ Working correctly' : '❌ Not working properly'}`);
      
    } catch (error) {
      console.log(`  ❌ Error calling function: ${error.message}`);
    }
    
    console.log('');
  });
}

function forceCollapseAllSections() {
  console.log('🔧 === FORCE COLLAPSE ALL SECTIONS ===\n');
  
  const sectionsToHide = ['partA', 'partB', 'partB1', 'partB3', 'partB3New', 'partB4'];
  
  sectionsToHide.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.style.display = 'none';
      console.log(`✅ Collapsed ${sectionId}`);
    } else {
      console.log(`⚠️ Element ${sectionId} not found`);
    }
  });
  
  console.log('\n✅ All sections forced to collapsed state!');
  
  // Test results
  setTimeout(() => {
    console.log('\n🔍 Verifying collapsed state:');
    testCollapsedState();
  }, 500);
}

function createCollapsedStateReport() {
  const testResult = testCollapsedState();
  
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
    border: 2px solid ${testResult.allCollapsed ? '#28a745' : '#dc3545'};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const statusColor = testResult.allCollapsed ? '#28a745' : '#dc3545';
  const statusText = testResult.allCollapsed ? 'ALL SECTIONS COLLAPSED' : 'SOME SECTIONS EXPANDED';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: ${statusColor};">Collapsed State Test Report</h3>
    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
    <p><strong>Sections checked:</strong> ${testResult.results.length}</p>
    
    ${testResult.expandedSections.length > 0 ? `
      <div style="margin: 15px 0;">
        <h4 style="color: #dc3545; margin: 10px 0 5px 0;">Expanded Sections:</h4>
        <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
          ${testResult.expandedSections.map(section => 
            `<li>${section.name} (${section.id})</li>`
          ).join('')}
        </ul>
      </div>
    ` : `
      <p style="color: #28a745; font-weight: bold;">✅ All sections properly collapsed!</p>
    `}
    
    <div style="margin: 15px 0;">
      <button onclick="testCollapsedState()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test State</button>
      
      <button onclick="testButtonFunctionality()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test Buttons</button>
      
      <button onclick="forceCollapseAllSections()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Force Collapse</button>
      
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
  window.testCollapsedState = testCollapsedState;
  window.testButtonFunctionality = testButtonFunctionality;
  window.forceCollapseAllSections = forceCollapseAllSections;
  window.createCollapsedStateReport = createCollapsedStateReport;
}
