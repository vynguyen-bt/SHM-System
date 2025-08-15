// Integrated CSV generator - automatically generates both TEST.csv and TRAIN.csv

async function generateBothCsvFiles() {
  console.log('🔧 === INTEGRATED CSV GENERATION ===\n');
  console.log('📊 Generating both TEST.csv and TRAIN.csv automatically...\n');
  
  try {
    // Step 1: Generate TEST.csv
    console.log('📊 Step 1: Generating TEST.csv...');
    const testCsvSuccess = await generateTestCsvFile();
    
    if (!testCsvSuccess) {
      console.log('❌ TEST.csv generation failed');
      alert('❌ Không thể tạo TEST.csv!\n\nVui lòng kiểm tra:\n- Section 1 đã chạy\n- Damage.txt đã load\n- Damaged elements có sẵn');
      return false;
    }
    
    console.log('✅ TEST.csv generated successfully\n');
    
    // Step 2: Generate TRAIN.csv
    console.log('📊 Step 2: Generating TRAIN.csv...');
    const trainCsvSuccess = await generateTrainCsvFile();
    
    if (!trainCsvSuccess) {
      console.log('⚠️ TRAIN.csv generation failed - no training case files found');
      console.log('✅ TEST.csv generated successfully (TRAIN.csv skipped)');
      
      alert('✅ TEST.csv generated successfully!\n\n' +
            '⚠️ TRAIN.csv không được tạo do không tìm thấy training case files.\n\n' +
            '💡 Để tạo TRAIN.csv, load các files có format:\n' +
            'ID_2134-th0.2_2-05_20250814_220218');
      
      return true; // TEST.csv thành công
    }
    
    console.log('✅ TRAIN.csv generated successfully\n');
    console.log('🎉 Both TEST.csv and TRAIN.csv generated successfully!');
    
    alert('🎉 Thành công!\n\n' +
          '✅ TEST.csv: Generated with raw values + correct DI\n' +
          '✅ TRAIN.csv: Generated from training case files\n\n' +
          '📊 Both files downloaded automatically!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in integrated CSV generation:', error);
    alert('❌ Lỗi khi tạo CSV files!\n\n' + error.message);
    return false;
  }
}

async function generateTestCsvFile() {
  console.log('   🔧 Creating TEST.csv...');

  try {
    // Check if required functions exist
    if (typeof getDamagedElementsList !== 'function') {
      console.log('   ❌ getDamagedElementsList function not available');
      return false;
    }

    if (typeof createTestCsvContent !== 'function') {
      console.log('   ❌ createTestCsvContent function not available');
      return false;
    }

    // Check prerequisites
    const damagedElements = getDamagedElementsList();
    if (!damagedElements || damagedElements.length === 0) {
      console.log('   ❌ No damaged elements found');
      return false;
    }
    
    console.log(`   📊 Damaged elements: ${damagedElements.length}`);
    
    // Generate TEST.csv content
    const testCsvContent = await createTestCsvContent();
    
    if (!testCsvContent || testCsvContent.trim().length === 0) {
      console.log('   ❌ Empty TEST.csv content');
      return false;
    }
    
    // Download TEST.csv
    const blob = new Blob([testCsvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TEST.csv';
    link.click();
    
    // Log structure info
    const lines = testCsvContent.split('\n');
    const header = lines[0];
    const columns = header.split(',');
    const featureColumns = columns.filter(col => col.startsWith('U'));
    const diColumns = columns.filter(col => col.startsWith('DI'));
    
    console.log(`   ✅ TEST.csv: ${featureColumns.length} features, ${diColumns.length} DI columns`);
    console.log(`   📁 TEST.csv downloaded`);
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Error generating TEST.csv:', error);
    return false;
  }
}

async function generateTrainCsvFile() {
  console.log('   🔧 Creating TRAIN.csv...');

  try {
    // Check if required functions exist
    if (typeof getDamagedElementsList !== 'function') {
      console.log('   ❌ getDamagedElementsList function not available');
      return false;
    }

    if (typeof createTrainCsvContent !== 'function') {
      console.log('   ❌ createTrainCsvContent function not available');
      return false;
    }

    // Check for training case files
    const trainingCases = await findTrainingCaseFiles();

    if (!trainingCases || trainingCases.length === 0) {
      console.log('   ⚠️ No training case files found');
      return false;
    }
    
    console.log(`   📊 Found ${trainingCases.length} training case files`);
    
    // Get structure from TEST.csv
    const damagedElements = getDamagedElementsList();
    const featureCount = await getFeatureCountFromTestStructure();
    
    console.log(`   📊 Structure: ${featureCount} features, ${damagedElements.length} DI columns`);
    
    // Generate TRAIN.csv content
    const trainCsvContent = await createTrainCsvContent(trainingCases, damagedElements, featureCount);
    
    if (!trainCsvContent || trainCsvContent.trim().length === 0) {
      console.log('   ❌ Empty TRAIN.csv content');
      return false;
    }
    
    // Download TRAIN.csv
    const blob = new Blob([trainCsvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'TRAIN.csv';
    link.click();
    
    // Log structure info
    const lines = trainCsvContent.split('\n');
    console.log(`   ✅ TRAIN.csv: ${trainingCases.length} training cases`);
    console.log(`   📁 TRAIN.csv downloaded`);
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Error generating TRAIN.csv:', error);
    return false;
  }
}

async function findTrainingCaseFiles() {
  console.log('   🔍 Searching for training case files...');

  // Check all file inputs for training case files
  const fileInputs = [
    document.getElementById("txt-file-training"),
    document.getElementById("txt-file-healthy"),
    document.getElementById("txt-file-damaged"),
    document.getElementById("txt-file-simulation")
  ];

  // Also check for files in browser's file system if available
  const additionalInputs = document.querySelectorAll('input[type="file"]');
  additionalInputs.forEach(input => {
    if (!fileInputs.includes(input)) {
      fileInputs.push(input);
    }
  });
  
  const trainingCases = [];
  
  for (const input of fileInputs) {
    if (input && input.files) {
      Array.from(input.files).forEach(file => {
        if (typeof parseTrainingCaseFileName === 'function') {
          const parsedCase = parseTrainingCaseFileName(file.name);
          if (parsedCase) {
            parsedCase.fileObject = file;
            trainingCases.push(parsedCase);
            console.log(`   ✅ Found: ${file.name} → DI = ${parsedCase.diValue}`);
          }
        }
      });
    }
  }
  
  // Sort by damage value for consistent ordering
  trainingCases.sort((a, b) => a.damageValue - b.damageValue);
  
  console.log(`   📊 Total training cases found: ${trainingCases.length}`);
  
  return trainingCases;
}

function showIntegratedCsvProgress() {
  // Create progress indicator
  const progressDiv = document.createElement('div');
  progressDiv.id = 'csv-generation-progress';
  progressDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: white;
    border: 2px solid #007BFF;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    z-index: 10001;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  progressDiv.innerHTML = `
    <h4 style="margin: 0 0 15px 0; color: #007BFF;">
      🔧 Generating CSV Files
    </h4>
    <div id="progress-status" style="margin: 15px 0; font-size: 14px;">
      📊 Preparing to generate TEST.csv and TRAIN.csv...
    </div>
    <div style="width: 100%; background: #f0f0f0; border-radius: 10px; margin: 15px 0;">
      <div id="progress-bar" style="width: 0%; height: 20px; background: #007BFF; border-radius: 10px; transition: width 0.3s;"></div>
    </div>
    <div id="progress-details" style="font-size: 12px; color: #666;">
      Starting...
    </div>
  `;
  
  document.body.appendChild(progressDiv);
  
  return {
    updateStatus: (status, progress, details) => {
      const statusEl = document.getElementById('progress-status');
      const barEl = document.getElementById('progress-bar');
      const detailsEl = document.getElementById('progress-details');
      
      if (statusEl) statusEl.textContent = status;
      if (barEl) barEl.style.width = progress + '%';
      if (detailsEl) detailsEl.textContent = details;
    },
    close: () => {
      const div = document.getElementById('csv-generation-progress');
      if (div) div.remove();
    }
  };
}

async function generateBothCsvFilesWithProgress() {
  const progress = showIntegratedCsvProgress();
  
  try {
    // Step 1: Generate TEST.csv
    progress.updateStatus('📊 Generating TEST.csv...', 25, 'Processing damage data and DI values');
    await new Promise(resolve => setTimeout(resolve, 500)); // Visual delay
    
    const testCsvSuccess = await generateTestCsvFile();
    
    if (!testCsvSuccess) {
      progress.close();
      alert('❌ Không thể tạo TEST.csv!\n\nVui lòng kiểm tra:\n- Section 1 đã chạy\n- Damage.txt đã load');
      return false;
    }
    
    progress.updateStatus('✅ TEST.csv completed', 50, 'TEST.csv downloaded successfully');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Generate TRAIN.csv
    progress.updateStatus('📊 Generating TRAIN.csv...', 75, 'Processing training case files');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trainCsvSuccess = await generateTrainCsvFile();
    
    if (!trainCsvSuccess) {
      progress.updateStatus('⚠️ TRAIN.csv skipped', 100, 'No training case files found');
      await new Promise(resolve => setTimeout(resolve, 1000));
      progress.close();
      
      alert('✅ TEST.csv generated successfully!\n\n' +
            '⚠️ TRAIN.csv không được tạo do không tìm thấy training case files.\n\n' +
            '💡 Load files có format: ID_2134-th0.2_2-05_20250814_220218');
      return true;
    }
    
    progress.updateStatus('🎉 Both files completed!', 100, 'TEST.csv and TRAIN.csv downloaded');
    await new Promise(resolve => setTimeout(resolve, 1000));
    progress.close();
    
    alert('🎉 Thành công!\n\n' +
          '✅ TEST.csv: Generated with raw values + correct DI\n' +
          '✅ TRAIN.csv: Generated from training case files\n\n' +
          '📊 Both files downloaded automatically!');
    
    return true;
    
  } catch (error) {
    progress.close();
    console.error('❌ Error in integrated CSV generation:', error);
    alert('❌ Lỗi khi tạo CSV files!\n\n' + error.message);
    return false;
  }
}

// Backup function to maintain compatibility with old processFilestrain
function processFilestrain() {
  console.log('📊 processFilestrain called - redirecting to integrated CSV generation');
  return generateBothCsvFilesWithProgress();
}

// Export functions
if (typeof window !== 'undefined') {
  window.generateBothCsvFiles = generateBothCsvFiles;
  window.generateTestCsvFile = generateTestCsvFile;
  window.generateTrainCsvFile = generateTrainCsvFile;
  window.findTrainingCaseFiles = findTrainingCaseFiles;
  window.generateBothCsvFilesWithProgress = generateBothCsvFilesWithProgress;
  window.processFilestrain = processFilestrain; // Backup compatibility
}
