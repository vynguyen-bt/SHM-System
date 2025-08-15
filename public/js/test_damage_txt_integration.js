// Test script để verify Damage.txt integration trong Mục 2

function testDamageTxtIntegration() {
  console.log('🧪 === TESTING DAMAGE.TXT INTEGRATION IN SECTION 2 ===\n');
  
  // 1. Check prerequisites
  console.log('📋 1. PREREQUISITES CHECK:');
  
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  console.log(`✅ Damage.txt file: ${hasDamageFile ? 'Loaded' : 'Missing'}`);
  
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  console.log(`✅ Section 1 results: ${hasSection1Results ? 'Available' : 'Missing'}`);
  
  const hasMeshData = window.meshData && window.meshData.elements;
  console.log(`✅ Mesh data: ${hasMeshData ? 'Available' : 'Missing'}`);
  
  if (!hasDamageFile) {
    console.log('⚠️ Please load Damage.txt file first');
    return;
  }
  
  if (!hasSection1Results) {
    console.log('⚠️ Please run Section 1 first to get damaged elements');
    return;
  }
  
  // 2. Test damaged elements extraction
  console.log('\n📋 2. DAMAGED ELEMENTS EXTRACTION:');
  const damagedElements = getDamagedElementsList();
  console.log(`📊 Damaged elements: [${damagedElements.join(', ')}]`);
  console.log(`📊 Count: ${damagedElements.length}`);
  
  const numDamageIndices = getEffectiveDICount(damagedElements);
  console.log(`📊 Effective DI count: ${numDamageIndices}`);
  
  // 3. Test mode extraction from Section 1
  console.log('\n📋 3. MODE EXTRACTION FROM SECTION 1:');
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  console.log(`📊 Mode used in Section 1: ${modeUsed}`);
  
  // 4. Test Damage.txt parsing
  console.log('\n📋 4. DAMAGE.TXT PARSING TEST:');
  
  const file = fileInputDamaged.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    try {
      const damageContent = event.target.result;
      console.log(`📊 File size: ${damageContent.length} characters`);
      
      // Parse for specific mode
      const damageData = parseModeShapeFile(damageContent, modeUsed);
      const nodeCount = Object.keys(damageData).length;
      console.log(`📊 Nodes found for mode ${modeUsed}: ${nodeCount}`);
      
      if (nodeCount > 0) {
        const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
        console.log(`📊 Node ID range: ${nodeIDs[0]} - ${nodeIDs[nodeIDs.length - 1]}`);
        
        // Sample values
        const sampleNodes = nodeIDs.slice(0, 5);
        console.log('📊 Sample values:');
        sampleNodes.forEach(nodeID => {
          const value = damageData[nodeID];
          console.log(`   Node ${nodeID}: ${value.toExponential(3)}`);
        });
        
        // 5. Test CSV conversion
        console.log('\n📋 5. CSV CONVERSION TEST:');
        testCsvConversion(damageContent, damagedElements, numDamageIndices);
        
      } else {
        console.log(`❌ No data found for mode ${modeUsed} in Damage.txt`);
        console.log('🔍 Available modes in file:');
        
        // Check what modes are available
        const lines = damageContent.trim().split('\n');
        const availableModes = new Set();
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const mode = parseInt(parts[1]);
            if (!isNaN(mode)) {
              availableModes.add(mode);
            }
          }
        }
        
        console.log(`   Available modes: [${Array.from(availableModes).sort((a, b) => a - b).join(', ')}]`);
      }
      
    } catch (error) {
      console.error('❌ Error parsing Damage.txt:', error);
    }
  };
  
  reader.readAsText(file);
}

function testCsvConversion(damageContent, damagedElements, numDamageIndices) {
  console.log('🔄 Testing CSV conversion...');
  
  try {
    const csvContent = convertDamageFileToTestCsv(damageContent, damagedElements, numDamageIndices);
    
    const lines = csvContent.trim().split('\n');
    const header = lines[0];
    const dataRow = lines[1];
    
    console.log(`✅ CSV generated successfully`);
    console.log(`📊 Lines: ${lines.length} (1 header + 1 data row)`);
    console.log(`📊 Header: ${header.substring(0, 50)}...`);
    
    // Analyze header
    const columns = header.split(',');
    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));
    
    console.log(`📊 Total columns: ${columns.length}`);
    console.log(`📊 Feature columns: ${featureColumns.length} (${featureColumns[0]} - ${featureColumns[featureColumns.length - 1]})`);
    console.log(`📊 DI columns: ${diColumns.length} (${diColumns.join(', ')})`);
    
    // Analyze data row
    const dataValues = dataRow.split(',');
    console.log(`📊 Data values: ${dataValues.length}`);
    console.log(`📊 Case: ${dataValues[0]}`);
    console.log(`📊 First 5 features: [${dataValues.slice(1, 6).join(', ')}]`);
    console.log(`📊 DI values: [${dataValues.slice(-numDamageIndices).join(', ')}]`);
    
    // Validate data quality
    let validFeatures = 0;
    let validDIs = 0;
    
    for (let i = 1; i <= featureColumns.length; i++) {
      const value = parseFloat(dataValues[i]);
      if (!isNaN(value) && value > 0) {
        validFeatures++;
      }
    }
    
    for (let i = 0; i < numDamageIndices; i++) {
      const value = parseFloat(dataValues[dataValues.length - numDamageIndices + i]);
      if (!isNaN(value) && value >= 0) {
        validDIs++;
      }
    }
    
    console.log(`📊 Valid features: ${validFeatures}/${featureColumns.length}`);
    console.log(`📊 Valid DIs: ${validDIs}/${numDamageIndices}`);
    
    const qualityScore = ((validFeatures / featureColumns.length) + (validDIs / numDamageIndices)) / 2 * 100;
    console.log(`📊 Data quality score: ${qualityScore.toFixed(1)}%`);
    
    if (qualityScore > 90) {
      console.log('✅ CSV conversion successful with high quality data');
    } else if (qualityScore > 70) {
      console.log('⚠️ CSV conversion successful with moderate quality data');
    } else {
      console.log('❌ CSV conversion has quality issues');
    }
    
  } catch (error) {
    console.error('❌ CSV conversion failed:', error);
  }
}

function testSection2Integration() {
  console.log('🧪 === TESTING COMPLETE SECTION 2 INTEGRATION ===\n');
  
  // Test the complete workflow
  console.log('📋 Testing complete Section 2 workflow...');
  
  // 1. Test prerequisites
  testDamageTxtIntegration();
  
  // 2. Test async CSV generation
  setTimeout(async () => {
    console.log('\n📋 6. ASYNC CSV GENERATION TEST:');
    
    try {
      console.log('🔄 Testing createTestCsvContent() async function...');
      const testCsvContent = await createTestCsvContent();
      
      if (typeof testCsvContent === 'string') {
        console.log('✅ Async CSV generation successful');
        console.log(`📊 CSV length: ${testCsvContent.length} characters`);
        
        const lines = testCsvContent.trim().split('\n');
        console.log(`📊 CSV lines: ${lines.length}`);
        console.log(`📊 Header: ${lines[0].substring(0, 50)}...`);
        
      } else {
        console.log('❌ Async CSV generation returned non-string result');
      }
      
    } catch (error) {
      console.error('❌ Async CSV generation failed:', error);
    }
    
    // 3. Test complete prediction workflow
    setTimeout(() => {
      console.log('\n📋 7. COMPLETE PREDICTION WORKFLOW TEST:');
      console.log('🔄 Testing trainAndPredict() with Damage.txt integration...');
      
      // This will test the complete workflow
      trainAndPredict().then(() => {
        console.log('✅ Complete Section 2 integration test completed');
      }).catch(error => {
        console.error('❌ Complete integration test failed:', error);
      });
      
    }, 2000);
    
  }, 3000);
}

function createDamageTxtIntegrationReport() {
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
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #28a745; text-align: center;">
      🔧 Section 2 Damage.txt Integration Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Updated Features:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #155724; font-size: 13px;">
        <li>✅ Complete TEST.txt replacement with Damage.txt as primary data source</li>
        <li>✅ Enhanced CSV generation with proper scaling and normalization</li>
        <li>✅ Real damage indices with intelligent threshold-based scaling</li>
        <li>✅ Synthetic feature correlation with damage patterns in fallback mode</li>
        <li>✅ Automatic mode detection from Section 1 results</li>
        <li>✅ Comprehensive error handling and user feedback</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testDamageTxtIntegration()" style="
        background: #28a745; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🧪 Test Integration</button>
      
      <button onclick="testSection2Integration()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔄 Full Workflow Test</button>
      
      <button onclick="testEnhancedDamageTxtIntegration()" style="
        background: #28a745;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🚀 Test Enhanced</button>

      <button onclick="testTESTtxtMigration()" style="
        background: #ffc107;
        color: black;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🔄 Test Migration</button>

      <button onclick="trainAndPredict()" style="
        background: #17a2b8;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🚀 Run Section 2</button>
      
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
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Prerequisites:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        <li>✅ Load SElement.txt (mesh data)</li>
        <li>✅ Load Healthy.txt and Damage.txt (mode shape files)</li>
        <li>✅ Run Section 1 to get damaged elements</li>
        <li>✅ Open Section 2 and click "Dự đoán mức độ hư hỏng"</li>
      </ul>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Check browser console for detailed test results and debug information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// ✅ NEW FUNCTION: Test complete TEST.txt to Damage.txt migration
function testTESTtxtMigration() {
  console.log('🔄 === TESTING TEST.TXT TO DAMAGE.TXT MIGRATION ===\n');

  // 1. Verify TEST.txt dependencies removed
  console.log('📋 1. DEPENDENCY REMOVAL CHECK:');

  const fileInputTest = document.getElementById("fileInputTest");
  console.log(`❌ fileInputTest element: ${fileInputTest ? 'Still exists (should be removed)' : 'Removed ✅'}`);

  const fileInputDamaged = document.getElementById("txt-file-damaged");
  console.log(`✅ txt-file-damaged element: ${fileInputDamaged ? 'Available' : 'Missing'}`);

  // 2. Test processFileTest function update
  console.log('\n📋 2. PROCESSFILETEST FUNCTION CHECK:');

  if (typeof processFileTest === 'function') {
    console.log('✅ processFileTest function exists');

    // Check if it uses Damage.txt
    const functionString = processFileTest.toString();
    const usesDamageFile = functionString.includes('txt-file-damaged');
    const usesTestFile = functionString.includes('fileInputTest');

    console.log(`✅ Uses Damage.txt: ${usesDamageFile ? 'Yes' : 'No'}`);
    console.log(`❌ Uses TEST.txt: ${usesTestFile ? 'Yes (should be No)' : 'No ✅'}`);

    if (usesDamageFile && !usesTestFile) {
      console.log('✅ processFileTest successfully migrated to Damage.txt');
    } else {
      console.log('⚠️ processFileTest migration incomplete');
    }
  } else {
    console.log('❌ processFileTest function not found');
  }

  // 3. Test button onclick update
  console.log('\n📋 3. BUTTON ONCLICK CHECK:');

  const section2Button = document.querySelector('button[onclick*="switchToPartB"]');
  if (section2Button) {
    const onclick = section2Button.getAttribute('onclick');
    console.log(`📊 Button onclick: ${onclick}`);

    const hasProcessFileTest = onclick.includes('processFileTest');
    console.log(`❌ Calls processFileTest: ${hasProcessFileTest ? 'Yes (should be removed)' : 'No ✅'}`);

    if (!hasProcessFileTest) {
      console.log('✅ Button onclick successfully updated');
    } else {
      console.log('⚠️ Button onclick still calls processFileTest');
    }
  } else {
    console.log('❌ Section 2 button not found');
  }

  // 4. Test file handling update
  console.log('\n📋 4. FILE HANDLING CHECK:');

  // Check if fileHandling.js still references TEST.txt
  console.log('ℹ️ Check fileHandling.js manually - should not load TEST.txt anymore');

  // 5. Test integration with existing workflow
  console.log('\n📋 5. INTEGRATION TEST:');

  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;

  console.log(`✅ Damage.txt loaded: ${hasDamageFile ? 'Yes' : 'No'}`);
  console.log(`✅ Section 1 results: ${hasSection1Results ? 'Available' : 'Missing'}`);

  if (hasDamageFile && hasSection1Results) {
    console.log('✅ Ready for Section 2 with Damage.txt integration');

    // Test processFileTest with current setup
    console.log('\n🧪 Testing processFileTest with current setup...');
    try {
      // This should work with Damage.txt now
      processFileTest();
      console.log('✅ processFileTest executed successfully');
    } catch (error) {
      console.log(`❌ processFileTest error: ${error.message}`);
    }
  } else {
    console.log('⚠️ Prerequisites missing for full integration test');
  }

  // 6. Summary
  console.log('\n📊 === MIGRATION SUMMARY ===');
  const migrationScore = [
    !fileInputTest, // fileInputTest removed
    usesDamageFile && !usesTestFile, // processFileTest updated
    !section2Button?.getAttribute('onclick')?.includes('processFileTest'), // button updated
    hasDamageFile, // Damage.txt available
    hasSection1Results // Section 1 results available
  ].filter(Boolean).length;

  console.log(`📊 Migration completeness: ${migrationScore}/5 (${(migrationScore/5*100).toFixed(0)}%)`);

  if (migrationScore === 5) {
    console.log('🎉 TEST.txt to Damage.txt migration completed successfully!');
  } else {
    console.log('⚠️ Migration incomplete - check issues above');
  }
}

// ✅ NEW FUNCTION: Test enhanced Damage.txt integration with proper scaling
function testEnhancedDamageTxtIntegration() {
  console.log('🚀 === TESTING ENHANCED DAMAGE.TXT INTEGRATION ===\n');

  // 1. Prerequisites check
  console.log('📋 1. ENHANCED PREREQUISITES CHECK:');

  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const hasDamageFile = fileInputDamaged && fileInputDamaged.files[0];
  const hasSection1Results = window.strainEnergyResults && window.strainEnergyResults.z;
  const hasMode = window.strainEnergyResults?.modeUsed;

  console.log(`✅ Damage.txt file: ${hasDamageFile ? 'Loaded' : 'Missing'}`);
  console.log(`✅ Section 1 results: ${hasSection1Results ? 'Available' : 'Missing'}`);
  console.log(`✅ Mode from Section 1: ${hasMode ? hasMode : 'Missing'}`);

  if (!hasDamageFile || !hasSection1Results) {
    console.log('⚠️ Prerequisites missing - cannot test enhanced integration');
    return;
  }

  // 2. Test enhanced CSV generation
  console.log('\n📋 2. ENHANCED CSV GENERATION TEST:');

  const damagedElements = getDamagedElementsList();
  const numDamageIndices = getEffectiveDICount(damagedElements);

  console.log(`📊 Damaged elements: [${damagedElements.join(', ')}]`);
  console.log(`📊 DI count: ${numDamageIndices}`);

  // 3. Test async CSV generation
  console.log('\n📋 3. ASYNC CSV GENERATION TEST:');

  createTestCsvContent().then(csvContent => {
    console.log('✅ Async CSV generation successful');

    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataRow = lines[1];

    console.log(`📊 CSV structure: ${lines.length} lines`);
    console.log(`📊 Header: ${header.substring(0, 50)}...`);

    // Analyze data quality
    const columns = header.split(',');
    const dataValues = dataRow.split(',');

    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));

    console.log(`📊 Features: ${featureColumns.length}, DI: ${diColumns.length}`);

    // Check DI values
    const diValues = dataValues.slice(-diColumns.length).map(v => parseFloat(v));
    console.log(`📊 DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);

    const qualityScore = (diValues.filter(v => v > 0).length / diColumns.length) * 100;
    console.log(`📊 Data quality score: ${qualityScore.toFixed(1)}%`);

    if (qualityScore > 80) {
      console.log('🎉 Enhanced integration test PASSED with high quality data!');
    } else if (qualityScore > 60) {
      console.log('✅ Enhanced integration test PASSED with acceptable quality');
    } else {
      console.log('⚠️ Enhanced integration test completed but data quality needs improvement');
    }

  }).catch(error => {
    console.error('❌ Async CSV generation failed:', error);
  });

  console.log('\n🎉 Enhanced Damage.txt integration test completed!');
}

// Export functions
if (typeof window !== 'undefined') {
  window.testDamageTxtIntegration = testDamageTxtIntegration;
  window.testSection2Integration = testSection2Integration;
  window.testTESTtxtMigration = testTESTtxtMigration;
  window.testEnhancedDamageTxtIntegration = testEnhancedDamageTxtIntegration;
  window.createDamageTxtIntegrationReport = createDamageTxtIntegrationReport;
}
