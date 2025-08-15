// Dynamic CSV Generation Interface for SHM-BIM-FEM
// Provides UI for dynamic DI column detection and enhanced CSV generation

function createDynamicCSVInterface() {
  const interfaceDiv = document.createElement('div');
  interfaceDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    max-height: 800px;
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
  
  interfaceDiv.innerHTML = `
    <h3 style="margin: 0 0 20px 0; color: #007BFF; text-align: center;">
      🔧 Dynamic CSV Generation System
    </h3>
    
    <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #0c5460;">🎯 Dynamic DI Detection Features:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #0c5460; font-size: 13px;">
        <li><strong>Automatic DI Column Count:</strong> Detects unique elements in Simulation.txt</li>
        <li><strong>THICKNESS-based DI Values:</strong> Extracts DI from THICKNESS field for TEST.csv</li>
        <li><strong>Filename-based DI Values:</strong> Extracts DI from training file names for TRAIN.csv</li>
        <li><strong>Structure Consistency:</strong> Identical headers between TEST and TRAIN files</li>
        <li><strong>Element Mapping:</strong> Maps elements to correct DI columns automatically</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #d4edda; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">📊 Implementation Logic:</h4>
      <div style="margin: 10px 0; font-size: 13px; color: #155724;">
        <strong>1. TEST.csv Generation:</strong><br>
        • Parse Simulation.txt → Count unique element IDs → Create DI1, DI2, ..., DIn<br>
        • Extract THICKNESS values → Convert "th0.2_2-05" → DI = 0.05<br>
        • Map damaged elements to corresponding DI columns<br><br>
        
        <strong>2. TRAIN.csv Generation:</strong><br>
        • Use same DI column structure as TEST.csv<br>
        • Parse training file names → "ID_2134-th0.2_2-05_timestamp" → DI = 0.05<br>
        • Map element ID to correct DI column position<br><br>
        
        <strong>3. Structure Validation:</strong><br>
        • Ensure identical headers: Case,U1,U2,...,Un,DI1,DI2,...,DIm<br>
        • Validate DI value ranges and consistency<br>
        • Check training data sufficiency
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">⚡ Expected Benefits:</h4>
      <ul style="margin: 5px 0; padding-left: 20px; color: #856404; font-size: 13px;">
        <li><strong>Scalable:</strong> Automatically adapts to any number of elements in Simulation.txt</li>
        <li><strong>Accurate:</strong> DI values directly from THICKNESS data and file names</li>
        <li><strong>Consistent:</strong> Guaranteed structure compatibility between files</li>
        <li><strong>Flexible:</strong> Handles varying numbers of damaged elements</li>
        <li><strong>AI-Ready:</strong> Optimized structure for machine learning training</li>
      </ul>
    </div>
    
    <div style="margin: 20px 0;">
      <h4 style="margin: 10px 0 15px 0;">🔧 Generation Actions:</h4>
      
      <button onclick="generateDynamicCSVFiles()" style="
        background: #007BFF;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      ">🚀 Generate Dynamic CSV Files</button>

      <button onclick="generateFallbackCSVFiles()" style="
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      ">🔄 Generate Fallback CSV Files</button>

      <button onclick="generateSimpleCSVFiles()" style="
        background: #17a2b8;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
        font-size: 16px;
        font-weight: bold;
        width: 100%;
      ">📊 Generate Simple CSV Files</button>
      
      <div style="display: flex; gap: 10px; margin: 10px 0;">
        <button onclick="testDynamicCSVSystem()" style="
          background: #28a745; 
          color: white; 
          border: none; 
          padding: 10px 15px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 13px;
          flex: 1;
        ">🧪 Test System</button>
        
        <button onclick="compareDynamicVsOriginalCSV()" style="
          background: #ffc107; 
          color: black; 
          border: none; 
          padding: 10px 15px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 13px;
          flex: 1;
        ">📊 Compare Methods</button>
      </div>
      
      <div style="display: flex; gap: 10px; margin: 10px 0;">
        <button onclick="testEnhancedTestCsvGeneration()" style="
          background: #17a2b8; 
          color: white; 
          border: none; 
          padding: 10px 15px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 13px;
          flex: 1;
        ">🔧 Test TEST.csv</button>
        
        <button onclick="testEnhancedTrainCsvGeneration()" style="
          background: #6f42c1; 
          color: white; 
          border: none; 
          padding: 10px 15px; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 13px;
          flex: 1;
        ">🔧 Test TRAIN.csv</button>
      </div>
      
      <button onclick="validateTrainTestConsistency()" style="
        background: #20c997; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin: 5px;
        font-size: 13px;
        width: 100%;
      ">🔍 Validate Consistency</button>
      
      <button onclick="this.remove()" style="
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
    
    <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #6c757d;">📋 Prerequisites Checklist:</h4>
      <div id="prerequisites-status" style="font-size: 13px; color: #6c757d;">
        <div>• Section 1 results: <span id="section1-status">Checking...</span></div>
        <div>• Damage.txt file: <span id="damage-file-status">Checking...</span></div>
        <div>• Simulation.txt file: <span id="simulation-file-status">Checking...</span></div>
        <div>• Training case files: <span id="training-files-status">Checking...</span></div>
      </div>
      <button onclick="checkDynamicCSVPrerequisites()" style="
        background: #6c757d; 
        color: white; 
        border: none; 
        padding: 8px 15px; 
        border-radius: 5px; 
        cursor: pointer;
        margin-top: 10px;
        font-size: 12px;
      ">🔄 Refresh Status</button>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <p style="margin: 0; font-size: 12px; color: #6c757d; text-align: center;">
        💡 Dynamic CSV generation automatically detects DI column count from Simulation.txt<br>
        Check browser console for detailed generation logs and analysis
      </p>
    </div>
  `;
  
  document.body.appendChild(interfaceDiv);
  
  // Auto-check prerequisites when interface opens
  setTimeout(() => checkDynamicCSVPrerequisites(), 500);
}

/**
 * Check dynamic CSV prerequisites and update status
 */
async function checkDynamicCSVPrerequisites() {
  console.log('📋 Checking dynamic CSV prerequisites...');
  
  // Check Section 1 results
  const section1Status = document.getElementById('section1-status');
  if (window.strainEnergyResults) {
    section1Status.innerHTML = '<span style="color: #28a745;">✅ Available</span>';
  } else {
    section1Status.innerHTML = '<span style="color: #dc3545;">❌ Missing</span>';
  }
  
  // Check Damage.txt file
  const damageFileStatus = document.getElementById('damage-file-status');
  const damageFile = document.getElementById('txt-file-damaged');
  if (damageFile && damageFile.files && damageFile.files.length > 0) {
    damageFileStatus.innerHTML = '<span style="color: #28a745;">✅ Loaded</span>';
  } else {
    damageFileStatus.innerHTML = '<span style="color: #dc3545;">❌ Not loaded</span>';
  }
  
  // Check Simulation.txt file
  const simulationFileStatus = document.getElementById('simulation-file-status');
  const simulationFile = document.getElementById('txt-file-simulation');
  if (simulationFile && simulationFile.files && simulationFile.files.length > 0) {
    simulationFileStatus.innerHTML = '<span style="color: #28a745;">✅ Loaded</span>';
    
    // Try to parse Simulation.txt for element count
    try {
      const simulationData = await parseSimulationFileForDynamicDI();
      simulationFileStatus.innerHTML = `<span style="color: #28a745;">✅ Loaded (${simulationData.dynamicDICount} elements)</span>`;
    } catch (error) {
      simulationFileStatus.innerHTML = '<span style="color: #ffc107;">⚠️ Loaded (parse error)</span>';
    }
  } else {
    simulationFileStatus.innerHTML = '<span style="color: #dc3545;">❌ Not loaded</span>';
  }
  
  // Check training case files
  const trainingFilesStatus = document.getElementById('training-files-status');
  try {
    const trainingCases = await findEnhancedTrainingCaseFiles();
    if (trainingCases.length > 0) {
      trainingFilesStatus.innerHTML = `<span style="color: #28a745;">✅ Found (${trainingCases.length} files)</span>`;
    } else {
      trainingFilesStatus.innerHTML = '<span style="color: #ffc107;">⚠️ None found</span>';
    }
  } catch (error) {
    trainingFilesStatus.innerHTML = '<span style="color: #dc3545;">❌ Error checking</span>';
  }
}

/**
 * Show dynamic CSV generation example
 */
function showDynamicCSVExample() {
  const exampleDiv = document.createElement('div');
  exampleDiv.style.cssText = `
    position: fixed;
    top: 50px;
    right: 50px;
    width: 600px;
    max-height: 600px;
    background: white;
    border: 2px solid #17a2b8;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 13px;
    overflow-y: auto;
  `;
  
  exampleDiv.innerHTML = `
    <h4 style="margin: 0 0 15px 0; color: #17a2b8;">📊 Dynamic CSV Generation Example</h4>
    
    <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <strong>Simulation.txt Content:</strong>
      <pre style="margin: 5px 0; font-size: 11px; color: #495057;">ID: 2134
THICKNESS: th0.2_2-05

ID: 2145
THICKNESS: th0.2_2-10

ID: 2156
THICKNESS: th0.2_2-00</pre>
    </div>
    
    <div style="margin: 15px 0; padding: 10px; background: #e9ecef; border-radius: 5px;">
      <strong>Dynamic Detection Result:</strong>
      <div style="margin: 5px 0; font-size: 12px;">
        • Elements found: [2134, 2145, 2156]<br>
        • DI columns: DI1, DI2, DI3<br>
        • Element 2134 → DI1 = 0.05<br>
        • Element 2145 → DI2 = 0.10<br>
        • Element 2156 → DI3 = 0.00
      </div>
    </div>
    
    <div style="margin: 15px 0; padding: 10px; background: #d4edda; border-radius: 5px;">
      <strong>Generated CSV Structure:</strong>
      <pre style="margin: 5px 0; font-size: 11px; color: #155724;">Case,U1,U2,...,U121,DI1,DI2,DI3
0,0.00012,-0.00008,...,0.00015,0.0500,0.1000,0.0000</pre>
    </div>
    
    <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 5px;">
      <strong>Training Case Files:</strong>
      <div style="margin: 5px 0; font-size: 12px;">
        • ID_2134-th0.2_2-05_20250814_220218 → DI1 = 0.05<br>
        • ID_2145-th0.2_2-10_20250814_220345 → DI2 = 0.10<br>
        • ID_2156-th0.2_2-00_20250814_220512 → DI3 = 0.00
      </div>
    </div>
    
    <button onclick="this.parentElement.remove()" style="
      background: #dc3545; 
      color: white; 
      border: none; 
      padding: 8px 15px; 
      border-radius: 5px; 
      cursor: pointer;
      margin-top: 15px;
      width: 100%;
    ">Close Example</button>
  `;
  
  document.body.appendChild(exampleDiv);
}

// Export functions
if (typeof window !== 'undefined') {
  window.createDynamicCSVInterface = createDynamicCSVInterface;
  window.checkDynamicCSVPrerequisites = checkDynamicCSVPrerequisites;
  window.showDynamicCSVExample = showDynamicCSVExample;
}
