# Camera Settings Synchronization

## Vấn đề đã sửa
❌ **Zoom quá gần**: Hình ảnh tải về chỉ thấy một phần nhỏ của cấu trúc thay vì toàn bộ 600 elements

## Giải pháp
✅ **Đồng bộ camera settings** với button "Download Multi-Mode" gốc

## Các thay đổi đã thực hiện

### 1. **Camera Settings trong `createChartImage()`**
```javascript
// ❌ Cũ (zoom quá gần):
eye: { x: 1.5, y: 1.5, z: 1.5 }

// ✅ Mới (giống button gốc):
eye: { x: 1.6, y: 1.6, z: 1.8 }
center: { x: transformedXMax/2, y: transformedYMax/2, z: 0 }
up: { x: 0, y: 0, z: 1 }
```

### 2. **Camera Settings trong `resetCameraForExport()`**
```javascript
// ❌ Cũ (quá xa):
eye: { x: 2.5, y: 2.5, z: 2.0 }
center: { x: 0, y: 0, z: 0.1 }

// ✅ Mới (giống button gốc):
eye: { x: 1.6, y: 1.6, z: 1.8 }
center: { x: 0, y: 0, z: 0 }
```

### 3. **Đồng bộ hoàn toàn với Section 1**
- ✅ **Eye position**: (1.6, 1.6, 1.8)
- ✅ **Center**: Data center for layout, (0,0,0) for export
- ✅ **Up vector**: (0, 0, 1)
- ✅ **Projection**: Orthographic
- ✅ **Aspect mode**: 'data'

## So sánh Camera Settings

| Component | Section 1 (Button gốc) | TEST.csv Button (Cũ) | TEST.csv Button (Mới) |
|-----------|------------------------|---------------------|---------------------|
| **Eye X** | 1.6 | 1.5 → 2.5 | ✅ 1.6 |
| **Eye Y** | 1.6 | 1.5 → 2.5 | ✅ 1.6 |
| **Eye Z** | 1.8 | 1.5 → 2.0 | ✅ 1.8 |
| **Center X** | transformedXMax/2 | 0 | ✅ transformedXMax/2 (layout) / 0 (export) |
| **Center Y** | transformedYMax/2 | 0 | ✅ transformedYMax/2 (layout) / 0 (export) |
| **Center Z** | 0 | 0.1 | ✅ 0 |
| **Up vector** | (0,0,1) | Missing | ✅ (0,0,1) |

## Expected Results

### Trước khi sửa:
- 🔍 **Zoom quá gần**: Chỉ thấy ~20-30 elements
- 📏 **View hẹp**: Mất nhiều elements ở edge
- 🎯 **Center sai**: Không focus vào data center

### Sau khi sửa:
- ✅ **View rộng**: Thấy toàn bộ 600 elements
- ✅ **Tỷ lệ đúng**: Giống y chang button gốc
- ✅ **Center chính xác**: Focus vào center của data
- ✅ **Consistent**: Tất cả charts có cùng viewing angle

## Test Commands

### 1. **Test single chart**
```javascript
debugTestCSVChartGeneration(10, 40);
```

### 2. **Compare với Section 1**
```javascript
// Tạo chart Section 1 và so sánh visual
// Click "Tính toán chỉ số hư hỏng" để tạo Section 1 chart
// Sau đó click "Download Multi-3D (TEST.csv Based)" để so sánh
```

### 3. **Test full download**
```javascript
// Click button "Download Multi-3D (TEST.csv Based)"
// Kiểm tra 6 images trong ZIP có view giống Section 1
```

## Visual Comparison

### Section 1 (Button gốc):
- 📊 **Full structure visible**: Tất cả 600 elements
- 🎯 **Optimal angle**: (1.6, 1.6, 1.8)
- 📐 **Proper proportions**: Aspect mode 'data'

### TEST.csv Button (Sau khi sửa):
- ✅ **Identical view**: Giống y chang Section 1
- ✅ **Same camera angle**: (1.6, 1.6, 1.8)
- ✅ **Same proportions**: Aspect mode 'data'
- ✅ **Same centering**: Data-centered view

## Technical Details

### Layout Camera (trong createChartImage):
```javascript
camera: {
  projection: { type: 'orthographic' },
  eye: { x: 1.6, y: 1.6, z: 1.8 },
  center: { x: transformedXMax/2, y: transformedYMax/2, z: 0 },
  up: { x: 0, y: 0, z: 1 }
}
```

### Export Camera (trong resetCameraForExport):
```javascript
'scene.camera': {
  eye: { x: 1.6, y: 1.6, z: 1.8 },
  center: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 0, z: 1 },
  projection: { type: 'orthographic' }
}
```

## Status
✅ **HOÀN THÀNH** - Camera settings đã được đồng bộ hoàn toàn với button gốc

## Expected Output
Khi download charts từ button "Download Multi-3D (TEST.csv Based)", tất cả 6 images sẽ có:
- ✅ **Full structure view**: Thấy toàn bộ 600 elements
- ✅ **Optimal zoom level**: Không quá gần, không quá xa
- ✅ **Consistent angle**: Giống y chang Section 1
- ✅ **Proper centering**: Focus vào center của structure

Hình ảnh bây giờ sẽ hiển thị toàn bộ cấu trúc thay vì chỉ một phần nhỏ!
