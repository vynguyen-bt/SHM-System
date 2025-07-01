from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

UPLOAD_FOLDER = '../public/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the uploads folder exists

model = None  # Placeholder for the trained model
scaler = None  # Placeholder for the scaler
test_file_path = None  # Store the path to the uploaded test file

def train_ann(file_path):
    global scaler  # Ensure we use the same scaler for prediction

    # Load the training data
    df = pd.read_csv(file_path)

    # Extract features (columns 2-12) and targets (columns 13-22)
    X = df.iloc[:, 1:12].values  # 11 feature columns
    y = df.iloc[:, 12:].values   # 10 target columns (damage percentages)

    # Feature Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split the data into training and validation sets
    X_train, X_val, y_train, y_val = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # Initialize the ANN
    ann = tf.keras.models.Sequential()


    # Adding the input layer and the first hidden layer with Batch Normalization and Dropout
    ann.add(tf.keras.layers.Dense(units=11, activation='relu', input_shape=(X_train.shape[1],)))
    # ann.add(tf.keras.layers.BatchNormalization())
    # ann.add(tf.keras.layers.Dropout(0.1))

    # Adding the second hidden layer
    ann.add(tf.keras.layers.Dense(units=11, activation='relu'))
    # ann.add(tf.keras.layers.BatchNormalization())
    # ann.add(tf.keras.layers.Dropout(0.1))

    # Adding the third hidden layer
    ann.add(tf.keras.layers.Dense(units=11, activation='relu'))
    # tf.keras.layers.Dense(units=11)
    # tf.keras.layers.LeakyReLU(alpha=0.01)
    # ann.add(tf.keras.layers.BatchNormalization())
    # ann.add(tf.keras.layers.Dropout(0.3))

    # Adding the output layer for 10 damage values
    ann.add(tf.keras.layers.Dense(units=10, activation='linear'))  # Change to 10 for damage predictions
    ann.add(tf.keras.layers.Dropout(0.2))
    # Compiling the ANN
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.01)
    ann.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
    
    # Callbacks for early stopping and learning rate reduction
    # early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    # lr_scheduler = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.1, patience=5, min_lr=1e-6)
    
    # Training the ANN on the Training set
    ann.fit(X_train, y_train, batch_size=32, epochs=100, validation_data=(X_val, y_val))
    # ann.fit(X_train, y_train, batch_size=32, epochs=100, validation_data=(X_val, y_val),
    #     callbacks=[early_stopping, lr_scheduler])

    return ann

@app.route('/upload-files', methods=['POST'])
def upload_files():
    """Endpoint to upload train and test files."""
    global model, test_file_path

    # Ensure both files are uploaded
    if 'train_file' not in request.files or 'test_file' not in request.files:
        return jsonify({'error': 'Both train and test files are required'}), 400

    # Save the train file
    train_file = request.files['train_file']
    train_path = os.path.join(UPLOAD_FOLDER, train_file.filename)
    train_file.save(train_path)

    # Save the test file
    test_file = request.files['test_file']
    test_file_path = os.path.join(UPLOAD_FOLDER, test_file.filename)
    test_file.save(test_file_path)

    # Train the model
    model = train_ann(train_path)
    return jsonify({'message': 'Model trained and test file uploaded successfully!'})

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint to predict using the saved test file."""
    global model, test_file_path, scaler

    if model is None:
        return jsonify({'error': 'Model not trained yet'}), 400

    if test_file_path is None:
        return jsonify({'error': 'No test file uploaded yet'}), 400

    # Load the test data
    df_test = pd.read_csv(test_file_path)
    X_test = df_test.iloc[:, 1:12].values  # Use only the 11 feature columns

    # Feature Scaling for the test set using the original scaler
    X_test_scaled = scaler.transform(X_test)

    # Perform prediction with Dropout during inference (stochastic behavior)
    raw_preds = model(X_test_scaled, training=True).numpy() * 100
    # Loại bỏ giá trị âm
    predictions = np.clip(raw_preds, 0, None).tolist()
    # Create response and add no-cache headers
    response = jsonify({'predictions': predictions})
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
