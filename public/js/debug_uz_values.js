// ✅ DEBUG: Verify UZ values extraction from Damage.txt vs TEST.csv

function debugUzValues() {
  console.log('🔍 === DEBUGGING UZ VALUES EXTRACTION ===');
  
  // Test with user's actual Damage.txt data
  const sampleDamageContent = `Node_ID	Mode	EigenVector_UZ
1	10	-0.00027493950966129
1	12	0.000162612356231889
1	14	-0.000139914445524435
1	17	0.000303954751003727
1	20	-8.018958284737E-05
2	10	-0.000274150680555344
2	12	-0.000156897342455771
2	14	-0.000141800972856613
2	17	-0.000303634458243555
2	20	-7.21470684829117E-05
3	10	-3.0824627366132E-05
3	12	2.36599015781437E-06
3	14	6.03080126090838E-06
3	17	-6.50836674796313E-06
3	20	0.000194946059259311
4	10	-3.02817379477255E-05
4	12	-3.83803021599451E-06
4	14	6.06274647465508E-06
4	17	1.29330867555396E-05
4	20	0.000186584988981196`;

  console.log('📋 Sample Damage.txt content (first 4 nodes):');
  console.log(sampleDamageContent);
  
  // Test parsing for different modes
  const testModes = [10, 12, 14, 17, 20];
  
  testModes.forEach(mode => {
    console.log(`\n🎯 Testing Mode ${mode}:`);
    
    try {
      const parsedData = parseModeShapeFile(sampleDamageContent, mode);
      console.log(`✅ Parsed ${Object.keys(parsedData).length} nodes for Mode ${mode}`);
      
      // Show first 4 nodes
      for (let nodeId = 1; nodeId <= 4; nodeId++) {
        const value = parsedData[nodeId];
        if (value !== undefined) {
          console.log(`   Node ${nodeId}: ${value}`);
        } else {
          console.log(`   Node ${nodeId}: NOT FOUND`);
        }
      }
      
      // Compare with expected values from user's data
      const expectedValues = getExpectedValuesForMode(mode);
      console.log('📊 Expected vs Actual comparison:');
      expectedValues.forEach(expected => {
        const actual = parsedData[expected.nodeId];
        const match = Math.abs(actual - expected.value) < 1e-10;
        console.log(`   Node ${expected.nodeId}: Expected=${expected.value}, Actual=${actual}, Match=${match ? '✅' : '❌'}`);
      });
      
    } catch (error) {
      console.error(`❌ Error parsing Mode ${mode}:`, error);
    }
  });
}

function getExpectedValuesForMode(mode) {
  // Expected values from user's Damage.txt
  const expectedData = {
    10: [
      { nodeId: 1, value: -0.00027493950966129 },
      { nodeId: 2, value: -0.000274150680555344 },
      { nodeId: 3, value: -3.0824627366132E-05 },
      { nodeId: 4, value: -3.02817379477255E-05 }
    ],
    12: [
      { nodeId: 1, value: 0.000162612356231889 },
      { nodeId: 2, value: -0.000156897342455771 },
      { nodeId: 3, value: 2.36599015781437E-06 },
      { nodeId: 4, value: -3.83803021599451E-06 }
    ],
    14: [
      { nodeId: 1, value: -0.000139914445524435 },
      { nodeId: 2, value: -0.000141800972856613 },
      { nodeId: 3, value: 6.03080126090838E-06 },
      { nodeId: 4, value: 6.06274647465508E-06 }
    ],
    17: [
      { nodeId: 1, value: 0.000303954751003727 },
      { nodeId: 2, value: -0.000303634458243555 },
      { nodeId: 3, value: -6.50836674796313E-06 },
      { nodeId: 4, value: 1.29330867555396E-05 }
    ],
    20: [
      { nodeId: 1, value: -8.018958284737E-05 },
      { nodeId: 2, value: -7.21470684829117E-05 },
      { nodeId: 3, value: 0.000194946059259311 },
      { nodeId: 4, value: 0.000186584988981196 }
    ]
  };
  
  return expectedData[mode] || [];
}

function debugTestCsvGeneration() {
  console.log('🔍 === DEBUGGING TEST CSV GENERATION ===');
  
  // Simulate the TEST.csv generation process
  const sampleDamageContent = `Node_ID	Mode	EigenVector_UZ
1	10	-0.00027493950966129
2	10	-0.000274150680555344
3	10	-3.0824627366132E-05
4	10	-3.02817379477255E-05`;

  const mode = 10;
  console.log(`📊 Testing CSV generation for Mode ${mode}`);
  
  try {
    // Parse the data
    const damageData = parseModeShapeFile(sampleDamageContent, mode);
    console.log('✅ Parsed damage data:', damageData);
    
    // Simulate feature generation (first 4 features)
    const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
    console.log('📋 Node IDs (sorted):', nodeIDs);
    
    console.log('\n📊 Feature generation simulation:');
    for (let i = 0; i < Math.min(4, nodeIDs.length); i++) {
      const nodeID = nodeIDs[i];
      const rawValue = damageData[nodeID];
      console.log(`   U${i + 1} (Node ${nodeID}): ${rawValue}`);
    }
    
    // Compare with TEST.csv values
    console.log('\n📋 Expected TEST.csv values (from your example):');
    const testCsvValues = [0.000307, 0.000164, 0.000859, 0.000883];
    testCsvValues.forEach((value, index) => {
      console.log(`   U${index + 1}: ${value} (from TEST.csv)`);
    });
    
    console.log('\n⚠️ COMPARISON ANALYSIS:');
    console.log('❌ Values DO NOT match! This indicates:');
    console.log('   1. Different mode being used');
    console.log('   2. Different scaling/transformation applied');
    console.log('   3. Different node ordering');
    console.log('   4. Random generation instead of real data');
    
  } catch (error) {
    console.error('❌ Error in CSV generation simulation:', error);
  }
}

function debugCurrentTestCsvLogic() {
  console.log('🔍 === DEBUGGING CURRENT TEST CSV LOGIC ===');
  
  // Check what mode is being used
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  console.log(`📊 Current mode from Section 1: ${modeUsed}`);
  
  // Check if Damage.txt file is loaded
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  if (fileInputDamaged && fileInputDamaged.files[0]) {
    console.log('✅ Damage.txt file is loaded');
    
    const file = fileInputDamaged.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const content = event.target.result;
      console.log(`📊 File size: ${content.length} characters`);
      
      // Test parsing with current mode
      try {
        const parsedData = parseModeShapeFile(content, modeUsed);
        console.log(`✅ Successfully parsed ${Object.keys(parsedData).length} nodes for Mode ${modeUsed}`);
        
        // Show first 10 values
        const nodeIDs = Object.keys(parsedData).map(id => parseInt(id)).sort((a, b) => a - b);
        console.log('\n📋 First 10 UZ values that would go into TEST.csv:');
        for (let i = 0; i < Math.min(10, nodeIDs.length); i++) {
          const nodeID = nodeIDs[i];
          const value = parsedData[nodeID];
          console.log(`   U${i + 1} (Node ${nodeID}): ${value}`);
        }
        
      } catch (error) {
        console.error(`❌ Error parsing Mode ${modeUsed}:`, error);
      }
    };
    reader.readAsText(file);
    
  } else {
    console.log('❌ Damage.txt file is NOT loaded');
  }
}

function compareWithActualTestCsv() {
  console.log('🔍 === COMPARING WITH ACTUAL TEST CSV ===');
  
  // Your actual TEST.csv values
  const actualTestValues = [
    0.000307, 0.000164, 0.000859, 0.000883, 0.00095, 0.000227, 0.000881, 0.000468, 0.000654, 0.000174
  ];
  
  console.log('📋 Actual TEST.csv U1-U10 values:');
  actualTestValues.forEach((value, index) => {
    console.log(`   U${index + 1}: ${value}`);
  });
  
  console.log('\n🔍 Analysis:');
  console.log('   - Values are in range 0.000xxx (small positive numbers)');
  console.log('   - All values are positive');
  console.log('   - Values appear to be scaled/transformed');
  console.log('   - Pattern suggests random generation or heavy processing');
  
  console.log('\n📊 Expected from Damage.txt Mode 10:');
  console.log('   - Node 1: -0.00027493950966129 (negative)');
  console.log('   - Node 2: -0.000274150680555344 (negative)');
  console.log('   - Values should be negative for Mode 10');
  
  console.log('\n❌ CONCLUSION: Current TEST.csv is NOT using raw Damage.txt values!');
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.debugUzValues = debugUzValues;
  window.debugTestCsvGeneration = debugTestCsvGeneration;
  window.debugCurrentTestCsvLogic = debugCurrentTestCsvLogic;
  window.compareWithActualTestCsv = compareWithActualTestCsv;
}
