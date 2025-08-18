# Quick Debug - Section 1 Threshold Plane Missing

## Chạy debug ngay:

```javascript
debugSection1NoLabels(10, 40);
```

## Nếu vẫn lỗi, thử fix nhanh:

### Fix 1: Revert về function gốc
```javascript
// Trong downloadMultiMode3DCharts, thay đổi từ:
const imageBlob = await createChartImageNoLabels(chartData, mode, threshold);

// Về:
const imageBlob = await createChartImage(chartData, mode, threshold);
```

### Fix 2: Kiểm tra threshold plane trong createChartImageNoLabels
- Có thể Z0 value bị sai
- Có thể plane generation bị lỗi
- Có thể traces order bị sai

## Test ngay:
1. Chạy `debugSection1NoLabels(10, 40)`
2. Kiểm tra console output
3. Xem downloaded image có threshold plane không
4. Báo cáo kết quả để tôi fix chính xác
