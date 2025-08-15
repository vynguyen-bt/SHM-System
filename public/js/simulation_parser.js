// ✅ NEW MODULE: Simulation.txt parser for dynamic DI values extraction

function parseSimulationFile(simulationContent) {
  console.log('📄 === PARSING SIMULATION.TXT FOR DI VALUES ===');
  
  const lines = simulationContent.trim().split('\n');
  const simulationData = {};
  let currentElementID = null;
  
  console.log(`📊 Processing ${lines.length} lines from Simulation.txt`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Parse element ID: "ID: [element_id]"
    if (line.startsWith('ID:')) {
      const idMatch = line.match(/ID:\s*(\d+)/);
      if (idMatch) {
        currentElementID = parseInt(idMatch[1]);
        console.log(`🔍 Found element ID: ${currentElementID}`);
      }
    }
    
    // Parse thickness with DI value: "THICKNESS: th[value1]_[value2]-[DI_value]"
    else if (line.startsWith('THICKNESS:') && currentElementID !== null) {
      const thicknessMatch = line.match(/THICKNESS:\s*th[\d.]+_[\d.]+-(\d+(?:\.\d+)?)/);
      if (thicknessMatch) {
        const diValue = parseFloat(thicknessMatch[1]);
        
        // Convert to proper decimal format (05 -> 0.05, 10 -> 0.10, etc.)
        const normalizedDI = diValue < 1 ? diValue : diValue / 100;
        
        simulationData[currentElementID] = normalizedDI;
        console.log(`✅ Element ${currentElementID}: DI = ${normalizedDI} (from ${thicknessMatch[1]})`);
      }
    }
  }
  
  console.log(`📊 Extracted DI values for ${Object.keys(simulationData).length} elements`);
  return simulationData;
}

function getDynamicFeatureCount(damageContent, mode) {
  console.log(`📊 === CALCULATING DYNAMIC FEATURE COUNT FOR MODE ${mode} ===`);
  
  const lines = damageContent.trim().split('\n');
  const uniqueNodeIDs = new Set();
  
  // Skip header line and process data
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    
    if (parts.length >= 3) {
      const nodeID = parseInt(parts[0]);
      const modeNumber = parseInt(parts[1]);
      
      if (modeNumber === mode && !isNaN(nodeID)) {
        uniqueNodeIDs.add(nodeID);
      }
    }
  }
  
  const featureCount = uniqueNodeIDs.size;
  console.log(`✅ Found ${featureCount} unique Node_IDs for mode ${mode}`);
  console.log(`📊 Node ID range: ${Math.min(...uniqueNodeIDs)} - ${Math.max(...uniqueNodeIDs)}`);
  
  return featureCount;
}

function createDynamicTestCsvContent() {
  console.log('🚀 === CREATING DYNAMIC TEST CSV WITH SIMULATION.TXT INTEGRATION ===');
  
  // Get prerequisites
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  const fileInputSimulation = document.getElementById("txt-file-simulation");
  
  if (!fileInputDamaged || !fileInputDamaged.files[0]) {
    console.error('❌ Damage.txt file not available');
    return Promise.reject(new Error('Damage.txt file required'));
  }
  
  if (!fileInputSimulation || !fileInputSimulation.files[0]) {
    console.warn('⚠️ Simulation.txt file not available, falling back to strain energy DI values');
    return createTestCsvContent(); // Fallback to existing method
  }
  
  const damagedElements = getDamagedElementsList();
  const modeUsed = window.strainEnergyResults?.modeUsed || 12;
  
  console.log(`📊 Configuration: Mode ${modeUsed}, Damaged elements: [${damagedElements.join(', ')}]`);
  
  // Read both files asynchronously
  return Promise.all([
    readFileAsText(fileInputDamaged.files[0]),
    readFileAsText(fileInputSimulation.files[0])
  ]).then(([damageContent, simulationContent]) => {
    
    // 1. Calculate dynamic feature count from Damage.txt
    const dynamicFeatureCount = getDynamicFeatureCount(damageContent, modeUsed);
    
    // 2. Parse mode shape data from Damage.txt
    const damageData = parseModeShapeFile(damageContent, modeUsed);
    
    // 3. Parse DI values from Simulation.txt
    const simulationData = parseSimulationFile(simulationContent);
    
    // 4. Generate dynamic CSV
    const csvContent = generateDynamicTestCsv(
      damageData, 
      simulationData, 
      damagedElements, 
      dynamicFeatureCount, 
      modeUsed
    );
    
    return csvContent;
  });
}

function generateDynamicTestCsv(damageData, simulationData, damagedElements, featureCount, modeUsed) {
  console.log('🔄 === GENERATING DYNAMIC CSV WITH SIMULATION DI VALUES ===');
  console.log(`📊 Input: ${featureCount} features, ${damagedElements.length} DI columns, mode ${modeUsed}`);
  
  // Create dynamic header: Case,U1,U2,...,UN,DI1,DI2,...,DIM
  let csvContent = "Case";
  
  // Add dynamic feature columns (U1-UN where N = unique Node_IDs)
  for (let i = 1; i <= featureCount; i++) {
    csvContent += ",U" + i;
  }
  
  // Add dynamic DI columns (DI1-DIM where M = damaged elements count)
  for (let i = 1; i <= damagedElements.length; i++) {
    csvContent += ",DI" + i;
  }
  csvContent += "\n";
  
  // Create single test case (Case=0)
  csvContent += "0"; // Case number
  
  // Process mode shape data for features (U1-UN)
  const nodeIDs = Object.keys(damageData).map(id => parseInt(id)).sort((a, b) => a - b);
  console.log(`📊 Processing ${nodeIDs.length} nodes for features`);
  
  // Calculate scaling factors for proper normalization
  const modeShapeValues = nodeIDs.map(nodeID => Math.abs(damageData[nodeID] || 0));
  const maxModeValue = Math.max(...modeShapeValues);
  const minModeValue = Math.min(...modeShapeValues.filter(v => v > 0));
  
  console.log(`📊 Mode shape value range: ${minModeValue.toExponential(3)} - ${maxModeValue.toExponential(3)}`);
  
  // Generate features with proper scaling and normalization
  for (let i = 1; i <= featureCount; i++) {
    let featureValue = 0.001; // Default small value
    
    if (i <= nodeIDs.length) {
      const nodeID = nodeIDs[i - 1];
      const rawValue = damageData[nodeID];
      
      if (rawValue !== undefined && !isNaN(rawValue) && rawValue !== 0) {
        // Apply hybrid scaling
        const absValue = Math.abs(rawValue);
        
        if (absValue < minModeValue * 10) {
          const logScaled = Math.log10(absValue / minModeValue + 1) / Math.log10(maxModeValue / minModeValue + 1);
          featureValue = Math.max(logScaled * 0.1, 0.001);
        } else {
          const linearScaled = (absValue / maxModeValue) * 1000;
          featureValue = Math.min(Math.max(linearScaled, 0.001), 1.0);
        }
        
        featureValue = Math.min(Math.max(featureValue, 0.001), 1.0);
      }
    }
    
    csvContent += "," + featureValue.toFixed(6);
  }
  
  // Generate DI values from Simulation.txt data
  console.log(`📊 Processing DI values from Simulation.txt for ${damagedElements.length} elements`);
  
  for (let i = 0; i < damagedElements.length; i++) {
    const elementID = damagedElements[i];
    let diValue = 0;
    
    if (simulationData[elementID] !== undefined) {
      diValue = simulationData[elementID];
      console.log(`🎯 DI${i+1} (Element ${elementID}): ${diValue} (from Simulation.txt)`);
    } else {
      // Fallback to strain energy if Simulation.txt doesn't have this element
      const z = window.strainEnergyResults?.z || {};
      const Z0 = window.strainEnergyResults?.Z0 || 1.0;
      const maxZ = window.strainEnergyResults?.maxZ || 10.0;
      
      if (z[elementID] !== undefined) {
        const actualDamage = z[elementID];
        if (actualDamage >= Z0) {
          diValue = 0.1 + (actualDamage - Z0) / (maxZ - Z0) * 0.9;
          diValue = Math.min(Math.max(diValue, 0.1), 1.0);
        } else {
          diValue = (actualDamage / Z0) * 0.1;
          diValue = Math.min(Math.max(diValue, 0), 0.1);
        }
      }
      
      console.log(`🎯 DI${i+1} (Element ${elementID}): ${diValue.toFixed(4)} (fallback from strain energy)`);
    }
    
    csvContent += "," + diValue.toFixed(4);
  }
  csvContent += "\n";
  
  console.log(`✅ Generated dynamic CSV with ${1 + featureCount + damagedElements.length} columns`);
  console.log(`📊 Structure: 1 Case + ${featureCount} Features + ${damagedElements.length} DI columns`);
  console.log(`📊 Data sources: Mode ${modeUsed} from Damage.txt + DI values from Simulation.txt`);
  
  return csvContent;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Export functions
if (typeof window !== 'undefined') {
  window.parseSimulationFile = parseSimulationFile;
  window.getDynamicFeatureCount = getDynamicFeatureCount;
  window.createDynamicTestCsvContent = createDynamicTestCsvContent;
  window.generateDynamicTestCsv = generateDynamicTestCsv;
}
