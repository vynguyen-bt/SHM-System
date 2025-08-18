# Debug: Threshold Plane Missing in Section 1 Download

## Vấn đề
❌ **Mặt phẳng ngưỡng bị mất** trong biểu đồ 3D tải về ở Section 1

## Debug Steps

### 1. **Test Single Image với Debug Logging**
```javascript
// Test Section 1 NO LABELS function với detailed logging
debugSection1NoLabels(10, 40);
```

### 2. **Expected Debug Output**
```
🔧 === DEBUGGING SECTION 1 NO LABELS ===
🎯 Testing Mode 10, Threshold 40%

📊 Step 1: Testing chart data generation...
✅ Chart data generated successfully: {z: {...}, elements: [...], Z0: 0.0454, maxZ: 0.1134}

🎯 Damaged elements: 25 total
🎯 Z0 threshold: 0.0454 (40%)
🎯 Max damage: 0.1134

🖼️ Step 2: Testing Section 1 NO LABELS image creation...
📸 Creating Section 1 image (NO LABELS) for Mode 10, Z0 40%...

🎯 Section 1 NO LABELS - Creating threshold plane:
   Z0 = 0.0454 (40%)
   maxZ = 0.1134
   Transformed bounds: X[0, 15.000], Y[0, 10.000]
   Plane bounds: X[-0.750, 15.750], Y[-0.500, 10.500]
   Plane grid: 21×21, Z constant = 0.0454

📊 Section 1 NO LABELS - Traces summary:
   Trace 1: mesh3d (4800 vertices)
   Trace 2: surface (21×21 grid)
   Total traces: 2

📊 Creating Section 1 Plotly chart (NO LABELS) for Mode 10...
✅ Section 1 Plotly chart created successfully for Mode 10
📷 Camera reset completed for Mode 10
🖼️ Converting Section 1 chart to image for Mode 10...
✅ Section 1 image generated for Mode 10
✅ Section 1 image blob created for Mode 10: 125432 bytes

💾 Step 3: Testing single image download...
🎉 Section 1 NO LABELS debug test completed successfully!
```

### 3. **Check Downloaded Image**
- ✅ **Mesh3D elements**: Should be visible with colors
- ✅ **Threshold plane**: Should be visible as red surface at Z0 level
- ❌ **Text labels**: Should NOT be present

## Possible Issues

### **Issue 1: Z0 Value Too Low/High**
```javascript
// Check if Z0 is within visible range
console.log(`Z0: ${Z0.toFixed(4)}, maxZ: ${maxZ.toFixed(4)}`);
console.log(`Z0 percentage: ${(Z0/maxZ*100).toFixed(1)}%`);

// Z0 should be between 0 and maxZ
// If Z0 ≈ 0, plane might be at bottom (invisible)
// If Z0 ≈ maxZ, plane might be at top (covering elements)
```

### **Issue 2: Plane Generation Error**
```javascript
// Check plane data structure
console.log(`Plane X: [${planeX[0].toFixed(3)}, ..., ${planeX[planeX.length-1].toFixed(3)}]`);
console.log(`Plane Y: [${planeY[0].toFixed(3)}, ..., ${planeY[planeY.length-1].toFixed(3)}]`);
console.log(`Plane Z: all values = ${Z0.toFixed(4)}`);
```

### **Issue 3: Trace Order**
```javascript
// Check if threshold plane is being overridden by mesh3d
const traces = [traceMesh3D, thresholdPlane];  // Current order
// Try: const traces = [thresholdPlane, traceMesh3D];  // Plane first
```

### **Issue 4: Opacity/Visibility**
```javascript
// Check threshold plane properties
const thresholdPlane = {
  type: 'surface',
  opacity: 0.7,        // Should be visible
  showscale: false,    // No colorbar
  showlegend: false,   // No legend entry
  // ... other properties
};
```

## Quick Fixes to Try

### **Fix 1: Increase Plane Opacity**
```javascript
// In createChartImageNoLabels, line ~4740
opacity: 1.0,  // Change from 0.7 to 1.0 for better visibility
```

### **Fix 2: Change Plane Color**
```javascript
// Make plane more visible
colorscale: [
  [0, 'rgba(255,0,0,1.0)'],   // Bright red, full opacity
  [1, 'rgba(255,0,0,1.0)']    // Bright red, full opacity
],
```

### **Fix 3: Add Plane Debugging**
```javascript
// Add this after threshold plane creation
console.log('🔍 Threshold plane debug:', {
  type: thresholdPlane.type,
  xRange: [Math.min(...thresholdPlane.x), Math.max(...thresholdPlane.x)],
  yRange: [Math.min(...thresholdPlane.y), Math.max(...thresholdPlane.y)],
  zValue: thresholdPlane.z[0][0],
  opacity: thresholdPlane.opacity,
  visible: thresholdPlane.visible !== false
});
```

### **Fix 4: Compare with Working Function**
```javascript
// Compare threshold plane creation with draw3DDamageChart
// Check if there are differences in plane generation logic
```

## Test Commands

### **1. Debug Single Chart**
```javascript
debugSection1NoLabels(10, 40);
```

### **2. Compare with Interactive Chart**
```javascript
// Generate interactive chart first (should show threshold plane)
// Then compare with downloaded image
```

### **3. Test Different Thresholds**
```javascript
debugSection1NoLabels(10, 10);  // Low threshold
debugSection1NoLabels(10, 30);  // Medium threshold  
debugSection1NoLabels(10, 50);  // High threshold
```

### **4. Check Console for Errors**
```javascript
// Look for any Plotly errors or warnings
// Check if surface trace is being created properly
```

## Expected Results

### **If Working Correctly:**
- ✅ Console shows threshold plane creation
- ✅ Downloaded image shows red plane at Z0 level
- ✅ Plane spans across entire structure
- ✅ Elements above plane are visible
- ✅ Elements below plane are visible

### **If Still Broken:**
- ❌ No red plane visible in downloaded image
- ❌ Only mesh3d elements visible
- ❌ Possible console errors during plane creation

## Next Steps

1. **Run debug command**: `debugSection1NoLabels(10, 40)`
2. **Check console output** for threshold plane creation logs
3. **Examine downloaded image** for red threshold plane
4. **Report specific findings** from debug output

Run the debug và cho tôi biết console output để tôi có thể xác định chính xác vấn đề!
