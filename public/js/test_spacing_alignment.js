// Test script để kiểm tra spacing và text alignment của buttons

function testButtonSpacing() {
  console.log('📏 === TEST BUTTON SPACING ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  console.log(`🔍 Analyzing spacing between ${buttons.length} navigation buttons:\n`);
  
  const spacingData = [];
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const rect = button.getBoundingClientRect();
    const style = window.getComputedStyle(button);
    const text = button.textContent.trim();
    
    let verticalSpacing = 0;
    if (i > 0) {
      const prevButton = buttons[i - 1];
      const prevRect = prevButton.getBoundingClientRect();
      verticalSpacing = rect.top - prevRect.bottom;
    }
    
    const data = {
      index: i + 1,
      text: text.substring(0, 30),
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      verticalSpacing: verticalSpacing
    };
    
    spacingData.push(data);
    
    console.log(`🔘 Button ${i + 1}: "${text.substring(0, 40)}..."`);
    console.log(`  Position: top=${rect.top.toFixed(1)}px, bottom=${rect.bottom.toFixed(1)}px`);
    console.log(`  Height: ${rect.height.toFixed(1)}px`);
    console.log(`  Margin: top=${style.marginTop}, bottom=${style.marginBottom}`);
    if (i > 0) {
      console.log(`  Spacing from previous: ${verticalSpacing.toFixed(1)}px`);
    }
    console.log('');
  }
  
  // Analyze spacing consistency
  console.log('📊 SPACING CONSISTENCY ANALYSIS:\n');
  
  const spacings = spacingData.slice(1).map(btn => btn.verticalSpacing); // Skip first button
  const minSpacing = Math.min(...spacings);
  const maxSpacing = Math.max(...spacings);
  const spacingDiff = maxSpacing - minSpacing;
  
  console.log(`Spacing range: ${minSpacing.toFixed(1)}px - ${maxSpacing.toFixed(1)}px`);
  console.log(`Spacing difference: ${spacingDiff.toFixed(1)}px`);
  
  const isSpacingConsistent = spacingDiff < 3; // 3px tolerance
  console.log(`Spacing consistency: ${isSpacingConsistent ? '✅ Consistent' : '❌ Inconsistent'} (tolerance: 3px)`);
  
  if (!isSpacingConsistent) {
    console.log('\n⚠️ BUTTONS WITH INCONSISTENT SPACING:');
    spacingData.slice(1).forEach(btn => {
      const isOff = Math.abs(btn.verticalSpacing - spacings[0]) > 3;
      if (isOff) {
        console.log(`  Button ${btn.index}: ${btn.verticalSpacing.toFixed(1)}px spacing`);
      }
    });
  }
  
  return {
    isSpacingConsistent,
    spacingData,
    spacingDiff,
    averageSpacing: spacings.reduce((a, b) => a + b, 0) / spacings.length
  };
}

function testTextAlignment() {
  console.log('🎯 === TEST TEXT ALIGNMENT ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  console.log(`🔍 Analyzing text alignment in ${buttons.length} navigation buttons:\n`);
  
  const alignmentData = [];
  
  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect();
    const style = window.getComputedStyle(button);
    const text = button.textContent.trim();
    
    // Create a temporary span to measure text
    const tempSpan = document.createElement('span');
    tempSpan.style.cssText = `
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      font-weight: ${style.fontWeight};
      line-height: ${style.lineHeight};
      visibility: hidden;
      position: absolute;
      white-space: nowrap;
    `;
    tempSpan.textContent = text;
    document.body.appendChild(tempSpan);
    
    const textRect = tempSpan.getBoundingClientRect();
    document.body.removeChild(tempSpan);
    
    // Calculate text position within button
    const buttonCenterY = rect.top + rect.height / 2;
    const textCenterY = rect.top + (rect.height / 2); // Assuming perfect centering
    const verticalOffset = Math.abs(buttonCenterY - textCenterY);
    
    const data = {
      index: index + 1,
      text: text.substring(0, 30),
      buttonHeight: rect.height,
      textHeight: textRect.height,
      lineHeight: style.lineHeight,
      textAlign: style.textAlign,
      display: style.display,
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      verticalOffset: verticalOffset,
      padding: style.padding
    };
    
    alignmentData.push(data);
    
    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 40)}..."`);
    console.log(`  Button height: ${rect.height.toFixed(1)}px`);
    console.log(`  Text height: ${textRect.height.toFixed(1)}px`);
    console.log(`  Line height: ${style.lineHeight}`);
    console.log(`  Text align: ${style.textAlign}`);
    console.log(`  Display: ${style.display}`);
    console.log(`  Align items: ${style.alignItems}`);
    console.log(`  Justify content: ${style.justifyContent}`);
    console.log(`  Padding: ${style.padding}`);
    console.log('');
  });
  
  // Analyze alignment consistency
  console.log('📊 TEXT ALIGNMENT ANALYSIS:\n');
  
  const textAligns = alignmentData.map(btn => btn.textAlign);
  const displays = alignmentData.map(btn => btn.display);
  const alignItems = alignmentData.map(btn => btn.alignItems);
  
  const isTextAlignConsistent = [...new Set(textAligns)].length === 1;
  const isDisplayConsistent = [...new Set(displays)].length === 1;
  const isAlignItemsConsistent = [...new Set(alignItems)].length === 1;
  
  console.log(`Text align consistency: ${isTextAlignConsistent ? '✅' : '❌'} (${[...new Set(textAligns)].join(', ')})`);
  console.log(`Display consistency: ${isDisplayConsistent ? '✅' : '❌'} (${[...new Set(displays)].join(', ')})`);
  console.log(`Align items consistency: ${isAlignItemsConsistent ? '✅' : '❌'} (${[...new Set(alignItems)].join(', ')})`);
  
  const isVerticallyAligned = alignItems.every(align => align === 'center');
  console.log(`Vertical centering: ${isVerticallyAligned ? '✅ All centered' : '❌ Not all centered'}`);
  
  return {
    isTextAlignConsistent,
    isDisplayConsistent,
    isAlignItemsConsistent,
    isVerticallyAligned,
    alignmentData
  };
}

function applyPerfectSpacingAndAlignment() {
  console.log('🔧 === APPLYING PERFECT SPACING & ALIGNMENT ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  const perfectStyle = {
    // Size properties
    width: '320px',
    height: '40px',
    minWidth: '320px',
    maxWidth: '320px',
    minHeight: '40px',
    maxHeight: '40px',
    
    // Spacing properties
    padding: '0 16px',
    margin: '15px 0 0 auto',
    
    // Typography properties
    fontSize: '16px',
    lineHeight: '40px',
    fontWeight: '600',
    
    // Visual properties
    backgroundColor: '#0056b3',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    // Perfect vertical centering with left-aligned text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'left',
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  };
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    console.log(`🔧 Fixing Button ${index + 1}: "${text.substring(0, 30)}..."`);
    
    // Apply perfect style
    Object.keys(perfectStyle).forEach(prop => {
      button.style.setProperty(prop, perfectStyle[prop], 'important');
    });
    
    // First button gets no top margin
    if (index === 0) {
      button.style.setProperty('margin-top', '0', 'important');
    }
  });
  
  console.log('✅ Perfect spacing and alignment applied!');
  
  // Test results
  setTimeout(() => {
    console.log('\n🔍 Testing results after fix:');
    testButtonSpacing();
    testTextAlignment();
  }, 500);
}

function createSpacingAlignmentReport() {
  const spacingResult = testButtonSpacing();
  const alignmentResult = testTextAlignment();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 450px;
    max-height: 600px;
    background: white;
    border: 2px solid ${spacingResult.isSpacingConsistent && alignmentResult.isVerticallyAligned ? '#28a745' : '#dc3545'};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const allPassed = spacingResult.isSpacingConsistent && alignmentResult.isVerticallyAligned;
  const statusColor = allPassed ? '#28a745' : '#dc3545';
  const statusText = allPassed ? 'ALL TESTS PASSED' : 'ISSUES FOUND';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: ${statusColor};">Spacing & Alignment Report</h3>
    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
    
    <div style="margin: 15px 0;">
      <h4 style="margin: 10px 0 5px 0;">Test Results:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        <li>Spacing consistency: ${spacingResult.isSpacingConsistent ? '✅' : '❌'} (diff: ${spacingResult.spacingDiff.toFixed(1)}px)</li>
        <li>Text alignment: ${alignmentResult.isTextAlignConsistent ? '✅' : '❌'}</li>
        <li>Vertical centering: ${alignmentResult.isVerticallyAligned ? '✅' : '❌'}</li>
        <li>Display consistency: ${alignmentResult.isDisplayConsistent ? '✅' : '❌'}</li>
      </ul>
      
      <p style="font-size: 12px; color: #666; margin: 10px 0;">
        Average spacing: ${spacingResult.averageSpacing.toFixed(1)}px
      </p>
    </div>
    
    <div style="margin: 15px 0;">
      <button onclick="testButtonSpacing()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test Spacing</button>
      
      <button onclick="testTextAlignment()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test Alignment</button>
      
      <button onclick="applyPerfectSpacingAndAlignment()" style="
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
      Check browser console for detailed analysis.
    </p>
  `;
  
  document.body.appendChild(reportDiv);
  
  return { spacingResult, alignmentResult };
}

// Export functions
if (typeof window !== 'undefined') {
  window.testButtonSpacing = testButtonSpacing;
  window.testTextAlignment = testTextAlignment;
  window.applyPerfectSpacingAndAlignment = applyPerfectSpacingAndAlignment;
  window.createSpacingAlignmentReport = createSpacingAlignmentReport;
}
