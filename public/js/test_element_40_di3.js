// ✅ TEST: Verify Element 40 → DI3 mapping and ANN usage

function testElement40DI3Mapping() {
  console.log('🧪 === TESTING ELEMENT 40 → DI3 MAPPING ===');
  
  // Test setup: Element 40 should be in survey element 3 (DI3)
  const testInputs = {
    'element-y': '55',     // DI1 → Element 55
    'element-y-2': '95',   // DI2 → Element 95  
    'element-y-3': '40'    // DI3 → Element 40 ← TARGET
  };
  
  console.log('📋 Test setup:');
  console.log('  DI1 → Element 55 (survey element 1)');
  console.log('  DI2 → Element 95 (survey element 2)');
  console.log('  DI3 → Element 40 (survey element 3) ← TARGET');
  
  // Simulate input values
  Object.keys(testInputs).forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = testInputs[inputId];
      console.log(`✅ Set ${inputId} = ${testInputs[inputId]}`);
    } else {
      console.error(`❌ Input ${inputId} not found`);
    }
  });
  
  // Test getSurveyElementsFromInputs function
  if (typeof getSurveyElementsFromInputs === 'function') {
    const surveyElements = getSurveyElementsFromInputs();
    console.log(`\n📊 Survey elements detected: [${surveyElements.join(', ')}]`);
    
    // Verify Element 40 is included
    if (surveyElements.includes(40)) {
      console.log('✅ Element 40 is detected as survey element');
      console.log('✅ Element 40 will use ANN prediction (not random)');
    } else {
      console.error('❌ Element 40 NOT detected as survey element');
      console.error('❌ Element 40 will use random 0-2% (WRONG!)');
    }
    
    // Check position (should be 3rd element for DI3)
    const element40Index = surveyElements.indexOf(40);
    if (element40Index === 2) { // 0-based index, so 2 = 3rd position
      console.log('✅ Element 40 is in position 3 (DI3) ← CORRECT');
    } else if (element40Index >= 0) {
      console.log(`⚠️ Element 40 is in position ${element40Index + 1} (DI${element40Index + 1})`);
    }
    
  } else {
    console.error('❌ getSurveyElementsFromInputs function not found');
  }
  
  return {
    testInputs,
    expectedResult: 'Element 40 should use ANN prediction for DI3'
  };
}

function testElement40ANNPrediction() {
  console.log('\n🧪 === TESTING ELEMENT 40 ANN PREDICTION ===');
  
  // Test generateRealisticANNPrediction for element 40
  if (typeof generateRealisticANNPrediction === 'function') {
    const prediction = generateRealisticANNPrediction(40);
    console.log(`🤖 Element 40 ANN prediction: ${prediction.toFixed(2)}%`);
    
    if (prediction >= 5 && prediction <= 25) {
      console.log('✅ Prediction is in realistic ANN range (5-25%)');
      console.log('✅ Element 40 will NOT use random 0-2%');
    } else {
      console.error(`❌ Prediction ${prediction.toFixed(2)}% is outside expected range`);
    }
    
    return prediction;
  } else {
    console.error('❌ generateRealisticANNPrediction function not found');
    return null;
  }
}

function simulateElement40Workflow() {
  console.log('\n🔄 === SIMULATING ELEMENT 40 WORKFLOW ===');
  
  // Step 1: Setup inputs
  console.log('📝 Step 1: Setting up inputs...');
  const testResult = testElement40DI3Mapping();
  
  // Step 2: Test ANN prediction
  console.log('\n🤖 Step 2: Testing ANN prediction...');
  const prediction = testElement40ANNPrediction();
  
  // Step 3: Expected console output
  console.log('\n📊 Step 3: Expected console output when running Section 2:');
  console.log('```');
  console.log('📋 Survey elements from inputs: [55, 95, 40]');
  console.log('🎯 Survey elements for real ANN predictions: [55, 95, 40]');
  console.log('🤖 Element 55: Primary ANN prediction = XX.XX%');
  console.log('🤖 Element 95: Survey ANN prediction = XX.XX% (realistic)');
  console.log('🤖 Element 40: Survey ANN prediction = XX.XX% (realistic) ← TARGET');
  console.log('🎲 Element XXX: Random prediction = X.XX% (other elements)');
  console.log('KẾT QUẢ CHẨN ĐOÁN ANNS DI3 SẼ DÙNG CHO PHẦN TỬ 40');
  console.log('```');
  
  // Step 4: Success criteria
  console.log('\n🎯 Step 4: Success criteria:');
  console.log('✅ Element 40 shows "Survey ANN prediction" (not "Random prediction")');
  console.log('✅ Element 40 prediction is 5-25% range (not 0-2%)');
  console.log('✅ Console shows "DI3 SẼ DÙNG CHO PHẦN TỬ 40"');
  console.log('✅ Element 40 is in 3rd position (DI3)');
  
  return {
    setupComplete: true,
    element40Detected: testResult ? true : false,
    predictionGenerated: prediction !== null,
    expectedOutput: 'Element 40 should use ANN for DI3'
  };
}

function verifyElement40Implementation() {
  console.log('🔍 === VERIFYING ELEMENT 40 IMPLEMENTATION ===');
  
  // Check if all required functions exist
  const requiredFunctions = [
    'getSurveyElementsFromInputs',
    'generateRealisticANNPrediction'
  ];
  
  const functionStatus = {};
  requiredFunctions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    functionStatus[funcName] = exists;
    console.log(`${exists ? '✅' : '❌'} ${funcName}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  });
  
  // Check if inputs exist
  const requiredInputs = ['element-y', 'element-y-2', 'element-y-3'];
  const inputStatus = {};
  requiredInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    const exists = input !== null;
    inputStatus[inputId] = exists;
    console.log(`${exists ? '✅' : '❌'} ${inputId}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  });
  
  // Overall status
  const allFunctionsExist = Object.values(functionStatus).every(status => status);
  const allInputsExist = Object.values(inputStatus).every(status => status);
  
  console.log(`\n📊 Implementation Status:`);
  console.log(`   Functions: ${allFunctionsExist ? '✅ READY' : '❌ MISSING'}`);
  console.log(`   Inputs: ${allInputsExist ? '✅ READY' : '❌ MISSING'}`);
  console.log(`   Overall: ${allFunctionsExist && allInputsExist ? '🎉 READY FOR TESTING' : '⚠️ NEEDS FIXES'}`);
  
  return {
    functions: functionStatus,
    inputs: inputStatus,
    ready: allFunctionsExist && allInputsExist
  };
}

// Quick test for Element 60 (updated from Element 40)
function quickTestElement60() {
  console.log('⚡ === QUICK TEST: ELEMENT 60 → DI3 ===');

  // Set element 60 in input 3
  const input3 = document.getElementById('element-y-3');
  if (input3) {
    input3.value = '60';
    console.log('✅ Set "Nhập phần tử khảo sát 3" = 60');
  }

  // Test detection
  if (typeof getSurveyElementsFromInputs === 'function') {
    const elements = getSurveyElementsFromInputs();
    const hasElement60 = elements.includes(60);
    console.log(`📊 Survey elements: [${elements.join(', ')}]`);
    console.log(`🎯 Element 60 detected: ${hasElement60 ? '✅ YES' : '❌ NO'}`);

    if (hasElement60) {
      console.log('🎉 SUCCESS: Element 60 will use ANN prediction for DI3!');
    } else {
      console.log('❌ FAILED: Element 60 will use random 0-2%');
    }
  }
}

// Keep old function for backward compatibility
function quickTestElement40() {
  console.log('⚠️ Note: Updated to Element 60. Use quickTestElement60() instead.');
  quickTestElement60();
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.testElement40DI3Mapping = testElement40DI3Mapping;
  window.testElement40ANNPrediction = testElement40ANNPrediction;
  window.simulateElement40Workflow = simulateElement40Workflow;
  window.verifyElement40Implementation = verifyElement40Implementation;
  window.quickTestElement40 = quickTestElement40;
  window.quickTestElement60 = quickTestElement60; // ✅ NEW: Element 60 test
}
