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


def train_transformer(file_path):
    global scaler
    df = pd.read_csv(file_path)

    X = df.iloc[:, 1:12].values
    y = df.iloc[:, 12:].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)[..., np.newaxis]  # (samples, features, 1)

    X_train, X_val, y_train, y_val = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    transformer = build_transformer_model(input_dim=11, output_dim=10)
    transformer.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                        loss='mean_squared_error',
                        metrics=['mae'])
    transformer.fit(X_train, y_train, batch_size=16, epochs=100, validation_data=(X_val, y_val))

    return transformer, df


def train_local_ann(X_local, y_local):
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_local.shape[1],)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10, activation='linear')
    ])

    model.compile(optimizer='adam', loss='mse')
    model.fit(X_local, y_local, epochs=200, batch_size=16, verbose=0)
    return model


@app.route('/upload-files', methods=['POST'])
def upload_files():
    global model, test_file_path, full_df

    if 'train_file' not in request.files or 'test_file' not in request.files:
        return jsonify({'error': 'Both train and test files are required'}), 400

    train_file = request.files['train_file']
    train_path = os.path.join(UPLOAD_FOLDER, train_file.filename)
    train_file.save(train_path)

    test_file = request.files['test_file']
    test_file_path = os.path.join(UPLOAD_FOLDER, test_file.filename)
    test_file.save(test_file_path)

    model, full_df = train_transformer(train_path)
    return jsonify({'message': 'Transformer model trained successfully!'})


@app.route('/predict', methods=['POST'])
def predict():
    global model, test_file_path, scaler, full_df

    if model is None or test_file_path is None:
        return jsonify({'error': 'Model or test file not ready'}), 400

    df_test = pd.read_csv(test_file_path)
    X_test = df_test.iloc[:, 1:12].values
    X_test_scaled = scaler.transform(X_test)[..., np.newaxis]

    transformer_preds = model(X_test_scaled, training=False).numpy() * 100
    transformer_preds = np.clip(transformer_preds, 0, None)

    final_preds = []
    for i, x in enumerate(X_test):
        pred = transformer_preds[i]
        # Lấy các chỉ số có giá trị đáng kể (hư hỏng)
        top_idx = np.where(pred > 5)[0]  # ngưỡng có thể điều chỉnh
        if len(top_idx) == 0:
            final_preds.append(pred.tolist())
            continue

        # Xây dữ liệu tái train vùng lân cận
        df = full_df
        X_full = df.iloc[:, 1:12].values
        y_full = df.iloc[:, 12:].values
        X_full_scaled = scaler.transform(X_full)

        region_idx = set()
        for idx in top_idx:
            region_idx.update(range(max(0, idx - 1), min(10, idx + 2)))

        X_local, y_local = [], []
        for xi, yi in zip(X_full_scaled, y_full):
            if any(yi[j] > 0 for j in region_idx):
                X_local.append(xi)
                y_local.append(yi)

        if len(X_local) == 0:
            final_preds.append(pred.tolist())
            continue

        X_local = np.array(X_local)
        y_local = np.array(y_local)
        ann_model = train_local_ann(X_local, y_local)

        x_input = scaler.transform(x.reshape(1, -1))
        ann_pred = ann_model.predict(x_input)[0] * 100

        # Weighted merge giữa transformer và ANN
        final = 0.5 * pred + 0.5 * ann_pred
        final_preds.append(np.clip(final, 0, None).tolist())

    return jsonify({'predictions': final_preds})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
