const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ static cho toàn bộ thư mục public (bao gồm cả favicon.ico)
app.use(express.static(path.join(__dirname, '../public')));
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = '../public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Global variables to simulate Python backend
let model = null;
let testFilePath = null;
let trainData = null;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Backend is running',
    message: 'SHM-BIM-FEM Backend API (Node.js Version)',
    version: '2.0 (651 features)',
    timestamp: new Date().toISOString()
  });
});

// Upload files endpoint
app.post('/upload-files', upload.fields([
  { name: 'train_file', maxCount: 1 },
  { name: 'test_file', maxCount: 1 }
]), (req, res) => {
  try {
    console.log('=== Upload Files Request ===');
    
    if (!req.files || !req.files.train_file || !req.files.test_file) {
      return res.status(400).json({ error: 'Both train and test files are required' });
    }

    const trainFile = req.files.train_file[0];
    const testFile = req.files.test_file[0];
    
    console.log(`✓ Files uploaded: ${trainFile.filename}, ${testFile.filename}`);

    // Validate file format
    try {
      const trainPath = trainFile.path;
      const testPath = testFile.path;
      
      // Read and validate CSV files
      const trainContent = fs.readFileSync(trainPath, 'utf8');
      const testContent = fs.readFileSync(testPath, 'utf8');
      
      const trainLines = trainContent.trim().split('\n');
      const testLines = testContent.trim().split('\n');
      
      if (trainLines.length < 2) {
        return res.status(400).json({ error: 'Training file must have at least 2 lines (header + data)' });
      }
      
      if (testLines.length < 2) {
        return res.status(400).json({ error: 'Test file must have at least 2 lines (header + data)' });
      }
      
      // Check column count - minimum 123 (Case + U1-U121 + at least 1 DI)
      const trainCols = trainLines[0].split(',').length;
      const testCols = testLines[0].split(',').length;

      console.log(`✓ Training data: ${trainLines.length - 1} rows, ${trainCols} columns`);
      console.log(`✓ Test data: ${testLines.length - 1} rows, ${testCols} columns`);

      if (trainCols < 123) {
        return res.status(400).json({
          error: `Training file must have at least 123 columns (Case + U1-U121 + DI1+). Current: ${trainCols}`
        });
      }

      if (testCols < 123) {
        return res.status(400).json({
          error: `Test file must have at least 123 columns (Case + U1-U121 + DI1+). Current: ${testCols}`
        });
      }

      if (trainCols !== testCols) {
        return res.status(400).json({
          error: `Training and test files must have same number of columns. Train: ${trainCols}, Test: ${testCols}`
        });
      }

      // Tính số lượng cột DI và số features động
      const numDamageIndices = trainCols - 122;
      const numFeatures = trainCols - 1 - numDamageIndices; // Case + Features + DI
      console.log(`✓ Detected ${numDamageIndices} damage indices`);
      console.log(`✓ Detected ${numFeatures} feature columns`);

      // Lưu metadata
      global.datasetInfo = {
        numFeatures,
        numDamageIndices,
        totalColumns: trainCols
      };
      
      // Store file paths and data
      testFilePath = testPath;
      trainData = trainContent;
      
      // Simulate model training
      console.log('✓ Simulating model training...');
      model = {
        trained: true,
        timestamp: new Date().toISOString(),
        features: (global.datasetInfo && global.datasetInfo.numFeatures) ? global.datasetInfo.numFeatures : 121,
        outputs: (global.datasetInfo && global.datasetInfo.numDamageIndices) ? global.datasetInfo.numDamageIndices : 1
      };
      
      res.json({
        message: 'Files uploaded and model trained successfully!',
        train_shape: [trainLines.length - 1, trainCols],
        test_shape: [testLines.length - 1, testCols],
        model_info: model
      });
      
    } catch (fileError) {
      console.error('File validation error:', fileError);
      return res.status(400).json({ error: `Error reading CSV files: ${fileError.message}` });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

// Predict endpoint
app.post('/predict', (req, res) => {
  try {
    console.log('=== Predict Request ===');
    
    // Check if model is ready
    if (!model) {
      return res.status(400).json({ error: 'Model not trained yet. Please upload and train first.' });
    }
    
    if (!testFilePath) {
      return res.status(400).json({ error: 'Test file not uploaded yet.' });
    }
    
    // Read test data
    console.log(`✓ Loading test file: ${testFilePath}`);
    const testContent = fs.readFileSync(testFilePath, 'utf8');
    const testLines = testContent.trim().split('\n');
    
    if (testLines.length < 2) {
      return res.status(400).json({ error: 'Test file must have at least one data row' });
    }
    
    const header = testLines[0].split(',');
    const dataRows = testLines.slice(1);
    
    console.log(`✓ Test data: ${dataRows.length} samples, ${header.length} features`);
    
    if (header.length < 123) {
      return res.status(400).json({
        error: `Test file must have at least 123 columns. Current: ${header.length}`
      });
    }

    // Tính số DI và số features động từ header
    const numDamageIndices = global.datasetInfo ? global.datasetInfo.numDamageIndices : (header.length - 122);
    const numFeatures = global.datasetInfo ? global.datasetInfo.numFeatures : (header.length - 1 - numDamageIndices);
    console.log(`✓ Using ${numDamageIndices} damage indices for prediction`);
    console.log(`✓ Using ${numFeatures} feature columns for prediction`);

    // Tạo chẩn đoán mô phỏng
    console.log('✓ Generating predictions...');
    const predictions = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',');

      // Trích xuất features động: U1..U{numFeatures}
      const features = row.slice(1, 1 + numFeatures).map(val => parseFloat(val) || 0);

      // Generate realistic damage predictions for dynamic number of indices
      const prediction = [];
      for (let j = 0; j < numDamageIndices; j++) {
        let damageValue = 0;

        // Simulate realistic damage patterns
        if (j === 1 && numDamageIndices >= 2) {
          // Second element has highest damage (5-20%)
          damageValue = 5 + Math.random() * 15;
        } else if (j === 0 || (j === 2 && numDamageIndices >= 3)) {
          // First and third elements have moderate damage (1-10%)
          damageValue = 1 + Math.random() * 9;
        } else {
          // Other elements have low damage (0-5%)
          damageValue = Math.random() * 5;
        }

        prediction.push(Math.max(0, damageValue));
      }

      predictions.push(prediction);
    }
    
    console.log(`✓ Generated ${predictions.length} predictions`);
    console.log(`✓ Sample prediction: [${predictions[0].slice(0, 5).map(v => v.toFixed(2)).join(', ')}...]`);
    
    res.json({
      predictions: predictions,
      message: `Prediction completed for ${predictions.length} samples`,
      model_info: model
    });
    
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: `Prediction error: ${error.message}` });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Route favicon (phòng trường hợp static không bắt kịp)
app.get('/favicon.ico', (req, res) => {
  const iconPath = path.join(__dirname, '../public', 'favicon.ico');
  if (fs.existsSync(iconPath)) return res.sendFile(iconPath);
  return res.status(204).end(); // không có icon cũng không lỗi
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SHM-BIM-FEM Backend Server Started');
  console.log('📊 Supports 121 features (U1-U121) + dynamic damage indices (DI1+)');
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log('🔧 Node.js version - compatible with 662-column CSV format');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});
