#!/usr/bin/env python3
"""
Simplified backend for testing SHM-BIM-FEM system
"""

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import pandas as pd
    import numpy as np
    import os
    import traceback
    
    print("✓ All imports successful")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages:")
    print("pip install flask flask-cors pandas numpy scikit-learn tensorflow")
    exit(1)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../public/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables
model = None
scaler = None
test_file_path = None
full_df = None

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'Backend is running',
        'message': 'SHM-BIM-FEM Backend API',
        'version': '2.0 (651 features)'
    })

@app.route('/upload-files', methods=['POST'])
def upload_files():
    """Upload and process training/test files"""
    global model, test_file_path, full_df
    
    try:
        print("=== Upload Files Request ===")
        
        # Check files
        if 'train_file' not in request.files or 'test_file' not in request.files:
            return jsonify({'error': 'Both train and test files are required'}), 400

        train_file = request.files['train_file']
        test_file = request.files['test_file']
        
        if train_file.filename == '' or test_file.filename == '':
            return jsonify({'error': 'No files selected'}), 400

        # Save files
        train_path = os.path.join(UPLOAD_FOLDER, train_file.filename)
        test_file_path = os.path.join(UPLOAD_FOLDER, test_file.filename)
        
        train_file.save(train_path)
        test_file.save(test_file_path)
        
        print(f"✓ Files saved: {train_path}, {test_file_path}")

        # Validate file format
        try:
            df_train = pd.read_csv(train_path)
            df_test = pd.read_csv(test_file_path)
            
            print(f"✓ Training data shape: {df_train.shape}")
            print(f"✓ Test data shape: {df_test.shape}")
            
            if df_train.shape[1] < 662:
                return jsonify({
                    'error': f'Training file must have 662 columns (Case + U1-U651 + DI1-DI10). Current: {df_train.shape[1]}'
                }), 400
                
            if df_test.shape[1] < 662:
                return jsonify({
                    'error': f'Test file must have 662 columns (Case + U1-U651 + DI1-DI10). Current: {df_test.shape[1]}'
                }), 400
                
        except Exception as e:
            return jsonify({'error': f'Error reading CSV files: {str(e)}'}), 400

        # Simulate training (for testing purposes)
        print("✓ Simulating model training...")
        model = "trained_model_placeholder"
        full_df = df_train
        
        return jsonify({
            'message': 'Files uploaded and model trained successfully!',
            'train_shape': df_train.shape,
            'test_shape': df_test.shape
        })
        
    except Exception as e:
        print(f"❌ Error in upload_files: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict damage levels"""
    global model, test_file_path, full_df
    
    try:
        print("=== Predict Request ===")
        
        # Check if model is ready
        if model is None:
            return jsonify({'error': 'Model not trained yet. Please upload and train first.'}), 400
        
        if test_file_path is None:
            return jsonify({'error': 'Test file not uploaded yet.'}), 400

        # Load test data
        print(f"✓ Loading test file: {test_file_path}")
        df_test = pd.read_csv(test_file_path)
        print(f"✓ Test data shape: {df_test.shape}")
        
        if df_test.shape[1] < 662:
            return jsonify({
                'error': f'Test file must have 662 columns. Current: {df_test.shape[1]}'
            }), 400

        # Extract features (U1-U651)
        X_test = df_test.iloc[:, 1:652].values
        print(f"✓ Features shape: {X_test.shape}")
        
        # Simulate predictions (for testing purposes)
        print("✓ Generating simulated predictions...")
        num_samples = X_test.shape[0]
        
        # Create realistic-looking predictions
        predictions = []
        for i in range(num_samples):
            # Simulate 10 damage indices with some random values
            pred = np.random.uniform(0, 20, 10).tolist()
            # Make some values higher to simulate damage
            pred[2] = 15.5  # DI3 has damage
            pred[4] = 8.2   # DI5 has some damage
            predictions.append(pred)
        
        print(f"✓ Generated {len(predictions)} predictions")
        print(f"✓ Sample prediction: {predictions[0][:5]}...")
        
        return jsonify({
            'predictions': predictions,
            'message': f'Prediction completed for {len(predictions)} samples'
        })
        
    except FileNotFoundError:
        return jsonify({'error': f'Test file not found: {test_file_path}'}), 400
    except Exception as e:
        print(f"❌ Error in predict: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting SHM-BIM-FEM Backend (Simple Version)")
    print("📊 Supports 651 features (U1-U651) + 10 damage indices (DI1-DI10)")
    print("🌐 Server will run on http://localhost:5000")
    print("=" * 50)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("Make sure port 5000 is not in use by another application")
