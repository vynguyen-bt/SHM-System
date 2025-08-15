// Test script để kiểm tra layout của sections sau khi khôi phục

function testSectionLayout() {
  console.log('🎨 === TEST SECTION LAYOUT RESTORATION ===\n');
  
  const sections = [
    { id: 'partA', name: 'Section 1 - Chẩn đoán vị trí hư hỏng' },
    { id: 'partB', name: 'Section 2 - Chẩn đoán mức độ hư hỏng' },
    { id: 'partB1', name: 'Section 0 - Mô phỏng hư hỏng' },
    { id: 'partB3', name: 'Section 3 - Cải thiện kết quả chẩn đoán' },
    { id: 'partB4', name: 'Section 4 - Cải thiện độ chính xác chẩn đoán' }
  ];
  
  const layoutResults = [];
  
  sections.forEach(section => {
    console.log(`🔍 Testing ${section.name}:`);
    
    const element = document.getElementById(section.id);
    if (!element) {
      console.log(`  ❌ Element not found`);
      layoutResults.push({ ...section, found: false });
      return;
    }
    
    // Show section temporarily to test layout
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    
    // Test container elements
    const containers = element.querySelectorAll('.container');
    const forms = element.querySelectorAll('form');
    const inputs = element.querySelectorAll('input, select');
    const labels = element.querySelectorAll('label');
    const charts = element.querySelectorAll('#damage3DChart, .chart-container');
    const tables = element.querySelectorAll('table');
    
    console.log(`  Containers found: ${containers.length}`);
    console.log(`  Forms found: ${forms.length}`);
    console.log(`  Input elements: ${inputs.length}`);
    console.log(`  Labels: ${labels.length}`);
    console.log(`  Charts: ${charts.length}`);
    console.log(`  Tables: ${tables.length}`);
    
    // Test container styling
    let containerIssues = [];
    containers.forEach((container, index) => {
      const style = window.getComputedStyle(container);
      
      const expectedStyles = {
        width: '95%',
        maxWidth: '1200px',
        padding: '20px',
        backgroundColor: 'rgb(255, 255, 255)',
        borderRadius: '8px'
      };
      
      Object.keys(expectedStyles).forEach(prop => {
        const actual = style[prop];
        const expected = expectedStyles[prop];
        
        if (actual !== expected) {
          containerIssues.push(`${prop}: ${actual} (expected: ${expected})`);
        }
      });
    });
    
    // Test form element styling
    let formIssues = [];
    inputs.forEach((input, index) => {
      if (input.classList.contains('button-open')) return; // Skip navigation buttons
      
      const style = window.getComputedStyle(input);
      
      const expectedStyles = {
        maxWidth: '400px',
        padding: '12px',
        borderRadius: '5px',
        fontSize: '14px'
      };
      
      Object.keys(expectedStyles).forEach(prop => {
        const actual = style[prop];
        const expected = expectedStyles[prop];
        
        if (actual !== expected) {
          formIssues.push(`Input ${index}: ${prop}: ${actual} (expected: ${expected})`);
        }
      });
    });
    
    // Test label styling
    let labelIssues = [];
    labels.forEach((label, index) => {
      const style = window.getComputedStyle(label);
      
      if (style.fontSize !== '16px' || style.fontWeight !== '500') {
        labelIssues.push(`Label ${index}: fontSize: ${style.fontSize}, fontWeight: ${style.fontWeight}`);
      }
    });
    
    const result = {
      ...section,
      found: true,
      containers: containers.length,
      forms: forms.length,
      inputs: inputs.length,
      labels: labels.length,
      charts: charts.length,
      tables: tables.length,
      containerIssues: containerIssues,
      formIssues: formIssues,
      labelIssues: labelIssues,
      hasIssues: containerIssues.length > 0 || formIssues.length > 0 || labelIssues.length > 0
    };
    
    layoutResults.push(result);
    
    if (result.hasIssues) {
      console.log(`  ⚠️ Issues found:`);
      if (containerIssues.length > 0) {
        console.log(`    Container issues: ${containerIssues.join(', ')}`);
      }
      if (formIssues.length > 0) {
        console.log(`    Form issues: ${formIssues.slice(0, 3).join(', ')}${formIssues.length > 3 ? '...' : ''}`);
      }
      if (labelIssues.length > 0) {
        console.log(`    Label issues: ${labelIssues.slice(0, 3).join(', ')}${labelIssues.length > 3 ? '...' : ''}`);
      }
    } else {
      console.log(`  ✅ Layout looks good`);
    }
    
    // Restore original display
    element.style.display = originalDisplay;
    console.log('');
  });
  
  // Summary
  const totalIssues = layoutResults.filter(r => r.hasIssues).length;
  console.log(`📊 === LAYOUT TEST SUMMARY ===`);
  console.log(`Sections tested: ${layoutResults.length}`);
  console.log(`Sections with issues: ${totalIssues}`);
  console.log(`Overall status: ${totalIssues === 0 ? '✅ ALL GOOD' : '⚠️ ISSUES FOUND'}\n`);
  
  return layoutResults;
}

function fixSectionLayoutIssues() {
  console.log('🔧 === FIXING SECTION LAYOUT ISSUES ===\n');
  
  // Force apply restored styles
  const style = document.createElement('style');
  style.textContent = `
    /* Force restored layout styles */
    .container {
      width: 95% !important;
      max-width: 1200px !important;
      padding: 20px !important;
      background-color: #fff !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
      overflow-x: auto !important;
      margin: 0 auto !important;
    }
    
    label {
      font-size: 16px !important;
      font-weight: 500 !important;
      display: block !important;
      margin: 10px 0 5px !important;
    }
    
    input:not(.button-open),
    select,
    button:not(.button-open) {
      width: 100% !important;
      max-width: 400px !important;
      padding: 12px !important;
      margin-bottom: 15px !important;
      border-radius: 5px !important;
      border: 1px solid #ccc !important;
      display: block !important;
      font-size: 14px !important;
      font-family: Arial, sans-serif !important;
      box-sizing: border-box !important;
    }
    
    input[type="number"],
    input[type="file"],
    select {
      background-color: #f9f9f9 !important;
    }
    
    #damage3DChart {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 600px !important;
      margin: 20px 0 !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
      background-color: #fff !important;
      overflow: visible !important;
      position: relative !important;
    }
    
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 15px 0 !important;
      background-color: #fff !important;
    }
    
    table th,
    table td {
      padding: 12px !important;
      text-align: left !important;
      border-bottom: 1px solid #ddd !important;
    }
    
    table th {
      background-color: #f8f9fa !important;
      font-weight: 600 !important;
      color: #495057 !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ Applied force layout fixes');
  
  // Test after fix
  setTimeout(() => {
    console.log('\n🧪 Testing layout after fixes:');
    testSectionLayout();
  }, 500);
}

function createLayoutTestReport() {
  const layoutResults = testSectionLayout();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-height: 700px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const totalIssues = layoutResults.filter(r => r.hasIssues).length;
  const statusColor = totalIssues === 0 ? '#28a745' : '#ffc107';
  const statusText = totalIssues === 0 ? 'LAYOUT RESTORED' : 'SOME ISSUES FOUND';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #007BFF; text-align: center;">
      🎨 Section Layout Test Report
    </h3>
    
    <div style="text-align: center; margin: 20px 0;">
      <div style="
        display: inline-block;
        padding: 15px 25px;
        background: ${statusColor};
        color: ${totalIssues === 0 ? 'white' : 'black'};
        border-radius: 25px;
        font-weight: bold;
        font-size: 16px;
      ">
        ${statusText}
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Section Status:</h4>
      ${layoutResults.map(result => `
        <div style="margin: 10px 0; padding: 10px; background: ${result.hasIssues ? '#fff3cd' : '#d4edda'}; border-radius: 5px;">
          <strong>${result.name}</strong>
          <div style="font-size: 12px; margin-top: 5px;">
            ${result.found ? `
              Containers: ${result.containers}, Forms: ${result.forms}, Inputs: ${result.inputs}
              ${result.hasIssues ? '<br><span style="color: #856404;">⚠️ Has styling issues</span>' : '<br><span style="color: #155724;">✅ Layout OK</span>'}
            ` : '<span style="color: #721c24;">❌ Not found</span>'}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Actions:</h4>
      
      <button onclick="testSectionLayout()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🧪 Test Layout</button>
      
      <button onclick="fixSectionLayoutIssues()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔧 Fix Issues</button>
      
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
      ">❌ Close Report</button>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Layout has been restored from backup. Check console for detailed information.
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
  
  return layoutResults;
}

// Export functions
if (typeof window !== 'undefined') {
  window.testSectionLayout = testSectionLayout;
  window.fixSectionLayoutIssues = fixSectionLayoutIssues;
  window.createLayoutTestReport = createLayoutTestReport;
}
