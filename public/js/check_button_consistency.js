// Script kiểm tra tính nhất quán của button trên website SHM-BIM-FEM

function checkButtonConsistency() {
  console.log('🔘 === KIỂM TRA TÍNH NHẤT QUÁN BUTTON ===\n');

  // Lấy tất cả button có class "button-open"
  const buttons = document.querySelectorAll('.button-open');

  console.log(`📊 Tìm thấy ${buttons.length} button với class "button-open":\n`);

  // Kiểm tra CSS rules áp dụng cho từng button
  console.log('🔍 === CSS RULES ANALYSIS ===\n');
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    const onclick = button.getAttribute('onclick');

    console.log(`🔘 Button ${index + 1}: "${text.substring(0, 30)}..."`);
    console.log(`   OnClick: ${onclick}`);

    // Kiểm tra các CSS rules có thể áp dụng
    const hasProcessDataX = onclick && onclick.includes('processDataX');
    const hasProcessFilestrain = onclick && onclick.includes('processFilestrain');
    const hasProcessFileTest = onclick && onclick.includes('processFileTest');

    console.log(`   🎯 CSS Rule Matches:`);
    console.log(`      .button-open: ✅ (always applies)`);
    console.log(`      processDataX: ${hasProcessDataX ? '⚠️ MATCH' : '❌'}`);
    console.log(`      processFilestrain: ${hasProcessFilestrain ? '⚠️ MATCH' : '❌'}`);
    console.log(`      processFileTest: ${hasProcessFileTest ? '⚠️ MATCH' : '❌'}`);
    console.log('');
  });
  
  const buttonData = [];
  
  buttons.forEach((button, index) => {
    const computedStyle = window.getComputedStyle(button);
    const text = button.textContent.trim();
    const onclick = button.getAttribute('onclick');
    
    const data = {
      index: index,
      text: text,
      onclick: onclick,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      padding: computedStyle.padding,
      borderRadius: computedStyle.borderRadius,
      width: computedStyle.width,
      height: computedStyle.height,
      boxShadow: computedStyle.boxShadow,
      border: computedStyle.border
    };
    
    buttonData.push(data);
    
    console.log(`🔘 Button ${index + 1}: "${text}"`);
    console.log(`   Background: ${data.backgroundColor}`);
    console.log(`   Color: ${data.color}`);
    console.log(`   Font-size: ${data.fontSize}`);
    console.log(`   Font-weight: ${data.fontWeight}`);
    console.log(`   Padding: ${data.padding}`);
    console.log(`   Border-radius: ${data.borderRadius}`);
    console.log(`   Size: ${data.width} x ${data.height}`);
    console.log(`   Box-shadow: ${data.boxShadow}`);
    console.log(`   OnClick: ${onclick}`);
    console.log('');
  });
  
  // Phân tích tính nhất quán
  console.log('📊 === PHÂN TÍCH TÍNH NHẤT QUÁN ===\n');
  
  const properties = ['backgroundColor', 'color', 'fontSize', 'fontWeight', 'padding', 'borderRadius'];
  const inconsistencies = [];
  
  properties.forEach(prop => {
    const values = [...new Set(buttonData.map(btn => btn[prop]))];
    const isConsistent = values.length === 1;
    
    console.log(`${prop}: ${isConsistent ? '✅ Nhất quán' : '❌ Không nhất quán'}`);
    if (!isConsistent) {
      console.log(`   Các giá trị khác nhau: ${values.join(' | ')}`);
      inconsistencies.push({
        property: prop,
        values: values,
        buttons: buttonData.map((btn, idx) => ({ index: idx + 1, text: btn.text.substring(0, 20), value: btn[prop] }))
      });
    }
    console.log('');
  });
  
  // Báo cáo chi tiết về inconsistencies
  if (inconsistencies.length > 0) {
    console.log('❌ === CHI TIẾT CÁC VẤN ĐỀ ===\n');
    inconsistencies.forEach(issue => {
      console.log(`🔍 ${issue.property}:`);
      issue.buttons.forEach(btn => {
        console.log(`   Button ${btn.index} (${btn.text}...): ${btn.value}`);
      });
      console.log('');
    });
  }
  
  return { buttonData, inconsistencies };
}

function fixButtonConsistency() {
  console.log('🔧 === SỬA CHỮA TÍNH NHẤT QUÁN BUTTON ===\n');
  
  const buttons = document.querySelectorAll('.button-open');
  
  // Định nghĩa style chuẩn (theo CSS variables)
  const standardStyle = {
    backgroundColor: 'var(--primary-blue-dark)',
    color: 'white',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    borderRadius: 'var(--border-radius-md)',
    border: 'none',
    boxShadow: 'var(--shadow-sm)',
    minWidth: '280px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };
  
  console.log('🎯 Áp dụng style chuẩn cho tất cả button...\n');
  
  buttons.forEach((button, index) => {
    const text = button.textContent.trim();
    console.log(`🔧 Fixing Button ${index + 1}: "${text}"`);
    
    // Áp dụng style chuẩn
    Object.keys(standardStyle).forEach(prop => {
      button.style[prop] = standardStyle[prop];
    });
    
    // Thêm hover effect
    button.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#003d82';
      this.style.boxShadow = 'var(--shadow-md)';
      this.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.backgroundColor = 'var(--primary-blue-dark)';
      this.style.boxShadow = 'var(--shadow-sm)';
      this.style.transform = 'translateY(0)';
    });
  });
  
  console.log('✅ Hoàn thành! Tất cả button đã được chuẩn hóa.\n');
  
  // Kiểm tra lại
  setTimeout(() => {
    console.log('🔍 Kiểm tra lại sau khi sửa chữa:');
    checkButtonConsistency();
  }, 500);
}

function generateButtonReport() {
  const result = checkButtonConsistency();
  
  // Tạo visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 500px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const inconsistentCount = result.inconsistencies.length;
  const statusColor = inconsistentCount === 0 ? '#28a745' : '#dc3545';
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #007BFF;">Button Consistency Report</h3>
    <p><strong>Total Buttons:</strong> ${result.buttonData.length}</p>
    <p><strong>Inconsistencies:</strong> <span style="color: ${statusColor}; font-weight: bold;">${inconsistentCount}</span></p>
    
    ${inconsistentCount > 0 ? `
      <h4 style="color: #dc3545; margin: 15px 0 5px 0;">Issues Found:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
        ${result.inconsistencies.map(issue => `<li>${issue.property}: ${issue.values.length} different values</li>`).join('')}
      </ul>
      <button onclick="fixButtonConsistency()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 8px 12px; 
        border-radius: 4px; 
        cursor: pointer;
        margin: 10px 5px 5px 0;
        font-size: 12px;
      ">Fix All Buttons</button>
    ` : `
      <p style="color: #28a745; font-weight: bold;">✅ All buttons are consistent!</p>
    `}
    
    <button onclick="this.parentElement.remove()" style="
      background: #dc3545; 
      color: white; 
      border: none; 
      padding: 8px 12px; 
      border-radius: 4px; 
      cursor: pointer;
      margin: 5px 0;
      font-size: 12px;
    ">Close Report</button>
  `;
  
  document.body.appendChild(reportDiv);
  
  return result;
}

// Export functions for console use
if (typeof window !== 'undefined') {
  window.checkButtonConsistency = checkButtonConsistency;
  window.fixButtonConsistency = fixButtonConsistency;
  window.generateButtonReport = generateButtonReport;
}
