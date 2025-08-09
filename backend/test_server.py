#!/usr/bin/env python3
"""
Test server for Section 2 updates validation
Tests new CSV structure: 256 features, 4 DI, 50 training cases
"""

import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.parse

class TestHandler(BaseHTTPRequestHandler):
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
            'message': 'Test server for Section 2 updates',
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
        parsed_path = urlparse(self.path)
        
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        
        if parsed_path.path == '/upload-files':
            self.handle_upload()
        elif parsed_path.path == '/predict':
            self.handle_predict()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())

    def handle_upload(self):
        """Handle file upload and training"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Simulate CSV structure validation
            print("📊 Simulating CSV structure validation...")
            print("- Expected: 261 columns (Case + U1-U256 + DI1-DI4)")
            print("- Expected: 50 training cases")
            print("- Feature range: columns 1-256")
            print("- DI range: columns 257-260")
            
            self.send_response(200)
            self.end_headers()
            
            response = {
                'message': 'Model trained successfully with new structure!',
                'structure': {
                    'total_cols': 261,
                    'feature_cols': 256,
                    'di_count': 4,
                    'training_cases': 50
                },
                'validation': {
                    'csv_structure': 'PASS',
                    'feature_count': 'PASS',
                    'di_count': 'PASS',
                    'training_cases': 'PASS'
                }
            }
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def handle_predict(self):
        """Handle prediction requests"""
        try:
            print("🔮 Generating optimized mock predictions for 4 DI...")

            # Simulate TEST.csv DI values for optimization testing
            # Mock scenario: DI1=0, DI2=0.1 (>0), DI3=0, DI4=0.05 (>0)
            mock_test_di = [0, 0.1, 0, 0.05]  # DI values from TEST.csv
            damaged_indices = [i for i, val in enumerate(mock_test_di) if val > 0]

            print(f"📊 Mock TEST.csv DI values: {mock_test_di}")
            print(f"🎯 Damaged indices (DI > 0): {damaged_indices}")

            # Generate predictions based on optimization logic
            predictions = [[]]
            pred = [0, 0, 0, 0]

            for i in range(4):
                if i in damaged_indices:
                    # Damaged elements: Use ensemble (higher values 5-25%)
                    pred[i] = round(random.uniform(5, 25), 2)
                    print(f"   DI{i+1}: {pred[i]}% (damaged, used ANN ensemble)")
                else:
                    # Undamaged elements: Use Transformer + noise (0-2%)
                    pred[i] = round(random.uniform(0, 2), 2)
                    print(f"   DI{i+1}: {pred[i]}% (undamaged, Transformer only)")

            predictions[0] = pred
            
            self.send_response(200)
            self.end_headers()
            
            response = {
                'predictions': predictions,
                'message': 'Optimized prediction completed for 1 sample with 4 DI',
                'model_info': {
                    'trained': True,
                    'features': 256,
                    'outputs': 4,
                    'structure': 'Optimized Transformer + Selective ANN ensemble',
                    'csv_format': 'Case + U1-U256 + DI1-DI4'
                },
                'optimization': {
                    'test_di_values': mock_test_di,
                    'damaged_indices': damaged_indices,
                    'undamaged_indices': [i for i in range(4) if i not in damaged_indices],
                    'ann_training_skipped': len([i for i in range(4) if i not in damaged_indices]),
                    'performance_improvement': 'ANN training skipped for undamaged elements'
                },
                'validation': {
                    'prediction_count': len(predictions[0]),
                    'expected_di_count': 4,
                    'structure_match': len(predictions[0]) == 4
                }
            }
            self.wfile.write(json.dumps(response).encode())
            
            print(f"✅ Sent predictions: {predictions[0]}")
            print(f"📊 DI count: {len(predictions[0])} (expected: 4)")
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{self.address_string()}] {format % args}")

def run_server(port=5001):
    """Run the test server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, TestHandler)
    
    print(f"🚀 Test Server for Section 2 Updates")
    print(f"📊 Testing: 256 features, 4 DI, 50 training cases")
    print(f"🌐 Server running on http://localhost:{port}")
    print(f"📋 Endpoints:")
    print(f"   GET  / - Server status")
    print(f"   POST /upload-files - File upload simulation")
    print(f"   POST /predict - Prediction simulation")
    print(f"🔧 CORS enabled for frontend testing")
    print(f"⏹️  Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
