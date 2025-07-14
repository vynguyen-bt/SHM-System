const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Backend is running',
    message: 'SHM-BIM-FEM Backend API (Test Version)',
    timestamp: new Date().toISOString()
  });
});

// Upload files endpoint (simplified)
app.post('/upload-files', (req, res) => {
  console.log('📤 Upload files request received');
  
  res.json({
    message: 'Files uploaded and model trained successfully!',
    train_shape: [20, 655],
    test_shape: [1, 655],
    model_info: {
      trained: true,
      timestamp: new Date().toISOString(),
      features: 651,
      outputs: 3
    }
  });
});

// Predict endpoint (simplified)
app.post('/predict', (req, res) => {
  console.log('🔮 Predict request received');
  
  // Generate realistic predictions for 3 damage indices
  const predictions = [[
    Math.random() * 5 + 1,    // DI1: 1-6%
    Math.random() * 15 + 10,  // DI2: 10-25% (highest)
    Math.random() * 8 + 2     // DI3: 2-10%
  ]];
  
  res.json({
    predictions: predictions,
    message: 'Prediction completed for 1 samples',
    model_info: {
      trained: true,
      timestamp: new Date().toISOString(),
      features: 651,
      outputs: 3
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SHM-BIM-FEM Test Backend Server Started');
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log('🔧 Simplified version for testing');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});
