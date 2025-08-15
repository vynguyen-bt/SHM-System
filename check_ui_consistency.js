// Script để kiểm tra tính nhất quán UI trên website SHM-BIM-FEM
// Chạy script này trong browser console

function checkUIConsistency() {
  console.log('🎨 === KIỂM TRA TÍNH NHẤT QUÁN GIAO DIỆN ===\n');
  
  const report = {
    fontSizes: {},
    colors: {},
    buttonSizes: {},
    inconsistencies: []
  };

  // 1. KIỂM TRA FONT SIZES
  console.log('📝 1. KIỂM TRA KÍCH THƯỚC FONT:');
  
  // H1 titles
  const h1Elements = document.querySelectorAll('h1');
  console.log(`\n🔤 H1 TITLES (${h1Elements.length} elements):`);
  h1Elements.forEach((h1, index) => {
    const computedStyle = window.getComputedStyle(h1);
    const fontSize = computedStyle.fontSize;
    const color = computedStyle.color;
    const fontWeight = computedStyle.fontWeight;
    
    console.log(`  H1 ${index + 1}: "${h1.textContent.trim()}"`);
    console.log(`    Font-size: ${fontSize}`);
    console.log(`    Color: ${color}`);
    console.log(`    Font-weight: ${fontWeight}`);
    
    // Track for consistency
    if (!report.fontSizes.h1) report.fontSizes.h1 = [];
    report.fontSizes.h1.push({
      element: h1.textContent.trim(),
      fontSize: fontSize,
      color: color,
      fontWeight: fontWeight
    });
  });

  // H2 titles
  const h2Elements = document.querySelectorAll('h2');
  if (h2Elements.length > 0) {
    console.log(`\n🔤 H2 TITLES (${h2Elements.length} elements):`);
    h2Elements.forEach((h2, index) => {
      const computedStyle = window.getComputedStyle(h2);
      const fontSize = computedStyle.fontSize;
      const color = computedStyle.color;
      
      console.log(`  H2 ${index + 1}: "${h2.textContent.trim()}"`);
      console.log(`    Font-size: ${fontSize}`);
      console.log(`    Color: ${color}`);
      
      if (!report.fontSizes.h2) report.fontSizes.h2 = [];
      report.fontSizes.h2.push({
        element: h2.textContent.trim(),
        fontSize: fontSize,
        color: color
      });
    });
  }

  // 2. KIỂM TRA BUTTONS
  console.log('\n🔘 2. KIỂM TRA BUTTONS:');
  
  const buttons = document.querySelectorAll('button');
  console.log(`\n🔘 BUTTONS (${buttons.length} elements):`);
  
  buttons.forEach((button, index) => {
    const computedStyle = window.getComputedStyle(button);
    const fontSize = computedStyle.fontSize;
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    const padding = computedStyle.padding;
    const borderRadius = computedStyle.borderRadius;
    const width = computedStyle.width;
    const height = computedStyle.height;
    
    console.log(`  Button ${index + 1}: "${button.textContent.trim()}"`);
    console.log(`    Font-size: ${fontSize}`);
    console.log(`    Background: ${backgroundColor}`);
    console.log(`    Color: ${color}`);
    console.log(`    Padding: ${padding}`);
    console.log(`    Border-radius: ${borderRadius}`);
    console.log(`    Size: ${width} x ${height}`);
    console.log(`    Classes: ${button.className}`);
    
    if (!report.buttonSizes.all) report.buttonSizes.all = [];
    report.buttonSizes.all.push({
      text: button.textContent.trim(),
      fontSize: fontSize,
      backgroundColor: backgroundColor,
      color: color,
      padding: padding,
      borderRadius: borderRadius,
      width: width,
      height: height,
      classes: button.className
    });
  });

  // 3. PHÂN TÍCH TÍNH NHẤT QUÁN
  console.log('\n📊 3. PHÂN TÍCH TÍNH NHẤT QUÁN:');
  
  // Check H1 consistency
  if (report.fontSizes.h1 && report.fontSizes.h1.length > 1) {
    const h1FontSizes = [...new Set(report.fontSizes.h1.map(h => h.fontSize))];
    const h1Colors = [...new Set(report.fontSizes.h1.map(h => h.color))];
    const h1Weights = [...new Set(report.fontSizes.h1.map(h => h.fontWeight))];
    
    console.log('\n🔤 H1 CONSISTENCY:');
    console.log(`  Font sizes: ${h1FontSizes.length === 1 ? '✅ Nhất quán' : '❌ Không nhất quán'} (${h1FontSizes.join(', ')})`);
    console.log(`  Colors: ${h1Colors.length === 1 ? '✅ Nhất quán' : '❌ Không nhất quán'} (${h1Colors.join(', ')})`);
    console.log(`  Font weights: ${h1Weights.length === 1 ? '✅ Nhất quán' : '❌ Không nhất quán'} (${h1Weights.join(', ')})`);
    
    if (h1FontSizes.length > 1) {
      report.inconsistencies.push('H1 font sizes không nhất quán');
    }
    if (h1Colors.length > 1) {
      report.inconsistencies.push('H1 colors không nhất quán');
    }
  }

  // Check button consistency
  if (report.buttonSizes.all && report.buttonSizes.all.length > 1) {
    const buttonFontSizes = [...new Set(report.buttonSizes.all.map(b => b.fontSize))];
    const buttonBackgrounds = [...new Set(report.buttonSizes.all.map(b => b.backgroundColor))];
    const buttonColors = [...new Set(report.buttonSizes.all.map(b => b.color))];
    const buttonBorderRadius = [...new Set(report.buttonSizes.all.map(b => b.borderRadius))];
    
    console.log('\n🔘 BUTTON CONSISTENCY:');
    console.log(`  Font sizes: ${buttonFontSizes.length <= 2 ? '✅ Chấp nhận được' : '❌ Quá nhiều biến thể'} (${buttonFontSizes.join(', ')})`);
    console.log(`  Background colors: ${buttonBackgrounds.length <= 3 ? '✅ Chấp nhận được' : '❌ Quá nhiều biến thể'} (${buttonBackgrounds.length} variants)`);
    console.log(`  Text colors: ${buttonColors.length <= 2 ? '✅ Chấp nhận được' : '❌ Quá nhiều biến thể'} (${buttonColors.join(', ')})`);
    console.log(`  Border radius: ${buttonBorderRadius.length <= 2 ? '✅ Chấp nhận được' : '❌ Quá nhiều biến thể'} (${buttonBorderRadius.join(', ')})`);
  }

  // 4. TÓM TẮT VÀ KHUYẾN NGHỊ
  console.log('\n📋 4. TÓM TẮT:');
  console.log(`  Tổng số H1: ${h1Elements.length}`);
  console.log(`  Tổng số H2: ${h2Elements.length}`);
  console.log(`  Tổng số buttons: ${buttons.length}`);
  console.log(`  Số vấn đề phát hiện: ${report.inconsistencies.length}`);
  
  if (report.inconsistencies.length > 0) {
    console.log('\n❌ CÁC VẤN ĐỀ CẦN SỬA:');
    report.inconsistencies.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ GIAO DIỆN NHẤT QUÁN!');
  }

  return report;
}

// Hàm kiểm tra responsive design
function checkResponsiveDesign() {
  console.log('\n📱 === KIỂM TRA RESPONSIVE DESIGN ===');
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
  
  // Check if elements are properly sized
  const containers = document.querySelectorAll('.container');
  containers.forEach((container, index) => {
    const rect = container.getBoundingClientRect();
    console.log(`Container ${index + 1}: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`);
    
    if (rect.width > viewportWidth) {
      console.log(`  ⚠️ Container vượt quá viewport width`);
    }
  });
}

// Hàm tạo báo cáo visual
function generateVisualReport() {
  const report = checkUIConsistency();
  checkResponsiveDesign();
  
  // Create visual summary
  const summary = document.createElement('div');
  summary.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  summary.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #007BFF;">UI Consistency Report</h3>
    <p><strong>H1 Elements:</strong> ${document.querySelectorAll('h1').length}</p>
    <p><strong>Buttons:</strong> ${document.querySelectorAll('button').length}</p>
    <p><strong>Issues:</strong> ${report.inconsistencies.length}</p>
    <button onclick="this.parentElement.remove()" style="
      background: #dc3545; 
      color: white; 
      border: none; 
      padding: 5px 10px; 
      border-radius: 4px; 
      cursor: pointer;
      margin-top: 10px;
    ">Close</button>
  `;
  
  document.body.appendChild(summary);
  
  return report;
}

// Export functions for console use
if (typeof window !== 'undefined') {
  window.checkUIConsistency = checkUIConsistency;
  window.checkResponsiveDesign = checkResponsiveDesign;
  window.generateVisualReport = generateVisualReport;
}
