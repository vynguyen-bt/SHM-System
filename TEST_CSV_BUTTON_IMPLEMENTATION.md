# TEST.csv Based Multi-Mode 3D Charts Button Implementation

## Tổng quan
Đã tạo thành công button "Download Multi-3D (TEST.csv Based)" ở Mục 1 với đặc điểm:
- 6 modes: [10, 12, 14, 17, 20, 'combine']
- Chỉ ngưỡng 40%
- Damage indices dựa trên TEST.csv
- Tất cả elements = 0, trừ elements được xác định từ TEST.csv

## Các thay đổi đã thực hiện

### 1. HTML Interface (public/index.html)
- ✅ Thêm button "Download Multi-3D (TEST.csv Based)" vào Mục 1
- ✅ ID: `download-charts-test-csv-btn`
- ✅ Màu cyan (#17a2b8) để phân biệt với button gốc

### 2. JavaScript Functions (public/js/calculations.js)
- ✅ `downloadMultiMode3DChartsTestCSV()`: Function chính để download charts
- ✅ `generateTestCSVChartForModeAndThreshold()`: Tạo dữ liệu chart dựa trên TEST.csv
- ✅ `parseCSVData()`: Parse CSV data từ text
- ✅ `testTestCSVDownloadButton()`: Test function
- ✅ `debugTestCSVChartGeneration()`: Debug function

## Logic hoạt động

### 1. **Đọc TEST.csv**
```javascript
// Thứ tự ưu tiên:
1. window.testCSVData (cached)
2. ./Data/TEST.csv (fetch)
3. Fallback data (sample)
```

### 2. **Element Mapping**
```javascript
const elementMapping = {
  DI1: 55,  // Element 55
  DI2: 95,  // Element 95  
  DI3: 60,  // Element 60
  DI4: 75   // Element 75 (nếu có)
};
```

### 3. **Damage Calculation**
```javascript
// Nếu TEST.csv có DI1 = 0.1:
const basePercent = 0.1 * 100;        // 10%
const minPercent = 10 - 1;            // 9%
const maxPercent = 10 + 0.99;         // 10.99%
const randomPercent = random(9, 10.99); // Random trong khoảng
```

### 4. **Chart Generation**
- Tất cả elements = 0
- Chỉ elements từ TEST.csv có damage > 0
- Mọi thứ khác giống y chang button gốc

## Cấu hình Download

### File Output
- **6 charts total** (chỉ ngưỡng 40%)
- **File naming**: Giống button gốc
  - `3D_Damage_Mode10_Z040.png`
  - `3D_Damage_Mode12_Z040.png`
  - `3D_Damage_Mode14_Z040.png`
  - `3D_Damage_Mode17_Z040.png`
  - `3D_Damage_Mode20_Z040.png`
  - `3D_Damage_ModeCombine_Z040.png`
- **ZIP file**: `SHM_TestCSV_3D_Charts_{date}.zip`

### Visual Properties
- ✅ Giống y chang button gốc:
  - Layout dimensions: 1200x900
  - Font: Times New Roman
  - Colors: Green-to-Red colorscale
  - Threshold plane: 40% (dark red, opacity 0.5)
  - Camera: Orthographic
  - Lighting: Default Plotly

## Ví dụ hoạt động

### Sample TEST.csv:
```csv
Case,U1,U2,...,U651,DI1,DI2,DI3,DI4
1,0.001,0.002,...,0.651,0.1,0.08,0.12,0.0
```

### Kết quả:
- **Element 55**: 9.00-10.99% (random, từ DI1=0.1)
- **Element 95**: 7.00-8.99% (random, từ DI2=0.08)  
- **Element 60**: 11.00-12.99% (random, từ DI3=0.12)
- **Element 75**: 0% (DI4=0.0)
- **Tất cả elements khác**: 0%

## Cách sử dụng

### Bước 1: Chuẩn bị dữ liệu
1. Load SElement.txt
2. Load Healthy.txt và Damage.txt
3. Đảm bảo TEST.csv có trong Data folder hoặc uploads

### Bước 2: Test
```javascript
// Test prerequisites
testTestCSVDownloadButton();

// Test single chart
debugTestCSVChartGeneration(10, 40);
```

### Bước 3: Download
1. Click button "Download Multi-3D (TEST.csv Based)"
2. Theo dõi progress bar
3. ZIP file sẽ tự động download

## Khác biệt với button gốc

| Aspect | Button Gốc | Button TEST.csv |
|--------|------------|-----------------|
| Data source | Strain energy calculation | TEST.csv DI values |
| Elements shown | All damaged elements | Only TEST.csv mapped elements |
| Thresholds | [10,20,30,40,50] | [40] only |
| Total charts | 30 | 6 |
| Element mapping | Dynamic from calculation | Fixed: DI1→55, DI2→95, DI3→60 |
| Damage values | Calculated indices | Random within DI±1% |
| ZIP filename | `SHM_3D_Damage_Charts_` | `SHM_TestCSV_3D_Charts_` |

## Error Handling
- ✅ Fallback nếu TEST.csv không tìm thấy
- ✅ Validation cho CSV data structure
- ✅ Skip elements nếu DI = 0
- ✅ Continue processing nếu 1 chart fail

## Debug Commands

```javascript
// Test button functionality
testTestCSVDownloadButton();

// Debug single chart generation
debugTestCSVChartGeneration(10, 40);

// Check TEST.csv data
console.log('TEST.csv data:', window.testCSVData);

// Test with different mode
debugTestCSVChartGeneration('combine', 40);
```

## Status
✅ **HOÀN THÀNH** - Button đã được tạo và sẵn sàng sử dụng

## Expected Output
Khi chạy thành công, sẽ tạo ra 6 biểu đồ 3D với:
- Chỉ elements từ TEST.csv có damage > 0
- Tất cả elements khác = 0
- Visual properties giống y chang button gốc
- Chỉ ngưỡng 40%
