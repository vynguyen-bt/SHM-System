# Matplotlib 3D Visualization Integration Guide

## Overview

This guide explains how to integrate the matplotlib-based 3D visualization into your SHM-BIM-FEM project's "Section 1: Structural Damage Location Diagnosis" functionality. The integration provides high-quality static 3D charts with Times New Roman fonts as an alternative to the existing Plotly interactive charts.

## Features

- **High-Quality Static Charts**: Professional matplotlib 3D bar charts with Times New Roman fonts
- **Seamless Integration**: Works alongside existing Plotly visualization with toggle functionality
- **Data Compatibility**: Uses the same data structure as the existing Plotly implementation
- **Coordinate Transformation**: Maintains consistency with the project's coordinate system
- **Damage Threshold Highlighting**: Preserves element labeling for significant damage values
- **Color Mapping**: Consistent damage severity visualization
- **Download Functionality**: Direct PNG export with high DPI

## Setup Instructions

### 1. Python Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements_matplotlib.txt
```

#### Start the Matplotlib Backend Server
```bash
cd backend
python matplotlib_3d_visualizer.py
```

The server will run on `http://localhost:5001` by default.

### 2. Frontend Integration

The frontend integration is already included in the project:

- **HTML**: Visualization toggle controls added to Section 1
- **JavaScript**: `matplotlib_3d_integration.js` handles backend communication
- **Integration**: `calculations.js` updated to use enhanced visualization function

## Usage

### 1. Toggle Between Visualization Types

In Section 1, you'll see a new "3D Visualization Type" panel with two options:
- **🌐 Plotly (Interactive[object Object] Matplotlib (High Quality)**: New matplotlib-based static charts

### 2. Generate Visualizations

1. Load your data files and configure parameters as usual
2. Select your preferred visualization type
3. Click "Tính toán năng lượng biến dạng" (Calculate Strain Energy)
4. The system will automatically use the selected visualization type

### 3. Download Charts

- **Plotly**: Use the built-in Plotly download controls
- **Matplotlib**: Use the[object Object] appears below the chart

## Technical Implementation

### Backend Architecture

```python
# Core Components:
- SHMMatplotlib3DVisualizer: Main visualization class
- Flask API endpoint: /generate_matplotlib_3d
- Coordinate transformation: Compatible with existing logic
- Custom colormap: Matches project styling
```

### Frontend Integration

```javascript
// Key Components:
- MatplotlibVisualizationManager: Handles backend communication
- draw3DDamageChartEnhanced(): Enhanced visualization function
- handleVisualizationTypeChange(): Toggle functionality
```

### Data Flow

1. **Frontend**: Collects damage data and element coordinates
2. **API Call**: Sends data to matplotlib backend via POST request
3. **Processing**: Python backend generates 3D chart with matplotlib
4. **Response**: Returns base64-encoded PNG image
5. **Display**: Frontend displays image in the chart container

## API Reference

### POST /generate_matplotlib_3d

**Request Body:**
```json
{
  "damage_data": {"element_id": damage_value, ...},
  "elements": [{"id": int, "center": {"x": float, "y": float}}, ...],
  "threshold": 0.01,
  "title": "Section 1 - Structural Damage Location Diagnosis",
  "colormap": "cool",
  "return_format": "base64"
}
```

**Response:**
```json
{
  "success": true,
  "image": "base64_encoded_png",
  "stats": {
    "max_damage": 0.85,
    "elements_above_threshold": 12,
    "total_elements": 100,
    "grid_dimensions": [10, 10]
  },
  "format": "png"
}
```

## Customization Options

### 1. Colormap Options

Available colormaps in the backend:
- `'cool'`: Blue to magenta (default, matches original code)
- `'custom'`: Custom 7-color gradient matching Plotly implementation
- Any matplotlib colormap name (e.g., 'viridis', 'plasma', 'hot')

### 2. Chart Styling

Modify `SHMMatplotlib3DVisualizer.generate_3d_damage_chart()` parameters:
- `figsize`: Chart dimensions (default: (12, 8))
- `threshold`: Minimum damage value for labels (default: 0.01)
- `title`: Chart title
- Font settings are pre-configured for Times New Roman

### 3. Viewing Angle

Default viewing angle matches original code:
```python
ax.view_init(elev=35, azim=-130)
```

## Troubleshooting

### Backend Server Issues

**Problem**: Matplotlib backend not available
**Solution**: 
1. Check if Python server is running on port 5001
2. Verify all dependencies are installed
3. Check console for error messages

**Problem**: CORS errors
**Solution**: Flask-CORS is configured to allow all origins. If issues persist, check browser console.

### Frontend Integration Issues

**Problem**: Toggle not working
**Solution**: 
1. Ensure `matplotlib_3d_integration.js` is loaded
2. Check browser console for JavaScript errors
3. Verify backend server status

**Problem**: Charts not displaying
**Solution**:
1. Check network tab for API call failures
2. Verify data format matches expected structure
3. Check backend logs for processing errors

## Performance Considerations

- **Matplotlib**: Better for high-quality static exports and publications
- **Plotly**: Better for interactive exploration and real-time manipulation
- **Memory**: Matplotlib charts are generated server-side and cached as images
- **Network**: Base64 image transfer may be slower than Plotly's client-side rendering

## Future Enhancements

Potential improvements for future versions:
1. **Batch Processing**: Generate multiple charts simultaneously
2. **Animation Support**: Create rotating 3D animations
3. **Custom Themes**: Additional styling options
4. **Vector Formats**: SVG export for scalable graphics
5. **3D Surface Plots**: Alternative visualization styles

## Integration with Existing Features

The matplotlib integration preserves all existing functionality:
- ✅ Multi-mode chart downloads
- ✅ Excel report generation
- ✅ Coordinate transformation logic
- ✅ Damage threshold calculations
- ✅ Element labeling system
- ✅ Color mapping consistency

## Support

For issues or questions regarding the matplotlib integration:
1. Check the browser console for JavaScript errors
2. Check the Python backend logs for server errors
3. Verify all dependencies are correctly installed
4. Ensure the backend server is running and accessible
