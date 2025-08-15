// Debug script chuyên biệt cho vấn đề Mode Combine với 225 elements

function debugModeCombine225Issue() {
  console.log('🚨 === DEBUG MODE COMBINE 225 ELEMENTS ISSUE ===\n');
  
  // Check if files are loaded
  const fileInputNonDamaged = document.getElementById("txt-file-non-damaged");
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  
  if (!fileInputNonDamaged?.files[0] || !fileInputDamaged?.files[0]) {
    console.log('❌ Please load both Healthy.txt and Damage.txt files first');
    return;
  }
  
  if (!window.meshData) {
    console.log('❌ Please load SElement.txt file first');
    return;
  }
  
  console.log('✅ All required files loaded');
  
  // Check mesh data
  const { elements, nodes } = window.meshData;
  console.log(`📊 Mesh data: ${elements.length} elements, ${nodes.length} nodes`);
  
  if (elements.length === 225) {
    console.log('🎯 Detected 225-element grid - this is the problematic case');
    analyze225ElementGrid();
  } else {
    console.log(`ℹ️ Current grid has ${elements.length} elements (not 225)`);
  }
  
  // Test mode combine parsing
  testModeCombineParsing();
}

function analyze225ElementGrid() {
  console.log('\n🔍 === ANALYZING 225-ELEMENT GRID ===');
  
  const { elements, nodes, dx, dy } = window.meshData;
  
  // Grid analysis
  console.log(`📐 Grid spacing: dx=${dx}, dy=${dy}`);
  console.log(`📊 Total elements: ${elements.length}`);
  console.log(`📊 Total nodes: ${nodes.length}`);
  
  // Check if it's a 15x15 grid
  const expectedNodes = 16 * 16; // 15x15 elements = 16x16 nodes
  console.log(`🔢 Expected nodes for 15x15 grid: ${expectedNodes}`);
  console.log(`🔢 Actual nodes: ${nodes.length}`);
  
  if (nodes.length !== expectedNodes) {
    console.log('⚠️ Node count mismatch - this could cause issues');
  }
  
  // Check node ID range
  const nodeIDs = nodes.map(n => n.id);
  const minNodeID = Math.min(...nodeIDs);
  const maxNodeID = Math.max(...nodeIDs);
  console.log(`🔢 Node ID range: ${minNodeID} - ${maxNodeID}`);
  
  // Check for gaps in node IDs
  const expectedRange = maxNodeID - minNodeID + 1;
  if (nodeIDs.length !== expectedRange) {
    console.log('⚠️ Non-sequential node IDs detected - this could cause mode combine issues');
    
    // Find missing node IDs
    const missingIDs = [];
    for (let i = minNodeID; i <= maxNodeID; i++) {
      if (!nodeIDs.includes(i)) {
        missingIDs.push(i);
      }
    }
    console.log(`❌ Missing node IDs: [${missingIDs.slice(0, 10).join(', ')}${missingIDs.length > 10 ? '...' : ''}]`);
  } else {
    console.log('✅ Sequential node IDs confirmed');
  }
  
  // Check element connectivity
  const elementNodeCounts = elements.map(el => el.nodes.length);
  const uniqueNodeCounts = [...new Set(elementNodeCounts)];
  console.log(`🔗 Element node counts: [${uniqueNodeCounts.join(', ')}]`);
  
  if (uniqueNodeCounts.length > 1) {
    console.log('⚠️ Mixed element types detected');
  }
}

function testModeCombineParsing() {
  console.log('\n🧪 === TESTING MODE COMBINE PARSING ===');
  
  const fileInputNonDamaged = document.getElementById("txt-file-non-damaged");
  const fileInputDamaged = document.getElementById("txt-file-damaged");
  
  // Test with healthy file
  const reader1 = new FileReader();
  reader1.onload = function(event) {
    const healthyContent = event.target.result;
    console.log('\n📄 HEALTHY FILE ANALYSIS:');
    analyzeModeCombineData(healthyContent, 'Healthy');
    
    // Test with damaged file
    const reader2 = new FileReader();
    reader2.onload = function(event) {
      const damagedContent = event.target.result;
      console.log('\n📄 DAMAGED FILE ANALYSIS:');
      analyzeModeCombineData(damagedContent, 'Damaged');
      
      // Compare results
      compareModeCombineResults(healthyContent, damagedContent);
    };
    reader2.readAsText(fileInputDamaged.files[0]);
  };
  reader1.readAsText(fileInputNonDamaged.files[0]);
}

function analyzeModeCombineData(content, label) {
  console.log(`\n🔍 Analyzing ${label} file for Mode Combine data:`);
  
  const lines = content.trim().split('\n');
  const targetModes = [10, 12, 14, 17, 20];
  const modeStats = {};
  
  console.log(`📊 Total lines: ${lines.length}`);
  
  // Parse and analyze
  let validRows = 0;
  const nodeData = {};
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 3) {
      validRows++;
      const nodeID = Number(parts[0]);
      const mode = Number(parts[1]);
      const value = Number(parts[2]);
      
      if (!isNaN(nodeID) && !isNaN(mode) && !isNaN(value)) {
        if (!modeStats[mode]) {
          modeStats[mode] = { count: 0, nodes: [], values: [], min: Infinity, max: -Infinity };
        }
        
        modeStats[mode].count++;
        modeStats[mode].nodes.push(nodeID);
        modeStats[mode].values.push(value);
        modeStats[mode].min = Math.min(modeStats[mode].min, value);
        modeStats[mode].max = Math.max(modeStats[mode].max, value);
        
        if (!nodeData[nodeID]) {
          nodeData[nodeID] = {};
        }
        nodeData[nodeID][mode] = value;
      }
    }
  }
  
  console.log(`📊 Valid data rows: ${validRows}`);
  console.log(`📊 Unique nodes: ${Object.keys(nodeData).length}`);
  
  // Check target modes availability
  console.log('\n🎯 Target modes analysis:');
  const availableModes = [];
  const missingModes = [];
  
  targetModes.forEach(mode => {
    if (modeStats[mode]) {
      availableModes.push(mode);
      const stats = modeStats[mode];
      console.log(`  Mode ${mode}: ${stats.count} data points, range [${stats.min.toExponential(2)}, ${stats.max.toExponential(2)}]`);
    } else {
      missingModes.push(mode);
      console.log(`  Mode ${mode}: ❌ NOT FOUND`);
    }
  });
  
  console.log(`✅ Available modes: [${availableModes.join(', ')}]`);
  if (missingModes.length > 0) {
    console.log(`❌ Missing modes: [${missingModes.join(', ')}]`);
  }
  
  // Test combination for sample nodes
  console.log('\n🧮 Sample node combination test:');
  const sampleNodes = [1, 31, 61, 91, 121];
  
  sampleNodes.forEach(nodeID => {
    if (nodeData[nodeID]) {
      let combinedValue = 0;
      let modesFound = 0;
      const contributions = [];
      
      targetModes.forEach(mode => {
        if (nodeData[nodeID][mode] !== undefined) {
          const value = nodeData[nodeID][mode];
          combinedValue += value;
          modesFound++;
          contributions.push(`M${mode}:${value.toExponential(2)}`);
        }
      });
      
      console.log(`  Node ${nodeID}: ${combinedValue.toExponential(3)} (${modesFound}/${targetModes.length} modes: ${contributions.join(', ')})`);
    } else {
      console.log(`  Node ${nodeID}: ❌ NOT FOUND`);
    }
  });
  
  return {
    totalLines: lines.length,
    validRows: validRows,
    uniqueNodes: Object.keys(nodeData).length,
    availableModes: availableModes,
    missingModes: missingModes,
    modeStats: modeStats,
    nodeData: nodeData
  };
}

function compareModeCombineResults(healthyContent, damagedContent) {
  console.log('\n🔄 === COMPARING HEALTHY vs DAMAGED MODE COMBINE ===');
  
  // Analyze both files
  const healthyResult = analyzeModeCombineData(healthyContent, 'Healthy');
  const damagedResult = analyzeModeCombineData(damagedContent, 'Damaged');
  
  console.log('\n📊 COMPARISON SUMMARY:');
  console.log(`Healthy: ${healthyResult.uniqueNodes} nodes, modes [${healthyResult.availableModes.join(',')}]`);
  console.log(`Damaged: ${damagedResult.uniqueNodes} nodes, modes [${damagedResult.availableModes.join(',')}]`);
  
  // Check consistency
  const nodeCountMatch = healthyResult.uniqueNodes === damagedResult.uniqueNodes;
  const modesMatch = JSON.stringify(healthyResult.availableModes) === JSON.stringify(damagedResult.availableModes);
  
  console.log(`Node count consistency: ${nodeCountMatch ? '✅' : '❌'}`);
  console.log(`Mode availability consistency: ${modesMatch ? '✅' : '❌'}`);
  
  if (!nodeCountMatch) {
    console.log('⚠️ Different number of nodes between healthy and damaged files');
  }
  
  if (!modesMatch) {
    console.log('⚠️ Different modes available between healthy and damaged files');
    console.log(`  Healthy missing: [${damagedResult.availableModes.filter(m => !healthyResult.availableModes.includes(m)).join(',')}]`);
    console.log(`  Damaged missing: [${healthyResult.availableModes.filter(m => !damagedResult.availableModes.includes(m)).join(',')}]`);
  }
  
  // Test actual mode combine calculation
  console.log('\n🧮 TESTING ACTUAL MODE COMBINE CALCULATION:');
  
  try {
    const healthyCombined = parseModeShapeFile(healthyContent, 'combine');
    const damagedCombined = parseModeShapeFile(damagedContent, 'combine');
    
    console.log(`✅ Mode combine parsing successful`);
    console.log(`Healthy combined: ${Object.keys(healthyCombined).length} nodes`);
    console.log(`Damaged combined: ${Object.keys(damagedCombined).length} nodes`);
    
    // Compare sample values
    const sampleNodes = [1, 31, 61, 91, 121];
    console.log('\n📊 Sample combined values comparison:');
    
    sampleNodes.forEach(nodeID => {
      const healthyVal = healthyCombined[nodeID];
      const damagedVal = damagedCombined[nodeID];
      
      if (healthyVal !== undefined && damagedVal !== undefined) {
        const ratio = Math.abs(damagedVal / healthyVal);
        console.log(`  Node ${nodeID}: H=${healthyVal.toExponential(3)}, D=${damagedVal.toExponential(3)}, Ratio=${ratio.toFixed(3)}`);
      } else {
        console.log(`  Node ${nodeID}: Missing data (H=${healthyVal !== undefined}, D=${damagedVal !== undefined})`);
      }
    });
    
  } catch (error) {
    console.log(`❌ Mode combine calculation failed: ${error.message}`);
  }
}

function createModeCombine225Report() {
  // Create visual report
  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-height: 700px;
    background: white;
    border: 2px solid #dc3545;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow-y: auto;
  `;
  
  reportDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #dc3545; text-align: center;">
      🚨 Mode Combine 225 Elements Debug
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
      <h4 style="margin: 0 0 10px 0; color: #721c24;">🔍 Issue Description:</h4>
      <p style="margin: 0; color: #721c24; font-size: 13px;">
        Mode Combine calculations are producing incorrect results specifically when using 225-element grids.
        This debug tool will help identify the root cause.
      </p>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Debug Actions:</h4>
      
      <button onclick="debugModeCombine225Issue()" style="
        background: #dc3545; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🚨 Run Full Debug Analysis</button>
      
      <button onclick="analyze225ElementGrid()" style="
        background: #ffc107; 
        color: black; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">📊 Analyze Grid</button>
      
      <button onclick="testModeCombineParsing()" style="
        background: #17a2b8; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 48%;
      ">🧪 Test Parsing</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: #6c757d; 
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
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">Prerequisites:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
        <li>Load SElement.txt (225 elements)</li>
        <li>Load Healthy.txt mode shape file</li>
        <li>Load Damage.txt mode shape file</li>
        <li>Select "mode tổng hợp" in dropdown</li>
      </ul>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Check browser console for detailed debug information
      </p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.debugModeCombine225Issue = debugModeCombine225Issue;
  window.analyze225ElementGrid = analyze225ElementGrid;
  window.testModeCombineParsing = testModeCombineParsing;
  window.analyzeModeCombineData = analyzeModeCombineData;
  window.compareModeCombineResults = compareModeCombineResults;
  window.createModeCombine225Report = createModeCombine225Report;
}
