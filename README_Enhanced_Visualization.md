# Enhanced 3D Visualization for Structural Health Monitoring

This package provides enhanced 3D visualization capabilities for your Artificial Neural Network-based Structural Health Monitoring system.

## Features

### 1. Enhanced 3D Bar Plot
- **Improved color schemes**: Custom colormap with better damage indication
- **Better visual clarity**: Enhanced styling, transparency, and edge definition
- **Value annotations**: Automatic labeling of significant damage values
- **Professional styling**: Times New Roman font, improved axes labels

### 2. 3D Surface Plot
- **Smooth visualization**: Continuous surface representation of damage
- **Contour integration**: Base contour lines for better depth perception
- **Anti-aliasing**: Smooth rendering for publication-quality plots

### 3. Interactive Plotly Visualization
- **Full interactivity**: Pan, zoom, rotate with mouse controls
- **Hover information**: Detailed damage data on mouse hover
- **Critical point highlighting**: Automatic marking of high-damage areas
- **Web-based**: Opens in browser for sharing and presentation

### 4. Multi-View Analysis
- **Four viewing angles**: Front-left, front-right, top-left, and side views
- **Comprehensive analysis**: All angles in one figure
- **Consistent styling**: Uniform coloring across all views

### 5. Animated Rotation
- **360-degree rotation**: Automatic rotation animation
- **Export capability**: Save as GIF for presentations
- **Smooth transitions**: Professional animation quality

### 6. 2D Analysis Tools
- **Heatmap visualization**: Traditional 2D damage representation
- **Contour mapping**: Iso-damage lines for detailed analysis
- **Side-by-side comparison**: Both views in one figure

### 7. 3D Wireframe Plot
- **Structural grid view**: Shows the underlying structural mesh
- **Critical point overlay**: Red markers for high-damage locations
- **Engineering perspective**: Familiar view for structural engineers

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. For interactive features, ensure plotly is installed:
```bash
pip install plotly kaleido
```

## Usage

### Quick Integration with Your Existing Code

Replace your existing visualization section with:

```python
from enhanced_3d_visualization import StructuralHealthMonitoringVisualizer

# Initialize visualizer
visualizer = StructuralHealthMonitoringVisualizer(X_size=30, Y_size=20)

# Your existing prediction code...
# y_pred2 = ann2.predict(X_test)

# Enhanced visualization
visualizer.enhanced_3d_bar_plot(
    y_pred2.flatten(),
    title="MODE 1 - Enhanced Damage Detection",
    show_values=True,
    threshold=0.01
)
```

### Complete Example

See `your_enhanced_ann_code.py` for a complete integration example with your existing ANN code.

### Demonstration

Run the demo to see all visualization types:
```python
python enhanced_shm_visualization_demo.py
```

## Visualization Methods

| Method | Description | Best For |
|--------|-------------|----------|
| `enhanced_3d_bar_plot()` | Improved version of your current plot | General damage overview |
| `surface_plot_3d()` | Smooth 3D surface | Continuous damage distribution |
| `interactive_plotly_visualization()` | Web-based interactive plot | Presentations and detailed analysis |
| `multi_view_comparison()` | Multiple viewing angles | Comprehensive analysis |
| `animated_rotation_plot()` | Rotating animation | Dynamic presentations |
| `contour_heatmap_2d()` | 2D heatmap and contours | Traditional engineering analysis |
| `wireframe_plot_3d()` | Structural grid view | Engineering perspective |

## Customization Options

### Color Schemes
- Custom damage-focused colormap (blue → cyan → yellow → orange → red)
- Adjustable transparency and styling
- Professional color gradients

### Interactivity
- Mouse controls for 3D navigation
- Hover tooltips with detailed information
- Zoom and pan capabilities

### Export Options
- High-resolution PNG/PDF export
- GIF animation export
- Interactive HTML export (plotly)

## Benefits for Structural Health Monitoring

1. **Better Damage Detection**: Enhanced color schemes make damage more visible
2. **Multiple Perspectives**: Different visualization types reveal different aspects
3. **Professional Presentation**: Publication-ready plots with proper styling
4. **Interactive Analysis**: Detailed exploration of damage patterns
5. **Engineering Familiarity**: Traditional views (wireframe, contours) for engineers
6. **Comprehensive Analysis**: Multiple visualization types in one workflow

## File Structure

```
├── enhanced_3d_visualization.py          # Main visualization class
├── enhanced_shm_visualization_demo.py    # Demonstration script
├── your_enhanced_ann_code.py            # Your code with enhanced visualization
├── requirements.txt                      # Required packages
└── README_Enhanced_Visualization.md     # This documentation
```

## Technical Notes

- **Grid Size**: Configurable for different structural layouts (default: 30x20)
- **Performance**: Optimized for real-time visualization
- **Memory**: Efficient handling of large damage datasets
- **Compatibility**: Works with your existing TensorFlow/Keras workflow

## Troubleshooting

### Common Issues

1. **Plotly not working**: Install with `pip install plotly kaleido`
2. **Animation not saving**: Install pillow with `pip install pillow`
3. **Font issues**: Times New Roman should be available on most systems
4. **Memory issues**: For very large grids, use the 2D visualization methods

### Performance Tips

- Use `threshold` parameter to hide small damage values
- Set `show_values=False` for cleaner plots with many elements
- Use 2D methods for quick analysis of large datasets

## Integration with Your Workflow

The enhanced visualization integrates seamlessly with your existing ANN workflow:

1. **No code changes needed** in your training/prediction sections
2. **Drop-in replacement** for your current visualization
3. **Additional methods** available for deeper analysis
4. **Same data format** - works with your y_pred2 output

This enhanced visualization package transforms your damage detection results into professional, publication-ready visualizations that provide deeper insights into structural health conditions.
