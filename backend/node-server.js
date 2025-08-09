const http = require('http');
const url = require('url');

// Simple HTTP server for testing Section 2 optimized logic
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Optimized ANN Server for Section 2',
      features: {
        optimized_ann_training: true,
        selective_ensemble: true,
        di_based_processing: true
      },
      config: {
        features: 256,
        max_di: 4,
        training_cases: 50,
        csv_columns: 261
      }
    }));
  }
  else if (req.method === 'POST' && parsedUrl.pathname === '/upload-files') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('📊 Simulating optimized CSV structure validation...');
      console.log('- Expected: 261 columns (Case + U1-U256 + DI1-DI4)');
      console.log('- Expected: 50 training cases');
      console.log('- Optimized ANN training based on DI values');
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Optimized model trained successfully!',
        structure: {
          total_cols: 261,
          feature_cols: 256,
          di_count: 4,
          training_cases: 50
        },
        optimization: {
          ann_training: 'selective_based_on_di_values',
          performance_improvement: 'up_to_75_percent_faster',
          logic: 'di_zero_skip_ann_training'
        }
      }));
    });
  }
  else if (req.method === 'POST' && parsedUrl.pathname === '/predict') {
    console.log('🔮 Generating optimized predictions with selective ANN training...');
    
    // Simulate different TEST.csv scenarios
    const scenarios = [
      { di: [0, 0, 0, 0], name: 'All undamaged' },
      { di: [0, 0.1, 0, 0.05], name: 'Partial damage' },
      { di: [0.05, 0.1, 0.08, 0.12], name: 'Full damage' }
    ];
    
    // Use random scenario for demo
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const testDiValues = scenario.di;
    const damagedIndices = testDiValues.map((val, i) => val > 0 ? i : -1).filter(i => i >= 0);
    
    console.log(`📊 Scenario: ${scenario.name}`);
    console.log(`📊 TEST.csv DI values: ${testDiValues}`);
    console.log(`🎯 Damaged indices: ${damagedIndices}`);
    
    // Generate optimized predictions
    const pred = [0, 0, 0, 0];
    let annTrainingSkipped = 0;
    let annTrainingPerformed = 0;
    
    for (let i = 0; i < 4; i++) {
      if (damagedIndices.includes(i)) {
        // Damaged elements: Use ensemble (5-25%)
        pred[i] = Math.round((5 + Math.random() * 20) * 100) / 100;
        annTrainingPerformed++;
        console.log(`   DI${i+1}: ${pred[i]}% (damaged → ANN ensemble)`);
      } else {
        // Undamaged elements: Transformer + noise (0-2%)
        pred[i] = Math.round((Math.random() * 2) * 100) / 100;
        annTrainingSkipped++;
        console.log(`   DI${i+1}: ${pred[i]}% (undamaged → Transformer only)`);
      }
    }
    
    const performanceImprovement = (annTrainingSkipped / 4) * 100;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      predictions: [pred],
      message: `Optimized prediction completed - ${scenario.name} scenario`,
      optimization_results: {
        scenario: scenario.name,
        test_di_values: testDiValues,
        damaged_indices: damagedIndices,
        undamaged_indices: [0, 1, 2, 3].filter(i => !damagedIndices.includes(i)),
        ann_training_skipped: annTrainingSkipped,
        ann_training_performed: annTrainingPerformed,
        performance_improvement_percent: Math.round(performanceImprovement * 10) / 10,
        computational_savings: `${annTrainingSkipped}/4 ANN trainings skipped`
      },
      model_info: {
        features: 256,
        outputs: 4,
        structure: 'Optimized Transformer + Selective ANN',
        logic: 'DI-based selective training'
      }
    }));
    
    console.log(`✅ Optimization: ${annTrainingSkipped}/4 ANN trainings skipped (${performanceImprovement.toFixed(1)}% faster)`);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`🚀 Optimized ANN Test Server`);
  console.log(`⚡ Testing: Selective ANN training based on DI values`);
  console.log(`📊 Structure: 256 features, 4 DI, 50 training cases`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  / - Server status`);
  console.log(`   POST /upload-files - Optimized training simulation`);
  console.log(`   POST /predict - Selective ANN prediction`);
  console.log(`🔧 CORS enabled for frontend testing`);
  console.log(`⏹️  Press Ctrl+C to stop`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
    console.log(`💡 Try: netstat -ano | findstr :${PORT}`);
    console.log(`💡 Then: taskkill /PID <PID> /F`);
  } else {
    console.error('Server error:', err);
  }
});
