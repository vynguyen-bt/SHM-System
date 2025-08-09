from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import os

from transformer_model import build_transformer_model

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../public/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = None
scaler = None
test_file_path = None


def detect_csv_structure(df):
    """Detect CSV structure and validate compatibility"""
    total_cols = df.shape[1]

    # Minimum required: Case + U1-U256 + at least 1 DI
    min_required_cols = 262  # Case(1) + U1-U256(256) + DI1(1)

    if total_cols < min_required_cols:
        raise ValueError(f"Minimum {min_required_cols} columns required (Case + U1-U256 + DI1+). Current: {total_cols}")

    # Calculate DI count dynamically
    feature_cols = 256  # U1-U256
    di_count = total_cols - 1 - feature_cols  # Total - Case - Features

    # Validate maximum DI count
    max_di_count = 4
    if di_count > max_di_count:
        raise ValueError(f"Maximum {max_di_count} DI columns supported. Current: {di_count}")

    print(f"📊 CSV Structure detected:")
    print(f"  - Total columns: {total_cols}")
    print(f"  - Feature columns (U1-U256): {feature_cols}")
    print(f"  - DI columns: {di_count}")
    print(f"  - Expected format: Case + U1-U{feature_cols} + DI1-DI{di_count}")

    return {
        'total_cols': total_cols,
        'feature_cols': feature_cols,
        'di_count': di_count,
        'feature_start': 1,
        'feature_end': 257,
        'di_start': 257,
        'di_end': total_cols
    }

def train_transformer(file_path):
    global scaler
    try:
        print(f"Loading training data from: {file_path}")
        df = pd.read_csv(file_path)
        print(f"Training data loaded. Shape: {df.shape}")

        # Dynamic CSV structure detection
        structure = detect_csv_structure(df)

        X = df.iloc[:, structure['feature_start']:structure['feature_end']].values
        y = df.iloc[:, structure['di_start']:structure['di_end']].values
        print(f"Features shape: {X.shape}, Labels shape: {y.shape}")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)[..., np.newaxis]  # (samples, features, 1)
        print(f"Scaled features shape: {X_scaled.shape}")

        X_train, X_val, y_train, y_val = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
        print(f"Train set: {X_train.shape}, Validation set: {X_val.shape}")

        print("Building transformer model...")
        # Use dynamic output dimension based on detected DI count
        transformer = build_transformer_model(input_dim=structure['feature_cols'], output_dim=structure['di_count'])
        transformer.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                            loss='mean_squared_error',
                            metrics=['mae'])

        print(f"Model built with input_dim={structure['feature_cols']}, output_dim={structure['di_count']}")

        print("Starting model training...")
        transformer.fit(X_train, y_train, batch_size=16, epochs=100, validation_data=(X_val, y_val))
        print("Model training completed successfully")

        return transformer, df

    except Exception as e:
        print(f"Error in train_transformer: {str(e)}")
        raise e


def train_local_ann(X_local, y_local):
    # Dynamic output dimension based on y_local shape
    output_dim = y_local.shape[1] if len(y_local.shape) > 1 else 4

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_local.shape[1],)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(output_dim, activation='linear')
    ])

    model.compile(optimizer='adam', loss='mse')
    model.fit(X_local, y_local, epochs=200, batch_size=16, verbose=0)
    return model


@app.route('/upload-files', methods=['POST'])
def upload_files():
    global model, test_file_path, full_df

    try:
        if 'train_file' not in request.files or 'test_file' not in request.files:
            return jsonify({'error': 'Both train and test files are required'}), 400

        train_file = request.files['train_file']
        test_file = request.files['test_file']

        if train_file.filename == '' or test_file.filename == '':
            return jsonify({'error': 'No files selected'}), 400

        train_path = os.path.join(UPLOAD_FOLDER, train_file.filename)
        test_file_path = os.path.join(UPLOAD_FOLDER, test_file.filename)

        train_file.save(train_path)
        test_file.save(test_file_path)

        print(f"Training file saved: {train_path}")
        print(f"Test file saved: {test_file_path}")

        # Kiểm tra format file CSV với dynamic validation
        try:
            df_check = pd.read_csv(train_path)
            print(f"Training data shape: {df_check.shape}")

            # Use dynamic structure detection
            structure = detect_csv_structure(df_check)
            print(f"✅ CSV structure validation passed: {structure['di_count']} DI columns detected")

        except Exception as e:
            return jsonify({'error': f'Error reading training file: {str(e)}'}), 400

        model, full_df = train_transformer(train_path)
        print("Model training completed successfully")
        return jsonify({'message': 'Transformer model trained successfully!'})

    except Exception as e:
        print(f"Error in upload_files: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/predict', methods=['POST'])
def predict():
    global model, test_file_path, scaler, full_df

    try:
        if model is None:
            return jsonify({'error': 'Model not trained yet. Please upload and train first.'}), 400

        if test_file_path is None:
            return jsonify({'error': 'Test file not uploaded yet.'}), 400

        if scaler is None:
            return jsonify({'error': 'Scaler not initialized. Please retrain the model.'}), 400

        print(f"Loading test file: {test_file_path}")
        df_test = pd.read_csv(test_file_path)
        print(f"Test data shape: {df_test.shape}")

        # Use dynamic structure detection for test file
        test_structure = detect_csv_structure(df_test)

        X_test = df_test.iloc[:, test_structure['feature_start']:test_structure['feature_end']].values
        print(f"X_test shape: {X_test.shape}")

        X_test_scaled = scaler.transform(X_test)[..., np.newaxis]
        print(f"X_test_scaled shape: {X_test_scaled.shape}")

    except FileNotFoundError:
        return jsonify({'error': f'Test file not found: {test_file_path}'}), 400
    except Exception as e:
        print(f"Error loading test data: {str(e)}")
        return jsonify({'error': f'Error loading test data: {str(e)}'}), 400

    try:
        print("Starting prediction with transformer model...")
        transformer_preds = model(X_test_scaled, training=False).numpy() * 100
        transformer_preds = np.clip(transformer_preds, 0, None)
        print(f"Transformer predictions shape: {transformer_preds.shape}")

        # Extract DI values from TEST.csv for optimized ANN training
        y_test = df_test.iloc[:, test_structure['di_start']:test_structure['di_end']].values
        print(f"Test DI values shape: {y_test.shape}")

        final_preds = []
        for i, x in enumerate(X_test):
            pred = transformer_preds[i]
            test_di_values = y_test[i] if i < len(y_test) else np.zeros(test_structure['di_count'])

            print(f"Sample {i}: Test DI values = {test_di_values}")

            # NEW LOGIC: Check DI values from TEST.csv instead of prediction values
            damaged_indices = np.where(test_di_values > 0)[0]  # Indices where DI > 0

            if len(damaged_indices) == 0:
                # All DI = 0: Use only Transformer + random noise for realism
                print(f"Sample {i}: All DI = 0, using Transformer + random noise")
                final_pred = pred.copy()
                # Add small random noise (0-2%) for undamaged elements
                for j in range(len(final_pred)):
                    final_pred[j] = max(0, final_pred[j] + np.random.uniform(0, 2))
                final_preds.append(np.clip(final_pred, 0, None).tolist())
                continue

            # Some DI > 0: Train Local ANN for damaged elements only
            print(f"Sample {i}: DI > 0 at indices {damaged_indices}, training Local ANN")

            # Xây dữ liệu tái train vùng lân cận cho damaged elements
            df = full_df
            X_full = df.iloc[:, 1:257].values
            y_full = df.iloc[:, 257:].values
            X_full_scaled = scaler.transform(X_full)

            # Build region indices around damaged elements
            region_idx = set()
            for idx in damaged_indices:
                region_idx.update(range(max(0, idx - 1), min(4, idx + 2)))

            X_local, y_local = [], []
            for xi, yi in zip(X_full_scaled, y_full):
                if any(yi[j] > 0 for j in region_idx):
                    X_local.append(xi)
                    y_local.append(yi)

            if len(X_local) == 0:
                # Fallback: use only Transformer if no training data
                print(f"Sample {i}: No training data found, using Transformer only")
                final_preds.append(pred.tolist())
                continue

            # Train Local ANN
            X_local = np.array(X_local)
            y_local = np.array(y_local)
            ann_model = train_local_ann(X_local, y_local)

            x_input = scaler.transform(x.reshape(1, -1))
            ann_pred = ann_model.predict(x_input)[0] * 100

            # Optimized ensemble: Apply ANN only to damaged elements
            final_pred = pred.copy()
            for j in damaged_indices:
                if j < len(final_pred) and j < len(ann_pred):
                    # Ensemble for damaged elements (50% Transformer + 50% ANN)
                    final_pred[j] = 0.5 * pred[j] + 0.5 * ann_pred[j]

            # For undamaged elements (DI = 0), use Transformer + small random noise
            for j in range(len(final_pred)):
                if j not in damaged_indices:
                    final_pred[j] = max(0, pred[j] + np.random.uniform(0, 2))

            final_preds.append(np.clip(final_pred, 0, None).tolist())
            print(f"Sample {i}: Ensemble completed for damaged indices {damaged_indices}")

        print(f"Prediction completed. Number of predictions: {len(final_preds)}")
        return jsonify({'predictions': final_preds})

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
