// Debug script chuyên biệt cho button mục 2

function debugButton2() {
  console.log('🔍 === DEBUG BUTTON MỤC 2 ===\n');
  
  // Tìm button mục 2
  const button2 = document.querySelector('button.button-open[onclick*="switchToPartB()"]');
  
  if (!button2) {
    console.log('❌ Không tìm thấy button mục 2');
    return;
  }
  
  console.log('✅ Tìm thấy button mục 2:', button2.textContent.trim());
  console.log('📋 OnClick:', button2.getAttribute('onclick'));
  console.log('📋 Classes:', button2.className);
  
  // Lấy computed styles
  const computedStyle = window.getComputedStyle(button2);

  console.log('\n📏 SIZE-FOCUSED COMPUTED STYLES:');
  const sizeProps = [
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'fontSize',
    'lineHeight',
    'boxSizing'
  ];

  console.log('🔍 KÍCH THƯỚC CHI TIẾT:');
  sizeProps.forEach(prop => {
    console.log(`  ${prop}: ${computedStyle[prop]}`);
  });

  console.log('\n🎨 VISUAL STYLES:');
  const visualProps = [
    'backgroundColor',
    'color',
    'fontWeight',
    'borderRadius',
    'border',
    'boxShadow',
    'cursor',
    'transition',
    'display',
    'textAlign'
  ];
  
  visualProps.forEach(prop => {
    console.log(`  ${prop}: ${computedStyle[prop]}`);
  });

  // Đo kích thước thực tế
  const rect = button2.getBoundingClientRect();
  console.log('\n📐 KÍCH THƯỚC THỰC TẾ (getBoundingClientRect):');
  console.log(`  width: ${rect.width}px`);
  console.log(`  height: ${rect.height}px`);
  console.log(`  top: ${rect.top}px`);
  console.log(`  left: ${rect.left}px`);
  
  // Kiểm tra CSS rules áp dụng
  console.log('\n🔍 CSS RULES MATCHING:');
  const onclick = button2.getAttribute('onclick');
  
  const ruleChecks = [
    { name: '.button-open', match: button2.classList.contains('button-open') },
    { name: 'switchToPartB()', match: onclick.includes('switchToPartB()') },
    { name: 'processFilestrain', match: onclick.includes('processFilestrain') },
    { name: 'processFileTest', match: onclick.includes('processFileTest') },
    { name: 'processDataX', match: onclick.includes('processDataX') }
  ];
  
  ruleChecks.forEach(check => {
    console.log(`  ${check.name}: ${check.match ? '✅ MATCH' : '❌'}`);
  });
  
  // So sánh với button khác
  console.log('\n📊 SO SÁNH VỚI BUTTON KHÁC:');
  const otherButtons = document.querySelectorAll('.button-open');
  const referenceButton = Array.from(otherButtons).find(btn => 
    btn.textContent.includes('0. Mô phỏng') || btn.textContent.includes('1. Chẩn đoán vị trí')
  );
  
  if (referenceButton) {
    const refStyle = window.getComputedStyle(referenceButton);
    const refRect = referenceButton.getBoundingClientRect();
    console.log('🔗 Reference button:', referenceButton.textContent.trim());

    console.log('\n📏 SO SÁNH KÍCH THƯỚC:');
    sizeProps.forEach(prop => {
      const button2Value = computedStyle[prop];
      const refValue = refStyle[prop];
      const isMatch = button2Value === refValue;

      console.log(`  ${prop}: ${isMatch ? '✅' : '❌'} (${button2Value} vs ${refValue})`);
    });

    console.log('\n📐 SO SÁNH KÍCH THƯỚC THỰC TẾ:');
    const rect2 = button2.getBoundingClientRect();
    console.log(`  width: ${rect2.width === refRect.width ? '✅' : '❌'} (${rect2.width}px vs ${refRect.width}px)`);
    console.log(`  height: ${rect2.height === refRect.height ? '✅' : '❌'} (${rect2.height}px vs ${refRect.height}px)`);

    const widthDiff = Math.abs(rect2.width - refRect.width);
    const heightDiff = Math.abs(rect2.height - refRect.height);
    console.log(`  📊 Chênh lệch: width ${widthDiff.toFixed(1)}px, height ${heightDiff.toFixed(1)}px`);
  }
  
  return {
    button: button2,
    computedStyle: computedStyle,
    onclick: onclick,
    ruleChecks: ruleChecks
  };
}

function forceFixButton2() {
  console.log('🔧 === FORCE FIX BUTTON MỤC 2 ===\n');
  
  const button2 = document.querySelector('button.button-open[onclick*="switchToPartB()"]');
  
  if (!button2) {
    console.log('❌ Không tìm thấy button mục 2');
    return;
  }
  
  console.log('🎯 Áp dụng style chuẩn cho button mục 2...');
  
  // Áp dụng style trực tiếp với highest priority - PERFECT SPACING & ALIGNMENT
  const standardStyle = {
    // SIZE CRITICAL PROPERTIES
    width: '320px',
    minWidth: '320px',
    maxWidth: '320px',
    height: '40px',
    minHeight: '40px',
    maxHeight: '40px',

    // SPACING PROPERTIES - PERFECT SPACING
    padding: '0 16px',                 /* Remove vertical padding */
    margin: '15px 0 0 auto',           /* Consistent 15px spacing */

    // TYPOGRAPHY PROPERTIES
    fontSize: '16px',
    lineHeight: '40px',                /* Line-height = height for perfect centering */
    fontWeight: '600',

    // VISUAL PROPERTIES
    backgroundColor: '#0056b3',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',

    // LAYOUT PROPERTIES - VERTICAL CENTERING WITH LEFT-ALIGNED TEXT
    display: 'flex',                   /* Use flexbox for perfect centering */
    alignItems: 'center',              /* Vertical centering */
    justifyContent: 'flex-start',      /* Left-aligned text */
    textAlign: 'left',                 /* Left-aligned text */
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  };
  
  // Áp dụng từng style với !important
  Object.keys(standardStyle).forEach(prop => {
    button2.style.setProperty(prop, standardStyle[prop], 'important');
  });
  
  // Thêm hover effects
  button2.addEventListener('mouseenter', function() {
    this.style.setProperty('background-color', '#003d82', 'important');
    this.style.setProperty('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)', 'important');
    this.style.setProperty('transform', 'translateY(-1px)', 'important');
  });
  
  button2.addEventListener('mouseleave', function() {
    this.style.setProperty('background-color', '#0056b3', 'important');
    this.style.setProperty('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)', 'important');
    this.style.setProperty('transform', 'translateY(0)', 'important');
  });
  
  console.log('✅ Button mục 2 đã được force fix!');
  
  // Kiểm tra lại
  setTimeout(() => {
    console.log('\n🔍 Kiểm tra lại sau khi fix:');
    debugButton2();
  }, 500);
}

function compareAllButtons() {
  console.log('📊 === SO SÁNH KÍCH THƯỚC TẤT CẢ BUTTONS ===\n');

  const buttons = document.querySelectorAll('.button-open');
  const sizeProps = ['width', 'height', 'minWidth', 'padding', 'fontSize', 'lineHeight'];

  console.log(`Tìm thấy ${buttons.length} buttons:\n`);

  const buttonData = [];

  buttons.forEach((button, index) => {
    const style = window.getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    const text = button.textContent.trim().substring(0, 30);

    const data = {
      index: index + 1,
      text: text,
      computedWidth: style.width,
      computedHeight: style.height,
      actualWidth: rect.width,
      actualHeight: rect.height,
      minWidth: style.minWidth,
      padding: style.padding,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight
    };

    buttonData.push(data);

    console.log(`Button ${index + 1}: "${text}..."`);
    console.log(`  Computed: ${style.width} x ${style.height}`);
    console.log(`  Actual: ${rect.width.toFixed(1)}px x ${rect.height.toFixed(1)}px`);
    console.log(`  MinWidth: ${style.minWidth}`);
    console.log(`  Padding: ${style.padding}`);
    console.log(`  FontSize: ${style.fontSize}`);
    console.log('');
  });

  // Kiểm tra consistency về kích thước
  console.log('📏 SIZE CONSISTENCY CHECK:');

  // Check actual dimensions
  const widths = buttonData.map(btn => btn.actualWidth);
  const heights = buttonData.map(btn => btn.actualHeight);

  const minWidth = Math.min(...widths);
  const maxWidth = Math.max(...widths);
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);

  const widthDiff = maxWidth - minWidth;
  const heightDiff = maxHeight - minHeight;

  console.log(`Width range: ${minWidth.toFixed(1)}px - ${maxWidth.toFixed(1)}px (diff: ${widthDiff.toFixed(1)}px)`);
  console.log(`Height range: ${minHeight.toFixed(1)}px - ${maxHeight.toFixed(1)}px (diff: ${heightDiff.toFixed(1)}px)`);

  const isWidthConsistent = widthDiff < 2; // Stricter tolerance for fixed width
  const isHeightConsistent = heightDiff < 2; // Stricter tolerance for fixed height

  console.log(`Width consistency: ${isWidthConsistent ? '✅' : '❌'} (tolerance: 2px)`);
  console.log(`Height consistency: ${isHeightConsistent ? '✅' : '❌'} (tolerance: 2px)`);

  if (!isWidthConsistent || !isHeightConsistent) {
    console.log('\n⚠️ BUTTONS WITH DIFFERENT SIZES:');
    buttonData.forEach(btn => {
      const isWidthOff = Math.abs(btn.actualWidth - widths[0]) > 2;
      const isHeightOff = Math.abs(btn.actualHeight - heights[0]) > 2;

      if (isWidthOff || isHeightOff) {
        console.log(`  Button ${btn.index}: ${btn.actualWidth.toFixed(1)}x${btn.actualHeight.toFixed(1)}px - "${btn.text}..."`);
      }
    });
  }

  return buttonData;
}

function createButton2FixReport() {
  const result = debugButton2();
  
  // Tạo visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 400px;
    max-height: 600px;
    background: white;
    border: 2px solid #dc3545;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 12px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #dc3545;">Button 2 Debug Report</h3>
    <p><strong>Text:</strong> ${result ? result.button.textContent.trim().substring(0, 40) : 'Not found'}...</p>
    <p><strong>OnClick:</strong> ${result ? result.onclick.substring(0, 50) : 'N/A'}...</p>
    
    <h4 style="color: #007BFF; margin: 15px 0 5px 0;">Quick Actions:</h4>
    <button onclick="debugButton2()" style="
      background: #007BFF; 
      color: white; 
      border: none; 
      padding: 6px 10px; 
      border-radius: 4px; 
      cursor: pointer;
      margin: 3px;
      font-size: 11px;
    ">Debug Button 2</button>
    
    <button onclick="forceFixButton2()" style="
      background: #28a745; 
      color: white; 
      border: none; 
      padding: 6px 10px; 
      border-radius: 4px; 
      cursor: pointer;
      margin: 3px;
      font-size: 11px;
    ">Force Fix</button>
    
    <button onclick="compareAllButtons()" style="
      background: #ffc107; 
      color: black; 
      border: none; 
      padding: 6px 10px; 
      border-radius: 4px; 
      cursor: pointer;
      margin: 3px;
      font-size: 11px;
    ">Compare All</button>
    
    <button onclick="this.parentElement.remove()" style="
      background: #dc3545; 
      color: white; 
      border: none; 
      padding: 6px 10px; 
      border-radius: 4px; 
      cursor: pointer;
      margin: 3px;
      font-size: 11px;
    ">Close</button>
    
    <p style="margin-top: 15px; font-size: 11px; color: #666;">
      Check browser console for detailed debug information.
    </p>
  `;
  
  document.body.appendChild(reportDiv);
  
  return result;
}

function forceFixAllButtonSizes() {
  console.log('🔧 === FORCE FIX ALL BUTTON SIZES ===\n');

  const buttons = document.querySelectorAll('.button-open');

  console.log(`🎯 Fixing ${buttons.length} buttons...`);

  // Standard size properties - COMPACT RIGHT-ALIGNED WITH CENTERED TEXT
  const standardSizeStyle = {
    width: '320px',                    /* Fixed width for consistency */
    minWidth: '320px',
    maxWidth: '320px',
    height: '40px',                    /* Compact height */
    minHeight: '40px',
    maxHeight: '40px',
    padding: '8px 16px',               /* Compact padding */
    margin: '12px 0 0 auto',           /* Right alignment with margin-left: auto */
    fontSize: '16px',
    lineHeight: '1.3',                 /* Tighter line height */
    backgroundColor: '#0056b3',
    color: 'white',
    fontWeight: '600',
    borderRadius: '4px',               /* Smaller radius */
    border: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',                   /* Use flexbox for perfect alignment */
    alignItems: 'center',              /* Vertical centering */
    justifyContent: 'flex-start',      /* Left-aligned text */
    textAlign: 'left',                 /* Left-aligned text */
    textDecoration: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',                /* Prevent text overflow */
    whiteSpace: 'nowrap',              /* Keep text on single line */
    textOverflow: 'ellipsis'           /* Add ellipsis if text too long */
  };

  buttons.forEach((button, index) => {
    const text = button.textContent.trim().substring(0, 30);
    console.log(`🔧 Fixing Button ${index + 1}: "${text}..."`);

    // Apply standard size style with !important
    Object.keys(standardSizeStyle).forEach(prop => {
      button.style.setProperty(prop, standardSizeStyle[prop], 'important');
    });

    // Add consistent hover effects
    button.addEventListener('mouseenter', function() {
      this.style.setProperty('background-color', '#003d82', 'important');
      this.style.setProperty('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)', 'important');
      this.style.setProperty('transform', 'translateY(-1px)', 'important');
    });

    button.addEventListener('mouseleave', function() {
      this.style.setProperty('background-color', '#0056b3', 'important');
      this.style.setProperty('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.1)', 'important');
      this.style.setProperty('transform', 'translateY(0)', 'important');
    });
  });

  console.log('✅ All buttons fixed!');

  // Check results
  setTimeout(() => {
    console.log('\n🔍 Checking results after fix:');
    compareAllButtons();
  }, 500);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugButton2 = debugButton2;
  window.forceFixButton2 = forceFixButton2;
  window.compareAllButtons = compareAllButtons;
  window.createButton2FixReport = createButton2FixReport;
  window.forceFixAllButtonSizes = forceFixAllButtonSizes;
}
