# Section 3 Download Debug Guide

## Lỗi đã được sửa

### 1. Enhanced Error Handling
- ✅ Thêm validation cho tất cả prerequisites
- ✅ Improved error messages với chi tiết cụ thể
- ✅ Fallback mechanism khi Section 3 data không có
- ✅ Better handling của nested arrays/objects trong predictions

### 2. Data Validation
- ✅ Kiểm tra mesh data availability
- ✅ Validate file inputs trước khi đọc
- ✅ Check Section 3 results structure
- ✅ Validate prediction values (0-100%)

### 3. Chart Generation Improvements
- ✅ Enhanced error handling trong generateSection3ChartForModeAndThreshold()
- ✅ Better validation của parsed mode data
- ✅ Improved image creation error handling
- ✅ Added size validation cho image blobs

## Cách Debug

### Bước 1: Test Prerequisites
```javascript
// Kiểm tra tất cả prerequisites
testSection3DownloadButton();
```

### Bước 2: Debug Single Chart
```javascript
// Test tạo 1 chart đơn lẻ
debugSection3ChartGeneration(10, 40);
```

### Bước 3: Check Section 3 Data
```javascript
// Kiểm tra dữ liệu Section 3
console.log('Section 3 Results:', window.section3Results);
console.log('Survey Elements:', window.section3Results?.surveyElements);
console.log('Survey Predictions:', window.section3Results?.surveyPredictions);
```

### Bước 4: Test Mode Parsing
```javascript
// Test parsing mode data
const fileInputHealthy = document.getElementById("txt-file-non-damaged");
const fileInputDamaged = document.getElementById("txt-file-damaged");

if (fileInputHealthy.files[0]) {
  const content = await readFileAsText(fileInputHealthy.files[0]);
  const parsed = parseModeShapeFile(content, 10);
  console.log('Mode 10 parsed:', Object.keys(parsed).length, 'nodes');
}
```

## Các lỗi thường gặp và cách khắc phục

### 1. "Failed to fetch" Error
**Nguyên nhân**: Lỗi khi tạo chart image
**Khắc phục**:
- Đảm bảo Plotly.js đã load đầy đủ
- Kiểm tra chart data structure
- Test với debugSection3ChartGeneration()

### 2. "No Section 3 results found"
**Nguyên nhân**: Chưa chạy Section 3 hoặc data không được lưu
**Khắc phục**:
- Chạy Section 3 (trainAndPredictSection3) trước
- Kiểm tra window.section3Results có tồn tại không
- Function sẽ fallback về Section 1 data

### 3. "Invalid prediction value"
**Nguyên nhân**: Prediction values không hợp lệ
**Khắc phục**:
- Kiểm tra surveyPredictions array
- Đảm bảo values trong khoảng 0-100
- Check for nested arrays/objects

### 4. "No valid node data found for mode"
**Nguyên nhân**: Mode không tồn tại trong files
**Khắc phục**:
- Kiểm tra Healthy.txt và Damage.txt có chứa mode đó không
- Validate file format
- Test với mode khác (10, 12, 14, 17, 20)

## Workflow Debug

### 1. Chuẩn bị dữ liệu
```javascript
// 1. Load files
// 2. Run Section 1
processStrainEnergyData();

// 3. Run Section 3  
trainAndPredictSection3();

// 4. Verify data
testSection3DownloadButton();
```

### 2. Test từng bước
```javascript
// Test single chart generation
debugSection3ChartGeneration(10, 40);

// Test với mode khác
debugSection3ChartGeneration(12, 40);
debugSection3ChartGeneration('combine', 40);
```

### 3. Full download test
```javascript
// Chạy full download
downloadMultiMode3DChartsSection3();
```

## Expected Output

### Successful Run
```
🧮 Generating Section 3 data for Mode 10, Z0 40%...
✅ Mesh data available
✅ Section 1 results available  
✅ Mode shape files available
✅ Section 3 results available
📊 Section 3 survey elements: [2134, 2135, ...]
📊 Section 3 predictions: [45.67, 23.45, ...]%
🎯 Section 3 element 2134: 45.67% → 0.4567
✅ Section 3 Mode 10, Z0 40%: maxZ=0.4567, Z0=0.1827, validPredictions=5
📊 Chart data generated successfully: 600 elements, 5 valid predictions
🖼️ Creating chart image for Mode 10, Z0 40%...
✅ Added 3D_Damage_Mode10_Z040.png to ZIP (Section 3) - Size: 125432 bytes
```

### Error Indicators
- ❌ "Failed to fetch" → Chart creation issue
- ⚠️ "No Section 3 results found" → Missing data, using fallback
- ❌ "Invalid prediction value" → Data validation failed
- ❌ "No valid node data found" → Mode parsing failed

## Quick Fixes

### 1. Reset và thử lại
```javascript
// Clear cache và reload
location.reload();
```

### 2. Manual data check
```javascript
// Kiểm tra manual
console.log('Mesh:', !!window.meshData);
console.log('Section1:', !!window.strainEnergyResults);  
console.log('Section3:', !!window.section3Results);
```

### 3. Fallback test
```javascript
// Test với Section 1 data
downloadMultiMode3DCharts(); // Original function
```
