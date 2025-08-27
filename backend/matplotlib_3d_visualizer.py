"""
Matplotlib 3D Visualization Backend for SHM-BIM-FEM Project
Provides matplotlib-based 3D bar chart generation for Section 1: Structural Damage Location Diagnosis
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.colors as mcolors
from flask import Flask, request, jsonify, send_file
import base64
import io
import json
from flask_cors import CORS

# Configure matplotlib for Times New Roman font
plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['font.size'] = 12
plt.rcParams['axes.unicode_minus'] = False

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

class SHMMatplotlib3DVisualizer:
    """
    Matplotlib-based 3D visualization for structural damage location diagnosis
    Compatible with SHM-BIM-FEM project data structure
    """
    
    def __init__(self):
        self.default_colormap = 'cool'  # Default colormap matching original code
        
    def create_custom_colormap(self):
        """Create custom colormap similar to Plotly implementation"""
        colors = ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF8000', '#FF0000', '#800000']
        n_bins = 256
        return mcolors.LinearSegmentedColormap.from_list('damage', colors, N=n_bins)
    
    def apply_coordinate_transformation(self, elements):
        """
        Apply coordinate transformation logic matching the existing Plotly implementation
        """
        if not elements:
            return {}, 0, 0
            
        # Extract coordinates
        x_coords = [elem['center']['x'] for elem in elements]
        y_coords = [elem['center']['y'] for elem in elements]
        
        # Calculate transformation parameters
        x_min, x_max = min(x_coords), max(x_coords)
        y_min, y_max = min(y_coords), max(y_coords)
        
        # Create coordinate mapping for grid layout
        unique_x = sorted(list(set(x_coords)))
        unique_y = sorted(list(set(y_coords)))
        
        coord_map = {}
        for elem in elements:
            try:
                grid_x = unique_x.index(elem['center']['x'])
                grid_y = unique_y.index(elem['center']['y'])
                coord_map[elem['id']] = {'grid_x': grid_x, 'grid_y': grid_y}
            except ValueError:
                # Fallback for elements not in grid
                coord_map[elem['id']] = {'grid_x': 0, 'grid_y': 0}
        
        return coord_map, len(unique_x), len(unique_y)
    
    def generate_3d_damage_chart(self, damage_data, elements, threshold=0.01, 
                                title="Section 1 - Structural Damage Location Diagnosis",
                                colormap='cool', figsize=(12, 8)):
        """
        Generate 3D bar chart for damage visualization
        
        Args:
            damage_data: Dictionary with element IDs as keys and damage indices as values
            elements: List of element objects with center coordinates and IDs
            threshold: Minimum damage value to display labels
            title: Chart title
            colormap: Matplotlib colormap name or custom colormap
            figsize: Figure size tuple
        """
        
        # Apply coordinate transformation
        coord_map, grid_width, grid_height = self.apply_coordinate_transformation(elements)
        
        if not coord_map:
            raise ValueError("No valid elements provided for visualization")
        
        # Create damage grid
        damage_grid = np.zeros((grid_height, grid_width))
        element_ids_grid = np.full((grid_height, grid_width), -1, dtype=int)
        
        # Fill damage grid with data
        for elem_id, damage_value in damage_data.items():
            if elem_id in coord_map:
                grid_x = coord_map[elem_id]['grid_x']
                grid_y = coord_map[elem_id]['grid_y']
                if 0 <= grid_x < grid_width and 0 <= grid_y < grid_height:
                    damage_grid[grid_y, grid_x] = abs(damage_value)
                    element_ids_grid[grid_y, grid_x] = elem_id
        
        # Create coordinate meshgrid
        x = np.arange(grid_width)
        y = np.arange(grid_height)
        x_mesh, y_mesh = np.meshgrid(x, y)
        
        # Create figure and 3D axis
        fig = plt.figure(figsize=figsize)
        ax = fig.add_subplot(111, projection='3d')
        
        # Prepare data for bar3d
        x_flat = x_mesh.flatten()
        y_flat = y_mesh.flatten()
        z_flat = np.zeros_like(damage_grid.flatten())
        heights = damage_grid.flatten()
        
        # Color mapping
        if isinstance(colormap, str):
            if colormap == 'custom':
                cmap = self.create_custom_colormap()
            else:
                cmap = plt.cm.get_cmap(colormap)
        else:
            cmap = colormap
            
        # Normalize values for coloring
        vmax = np.max(heights) if np.max(heights) > 0 else 1
        normed_values = heights / vmax
        colors = cmap(normed_values)
        
        # Create 3D bars
        bars = ax.bar3d(x_flat, y_flat, z_flat, 0.8, 0.8, heights,
                       color=colors, alpha=0.8, shade=True, 
                       edgecolor='black', linewidth=0.5)
        
        # Add value labels for significant damage
        for i, (xi, yi, height, elem_id) in enumerate(zip(x_flat, y_flat, heights, element_ids_grid.flatten())):
            if height > threshold and elem_id != -1:
                percentage = height * 100  # Convert to percentage
                ax.text(xi + 0.4, yi + 0.4, height + vmax*0.02,
                       f'{percentage:.1f}%', ha='center', va='bottom',
                       fontsize=10, fontweight='bold', color='black')
        
        # Styling and labels
        ax.set_xlabel('Element X-Direction (EX)', fontsize=14, fontweight='bold')
        ax.set_ylabel('Element Y-Direction (EY)', fontsize=14, fontweight='bold')
        ax.set_zlabel('Damage Index', fontsize=14, fontweight='bold')
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        
        # Set aspect ratio and viewing angle
        max_height = max(15, vmax*20)
        ax.set_box_aspect([grid_width, grid_height, max_height])
        ax.view_init(elev=35, azim=-130)  # Match original viewing angle
        
        # Add colorbar
        mappable = plt.cm.ScalarMappable(cmap=cmap)
        mappable.set_array(damage_grid)
        cbar = plt.colorbar(mappable, ax=ax, shrink=0.6, aspect=20)
        cbar.set_label('Damage Index', fontsize=12, fontweight='bold')
        
        # Add grid for better visualization
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        return fig, ax, {
            'max_damage': float(vmax),
            'elements_above_threshold': int(np.sum(heights > threshold)),
            'total_elements': len(elements),
            'grid_dimensions': (grid_width, grid_height)
        }

@app.route('/generate_matplotlib_3d', methods=['POST'])
def generate_matplotlib_3d():
    """
    Flask endpoint to generate matplotlib 3D visualization
    Expected JSON payload:
    {
        "damage_data": {"element_id": damage_value, ...},
        "elements": [{"id": int, "center": {"x": float, "y": float}}, ...],
        "threshold": float (optional),
        "title": string (optional),
        "colormap": string (optional),
        "return_format": "base64" or "file" (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        damage_data = data.get('damage_data', {})
        elements = data.get('elements', [])
        threshold = data.get('threshold', 0.01)
        title = data.get('title', 'Section 1 - Structural Damage Location Diagnosis')
        colormap = data.get('colormap', 'cool')
        return_format = data.get('return_format', 'base64')
        
        if not damage_data or not elements:
            return jsonify({"error": "damage_data and elements are required"}), 400
        
        # Convert string keys to integers for damage_data
        damage_data = {int(k): float(v) for k, v in damage_data.items()}
        
        # Create visualizer and generate chart
        visualizer = SHMMatplotlib3DVisualizer()
        fig, ax, stats = visualizer.generate_3d_damage_chart(
            damage_data, elements, threshold, title, colormap
        )
        
        if return_format == 'base64':
            # Convert to base64 for JSON response
            buffer = io.BytesIO()
            fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close(fig)  # Clean up memory
            
            return jsonify({
                "success": True,
                "image": image_base64,
                "stats": stats,
                "format": "png"
            })
        else:
            # Return file directly
            buffer = io.BytesIO()
            fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plt.close(fig)  # Clean up memory
            
            return send_file(buffer, mimetype='image/png', 
                           as_attachment=True, 
                           download_name='matplotlib_3d_damage_chart.png')
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "matplotlib_3d_visualizer"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
