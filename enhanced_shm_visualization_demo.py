"""
Enhanced Structural Health Monitoring Visualization Demo
Integration with your existing ANN code for improved damage detection visualization
"""

# Import the enhanced visualization class
from enhanced_3d_visualization import StructuralHealthMonitoringVisualizer
import numpy as np
import matplotlib.pyplot as plt

# Your existing ANN code would go here...
# For demonstration, I'll create sample data similar to your output

def create_sample_damage_data():
    """Create sample damage data for demonstration"""
    # Simulate your y_pred2 output (600 elements for 30x20 grid)
    damage_data = np.zeros(600)
    
    # Add some damage at specific locations (similar to your P = [29, 284])
    damage_data[29] = 0.85   # High damage at element 29
    damage_data[284] = 0.72  # High damage at element 284
    
    # Add some random low-level damage
    np.random.seed(42)
    random_indices = np.random.choice(600, 20, replace=False)
    damage_data[random_indices] = np.random.uniform(0.05, 0.25, 20)
    
    return damage_data

def demonstrate_enhanced_visualizations():
    """
    Demonstrate all enhanced visualization methods
    """
    # Create sample data
    damage_data = create_sample_damage_data()
    
    # Initialize the visualizer
    visualizer = StructuralHealthMonitoringVisualizer(X_size=30, Y_size=20)
    
    print("=== Enhanced 3D Visualization Demo ===")
    print("Generating multiple visualization types...")
    
    # 1. Enhanced 3D Bar Plot
    print("\n1. Creating Enhanced 3D Bar Plot...")
    fig1, ax1 = visualizer.enhanced_3d_bar_plot(
        damage_data, 
        title="Enhanced 3D Damage Detection - MODE 1",
        show_values=True,
        threshold=0.1
    )
    
    # 2. 3D Surface Plot
    print("2. Creating 3D Surface Plot...")
    fig2, ax2 = visualizer.surface_plot_3d(
        damage_data,
        title="3D Surface - Damage Distribution Analysis"
    )
    
    # 3. 3D Wireframe Plot
    print("3. Creating 3D Wireframe Plot...")
    fig3, ax3 = visualizer.wireframe_plot_3d(
        damage_data,
        title="3D Wireframe - Structural Grid Analysis"
    )
    
    # 4. Multi-View Comparison
    print("4. Creating Multi-View Comparison...")
    fig4 = visualizer.multi_view_comparison(
        damage_data,
        title="Multi-Angle Damage Analysis"
    )
    
    # 5. 2D Contour and Heatmap
    print("5. Creating 2D Contour and Heatmap...")
    fig5 = visualizer.contour_heatmap_2d(
        damage_data,
        title="2D Damage Analysis - Heatmap & Contours"
    )
    
    # 6. Animated Rotation (optional - uncomment to use)
    print("6. Creating Animated Rotation Plot...")
    print("   (Animation will display - close window to continue)")
    fig6, anim = visualizer.animated_rotation_plot(
        damage_data,
        title="Animated Damage Visualization",
        save_animation=False  # Set to True to save as GIF
    )
    
    # 7. Interactive Plotly Visualization
    print("7. Creating Interactive Plotly Visualization...")
    try:
        fig7 = visualizer.interactive_plotly_visualization(
            damage_data,
            title="Interactive 3D Damage Visualization"
        )
        # Show the interactive plot
        fig7.show()
        print("   Interactive plot opened in browser")
    except ImportError:
        print("   Plotly not available - install with: pip install plotly")
    except Exception as e:
        print(f"   Plotly visualization error: {e}")
    
    print("\n=== Visualization Demo Complete ===")
    return damage_data

def integrate_with_your_ann_code(y_pred2):
    """
    Function to integrate enhanced visualizations with your existing ANN code
    
    Parameters:
    y_pred2: Your ANN prediction output (numpy array of shape (1, 600) or (600,))
    """
    
    # Ensure correct shape
    if y_pred2.ndim > 1:
        y_pred2 = y_pred2.flatten()
    
    # Initialize visualizer
    visualizer = StructuralHealthMonitoringVisualizer(X_size=30, Y_size=20)
    
    # Replace your existing visualization code with enhanced versions
    
    # Option 1: Enhanced version of your current 3D bar plot
    print("Creating enhanced version of your 3D visualization...")
    visualizer.enhanced_3d_bar_plot(
        y_pred2,
        title="MODE 1 - Enhanced Damage Detection",
        show_values=True,
        threshold=0.01
    )
    
    # Option 2: Additional surface plot for better understanding
    visualizer.surface_plot_3d(
        y_pred2,
        title="MODE 1 - Surface Analysis"
    )
    
    # Option 3: Multi-view for comprehensive analysis
    visualizer.multi_view_comparison(
        y_pred2,
        title="MODE 1 - Multi-Angle Analysis"
    )
    
    # Option 4: Interactive visualization (if plotly is available)
    try:
        fig_interactive = visualizer.interactive_plotly_visualization(
            y_pred2,
            title="MODE 1 - Interactive Analysis"
        )
        fig_interactive.show()
    except:
        print("Interactive visualization not available")

# Example of how to modify your existing code
def your_modified_ann_code_example():
    """
    Example showing how to modify your existing ANN code
    """
    
    # Your existing code up to the prediction part...
    # y_pred1 = ann1.predict(X_test)
    # y_pred2 = ann2.predict(X_test)
    # for j in range(2):
    #     y_pred2[:, P[j]] = y_pred1[:, j]
    
    # Create sample data for this example
    y_pred2 = create_sample_damage_data().reshape(1, -1)
    
    # REPLACE your existing visualization section with:
    print("=== Integration Example ===")
    integrate_with_your_ann_code(y_pred2)

if __name__ == "__main__":
    # Run the demonstration
    print("Starting Enhanced SHM Visualization Demo...")
    
    # Demonstrate all visualization types
    damage_data = demonstrate_enhanced_visualizations()
    
    # Show integration example
    print("\n" + "="*50)
    print("Integration Example:")
    your_modified_ann_code_example()
    
    print("\nDemo completed! Check the generated plots.")
