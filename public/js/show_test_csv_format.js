// Script để hiển thị định dạng hiện tại của file TEST.csv

function showTestCsvFormat() {
  console.log('📊 === ĐỊNH DẠNG HIỆN TẠI CỦA FILE TEST.CSV ===\n');
  
  // 1. Kiểm tra prerequisites
  console.log('📋 1. KIỂM TRA PREREQUISITES:');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  
  if (!hasDamageFile || !hasSection1Results) {
    console.log('⚠️ Cần load Damage.txt và chạy Section 1 trước');
    return;
  }
  
  // 2. Lấy thông tin cấu hình
  const damagedElements = getDamagedElementsList();
  const numDamageIndices = getEffectiveDICount(damagedElements);
  const featureCount = window.SHM_CONFIG?.features?.count || 256;
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  
  console.log(`📊 Configuration:`);
  console.log(`   - Mode: ${modeUsed}`);
  console.log(`   - Features: ${featureCount} (U1-U${featureCount})`);
  console.log(`   - Damage Indices: ${numDamageIndices} (DI1-DI${numDamageIndices})`);
  console.log(`   - Damaged Elements: [${damagedElements.join(', ')}]`);
  
  // 3. Hiển thị cấu trúc header
  console.log('\n📋 2. CẤU TRÚC HEADER:');
  
  let headerStructure = "Case";
  for (let i = 1; i <= featureCount; i++) {
    headerStructure += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    headerStructure += ",DI" + i;
  }
  
  console.log(`📊 Header format:`);
  console.log(`   ${headerStructure.substring(0, 50)}...`);
  console.log(`📊 Total columns: ${1 + featureCount + numDamageIndices}`);
  console.log(`   - Case: 1 column`);
  console.log(`   - Features: ${featureCount} columns (U1-U${featureCount})`);
  console.log(`   - Damage Indices: ${numDamageIndices} columns (DI1-DI${numDamageIndices})`);
  
  // 4. Tạo sample data để hiển thị format
  console.log('\n📋 3. SAMPLE DATA FORMAT:');
  
  createTestCsvContent().then(csvContent => {
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`📊 Complete CSV structure:`);
    console.log(`   Lines: ${lines.length} (1 header + 1 data row + 1 empty)`);
    console.log(`   Header: ${header}`);
    console.log(`   Data: ${dataRow.substring(0, 100)}...`);
    
    // Phân tích data row
    const dataValues = dataRow.split(',');
    const caseValue = dataValues[0];
    const featureValues = dataValues.slice(1, featureCount + 1);
    const diValues = dataValues.slice(featureCount + 1, featureCount + 1 + numDamageIndices);
    
    console.log(`\n📊 Data row analysis:`);
    console.log(`   Case: ${caseValue}`);
    console.log(`   Features (first 5): [${featureValues.slice(0, 5).join(', ')}]`);
    console.log(`   Features (last 5): [${featureValues.slice(-5).join(', ')}]`);
    console.log(`   DI values: [${diValues.join(', ')}]`);
    
    // Thống kê feature values
    const featureStats = analyzeFeatureValues(featureValues);
    console.log(`\n📊 Feature statistics:`);
    console.log(`   Min: ${featureStats.min}`);
    console.log(`   Max: ${featureStats.max}`);
    console.log(`   Average: ${featureStats.avg.toFixed(6)}`);
    console.log(`   Non-zero count: ${featureStats.nonZero}/${featureValues.length}`);
    
    // Thống kê DI values
    const diStats = analyzeDIValues(diValues, damagedElements);
    console.log(`\n📊 Damage Index statistics:`);
    diStats.forEach((stat, index) => {
      console.log(`   DI${index + 1} (Element ${stat.elementID}): ${stat.value} (${stat.status})`);
    });
    
    // Hiển thị example format
    console.log(`\n📋 4. EXAMPLE CSV FORMAT:`);
    console.log(`\n${header}`);
    console.log(`${dataRow}`);
    
  }).catch(error => {
    console.error('❌ Error generating sample CSV:', error);
  });
}

function analyzeFeatureValues(featureValues) {
  const numericValues = featureValues.map(v => parseFloat(v));
  const nonZeroValues = numericValues.filter(v => v > 0.001);
  
  return {
    min: Math.min(...numericValues).toFixed(6),
    max: Math.max(...numericValues).toFixed(6),
    avg: numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length,
    nonZero: nonZeroValues.length
  };
}

function analyzeDIValues(diValues, damagedElements) {
  return diValues.map((value, index) => {
    const numericValue = parseFloat(value);
    let status = 'undamaged';
    
    if (numericValue >= 0.1) {
      status = 'damaged (above threshold)';
    } else if (numericValue > 0) {
      status = 'below threshold';
    }
    
    return {
      elementID: damagedElements[index] || 'N/A',
      value: value,
      status: status
    };
  });
}

function demonstrateTestCsvGeneration() {
  console.log('🧪 === DEMO: TẠO TEST.CSV TỪNG BƯỚC ===\n');
  
  // Kiểm tra prerequisites
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  
  if (!hasDamageFile || !hasSection1Results) {
    console.log('⚠️ Cần load Damage.txt và chạy Section 1 trước');
    return;
  }
  
  console.log('📋 Step 1: Lấy thông tin từ Section 1');
  const damagedElements = getDamagedElementsList();
  const numDamageIndices = getEffectiveDICount(damagedElements);
  const modeUsed = window.strainEnergyResults.modeUsed;
  const z = window.strainEnergyResults.z;
  const Z0 = window.strainEnergyResults.Z0;
  const maxZ = window.strainEnergyResults.maxZ;
  
  console.log(`   ✅ Mode: ${modeUsed}`);
  console.log(`   ✅ Damaged elements: [${damagedElements.join(', ')}]`);
  console.log(`   ✅ Damage range: Z0=${Z0.toFixed(3)}, maxZ=${maxZ.toFixed(3)}`);
  
  console.log('\n📋 Step 2: Đọc và parse Damage.txt');
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    const damageData = parseModeShapeFile(damageContent, modeUsed);
    const nodeCount = Object.keys(damageData).length;
    
    console.log(`   ✅ Parsed ${nodeCount} nodes for mode ${modeUsed}`);
    
    if (nodeCount > 0) {
      const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
      console.log(`   ✅ Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
      
      // Sample mode shape values
      const sampleNodes = nodeIDs.slice(0, 5);
      console.log(`   📊 Sample mode shape values:`);
      sampleNodes.forEach(nodeID => {
        const value = damageData[nodeID];
        console.log(`      Node ${nodeID}: ${value.toExponential(3)}`);
      });
      
      console.log('\n📋 Step 3: Tạo CSV content');
      const csvContent = generateTestCsvFromDamageData(damageData, damagedElements, numDamageIndices, modeUsed);
      
      console.log('\n📋 Step 4: Kết quả cuối cùng');
      const lines = csvContent.split('\n');
      console.log(`   ✅ CSV generated: ${lines.length} lines`);
      console.log(`   📊 Header: ${lines[0].substring(0, 80)}...`);
      console.log(`   📊 Data: ${lines[1].substring(0, 80)}...`);
      
      // Hiển thị full format
      console.log('\n📋 5. FULL CSV FORMAT:');
      console.log('─'.repeat(100));
      console.log(csvContent);
      console.log('─'.repeat(100));
    }
  };
  
  reader.readAsText(file);
}

function createTestCsvFormatReport() {
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
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
  
  const damagedElements = getDamagedElementsList();
  const numDamageIndices = getEffectiveDICount(damagedElements);
  const featureCount = window.SHM_CONFIG?.features?.count || 256;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #17a2b8; text-align: center;">
      📊 Định dạng TEST.csv hiện tại
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Cấu trúc CSV:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px;">
        <li><strong>Header:</strong> Case,U1,U2,...,U${featureCount},DI1,DI2,...,DI${numDamageIndices}</li>
        <li><strong>Total columns:</strong> ${1 + featureCount + numDamageIndices} (1 Case + ${featureCount} Features + ${numDamageIndices} DI)</li>
        <li><strong>Data rows:</strong> 1 test case (Case=0)</li>
        <li><strong>Data source:</strong> Damage.txt mode shape + Section 1 damage calculations</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">🎯 Data Content:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px;">
        <li><strong>Features (U1-U${featureCount}):</strong> Mode shape values với hybrid scaling</li>
        <li><strong>DI values:</strong> Normalized damage indices (0-1 range)</li>
        <li><strong>Damaged elements:</strong> [${damagedElements.join(', ')}]</li>
        <li><strong>Scaling:</strong> Threshold-based cho damaged vs undamaged</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Actions:</h4>
      
      <button onclick="showTestCsvFormat()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">📊 Show Format</button>
      
      <button onclick="demonstrateTestCsvGeneration()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🧪 Demo Generation</button>
      
      <button onclick="processFileTest()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">📁 Generate & Download</button>
      
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
        💡 Check browser console for detailed format information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.showTestCsvFormat = showTestCsvFormat;
  window.demonstrateTestCsvGeneration = demonstrateTestCsvGeneration;
  window.createTestCsvFormatReport = createTestCsvFormatReport;
}
