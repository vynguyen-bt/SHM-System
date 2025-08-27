"""
Enhanced 3D Visualization Functions for Structural Health Monitoring
Provides multiple visualization methods for damage detection results
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation
from matplotlib.colors import LinearSegmentedColormap
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import seaborn as sns

# Set font to Times New Roman
plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['font.size'] = 12

class StructuralHealthMonitoringVisualizer:
    """
    Enhanced visualization class for Structural Health Monitoring results
    """
    
    def __init__(self, X_size=30, Y_size=20):
        self.X_size = X_size
        self.Y_size = Y_size
        
    def create_custom_colormap(self):
        """Create custom colormap for damage visualization"""
        colors = ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF8000', '#FF0000', '#800000']
        n_bins = 256
        return LinearSegmentedColormap.from_list('damage', colors, N=n_bins)
    
    def enhanced_3d_bar_plot(self, damage_data, title="Enhanced Damage Detection", 
                           save_path=None, show_values=True, threshold=0.01):
        """
        Enhanced 3D bar plot with improved aesthetics and features
        """
        # Reshape data
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))
        
        # Create coordinate grids
        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        x_mesh, y_mesh = np.meshgrid(x, y)
        
        # Create figure with larger size
        fig = plt.figure(figsize=(14, 10))
        ax = fig.add_subplot(111, projection='3d')
        
        # Custom colormap
        custom_cmap = self.create_custom_colormap()
        
        # Normalize values for coloring
        vmax = np.max(damage_grid)
        normed_values = damage_grid / vmax if vmax > 0 else damage_grid
        colors = custom_cmap(normed_values.flatten())
        
        # Create 3D bars with enhanced styling
        bars = ax.bar3d(
            x_mesh.flatten(), y_mesh.flatten(), np.zeros_like(damage_grid.flatten()),
            0.8, 0.8, damage_grid.flatten(),
            color=colors, alpha=0.8, shade=True, edgecolor='black', linewidth=0.5
        )
        
        # Add value labels on significant bars
        if show_values:
            for xi, yi, val in zip(x_mesh.flatten(), y_mesh.flatten(), damage_grid.flatten()):
                if val > threshold:
                    ax.text(xi + 0.4, yi + 0.4, val + vmax*0.02, 
                           f'{val:.3f}', ha='center', va='bottom', 
                           fontsize=8, fontweight='bold', color='black')
        
        # Enhanced styling
        ax.set_xlabel('Element X-Direction', fontsize=14, fontweight='bold')
        ax.set_ylabel('Element Y-Direction', fontsize=14, fontweight='bold')
        ax.set_zlabel('Damage Index', fontsize=14, fontweight='bold')
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        
        # Set aspect ratio and viewing angle
        ax.set_box_aspect([self.X_size, self.Y_size, max(15, vmax*20)])
        ax.view_init(elev=30, azim=-45)
        
        # Add colorbar
        mappable = plt.cm.ScalarMappable(cmap=custom_cmap)
        mappable.set_array(damage_grid)
        cbar = plt.colorbar(mappable, ax=ax, shrink=0.6, aspect=20)
        cbar.set_label('Damage Index', fontsize=12, fontweight='bold')
        
        # Add grid
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
        
        return fig, ax
    
    def surface_plot_3d(self, damage_data, title="3D Surface - Damage Distribution"):
        """
        3D surface plot for smooth damage visualization
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))
        
        # Create coordinate grids
        x = np.linspace(0, self.X_size-1, self.X_size)
        y = np.linspace(0, self.Y_size-1, self.Y_size)
        X, Y = np.meshgrid(x, y)
        
        fig = plt.figure(figsize=(12, 8))
        ax = fig.add_subplot(111, projection='3d')
        
        # Create surface plot
        surf = ax.plot_surface(X, Y, damage_grid, 
                              cmap=self.create_custom_colormap(),
                              alpha=0.9, antialiased=True, 
                              linewidth=0.1, edgecolors='black')
        
        # Add contour lines at the base
        ax.contour(X, Y, damage_grid, zdir='z', offset=0, 
                  cmap='viridis', alpha=0.6, linewidths=2)
        
        # Styling
        ax.set_xlabel('Element X-Direction', fontsize=12, fontweight='bold')
        ax.set_ylabel('Element Y-Direction', fontsize=12, fontweight='bold')
        ax.set_zlabel('Damage Index', fontsize=12, fontweight='bold')
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        # Add colorbar
        fig.colorbar(surf, shrink=0.6, aspect=20, label='Damage Index')
        
        plt.tight_layout()
        plt.show()
        
        return fig, ax
    
    def wireframe_plot_3d(self, damage_data, title="3D Wireframe - Structural Grid"):
        """
        3D wireframe plot for structural grid visualization
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))
        
        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        X, Y = np.meshgrid(x, y)
        
        fig = plt.figure(figsize=(12, 8))
        ax = fig.add_subplot(111, projection='3d')
        
        # Create wireframe
        wire = ax.plot_wireframe(X, Y, damage_grid, 
                               color='blue', alpha=0.7, linewidth=1.5)
        
        # Add scatter points for high damage areas
        threshold = np.max(damage_grid) * 0.1
        high_damage_mask = damage_grid > threshold
        if np.any(high_damage_mask):
            high_x, high_y = np.where(high_damage_mask)
            high_z = damage_grid[high_damage_mask]
            ax.scatter(high_y, high_x, high_z, 
                      c='red', s=100, alpha=0.8, marker='o')
        
        ax.set_xlabel('Element X-Direction', fontweight='bold')
        ax.set_ylabel('Element Y-Direction', fontweight='bold')
        ax.set_zlabel('Damage Index', fontweight='bold')
        ax.set_title(title, fontweight='bold')
        
        plt.tight_layout()
        plt.show()

        return fig, ax

    def animated_rotation_plot(self, damage_data, title="Animated Damage Visualization",
                             save_animation=False, filename="damage_animation.gif"):
        """
        Create animated rotating 3D plot
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))

        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        x_mesh, y_mesh = np.meshgrid(x, y)

        fig = plt.figure(figsize=(10, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Initial plot
        custom_cmap = self.create_custom_colormap()
        vmax = np.max(damage_grid)
        normed_values = damage_grid / vmax if vmax > 0 else damage_grid
        colors = custom_cmap(normed_values.flatten())

        bars = ax.bar3d(
            x_mesh.flatten(), y_mesh.flatten(), np.zeros_like(damage_grid.flatten()),
            0.8, 0.8, damage_grid.flatten(),
            color=colors, alpha=0.8, shade=True
        )

        ax.set_xlabel('Element X-Direction', fontweight='bold')
        ax.set_ylabel('Element Y-Direction', fontweight='bold')
        ax.set_zlabel('Damage Index', fontweight='bold')
        ax.set_title(title, fontweight='bold')

        def animate(frame):
            ax.view_init(elev=30, azim=frame*4)
            return bars

        anim = animation.FuncAnimation(fig, animate, frames=90, interval=100, blit=False)

        if save_animation:
            anim.save(filename, writer='pillow', fps=10)

        plt.show()
        return fig, anim

    def multi_view_comparison(self, damage_data, title="Multi-View Damage Analysis"):
        """
        Create multiple viewing angles in subplots
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))

        fig = plt.figure(figsize=(16, 12))

        # View angles: (elevation, azimuth)
        views = [(30, -45), (30, 45), (60, -45), (10, -90)]
        view_titles = ['Front-Left View', 'Front-Right View', 'Top-Left View', 'Side View']

        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        x_mesh, y_mesh = np.meshgrid(x, y)

        custom_cmap = self.create_custom_colormap()
        vmax = np.max(damage_grid)
        normed_values = damage_grid / vmax if vmax > 0 else damage_grid
        colors = custom_cmap(normed_values.flatten())

        for i, ((elev, azim), view_title) in enumerate(zip(views, view_titles)):
            ax = fig.add_subplot(2, 2, i+1, projection='3d')

            ax.bar3d(
                x_mesh.flatten(), y_mesh.flatten(), np.zeros_like(damage_grid.flatten()),
                0.8, 0.8, damage_grid.flatten(),
                color=colors, alpha=0.8, shade=True
            )

            ax.set_xlabel('EX', fontsize=10)
            ax.set_ylabel('EY', fontsize=10)
            ax.set_zlabel('Damage Index', fontsize=10)
            ax.set_title(view_title, fontsize=12, fontweight='bold')
            ax.view_init(elev=elev, azim=azim)
            ax.set_box_aspect([self.X_size, self.Y_size, 15])

        plt.suptitle(title, fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.show()

        return fig

    def interactive_plotly_visualization(self, damage_data, title="Interactive Damage Visualization"):
        """
        Create interactive 3D visualization using Plotly
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))

        # Create coordinate arrays
        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        x_mesh, y_mesh = np.meshgrid(x, y)

        # Flatten arrays for plotting
        x_flat = x_mesh.flatten()
        y_flat = y_mesh.flatten()
        z_flat = damage_grid.flatten()

        # Create 3D surface plot
        fig = go.Figure(data=[go.Surface(
            x=x,
            y=y,
            z=damage_grid,
            colorscale='Plasma',
            opacity=0.8,
            name='Damage Surface',
            hovertemplate='<b>Element Position</b><br>' +
                         'X: %{x}<br>' +
                         'Y: %{y}<br>' +
                         'Damage Index: %{z:.4f}<br>' +
                         '<extra></extra>'
        )])

        # Add scatter points for high damage areas
        threshold = np.max(damage_grid) * 0.1
        high_damage_mask = damage_grid > threshold
        if np.any(high_damage_mask):
            high_x, high_y = np.where(high_damage_mask)
            high_z = damage_grid[high_damage_mask]
            fig.add_trace(go.Scatter3d(
                x=high_y,
                y=high_x,
                z=high_z,
                mode='markers',
                marker=dict(
                    size=10,
                    color='red',
                    opacity=1.0
                ),
                name='Critical Damage Points',
                hovertemplate='<b>Critical Damage</b><br>' +
                             'X: %{x}<br>' +
                             'Y: %{y}<br>' +
                             'Damage Index: %{z:.4f}<br>' +
                             '<extra></extra>'
            ))

        fig.update_layout(
            title=dict(text=title, font=dict(size=16)),
            scene=dict(
                xaxis_title='Element X-Direction',
                yaxis_title='Element Y-Direction',
                zaxis_title='Damage Index',
                camera=dict(eye=dict(x=1.5, y=1.5, z=1.5))
            ),
            width=1000,
            height=700
        )

        return fig

    def contour_heatmap_2d(self, damage_data, title="2D Damage Heatmap"):
        """
        Create 2D contour heatmap for damage visualization
        """
        damage_grid = np.abs(damage_data.reshape(self.Y_size, self.X_size))

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Heatmap
        im1 = ax1.imshow(damage_grid, cmap=self.create_custom_colormap(),
                        aspect='auto', origin='lower')
        ax1.set_title('Damage Heatmap', fontweight='bold', fontsize=14)
        ax1.set_xlabel('Element X-Direction', fontweight='bold')
        ax1.set_ylabel('Element Y-Direction', fontweight='bold')
        plt.colorbar(im1, ax=ax1, label='Damage Index')

        # Contour plot
        x = np.arange(self.X_size)
        y = np.arange(self.Y_size)
        X, Y = np.meshgrid(x, y)

        contour = ax2.contourf(X, Y, damage_grid, levels=20,
                              cmap=self.create_custom_colormap())
        ax2.contour(X, Y, damage_grid, levels=20, colors='black',
                   linewidths=0.5, alpha=0.6)
        ax2.set_title('Damage Contour Map', fontweight='bold', fontsize=14)
        ax2.set_xlabel('Element X-Direction', fontweight='bold')
        ax2.set_ylabel('Element Y-Direction', fontweight='bold')
        plt.colorbar(contour, ax=ax2, label='Damage Index')

        plt.suptitle(title, fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.show()

        return fig
