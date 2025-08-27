/**
 * Matplotlib 3D Integration for SHM-BIM-FEM Section 1
 * Provides matplotlib-based 3D visualization as an alternative to Plotly
 */

class MatplotlibVisualizationManager {
    constructor() {
        this.backendUrl = 'http://localhost:5001';
        this.currentVisualizationType = 'plotly'; // 'plotly' or 'matplotlib'
        this.isMatplotlibServerRunning = false;
        this.checkServerStatus();
    }

    /**
     * Check if matplotlib backend server is running
     */
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/health`, {
                method: 'GET',
                timeout: 3000
            });
            this.isMatplotlibServerRunning = response.ok;
            console.log(`📊 Matplotlib backend status: ${this.isMatplotlibServerRunning ? '✅ Running' : '❌ Not available'}`);
            this.updateVisualizationToggle();
        } catch (error) {
            this.isMatplotlibServerRunning = false;
            console.log('📊 Matplotlib backend not available:', error.message);
            this.updateVisualizationToggle();
        }
    }

    /**
     * Update the visualization toggle UI based on server availability
     */
    updateVisualizationToggle() {
        const toggleContainer = document.getElementById('visualization-toggle-container');
        if (!toggleContainer) return;

        const matplotlibOption = document.getElementById('viz-matplotlib');
        const matplotlibLabel = document.querySelector('label[for="viz-matplotlib"]');
        
        if (matplotlibOption && matplotlibLabel) {
            if (this.isMatplotlibServerRunning) {
                matplotlibOption.disabled = false;
                matplotlibLabel.style.opacity = '1';
                matplotlibLabel.title = 'Matplotlib 3D visualization (Python backend)';
            } else {
                matplotlibOption.disabled = true;
                matplotlibLabel.style.opacity = '0.5';
                matplotlibLabel.title = 'Matplotlib backend not available. Please start the Python server.';
            }
        }
    }

    /**
     * Generate matplotlib 3D visualization
     */
    async generateMatplotlib3D(damageData, elements, threshold = 0.01, title = null) {
        if (!this.isMatplotlibServerRunning) {
            throw new Error('Matplotlib backend server is not running. Please start the Python server.');
        }

        try {
            console.log('📊 Generating matplotlib 3D visualization...');
            
            // Prepare data for backend
            const payload = {
                damage_data: damageData,
                elements: elements,
                threshold: threshold,
                title: title || 'Section 1 - Structural Damage Location Diagnosis (Matplotlib)',
                colormap: 'cool',
                return_format: 'base64'
            };

            const response = await fetch(`${this.backendUrl}/generate_matplotlib_3d`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate matplotlib visualization');
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Matplotlib 3D chart generated successfully');
                console.log('📊 Chart statistics:', result.stats);
                return result;
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('❌ Error generating matplotlib 3D chart:', error);
            throw error;
        }
    }

    /**
     * Display matplotlib image in the chart container
     */
    displayMatplotlibChart(imageBase64, containerId = 'damage3DChart') {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }

        // Clear existing content
        container.innerHTML = '';

        // Create image element
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${imageBase64}`;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '5px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        img.alt = 'Matplotlib 3D Damage Visualization';

        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Download Matplotlib Chart';
        downloadBtn.className = 'btn btn-secondary mt-2';
        downloadBtn.style.marginTop = '10px';
        downloadBtn.onclick = () => this.downloadMatplotlibChart(imageBase64);

        // Create container wrapper
        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(downloadBtn);

        container.appendChild(wrapper);
    }

    /**
     * Download matplotlib chart as PNG
     */
    downloadMatplotlibChart(imageBase64) {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${imageBase64}`;
        link.download = `matplotlib_3d_damage_chart_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
    }

    /**
     * Switch visualization type
     */
    setVisualizationType(type) {
        this.currentVisualizationType = type;
        console.log(`📊 Switched to ${type} visualization`);
    }

    /**
     * Get current visualization type
     */
    getVisualizationType() {
        return this.currentVisualizationType;
    }
}

// Global instance
window.matplotlibVizManager = new MatplotlibVisualizationManager();

/**
 * Enhanced draw3DDamageChart function with matplotlib integration
 */
function draw3DDamageChartEnhanced(z, elements, Z0) {
    const vizType = window.matplotlibVizManager.getVisualizationType();
    
    if (vizType === 'matplotlib' && window.matplotlibVizManager.isMatplotlibServerRunning) {
        return drawMatplotlib3DDamageChart(z, elements, Z0);
    } else {
        // Fall back to original Plotly implementation
        return draw3DDamageChart(z, elements, Z0);
    }
}

/**
 * Matplotlib-specific 3D damage chart function
 */
async function drawMatplotlib3DDamageChart(z, elements, Z0) {
    try {
        console.log('📊 Drawing matplotlib 3D damage chart...');
        
        // Convert z object to the format expected by matplotlib backend
        const damageData = {};
        Object.keys(z).forEach(elementId => {
            damageData[elementId] = z[elementId];
        });

        // Calculate threshold for labeling (similar to Plotly implementation)
        const threshold = Z0 || 0.01;
        
        // Generate matplotlib visualization
        const result = await window.matplotlibVizManager.generateMatplotlib3D(
            damageData, 
            elements, 
            threshold
        );

        // Display the chart
        window.matplotlibVizManager.displayMatplotlibChart(result.image);

        // Log statistics
        console.log('✅ Matplotlib 3D chart created successfully');
        console.log('📊 Chart statistics:', result.stats);

    } catch (error) {
        console.error('❌ Error creating matplotlib 3D chart:', error);
        
        // Show error message in container
        const container = document.getElementById('damage3DChart');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #dc3545; border: 1px solid #dc3545; border-radius: 5px;">
                    <h4>⚠️ Matplotlib Visualization Error</h4>
                    <p>Unable to generate matplotlib 3D chart: ${error.message}</p>
                    <p>Falling back to Plotly visualization...</p>
                    <button onclick="window.matplotlibVizManager.setVisualizationType('plotly'); processStrainEnergyData();" 
                            class="btn btn-primary mt-2">
                        🔄 Switch to Plotly
                    </button>
                </div>
            `;
        }
        
        // Fallback to Plotly
        window.matplotlibVizManager.setVisualizationType('plotly');
        return draw3DDamageChart(z, elements, Z0);
    }
}

/**
 * Handle visualization type change
 */
function handleVisualizationTypeChange() {
    const plotlyRadio = document.getElementById('viz-plotly');
    const matplotlibRadio = document.getElementById('viz-matplotlib');
    
    if (plotlyRadio && plotlyRadio.checked) {
        window.matplotlibVizManager.setVisualizationType('plotly');
    } else if (matplotlibRadio && matplotlibRadio.checked) {
        window.matplotlibVizManager.setVisualizationType('matplotlib');
    }
    
    // If we have existing data, regenerate the chart with new visualization type
    if (window.strainEnergyResults && window.strainEnergyResults.z && window.strainEnergyResults.elements) {
        const Z0_percent = parseFloat(document.getElementById('threshold').value) || 10;
        const Z0 = Z0_percent / 100;
        
        draw3DDamageChartEnhanced(
            window.strainEnergyResults.z, 
            window.strainEnergyResults.elements, 
            Z0
        );
    }
}

// Export functions to global scope
window.draw3DDamageChartEnhanced = draw3DDamageChartEnhanced;
window.drawMatplotlib3DDamageChart = drawMatplotlib3DDamageChart;
window.handleVisualizationTypeChange = handleVisualizationTypeChange;
