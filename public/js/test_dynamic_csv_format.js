// Test script cho dynamic CSV format với Simulation.txt integration

function testDynamicCsvFormat() {
  console.log('🚀 === TESTING DYNAMIC CSV FORMAT ===\n');
  
  // 1. Prerequisites check
  console.log('📋 1. PREREQUISITES CHECK:');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const fileInputSimulation = document.getElementById("txt-file-simulation");
  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  const hasSimulationFile = fileInputSimulation && fileInputSimulation.files[0];
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  
  console.log(`✅ Damage.txt file: ${hasDamageFile ? 'Loaded' : 'Missing'}`);
  console.log(`✅ Simulation.txt file: ${hasSimulationFile ? 'Loaded' : 'Missing'}`);
  console.log(`✅ Section 1 results: ${hasSection1Results ? 'Available' : 'Missing'}`);
  
  if (!hasDamageFile || !hasSection1Results) {
    console.log('⚠️ Prerequisites missing - cannot test dynamic format');
    return;
  }
  
  // 2. Test dynamic feature count calculation
  console.log('\n📋 2. DYNAMIC FEATURE COUNT TEST:');
  
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  console.log(`📊 Mode used: ${modeUsed}`);
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    
    // Test dynamic feature count calculation
    const dynamicFeatureCount = getDynamicFeatureCount(damageContent, modeUsed);
    console.log(`📊 Dynamic feature count for mode ${modeUsed}: ${dynamicFeatureCount}`);
    
    // Compare with configured count
    const configuredCount = window.SHM_CONFIG?.features?.count || 256;
    console.log(`📊 Configured feature count: ${configuredCount}`);
    console.log(`📊 Using dynamic count: ${dynamicFeatureCount > 0 ? 'YES' : 'NO'}`);
    
    // 3. Test damaged elements
    console.log('\n📋 3. DAMAGED ELEMENTS TEST:');
    
    const damagedElements = getDamagedElementsList();
    console.log(`📊 Damaged elements: [${damagedElements.join(', ')}]`);
    console.log(`📊 DI columns needed: ${damagedElements.length}`);
    
    // 4. Test Simulation.txt parsing if available
    if (hasSimulationFile) {
      console.log('\n📋 4. SIMULATION.TXT PARSING TEST:');
      
      const simulationFile = fileInputSimulation.files[0];
      const simulationReader = new FileReader();
      
      simulationReader.onload = function(simEvent) {
        const simulationContent = simEvent.target.result;
        
        try {
          const simulationData = parseSimulationFile(simulationContent);
          const simulationElementCount = Object.keys(simulationData).length;
          
          console.log(`📊 Simulation.txt elements: ${simulationElementCount}`);
          
          // Check coverage of damaged elements
          let coveredElements = 0;
          damagedElements.forEach(elementID => {
            if (simulationData[elementID] !== undefined) {
              console.log(`✅ Element ${elementID}: DI = ${simulationData[elementID]}`);
              coveredElements++;
            } else {
              console.log(`⚠️ Element ${elementID}: Not found in Simulation.txt`);
            }
          });
          
          const coveragePercent = (coveredElements / damagedElements.length) * 100;
          console.log(`📊 Coverage: ${coveredElements}/${damagedElements.length} (${coveragePercent.toFixed(1)}%)`);
          
          // 5. Test dynamic CSV generation
          console.log('\n📋 5. DYNAMIC CSV GENERATION TEST:');
          
          createDynamicTestCsvContent().then(csvContent => {
            console.log('✅ Dynamic CSV generation successful');
            
            const lines = csvContent.split('\n');
            const header = lines[0];
            const dataRow = lines[1];
            
            console.log(`📊 CSV structure: ${lines.length} lines`);
            console.log(`📊 Header: ${header.substring(0, 80)}...`);
            
            // Analyze structure
            const columns = header.split(',');
            const featureColumns = columns.filter(col => col.startsWith('U'));
            const diColumns = columns.filter(col => col.startsWith('DI'));
            
            console.log(`📊 Total columns: ${columns.length}`);
            console.log(`📊 Feature columns: ${featureColumns.length} (U1-U${featureColumns.length})`);
            console.log(`📊 DI columns: ${diColumns.length} (DI1-DI${diColumns.length})`);
            
            // Verify dynamic structure
            const expectedFeatures = dynamicFeatureCount;
            const expectedDIs = damagedElements.length;
            
            console.log(`📊 Expected vs Actual:`);
            console.log(`   Features: ${expectedFeatures} vs ${featureColumns.length} ${expectedFeatures === featureColumns.length ? '✅' : '❌'}`);
            console.log(`   DI columns: ${expectedDIs} vs ${diColumns.length} ${expectedDIs === diColumns.length ? '✅' : '❌'}`);
            
            // Check data quality
            const dataValues = dataRow.split(',');
            const diValues = dataValues.slice(-diColumns.length).map(v => parseFloat(v));
            
            console.log(`📊 DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);
            
            const nonZeroDIs = diValues.filter(v => v > 0).length;
            console.log(`📊 Non-zero DIs: ${nonZeroDIs}/${diColumns.length}`);
            
            if (expectedFeatures === featureColumns.length && expectedDIs === diColumns.length) {
              console.log('🎉 Dynamic CSV format test PASSED!');
            } else {
              console.log('⚠️ Dynamic CSV format test has issues');
            }
            
          }).catch(error => {
            console.error('❌ Dynamic CSV generation failed:', error);
          });
          
        } catch (error) {
          console.error('❌ Simulation.txt parsing failed:', error);
        }
      };
      
      simulationReader.readAsText(simulationFile);
    } else {
      console.log('\n📋 4. SIMULATION.TXT NOT AVAILABLE:');
      console.log('⚠️ Testing enhanced CSV format instead');
      
      // Test enhanced format without Simulation.txt
      createTestCsvContent().then(csvContent => {
        console.log('✅ Enhanced CSV generation successful (fallback)');
        
        const lines = csvContent.split('\n');
        const header = lines[0];
        const columns = header.split(',');
        const featureColumns = columns.filter(col => col.startsWith('U'));
        const diColumns = columns.filter(col => col.startsWith('DI'));
        
        console.log(`📊 Fallback structure: ${featureColumns.length} features, ${diColumns.length} DI columns`);
        
      }).catch(error => {
        console.error('❌ Enhanced CSV generation failed:', error);
      });
    }
  };
  
  reader.readAsText(file);
}

function testMultiModeSupport() {
  console.log('🔄 === TESTING MULTI-MODE SUPPORT ===\n');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.log('⚠️ Damage.txt file required for multi-mode test');
    return;
  }
  
  const supportedModes = [10, 12, 14, 17, 20];
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const damageContent = event.target.result;
    
    console.log('📊 Testing feature counts for different modes:');
    
    supportedModes.forEach(mode => {
      try {
        const featureCount = getDynamicFeatureCount(damageContent, mode);
        const damageData = parseModeShapeFile(damageContent, mode);
        const nodeCount = Object.keys(damageData).length;
        
        console.log(`   Mode ${mode}: ${featureCount} features (${nodeCount} nodes) ${featureCount > 0 ? '✅' : '❌'}`);
        
        if (featureCount > 0) {
          const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
          console.log(`      Node range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
        }
        
      } catch (error) {
        console.log(`   Mode ${mode}: Error - ${error.message} ❌`);
      }
    });
    
    console.log('\n📊 Multi-mode support test completed');
  };
  
  reader.readAsText(file);
}

function createDynamicCsvFormatReport() {
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 600px;
    max-height: 700px;
    background: white;
    border: 2px solid #28a745;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  const damagedElements = getDamagedElementsList();
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #28a745; text-align: center;">
      🚀 Dynamic CSV Format Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Dynamic Features:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>Feature count based on actual Node_IDs in Damage.txt</li>
        <li>DI count based on damaged elements from Section 1</li>
        <li>DI values from Simulation.txt thickness data</li>
        <li>Multi-mode support (10, 12, 14, 17, 20)</li>
        <li>Fallback to strain energy DI values if Simulation.txt unavailable</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📊 Current Configuration:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 13px;">
        <li><strong>Mode:</strong> ${modeUsed}</li>
        <li><strong>Damaged Elements:</strong> [${damagedElements.join(', ')}]</li>
        <li><strong>Expected DI Columns:</strong> ${damagedElements.length}</li>
        <li><strong>Format:</strong> Case,U1,U2,...,UN,DI1,DI2,...,DI${damagedElements.length}</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testDynamicCsvFormat()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🚀 Test Dynamic Format</button>
      
      <button onclick="testMultiModeSupport()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔄 Test Multi-Mode</button>
      
      <button onclick="createDynamicTestCsvContent().then(csv => console.log('Dynamic CSV:', csv))" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">📁 Generate Dynamic CSV</button>
      
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
        💡 Check browser console for detailed test results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.testDynamicCsvFormat = testDynamicCsvFormat;
  window.testMultiModeSupport = testMultiModeSupport;
  window.createDynamicCsvFormatReport = createDynamicCsvFormatReport;
}
