# Plotly Image Generation Debug Guide

## Lỗi hiện tại
```
❌ Error converting data URL to blob: Error: Invalid data URL format
```

## Nguyên nhân có thể
1. **Plotly.toImage() trả về format không đúng**
2. **imageDataOnly: true option gây vấn đề**
3. **Canvas rendering issue với 3D charts**
4. **Browser compatibility issue**

## Các cải tiến đã thực hiện

### 1. Enhanced dataURLToBlob() Function
- ✅ Detailed logging để debug input
- ✅ Better validation cho data URL format
- ✅ Improved error messages
- ✅ Support cho different data URL formats

### 2. Enhanced createChartImage() Function
- ✅ Primary + Fallback image generation methods
- ✅ Detailed logging cho Plotly.toImage() output
- ✅ Better validation cho returned data
- ✅ Improved error handling

### 3. Debug Functions
- ✅ `debugPlotlyImageGeneration()`: Test simple Plotly chart
- ✅ `debugSection3ChartGeneration()`: Test Section 3 specific chart
- ✅ Enhanced logging throughout

## Cách debug từng bước

### Bước 1: Test Plotly cơ bản
```javascript
// Test Plotly image generation với simple chart
debugPlotlyImageGeneration();
```

**Mong đợi**: 
- Simple chart được tạo thành công
- Image data URL được generate
- Blob conversion thành công
- Test image được download

### Bước 2: Kiểm tra console output
Sau khi chạy `debugPlotlyImageGeneration()`, kiểm tra:

```
📊 Image data type: string
📊 Image data length: [số lớn > 1000]
📊 Image data preview: data:image/png;base64,iVBORw0KGgo...
✅ Blob created: [size] bytes
```

### Bước 3: Nếu Bước 1 thành công
```javascript
// Test Section 3 chart generation
debugSection3ChartGeneration(10, 40);
```

### Bước 4: Nếu Bước 1 thất bại
Có thể là vấn đề với Plotly library hoặc browser. Thử:

1. **Refresh page** và thử lại
2. **Check Plotly version** trong console:
   ```javascript
   console.log('Plotly version:', Plotly.version);
   ```
3. **Check browser compatibility**

## Các giải pháp thay thế

### Giải pháp 1: Sử dụng html2canvas
Nếu Plotly.toImage() không hoạt động, có thể dùng html2canvas:

```javascript
// Alternative: Use html2canvas (cần thêm library)
const canvas = await html2canvas(tempDiv);
const imageDataURL = canvas.toDataURL('image/png');
```

### Giải pháp 2: Simplified Plotly options
Thử với options đơn giản hơn:

```javascript
const imageDataURL = await Plotly.toImage(tempDiv, {
  format: 'png',
  width: 800,
  height: 600,
  scale: 1  // Reduced scale
});
```

### Giải pháp 3: Canvas extraction
Trực tiếp extract canvas từ Plotly:

```javascript
const canvas = tempDiv.querySelector('canvas');
const imageDataURL = canvas.toDataURL('image/png');
```

## Expected Debug Output

### Successful Case:
```
🔧 === DEBUGGING PLOTLY IMAGE GENERATION ===
📊 Creating simple test chart...
✅ Test chart created
🖼️ Testing image generation...
📊 Image data type: string
📊 Image data length: 15234
📊 Image data preview: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAC+ZpjcAAAKQ2lDQ1BJQ0MgUHJvZmlsZQAASA2dlndUU9kWh8+9N73QEiIgJfQaegkg0jtIFQRRiUmAUAKGhCZ2RAVGFBEpVmRUwAFHhyJjRRQLg4Ji1wnyEFDGwVFEReXdjGsJ7601896a/cdZ39nnt9fZZ+9917oAUPyCBMJ0AEHD...
🔄 Converting data URL to blob...
📊 Data URL type: string
📊 Data URL length: 15234
📊 Data URL preview: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAYAAAC+ZpjcAAAKQ2lDQ1BJQ0MgUHJvZmlsZQAASA2dlndUU9kWh8+9N73QEiIgJfQaegkg0jtIFQRRiUmAUAKGhCZ2RAVGFBEpVmRUwAFHhyJjRRQLg4Ji1wnyEFDGwVFEReXdjGsJ7601896a/cdZ39nnt9fZZ+9917oAUPyCBMJ0AEHD...
📊 Header: data:image/png;base64
📊 Data length: 15180
📊 MIME type: image/png
📊 Is base64: true
✅ Data URL converted to blob: 11385 bytes, type: image/png
✅ Blob created: 11385 bytes
🎉 Plotly image generation test completed successfully!
```

### Failed Case:
```
❌ Plotly image generation test failed: Error: ...
📊 Image data type: undefined
📊 Image data length: null
📊 Image data preview: null
```

## Troubleshooting Steps

### 1. Nếu simple test thất bại:
- Kiểm tra Plotly library đã load chưa
- Refresh browser và thử lại
- Check browser console cho errors khác

### 2. Nếu simple test thành công nhưng Section 3 thất bại:
- Vấn đề với 3D chart complexity
- Thử giảm scale từ 3 xuống 2 hoặc 1
- Thử simplified layout options

### 3. Nếu data URL format sai:
- Check Plotly version compatibility
- Thử different export options
- Consider alternative export methods

## Quick Fix Commands

```javascript
// Test 1: Simple Plotly test
debugPlotlyImageGeneration();

// Test 2: Section 3 test
debugSection3ChartGeneration(10, 40);

// Test 3: Check Plotly
console.log('Plotly available:', typeof Plotly);
console.log('Plotly version:', Plotly.version);

// Test 4: Manual data URL test
const testURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const testBlob = dataURLToBlob(testURL);
console.log('Manual test blob:', testBlob.size, 'bytes');
```
