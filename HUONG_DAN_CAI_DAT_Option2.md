# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG OPTION 2 - ENHANCED VISUALIZATION

##[object Object] Cài đặt các thư viện cần thiết**

Mở Command Prompt hoặc Anaconda Prompt và chạy:

```bash
pip install numpy pandas tensorflow scikit-learn matplotlib seaborn plotly kaleido pillow openpyxl
```

Hoặc nếu bạn sử dụng conda:
```bash
conda install numpy pandas tensorflow scikit-learn matplotlib seaborn plotly pillow openpyxl
pip install kaleido
```

## [object Object]ớc 2: Chuẩn bị các file**

Đảm bảo bạn có các file sau trong cùng thư mục:

1. `enhanced_3d_visualization.py` - Class chính cho visualization
2. `your_enhanced_ann_code.py` - Code ANN đã được nâng cấp
3. Các file dữ liệu Excel của bạn:
   - `2P TRAIN.xlsx`
   - `2P CHECK.xlsx`

## 🎯 **Bước 3: Chỉnh sửa đường dẫn file**

Trong file `your_enhanced_ann_code.py`, cập nhật đường dẫn đến file Excel của bạn:

```python
# Thay đổi đường dẫn này
dataset_train = pd.read_excel(r'ĐƯỜNG_DẪN_CỦA_BẠN\2P TRAIN.xlsx', 
                               sheet_name='KB1.1', engine='openpyxl')

dataset_test = pd.read_excel(r'ĐƯỜNG_DẪN_CỦA_BẠN\2P CHECK.xlsx', 
                              sheet_name='KB1.1', engine='openpyxl')
```

## 🚀 **Bước 4: Chạy code nâng cấp**

```python
python your_enhanced_ann_code.py
```

## 📊 **Những gì bạn sẽ nhận được:**

### **1. Enhanced 3D Bar Plot**
- Màu sắc chuyên nghiệp hơn
- Hiển thị giá trị damage trên các cột
- Font Times New Roman
- Góc nhìn tối ưu

### **2. 3D Surface Plot**
- Hiển thị damage dưới dạng bề mặt liên tục
- Đường contour ở đáy
- Màu sắc gradient mượt mà

### **3. Multi-View Analysis**
- 4 góc nhìn khác nhau trong 1 figure
- Phân tích toàn diện từ nhiều hướng

### **4. 2D Heatmap & Contour**
- Heatmap truyền thống
- Đường đồng mức damage
- Dễ đọc và phân tích

### **5. Interactive Plotly Visualization**
- Tương tác với chuột (xoay, zoom, pan)
- Hiển thị thông tin chi tiết khi hover
- Mở trong trình duyệt web

### **6. Animated Rotation**
- Animation xoay 360 độ
- Có thể lưu thành file GIF

## ⚙️ **Tùy chỉnh nâng cao**

### Thay đổi ngưỡng hiển thị giá trị:
```python
visualizer.enhanced_3d_bar_plot(
    y_pred2_viz,
    threshold=0.005  # Chỉ hiển thị giá trị > 0.5%
)
```

### Lưu animation thành GIF:
```python
visualizer.animated_rotation_plot(
    y_pred2_viz,
    save_animation=True,
    filename="damage_animation.gif"
)
```

### Tắt hiển thị giá trị:
```python
visualizer.enhanced_3d_bar_plot(
    y_pred2_viz,
    show_values=False  # Không hiển thị số
)
```

##[object Object]h với code gốc**

| Tính năng | Code gốc | Enhanced Version |
|-----------|----------|------------------|
| Màu sắc | Cool colormap | Custom damage colormap |
| Tương tác | Không | Plotly interactive |
| Góc nhìn | 1 góc | Nhiều góc + animation |
| Thông tin | Cơ bản | Chi tiết + hover info |
| Xuất file | PNG | PNG, GIF, HTML |
| Phân tích | 3D bar | 7 loại visualization |

##[object Object]**Xử lý lỗi thường gặp**

### Lỗi: "ModuleNotFoundError: No module named 'plotly'"
```bash
pip install plotly kaleido
```

### Lỗi: "No module named 'enhanced_3d_visualization'"
- Đảm bảo file `enhanced_3d_visualization.py` cùng thư mục với code chính

### Lỗi đường dẫn file Excel:
- Kiểm tra đường dẫn file Excel
- Sử dụng raw string: `r'đường_dẫn'`

### Animation không hoạt động:
```bash
pip install pillow
```

## 📈 **Kết quả mong đợi**

Sau khi chạy thành công, bạn sẽ thấy:

1. **6 cửa sổ matplotlib** hiển thị các loại visualization khác nhau
2. **1 trang web** mở trong browser cho interactive plot
3. **Console output** báo cáo tiến trình tạo từng visualization
4. **Chất lượng hình ảnh** cao hơn nhiều so với code gốc

## 💡 **Lời khuyên**

- Chạy từng visualization một nếu máy chậm
- Đóng các cửa sổ plot để tiếp tục
- Sử dụng interactive plot để phân tích chi tiết
- Lưu các plot quan trọng bằng cách thêm `save_path` parameter

## 📞 **Hỗ trợ**

Nếu gặp vấn đề, hãy kiểm tra:
1. Python version >= 3.7
2. Tất cả thư viện đã được cài đặt
3. Đường dẫn file Excel chính xác
4. File `enhanced_3d_visualization.py` trong cùng thư mục
