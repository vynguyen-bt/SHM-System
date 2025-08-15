// DI values fix - correct DI calculation based on highest damage element and Simulation.txt

function parseSimulationFile() {
  console.log('📊 === PARSING SIMULATION.TXT FOR THICKNESS DATA ===');
  
  const fileInputSimulation = document.getElementById("txt-file-simulation");
  if (!fileInputSimulation || !fileInputSimulation.files[0]) {
    console.log('❌ Simulation.txt file not loaded');
    return Promise.resolve({});
  }
  
  const file = fileInputSimulation.files[0];
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = function(event) {
      try {
        const content = event.target.result;
        const simulationData = {};
        
        const lines = content.trim().split('\n');
        console.log(`📊 Processing ${lines.length} lines from Simulation.txt`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Parse format: ID: [number], THICKNESS: th[value]_[value]-[target_value]
          const idMatch = line.match(/ID:\s*(\d+)/);
          const thicknessMatch = line.match(/THICKNESS:\s*(th[\d.]+_[\d.]+-(\d+))/);
          
          if (idMatch && thicknessMatch) {
            const elementID = parseInt(idMatch[1]);
            const fullThickness = thicknessMatch[1];
            const targetValue = thicknessMatch[2];
            
            simulationData[elementID] = {
              thickness: fullThickness,
              targetValue: targetValue,
              diValue: parseFloat('0.' + targetValue.padStart(2, '0'))
            };
            
            if (i < 10) { // Log first 10 for verification
              console.log(`   Element ${elementID}: ${fullThickness} → DI = ${simulationData[elementID].diValue}`);
            }
          }
        }
        
        console.log(`✅ Parsed ${Object.keys(simulationData).length} elements from Simulation.txt`);
        resolve(simulationData);
        
      } catch (error) {
        console.error('❌ Error parsing Simulation.txt:', error);
        resolve({});
      }
    };
    
    reader.onerror = function() {
      console.error('❌ Error reading Simulation.txt file');
      resolve({});
    };
    
    reader.readAsText(file);
  });
}

function getDamagedElementsWithPercentages() {
  console.log('📊 === GETTING DAMAGED ELEMENTS WITH PERCENTAGES ===');
  
  if (!window.strainEnergyResults || !window.strainEnergyResults.z) {
    console.log('❌ Section 1 results not available');
    return [];
  }
  
  const z = window.strainEnergyResults.z;
  const Z0 = window.strainEnergyResults.Z0 || 1.0;
  const maxZ = window.strainEnergyResults.maxZ || 10.0;
  
  const damagedElements = [];
  
  // Get damaged elements list
  const damagedElementsList = getDamagedElementsList();
  
  console.log(`📊 Processing ${damagedElementsList.length} damaged elements`);
  
  damagedElementsList.forEach(elementID => {
    const actualDamage = z[elementID];
    
    if (actualDamage !== undefined && !isNaN(actualDamage) && actualDamage > Z0) {
      // Calculate damage percentage
      const damagePercentage = ((actualDamage - Z0) / (maxZ - Z0)) * 100;
      
      damagedElements.push({
        elementID: elementID,
        actualDamage: actualDamage,
        damagePercentage: damagePercentage
      });
      
      console.log(`   Element ${elementID}: ${actualDamage.toFixed(3)} → ${damagePercentage.toFixed(2)}%`);
    }
  });
  
  // Sort by damage percentage (descending)
  damagedElements.sort((a, b) => b.damagePercentage - a.damagePercentage);
  
  console.log(`✅ Found ${damagedElements.length} damaged elements`);
  if (damagedElements.length > 0) {
    console.log(`📊 Highest damage: Element ${damagedElements[0].elementID} (${damagedElements[0].damagePercentage.toFixed(2)}%)`);
  }
  
  return damagedElements;
}

function calculateCorrectDIValues(damagedElements, simulationData) {
  console.log('📊 === CALCULATING CORRECT DI VALUES ===');
  
  const numDamageIndices = damagedElements.length;
  const diValues = new Array(numDamageIndices).fill(0);
  
  if (damagedElements.length === 0) {
    console.log('⚠️ No damaged elements found');
    return diValues;
  }
  
  // Find the element with highest damage percentage
  const highestDamageElement = damagedElements[0];
  console.log(`📊 Highest damage element: ${highestDamageElement.elementID} (${highestDamageElement.damagePercentage.toFixed(2)}%)`);
  
  // Find this element in simulation data
  const simulationInfo = simulationData[highestDamageElement.elementID];
  
  if (simulationInfo) {
    console.log(`📊 Found in Simulation.txt: ${simulationInfo.thickness} → DI = ${simulationInfo.diValue}`);
    
    // Find the index of this element in the damaged elements list
    const elementIndex = damagedElements.findIndex(elem => elem.elementID === highestDamageElement.elementID);
    
    if (elementIndex !== -1) {
      diValues[elementIndex] = simulationInfo.diValue;
      console.log(`✅ Set DI${elementIndex + 1} = ${simulationInfo.diValue} for Element ${highestDamageElement.elementID}`);
    }
  } else {
    console.log(`⚠️ Element ${highestDamageElement.elementID} not found in Simulation.txt`);
    
    // Fallback: use damage percentage as DI value
    const elementIndex = damagedElements.findIndex(elem => elem.elementID === highestDamageElement.elementID);
    if (elementIndex !== -1) {
      diValues[elementIndex] = highestDamageElement.damagePercentage / 100;
      console.log(`⚠️ Fallback: Set DI${elementIndex + 1} = ${diValues[elementIndex].toFixed(4)} (from damage %)`);
    }
  }
  
  console.log(`📊 Final DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);
  
  return diValues;
}

async function generateCsvWithCorrectDI(damageData, damagedElements, modeUsed) {
  console.log('📊 === GENERATING CSV WITH CORRECT DI VALUES ===');
  
  // Parse simulation data
  const simulationData = await parseSimulationFile();
  
  // Get damaged elements with percentages
  const damagedElementsWithPercentages = getDamagedElementsWithPercentages();
  
  // Calculate correct DI values
  const correctDIValues = calculateCorrectDIValues(damagedElementsWithPercentages, simulationData);
  
  // Sort nodes for correct mapping
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  const featureCount = nodeIDs.length;
  const numDamageIndices = damagedElements.length;
  
  console.log(`📊 CSV structure: ${featureCount} features, ${numDamageIndices} DI columns`);
  
  // Create header
  let csvContent = "Case";
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  for (let i = 1; i <= numDamageIndices; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";
  
  // Create data row with raw values
  csvContent += "0"; // Case
  
  // Add raw features (no scaling)
  for (let i = 0; i < featureCount; i++) {
    const nodeID = nodeIDs[i];
    const rawValue = damageData[nodeID] || 0;
    csvContent += "," + rawValue;
  }
  
  // Add correct DI values
  console.log('\n📊 Adding DI values to CSV:');
  for (let i = 0; i < numDamageIndices; i++) {
    const diValue = correctDIValues[i] || 0;
    console.log(`   DI${i + 1}: ${diValue.toFixed(4)}`);
    csvContent += "," + diValue.toFixed(4);
  }
  csvContent += "\n";
  
  console.log('✅ CSV with correct DI values generated');
  
  return csvContent;
}

function testDIValuesCalculation() {
  console.log('🧪 === TESTING DI VALUES CALCULATION ===\n');
  
  // Test with example scenario
  console.log('📊 Example scenario:');
  console.log('   Element 45: 3.15% damage');
  console.log('   Element 55: 5.69% damage');
  console.log('   Expected: Element 55 (highest) → DI2 = 0.05, others = 0');
  
  // Test parsing simulation data
  parseSimulationFile().then(simulationData => {
    console.log(`\n📊 Simulation data loaded: ${Object.keys(simulationData).length} elements`);
    
    // Show some examples
    const exampleElements = [45, 55, 2134];
    exampleElements.forEach(elementID => {
      if (simulationData[elementID]) {
        const info = simulationData[elementID];
        console.log(`   Element ${elementID}: ${info.thickness} → DI = ${info.diValue}`);
      } else {
        console.log(`   Element ${elementID}: Not found in simulation data`);
      }
    });
    
    // Test damaged elements calculation
    const damagedElements = getDamagedElementsWithPercentages();
    if (damagedElements.length > 0) {
      console.log(`\n📊 Current damaged elements:`);
      damagedElements.forEach((elem, index) => {
        console.log(`   ${index + 1}. Element ${elem.elementID}: ${elem.damagePercentage.toFixed(2)}%`);
      });
      
      // Calculate DI values
      const diValues = calculateCorrectDIValues(damagedElements, simulationData);
      console.log(`\n📊 Calculated DI values: [${diValues.map(v => v.toFixed(4)).join(', ')}]`);
    }
  });
}

function createDIValuesTestInterface() {
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 600px;
    max-height: 700px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #007BFF; text-align: center;">
      📊 DI Values Calculation Test
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 DI Logic:</h4>
      <ol style="margin: 5px 0; padding-left: 20px; color: #0c5460; font-size: 13px;">
        <li>Find element with highest damage % from Section 1</li>
        <li>Look up this element in Simulation.txt</li>
        <li>Extract THICKNESS value (e.g., th0.2_2-05)</li>
        <li>Convert to DI value (05 → 0.05)</li>
        <li>Assign to corresponding DI column, others = 0</li>
      </ol>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">📊 Example:</h4>
      <div style="font-family: monospace; font-size: 12px; color: #856404;">
        Element 45: 3.15% damage<br>
        Element 55: 5.69% damage (highest)<br>
        Element 55 → DI2, THICKNESS: th0.2_2-05<br>
        Result: DI1=0, DI2=0.05, DI3=0...
      </div>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Test Actions:</h4>
      
      <button onclick="testDIValuesCalculation()" style="
        background: #007BFF; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🧪 Test DI Calculation</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">❌ Close</button>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Check browser console for detailed DI calculation results
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.parseSimulationFile = parseSimulationFile;
  window.getDamagedElementsWithPercentages = getDamagedElementsWithPercentages;
  window.calculateCorrectDIValues = calculateCorrectDIValues;
  window.generateCsvWithCorrectDI = generateCsvWithCorrectDI;
  window.testDIValuesCalculation = testDIValuesCalculation;
  window.createDIValuesTestInterface = createDIValuesTestInterface;
}
