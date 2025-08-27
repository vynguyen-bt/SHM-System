# Artificial Neural Network for Structural Health Monitoring - ENHANCED VERSION
# Importing libraries
import numpy as np
import pandas as pd
import tensorflow as tf
tf.compat.v1.experimental.output_all_intermediates(True)
tf.config.run_functions_eagerly(True)
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Import the enhanced visualization class
from enhanced_3d_visualization import StructuralHealthMonitoringVisualizer

num_samples = 25
num_features = num_features_test = 600
num_samples_test = 1
X_size = 30
Y_size = 20
P = [29, 284]

## Part 1 - Data Preprocessing
# Loading the training dataset
dataset_train = pd.read_excel(r'E:\CAO HỌC\LVTS\NTV\PY\2 POINT\2P TRAIN.xlsx', 
                               sheet_name='KB1.1', engine='openpyxl')

# Trích xuất dữ liệu từ dòng 2 đến 11 và cột 2 đến 258
dataset_train = dataset_train.iloc[0:25, 0:654]
X_train = dataset_train.iloc[:, 1:-2].values
y_train1 = dataset_train.iloc[:, -2:].values
print(X_train)
print(y_train1)

# Khởi tạo y_train với tất cả giá trị là 0
y_train2 = np.zeros((num_samples, num_features))
non_zero_indices_train = P * num_samples
non_zero_values_train = dataset_train.iloc[:, -2:].values
for i in range(num_samples):
    y_train2[i, non_zero_indices_train[i]] = non_zero_values_train[i, 0]
print(y_train2)

# Loading the test dataset
dataset_test = pd.read_excel(r'E:\CAO HỌC\LVTS\NTV\PY\2 POINT\2P CHECK.xlsx', 
                              sheet_name='KB1.1', engine='openpyxl')

dataset_test = dataset_test.iloc[0:2, 0:654]
X_test = dataset_test.iloc[:, 1:-2].values
y_test1 = dataset_test.iloc[:, -2:].values

print(X_test)
print(y_test1)

non_zero_indices_test = P
non_zero_values_test = dataset_test.iloc[:, -2:].values
y_test2 = np.zeros((num_samples_test, num_features_test))
for i in range(num_samples_test):
    y_test2[i, non_zero_indices_test[i]] = non_zero_values_test[i, 0]
print(y_test2)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

## Part 2 - Building the ANN1
ann1 = tf.keras.models.Sequential()
ann1.add(tf.keras.layers.Dense(units=512, activation='relu', input_shape=(X_train.shape[1],)))
ann1.add(tf.keras.layers.Dropout(0.3))
ann1.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann1.add(tf.keras.layers.Dropout(0.3))
ann1.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann1.add(tf.keras.layers.Dropout(0.3))
ann1.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann1.add(tf.keras.layers.Dropout(0.2))
ann1.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann1.add(tf.keras.layers.Dropout(0.2))
ann1.add(tf.keras.layers.Dense(units=2, activation='sigmoid'))

## Part 2.1 - Building the ANN2
ann2 = tf.keras.models.Sequential()
ann2.add(tf.keras.layers.Dense(units=512, activation='relu', input_shape=(X_train.shape[1],)))
ann2.add(tf.keras.layers.Dropout(0.3))
ann2.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann2.add(tf.keras.layers.Dropout(0.3))
ann2.add(tf.keras.layers.Dense(units=512, activation='relu'))
ann2.add(tf.keras.layers.Dropout(0.3))
ann2.add(tf.keras.layers.Dense(units=600, activation='linear'))

## Part 3 - Training the ANN
optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
early_stopping = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=50, restore_best_weights=True)

ann1.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
ann1.fit(X_train, y_train1, validation_data=(X_test, y_test1), batch_size=32, epochs=1000, callbacks=[early_stopping])

optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
ann2.compile(optimizer=optimizer, loss='mean_squared_error', metrics=['mae'])
ann2.fit(X_train, y_train2, validation_data=(X_test, y_test2), batch_size=32, epochs=1000, callbacks=[early_stopping])

## Part 4 - Making predictions and evaluating the model
y_pred1 = ann1.predict(X_test)
y_pred2 = ann2.predict(X_test)

# Overwrite elements in ANN2 output with ANN1 predictions
for j in range(2):
     y_pred2[:, P[j]] = y_pred1[:, j]

print("ANN1 Prediction (Element 151):")
print(y_pred1)
print("\nExpected (Element 151):")
print(y_test1)

# ========================================
# ENHANCED VISUALIZATION SECTION
# ========================================

print("\n=== Starting Enhanced 3D Visualization ===")

# Initialize the enhanced visualizer
visualizer = StructuralHealthMonitoringVisualizer(X_size=X_size, Y_size=Y_size)

# Prepare data for visualization
y_pred2_viz = np.abs(y_pred2.flatten())

print("1. Creating Enhanced 3D Bar Plot...")
# Enhanced version of your original 3D bar chart
fig1, ax1 = visualizer.enhanced_3d_bar_plot(
    y_pred2_viz,
    title="MODE 1 - Enhanced Damage Detection",
    show_values=True,
    threshold=0.01
)

print("2. Creating 3D Surface Plot...")
# Additional surface plot for smoother visualization
fig2, ax2 = visualizer.surface_plot_3d(
    y_pred2_viz,
    title="MODE 1 - Surface Damage Analysis"
)

print("3. Creating Multi-View Analysis...")
# Multi-angle view for comprehensive analysis
fig3 = visualizer.multi_view_comparison(
    y_pred2_viz,
    title="MODE 1 - Multi-Angle Damage Analysis"
)

print("4. Creating 2D Analysis...")
# 2D heatmap and contour for additional insights
fig4 = visualizer.contour_heatmap_2d(
    y_pred2_viz,
    title="MODE 1 - 2D Damage Analysis"
)

print("5. Creating Interactive Visualization...")
# Interactive 3D plot (if plotly is available)
try:
    fig5 = visualizer.interactive_plotly_visualization(
        y_pred2_viz,
        title="MODE 1 - Interactive Damage Analysis"
    )
    fig5.show()
    print("   Interactive plot opened in browser")
except ImportError:
    print("   Plotly not installed. Install with: pip install plotly")
except Exception as e:
    print(f"   Interactive visualization error: {e}")

print("6. Creating Animated Visualization...")
# Animated rotating view
try:
    fig6, anim = visualizer.animated_rotation_plot(
        y_pred2_viz,
        title="MODE 1 - Animated Damage Analysis",
        save_animation=False  # Set to True to save as GIF
    )
    print("   Animation complete (close window to continue)")
except Exception as e:
    print(f"   Animation error: {e}")

print("\n=== Enhanced Visualization Complete ===")
print("All visualization methods have been applied to your damage detection results.")
print("The enhanced visualizations provide:")
print("- Better color schemes and visual clarity")
print("- Multiple viewing angles")
print("- Interactive features (with plotly)")
print("- Animation capabilities")
print("- 2D analysis options")
print("- Improved labeling and annotations")
