#!/usr/bin/env python3
"""
Simple HTTP server for testing Section 2 optimized ANN logic
No external dependencies required
"""

import json
import random
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

class OptimizedANNHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'status': 'ok',
            'message': 'Optimized ANN Server for Section 2',
            'features': {
                'optimized_ann_training': True,
                'selective_ensemble': True,
                'di_based_processing': True
            },
            'config': {
                'features': 256,
                'max_di': 4,
                'training_cases': 50,
                'csv_columns': 261
            }
        }
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        """Handle POST requests"""
        path = self.path
        
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        
        if path == '/upload-files':
            self.handle_upload()
        elif path == '/predict':
            self.handle_predict()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())

    def handle_upload(self):
        """Handle file upload and training simulation"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
            
            print("📊 Simulating optimized CSV structure validation...")
            print("- Expected: 261 columns (Case + U1-U256 + DI1-DI4)")
            print("- Expected: 50 training cases")
            print("- Optimized ANN training based on DI values")
            
            self.send_response(200)
            self.end_headers()
            
            response = {
                'message': 'Optimized model trained successfully!',
                'structure': {
                    'total_cols': 261,
                    'feature_cols': 256,
                    'di_count': 4,
                    'training_cases': 50
                },
                'optimization': {
                    'ann_training': 'selective_based_on_di_values',
                    'performance_improvement': 'up_to_75_percent_faster',
                    'logic': 'di_zero_skip_ann_training'
                }
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def handle_predict(self):
        """Handle optimized prediction requests"""
        try:
            print("🔮 Generating optimized predictions with selective ANN training...")
            
            # Use FIXED pattern to match frontend createTestCsvContent()
            scenario = {'di': [0, 0.1, 0.2, 0], 'name': 'Fixed optimization pattern'}
            test_di_values = scenario['di']
            damaged_indices = [i for i, val in enumerate(test_di_values) if val > 0]
            
            print(f"📊 Scenario: {scenario['name']}")
            print(f"📊 TEST.csv DI values: {test_di_values}")
            print(f"🎯 Damaged indices: {damaged_indices}")
            
            # Generate optimized predictions
            predictions = [[]]
            pred = [0, 0, 0, 0]
            
            ann_training_skipped = 0
            ann_training_performed = 0
            
            for i in range(4):
                if i in damaged_indices:
                    # Damaged elements: Use ensemble (5-25%)
                    pred[i] = round(random.uniform(5, 25), 2)
                    ann_training_performed += 1
                    print(f"   DI{i+1}: {pred[i]}% (damaged → ANN ensemble)")
                else:
                    # Undamaged elements: Transformer + noise (0-2%)
                    pred[i] = round(random.uniform(0, 2), 2)
                    ann_training_skipped += 1
                    print(f"   DI{i+1}: {pred[i]}% (undamaged → Transformer only)")
            
            predictions[0] = pred
            
            performance_improvement = (ann_training_skipped / 4) * 100
            
            self.send_response(200)
            self.end_headers()
            
            response = {
                'predictions': predictions,
                'message': f'Optimized prediction completed - {scenario["name"]} scenario',
                'optimization_results': {
                    'scenario': scenario['name'],
                    'test_di_values': test_di_values,
                    'damaged_indices': damaged_indices,
                    'undamaged_indices': [i for i in range(4) if i not in damaged_indices],
                    'ann_training_skipped': ann_training_skipped,
                    'ann_training_performed': ann_training_performed,
                    'performance_improvement_percent': round(performance_improvement, 1),
                    'computational_savings': f"{ann_training_skipped}/4 ANN trainings skipped"
                },
                'model_info': {
                    'features': 256,
                    'outputs': 4,
                    'structure': 'Optimized Transformer + Selective ANN',
                    'logic': 'DI-based selective training'
                }
            }
            
            self.wfile.write(json.dumps(response).encode())
            
            print(f"✅ Optimization: {ann_training_skipped}/4 ANN trainings skipped ({performance_improvement:.1f}% faster)")
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{self.address_string()}] {format % args}")

def run_server(port=5001):
    """Run the optimized ANN test server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, OptimizedANNHandler)
    
    print(f"🚀 Optimized ANN Test Server")
    print(f"⚡ Testing: Selective ANN training based on DI values")
    print(f"📊 Structure: 256 features, 4 DI, 50 training cases")
    print(f"🌐 Server running on http://localhost:{port}")
    print(f"📋 Endpoints:")
    print(f"   GET  / - Server status")
    print(f"   POST /upload-files - Optimized training simulation")
    print(f"   POST /predict - Selective ANN prediction")
    print(f"🔧 CORS enabled for frontend testing")
    print(f"⏹️  Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Optimized ANN server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
