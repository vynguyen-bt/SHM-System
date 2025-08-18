// ✅ TEST: Verify switch functions are properly loaded

function testSwitchFunctions() {
  console.log('🧪 === TESTING SWITCH FUNCTIONS ===');
  
  // Test if functions exist
  const functions = [
    'switchToPartA',
    'switchToPartB', 
    'switchToPartB1',
    'switchToPartB3'
  ];
  
  functions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ ${funcName}: EXISTS`);
    } else {
      console.error(`❌ ${funcName}: NOT FOUND`);
    }
  });
  
  // Test if elements exist
  const elements = [
    'partA',
    'partB',
    'partB1', 
    'partB3'
  ];
  
  console.log('\n🔍 Testing DOM elements:');
  elements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      console.log(`✅ ${elementId}: EXISTS`);
    } else {
      console.error(`❌ ${elementId}: NOT FOUND`);
    }
  });
  
  // Test function calls
  console.log('\n🔧 Testing function calls:');
  try {
    if (typeof switchToPartB1 === 'function') {
      console.log('✅ switchToPartB1 can be called');
      // Don't actually call it to avoid UI changes
    } else {
      console.error('❌ switchToPartB1 is not a function');
    }
  } catch (error) {
    console.error('❌ Error testing switchToPartB1:', error);
  }
}

// Test script loading order
function testScriptLoadOrder() {
  console.log('🔍 === TESTING SCRIPT LOAD ORDER ===');
  
  const requiredFunctions = [
    'parseModeShapeFile',
    'parseSimulationFile', 
    'switchToPartB1',
    'createTrainCsvFromUploadedFiles'
  ];
  
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ ${funcName}: LOADED`);
    } else {
      console.error(`❌ ${funcName}: NOT LOADED - check script order`);
    }
  });
}

// Quick fix for missing function
function createSwitchToPartB1Fallback() {
  if (typeof window.switchToPartB1 !== 'function') {
    console.log('🔧 Creating fallback switchToPartB1 function');
    
    window.switchToPartB1 = function() {
      console.log('🔧 Fallback switchToPartB1 called');
      var partB1 = document.getElementById("partB1");
      if (partB1) {
        partB1.style.display = partB1.style.display === "block" ? "none" : "block";
        console.log('✅ partB1 toggled successfully');
      } else {
        console.error('❌ partB1 element not found');
      }
    };
    
    console.log('✅ Fallback function created');
  }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  window.testSwitchFunctions = testSwitchFunctions;
  window.testScriptLoadOrder = testScriptLoadOrder;
  window.createSwitchToPartB1Fallback = createSwitchToPartB1Fallback;
  
  // Auto-create fallback if needed
  setTimeout(() => {
    if (typeof window.switchToPartB1 !== 'function') {
      console.log('⚠️ switchToPartB1 not found, creating fallback...');
      createSwitchToPartB1Fallback();
    }
  }, 1000);
}
