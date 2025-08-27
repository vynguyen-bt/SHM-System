from flask import Flask, request, jsonify
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')  # Use a non-interactive backend
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to confirm the server is running."""
    return jsonify({'status': 'ok'}), 200

@app.route('/generate_matplotlib_3d', methods=['POST'])
def generate_matplotlib_3d():
    """Generate a 3D plot using Matplotlib and return it as a base64 encoded image."""
    try:
        data = request.get_json()

        damage_data = data.get('damage_data')
        elements = data.get('elements')
        threshold = data.get('threshold', 0.01)
        title = data.get('title', '3D Damage Visualization')

        if not damage_data or not elements:
            return jsonify({'error': 'Missing damage_data or elements'}), 400

        fig = plt.figure(figsize=(10, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Ensure element IDs are strings for consistent matching
        print(f"Received {len(damage_data)} damage entries and {len(elements)} elements.")
        element_coords = {str(e['id']): e['nodes'] for e in elements}

        # Log the first few keys to check for mismatches
        if damage_data and element_coords:
            print(f"First damage key: {next(iter(damage_data.keys()))} (type: {type(next(iter(damage_data.keys())))})")
            print(f"First element key: {next(iter(element_coords.keys()))} (type: {type(next(iter(element_coords.keys())))})")

        x_coords, y_coords, z_coords, colors = [], [], [], []

        for element_id, damage_value in damage_data.items():
            if str(element_id) in element_coords:
                nodes = element_coords[str(element_id)]
                avg_x = np.mean([node['x'] for node in nodes])
                avg_y = np.mean([node['y'] for node in nodes])
                avg_z = np.mean([node['z'] for node in nodes])

                x_coords.append(avg_x)
                y_coords.append(avg_y)
                z_coords.append(avg_z)
                colors.append(damage_value)

        scatter = ax.scatter(x_coords, y_coords, z_coords, c=colors, cmap='cool', s=100)

        plt.colorbar(scatter, ax=ax, label='Damage Intensity')
        ax.set_title(title)
        ax.set_xlabel('X Coordinate')
        ax.set_ylabel('Y Coordinate')
        ax.set_zlabel('Z Coordinate')

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)

        return jsonify({
            'success': True,
            'image': img_base64,
            'stats': {
                'elements_processed': len(x_coords),
                'max_damage': max(colors) if colors else 0,
                'min_damage': min(colors) if colors else 0
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)

