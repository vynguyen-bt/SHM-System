// Test script để kiểm tra text alignment trong sections

function testTextAlignment() {
  console.log('📝 === TEST TEXT ALIGNMENT RESTORATION ===\n');
  
  const sections = [
    { id: 'partA', name: 'Section 1 - Chẩn đoán vị trí hư hỏng' },
    { id: 'partB', name: 'Section 2 - Chẩn đoán mức độ hư hỏng' },
    { id: 'partB1', name: 'Section 0 - Mô phỏng hư hỏng' },
    { id: 'partB3', name: 'Section 3 - Cải thiện kết quả chẩn đoán' },
    { id: 'partB4', name: 'Section 4 - Cải thiện độ chính xác chẩn đoán' }
  ];
  
  const alignmentResults = [];
  
  sections.forEach(section => {
    console.log(`📝 Testing text alignment in ${section.name}:`);
    
    const element = document.getElementById(section.id);
    if (!element) {
      console.log(`  ❌ Element not found`);
      alignmentResults.push({ ...section, found: false });
      return;
    }
    
    // Show section temporarily to test alignment
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    
    // Test different text elements
    const textElements = {
      paragraphs: element.querySelectorAll('p'),
      labels: element.querySelectorAll('label'),
      divs: element.querySelectorAll('div:not(.button-open)'),
      spans: element.querySelectorAll('span'),
      inputs: element.querySelectorAll('input:not(.button-open)'),
      selects: element.querySelectorAll('select'),
      tableCells: element.querySelectorAll('td'),
      listItems: element.querySelectorAll('li')
    };
    
    console.log(`  Found text elements:`);
    Object.keys(textElements).forEach(type => {
      console.log(`    ${type}: ${textElements[type].length}`);
    });
    
    // Check alignment for each type
    const alignmentIssues = [];
    
    Object.keys(textElements).forEach(type => {
      const elements = textElements[type];
      
      elements.forEach((el, index) => {
        // Skip navigation buttons and their containers
        if (el.classList.contains('button-open') || 
            el.closest('.button-open') ||
            el.textContent.trim().match(/^[0-4]\.\s/)) {
          return;
        }
        
        const style = window.getComputedStyle(el);
        const textAlign = style.textAlign;
        
        if (textAlign !== 'left' && textAlign !== 'start') {
          alignmentIssues.push({
            type: type,
            index: index,
            element: el.tagName.toLowerCase(),
            textAlign: textAlign,
            text: el.textContent.trim().substring(0, 50)
          });
        }
      });
    });
    
    // Check section container alignment
    const sectionStyle = window.getComputedStyle(element);
    const sectionAlign = sectionStyle.textAlign;
    
    console.log(`  Section container text-align: ${sectionAlign}`);
    
    if (sectionAlign !== 'left' && sectionAlign !== 'start') {
      alignmentIssues.push({
        type: 'section',
        element: 'section container',
        textAlign: sectionAlign,
        text: 'Section container'
      });
    }
    
    const result = {
      ...section,
      found: true,
      sectionAlign: sectionAlign,
      totalElements: Object.values(textElements).reduce((sum, arr) => sum + arr.length, 0),
      alignmentIssues: alignmentIssues,
      hasIssues: alignmentIssues.length > 0
    };
    
    alignmentResults.push(result);
    
    if (result.hasIssues) {
      console.log(`  ⚠️ Alignment issues found: ${alignmentIssues.length}`);
      alignmentIssues.slice(0, 5).forEach(issue => {
        console.log(`    ${issue.type}[${issue.index || 0}]: ${issue.textAlign} - "${issue.text}..."`);
      });
      if (alignmentIssues.length > 5) {
        console.log(`    ... and ${alignmentIssues.length - 5} more issues`);
      }
    } else {
      console.log(`  ✅ All text properly left-aligned`);
    }
    
    // Restore original display
    element.style.display = originalDisplay;
    console.log('');
  });
  
  // Summary
  const totalIssues = alignmentResults.filter(r => r.hasIssues).length;
  console.log(`📊 === TEXT ALIGNMENT SUMMARY ===`);
  console.log(`Sections tested: ${alignmentResults.length}`);
  console.log(`Sections with alignment issues: ${totalIssues}`);
  console.log(`Overall status: ${totalIssues === 0 ? '✅ ALL TEXT LEFT-ALIGNED' : '⚠️ ALIGNMENT ISSUES FOUND'}\n`);
  
  return alignmentResults;
}

function fixTextAlignment() {
  console.log('🔧 === FIXING TEXT ALIGNMENT ===\n');
  
  // Force apply left text alignment
  const style = document.createElement('style');
  style.textContent = `
    /* Force left text alignment for all content */
    .container p,
    .container div:not(.button-open),
    .container span,
    .container li,
    .container td,
    .container label,
    .container input:not(.button-open),
    .container select,
    .container textarea {
      text-align: left !important;
    }
    
    /* Section content should be left-aligned */
    #partA, #partB, #partB1, #partB3, #partB4 {
      text-align: left !important;
    }
    
    /* All text content within sections */
    #partA *, #partB *, #partB1 *, #partB3 *, #partB4 * {
      text-align: left !important;
    }
    
    /* Override any inherited right alignment from main-part */
    #partA .container *,
    #partB .container *,
    #partB1 .container *,
    #partB3 .container *,
    #partB4 .container * {
      text-align: left !important;
    }
    
    /* Exception: Keep navigation buttons as designed */
    .button-open {
      text-align: left !important; /* Text inside button left-aligned */
      margin-left: auto !important; /* Button itself right-aligned */
    }
    
    /* Exception: Keep titles as designed */
    h1:not(.container h1) {
      text-align: center !important; /* Main page title centered */
    }
    
    .container h1 {
      text-align: right !important; /* Section titles right-aligned */
    }
    
    /* Exception: Chart containers and notes can be centered */
    .chart-container {
      text-align: center !important;
    }
    
    .note {
      text-align: center !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ Applied force text alignment fixes');
  
  // Test after fix
  setTimeout(() => {
    console.log('\n🧪 Testing text alignment after fixes:');
    testTextAlignment();
  }, 500);
}

function createTextAlignmentReport() {
  const alignmentResults = testTextAlignment();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 500px;
    max-height: 600px;
    background: white;
    border: 2px solid #17a2b8;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const totalIssues = alignmentResults.filter(r => r.hasIssues).length;
  const statusColor = totalIssues === 0 ? '#28a745' : '#ffc107';
  const statusText = totalIssues === 0 ? 'TEXT ALIGNMENT RESTORED' : 'ALIGNMENT ISSUES FOUND';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #17a2b8; text-align: center;">
      📝 Text Alignment Test Report
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
      <h4 style="margin: 10px 0 15px 0;">Section Alignment Status:</h4>
      ${alignmentResults.map(result => `
        <div style="margin: 10px 0; padding: 10px; background: ${result.hasIssues ? '#fff3cd' : '#d4edda'}; border-radius: 5px;">
          <strong>${result.name}</strong>
          <div style="font-size: 12px; margin-top: 5px;">
            ${result.found ? `
              Elements: ${result.totalElements}, Section align: ${result.sectionAlign}
              ${result.hasIssues ? 
                `<br><span style="color: #856404;">⚠️ ${result.alignmentIssues.length} alignment issues</span>` : 
                '<br><span style="color: #155724;">✅ All text left-aligned</span>'
              }
            ` : '<span style="color: #721c24;">❌ Not found</span>'}
          </div>
        </div>
      `).join('')}
    </div>
    
    ${totalIssues > 0 ? `
      <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">🔧 Fix Needed:</h4>
        <p style="margin: 0; color: #856404; font-size: 13px;">
          Some text elements are not left-aligned. Click "Fix Alignment" to restore proper text alignment.
        </p>
      </div>
    ` : `
      <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
        <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Perfect!</h4>
        <p style="margin: 0; color: #155724; font-size: 13px;">
          All text content is properly left-aligned as expected.
        </p>
      </div>
    `}
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Actions:</h4>
      
      <button onclick="testTextAlignment()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">📝 Test Alignment</button>
      
      <button onclick="fixTextAlignment()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔧 Fix Alignment</button>
      
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
        💡 Text alignment has been restored to left-aligned like original version.
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
  
  return alignmentResults;
}

// Export functions
if (typeof window !== 'undefined') {
  window.testTextAlignment = testTextAlignment;
  window.fixTextAlignment = fixTextAlignment;
  window.createTextAlignmentReport = createTextAlignmentReport;
}
