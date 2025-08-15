// Test script cho right-aligned layout với centered text

function testRightAlignment() {
  console.log('➡️ === TEST RIGHT-ALIGNED LAYOUT ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  console.log(`📊 Testing right alignment of ${buttons.length} navigation buttons:\n`);
  
  const alignmentData = [];
  let containerWidth = 0;
  
  // Get container width
  if (buttons.length > 0) {
    const container = buttons[0].parentElement;
    containerWidth = container.getBoundingClientRect().width;
    console.log(`📐 Container width: ${containerWidth.toFixed(1)}px\n`);
  }
  
  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect();
    const style = window.getComputedStyle(button);
    const text = button.textContent.trim();
    
    // Calculate right alignment metrics
    const containerRect = button.parentElement.getBoundingClientRect();
    const rightEdge = rect.right;
    const containerRightEdge = containerRect.right;
    const distanceFromRight = containerRightEdge - rightEdge;
    
    const data = {
      index: index + 1,
      text: text.substring(0, 30),
      left: rect.left,
      right: rect.right,
      width: rect.width,
      distanceFromRight: distanceFromRight,
      textAlign: style.textAlign,
      margin: style.margin,
      marginLeft: style.marginLeft
    };
    
    alignmentData.push(data);
    
    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 40)}..."`);
    console.log(`  Position: left=${rect.left.toFixed(1)}px, right=${rect.right.toFixed(1)}px`);
    console.log(`  Width: ${rect.width.toFixed(1)}px`);
    console.log(`  Distance from right edge: ${distanceFromRight.toFixed(1)}px`);
    console.log(`  Text align: ${style.textAlign}`);
    console.log(`  Margin: ${style.margin}`);
    console.log(`  Margin-left: ${style.marginLeft}`);
    console.log('');
  });
  
  // Analyze right alignment consistency
  console.log('📊 RIGHT ALIGNMENT ANALYSIS:\n');
  
  const rightPositions = alignmentData.map(btn => btn.right);
  const distancesFromRight = alignmentData.map(btn => btn.distanceFromRight);
  
  const minRight = Math.min(...rightPositions);
  const maxRight = Math.max(...rightPositions);
  const rightDiff = maxRight - minRight;
  
  const minDistance = Math.min(...distancesFromRight);
  const maxDistance = Math.max(...distancesFromRight);
  const distanceDiff = maxDistance - minDistance;
  
  console.log(`Right edge positions: ${minRight.toFixed(1)}px - ${maxRight.toFixed(1)}px`);
  console.log(`Right edge difference: ${rightDiff.toFixed(1)}px`);
  console.log(`Distance from container right: ${minDistance.toFixed(1)}px - ${maxDistance.toFixed(1)}px`);
  console.log(`Distance difference: ${distanceDiff.toFixed(1)}px`);
  
  const isRightAligned = rightDiff < 5 && distanceDiff < 5; // 5px tolerance
  console.log(`\nRight alignment: ${isRightAligned ? '✅ Well aligned' : '❌ Misaligned'} (tolerance: 5px)`);
  
  // Check text alignment
  const textAlignments = alignmentData.map(btn => btn.textAlign);
  const uniqueTextAlignments = [...new Set(textAlignments)];
  const isTextCentered = uniqueTextAlignments.length === 1 && uniqueTextAlignments[0] === 'center';
  
  console.log(`Text alignment: ${isTextCentered ? '✅ All centered' : '❌ Inconsistent'}`);
  if (!isTextCentered) {
    console.log(`  Text alignments found: ${uniqueTextAlignments.join(', ')}`);
  }
  
  // Check margin-left: auto
  const marginLefts = alignmentData.map(btn => btn.marginLeft);
  const hasAutoMargin = marginLefts.every(margin => margin === 'auto' || margin.includes('auto'));
  
  console.log(`Margin-left auto: ${hasAutoMargin ? '✅ All have auto' : '❌ Some missing auto'}`);
  if (!hasAutoMargin) {
    alignmentData.forEach(btn => {
      if (btn.marginLeft !== 'auto' && !btn.marginLeft.includes('auto')) {
        console.log(`  Button ${btn.index}: margin-left = ${btn.marginLeft}`);
      }
    });
  }
  
  return {
    isRightAligned,
    isTextCentered,
    hasAutoMargin,
    alignmentData,
    rightDiff,
    distanceDiff
  };
}

function measureButtonSpacing() {
  console.log('📏 === BUTTON SPACING ANALYSIS ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  for (let i = 0; i < buttons.length - 1; i++) {
    const currentButton = buttons[i];
    const nextButton = buttons[i + 1];
    
    const currentRect = currentButton.getBoundingClientRect();
    const nextRect = nextButton.getBoundingClientRect();
    
    const verticalSpacing = nextRect.top - currentRect.bottom;
    
    console.log(`Button ${i + 1} to Button ${i + 2}: ${verticalSpacing.toFixed(1)}px vertical spacing`);
  }
}

function applyRightAlignmentFix() {
  console.log('🔧 === APPLYING RIGHT ALIGNMENT FIX ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  const rightAlignedStyle = {
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
    textAlign: 'center',               /* Centered text */
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  };
  
  // Also fix container alignment
  const containers = document.querySelectorAll('.main-part');
  containers.forEach(container => {
    container.style.setProperty('text-align', 'right', 'important');
    container.style.setProperty('padding-left', '0', 'important');
    container.style.setProperty('padding-right', '0', 'important');
    container.style.setProperty('margin-left', '0', 'important');
    container.style.setProperty('margin-right', '0', 'important');
  });
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    console.log(`🔧 Fixing Button ${index + 1}: "${text.substring(0, 30)}..."`);
    
    // Apply right-aligned style
    Object.keys(rightAlignedStyle).forEach(prop => {
      button.style.setProperty(prop, rightAlignedStyle[prop], 'important');
    });
  });
  
  console.log('✅ Right alignment applied to all buttons!');
  
  // Test results
  setTimeout(() => {
    console.log('\n🔍 Testing results after fix:');
    testRightAlignment();
    measureButtonSpacing();
  }, 500);
}

function createRightAlignmentReport() {
  const testResult = testRightAlignment();
  
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 450px;
    max-height: 600px;
    background: white;
    border: 2px solid ${testResult.isRightAligned && testResult.isTextCentered ? '#28a745' : '#dc3545'};
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const allPassed = testResult.isRightAligned && testResult.isTextCentered && testResult.hasAutoMargin;
  const statusColor = allPassed ? '#28a745' : '#dc3545';
  const statusText = allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: ${statusColor};">Right Alignment Test Report</h3>
    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
    
    <div style="margin: 15px 0;">
      <h4 style="margin: 10px 0 5px 0;">Test Results:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        <li>Right alignment: ${testResult.isRightAligned ? '✅' : '❌'} (diff: ${testResult.rightDiff.toFixed(1)}px)</li>
        <li>Text centered: ${testResult.isTextCentered ? '✅' : '❌'}</li>
        <li>Margin-left auto: ${testResult.hasAutoMargin ? '✅' : '❌'}</li>
      </ul>
    </div>
    
    <div style="margin: 15px 0;">
      <button onclick="testRightAlignment()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Test Alignment</button>
      
      <button onclick="measureButtonSpacing()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 3px;
        font-size: 12px;
      ">Check Spacing</button>
      
      <button onclick="applyRightAlignmentFix()" style="
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
      Check browser console for detailed alignment analysis.
    </p>
  `;
  
  document.body.appendChild(reportDiv);
  
  return testResult;
}

// Export functions
if (typeof window !== 'undefined') {
  window.testRightAlignment = testRightAlignment;
  window.measureButtonSpacing = measureButtonSpacing;
  window.applyRightAlignmentFix = applyRightAlignmentFix;
  window.createRightAlignmentReport = createRightAlignmentReport;
}
