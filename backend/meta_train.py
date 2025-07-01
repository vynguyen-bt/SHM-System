import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from meta_model import build_meta_model

def preprocess_data(file_path):
    df = pd.read_csv(file_path)
    X = df.iloc[:, 1:12].values
    y = df.iloc[:, 12:].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, y, scaler

def train_meta_model(X_train, y_train):
    model = build_meta_model(X_train.shape[1], y_train.shape[1])
    model.fit(X_train, y_train, epochs=100, batch_size=32, verbose=1)
    return model
