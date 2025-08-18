# Text Labels Font Size Update

## Vấn đề đã sửa
❌ **Text labels quá nhỏ**: Kích cỡ chữ 10 trong biểu đồ 3D Section 3 khó đọc

## Giải pháp
✅ **Tăng font size từ 10 → 16** và thêm bold weight cho tất cả text labels

## Các thay đổi đã thực hiện

### 1. **Section 1 (draw3DDamageChart) - Line 6779**
```javascript
// ❌ Cũ:
textfont: {
  family: 'Arial, sans-serif',
  size: 10,
  color: 'darkred'
}

// ✅ Mới:
textfont: {
  family: 'Arial, sans-serif',
  size: 16,        // INCREASED: 10→16 for better visibility
  color: 'darkred',
  weight: 'bold'   // ADD: Bold text for better readability
}
```

### 2. **TEST.csv Button (createChartImageFromSection1) - Line 4366**
```javascript
// ❌ Cũ:
textfont: {
  family: 'Arial, sans-serif',
  size: 10,
  color: 'darkred'
}

// ✅ Mới:
textfont: {
  family: 'Arial, sans-serif',
  size: 16,        // INCREASED: 10→16 for better visibility
  color: 'darkred',
  weight: 'bold'   // ADD: Bold text for better readability
}
```

### 3. **Section 3 (createChartImage) - Line 4720-4754**
```javascript
// ❌ Cũ: Text labels bị comment out
// ✅ NO TEXT LABELS - CLEAN MINIMAL DESIGN
const textLabels = [];
// Removed all text label generation for clean appearance

// ✅ Mới: Enable text labels với font size lớn
textfont: {
  family: 'Arial, sans-serif',
  size: 16,        // INCREASED: 10→16 for better visibility
  color: 'darkred',
  weight: 'bold'   // ADD: Bold text for better readability
}
```

## Text Label Format

### **Section 1 & TEST.csv Button:**
- Format: `"5.2%"` (chỉ phần trăm)
- Position: Slightly above element (z + 0.002)

### **Section 3:**
- Format: `"Element 55: 5.2%"` (bao gồm Element ID)
- Position: Slightly above element (z + 0.002)
- Enhanced hover info với Element ID

## Visual Improvements

### **Font Properties:**
- ✅ **Size**: 10 → 16 (60% increase)
- ✅ **Weight**: Normal → Bold
- ✅ **Family**: Arial, sans-serif (consistent)
- ✅ **Color**: darkred (consistent)

### **Readability:**
- ✅ **Better visibility** at all zoom levels
- ✅ **Bold text** stands out against 3D background
- ✅ **Consistent sizing** across all sections
- ✅ **Professional appearance**

## Expected Results

### **Before (Size 10):**
- 📝 Text labels barely visible
- 🔍 Hard to read at normal zoom
- 📊 Poor user experience

### **After (Size 16 + Bold):**
- ✅ **Clear visibility**: Easy to read at all zoom levels
- ✅ **Professional look**: Bold text stands out
- ✅ **Better UX**: Users can easily identify damaged elements
- ✅ **Consistent**: Same size across all sections

## Text Label Examples

### **Section 1:**
```
"9.2%" (Element 55)
"7.8%" (Element 95)
"11.4%" (Element 60)
```

### **Section 3:**
```
"Element 55: 9.2%"
"Element 95: 7.8%"
"Element 60: 11.4%"
```

### **TEST.csv Button:**
```
"9.67%" (Element 55)
"7.89%" (Element 95)
"11.34%" (Element 60)
```

## Technical Details

### **Text Positioning:**
- X, Y: Element center coordinates (transformed)
- Z: Element damage value + 0.002 offset
- Position: 'middle center'

### **Hover Information:**
```javascript
hovertemplate: '<b>Phần tử hư hỏng</b><br>' +
               '<b>Element ID:</b> ' + element.id + '<br>' +
               '<b>Tọa độ:</b> (%{x:.4f}, %{y:.4f})<br>' +
               '<b>Giá trị:</b> ' + percentage + '%<br>' +
               '<extra></extra>'
```

### **Display Conditions:**
- Only show for elements with damage ≥ threshold (Z0)
- Automatically positioned above element
- No legend entry (showlegend: false)

## Status
✅ **HOÀN THÀNH** - Text labels bây giờ có font size 16 + bold, dễ đọc hơn nhiều

## Test Commands

### **Test Section 1:**
```javascript
// Load files và click "Tính toán chỉ số hư hỏng"
// Check text labels có size 16 + bold
```

### **Test Section 3:**
```javascript
debugSection3ChartGeneration(10, 40);
// Check text labels format "Element XX: Y.Y%"
```

### **Test TEST.csv Button:**
```javascript
debugTestCSVChartGeneration(10, 40);
// Check text labels có size 16 + bold
```

## Benefits

1. **Better Readability**: Font size 60% lớn hơn
2. **Professional Look**: Bold text nổi bật
3. **Consistent UX**: Cùng size across all sections
4. **Better Accessibility**: Easier for users with vision difficulties
5. **Enhanced Information**: Section 3 includes Element ID

Text labels bây giờ sẽ rõ ràng và dễ đọc hơn nhiều trong tất cả biểu đồ 3D!
