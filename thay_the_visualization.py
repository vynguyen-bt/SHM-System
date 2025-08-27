# THAY THẾ PHẦN VISUALIZATION TRONG CODE GỐC CỦA BẠN
# Sao chép đoạn code này và thay thế phần visualization cuối trong code ANN của bạn

# Import thêm class enhanced visualization
from enhanced_3d_visualization import StructuralHealthMonitoringVisualizer

# Thay thế toàn bộ phần visualization cuối code của bạn (từ dòng "# Thiết lập font chữ Times New Roman") 
# bằng đoạn code dưới đây:

print("\n=== BẮT ĐẦU ENHANCED 3D VISUALIZATION ===")

# Khởi tạo enhanced visualizer
visualizer = StructuralHealthMonitoringVisualizer(X_size=X_size, Y_size=Y_size)

# Chuẩn bị dữ liệu cho visualization
y_pred2_viz = np.abs(y_pred2.flatten())

print("1. Tạo Enhanced 3D Bar Plot...")
# Phiên bản nâng cấp của 3D bar chart gốc
fig1, ax1 = visualizer.enhanced_3d_bar_plot(
    y_pred2_viz,
    title="MODE 1 - Enhanced Damage Detection",
    show_values=True,
    threshold=0.01
)

print("2. Tạo 3D Surface Plot...")
# Surface plot bổ sung cho visualization mượt mà hơn
fig2, ax2 = visualizer.surface_plot_3d(
    y_pred2_viz,
    title="MODE 1 - Surface Damage Analysis"
)

print("3. Tạo Multi-View Analysis...")
# Phân tích đa góc độ toàn diện
fig3 = visualizer.multi_view_comparison(
    y_pred2_viz,
    title="MODE 1 - Multi-Angle Damage Analysis"
)

print("4. Tạo 2D Analysis...")
# Heatmap và contour 2D để có thêm thông tin chi tiết
fig4 = visualizer.contour_heatmap_2d(
    y_pred2_viz,
    title="MODE 1 - 2D Damage Analysis"
)

print("5. Tạo Interactive Visualization...")
# 3D plot tương tác (nếu có plotly)
try:
    fig5 = visualizer.interactive_plotly_visualization(
        y_pred2_viz,
        title="MODE 1 - Interactive Damage Analysis"
    )
    fig5.show()
    print("   Interactive plot đã mở trong trình duyệt")
except ImportError:
    print("   Plotly chưa cài đặt. Cài đặt bằng: pip install plotly")
except Exception as e:
    print(f"   Lỗi interactive visualization: {e}")

print("6. Tạo Animated Visualization...")
# Animation xoay 360 độ
try:
    fig6, anim = visualizer.animated_rotation_plot(
        y_pred2_viz,
        title="MODE 1 - Animated Damage Analysis",
        save_animation=False  # Đặt True để lưu thành GIF
    )
    print("   Animation hoàn thành (đóng cửa sổ để tiếp tục)")
except Exception as e:
    print(f"   Lỗi animation: {e}")

print("\n=== ENHANCED VISUALIZATION HOÀN THÀNH ===")
print("Tất cả các phương pháp visualization đã được áp dụng cho kết quả damage detection.")
print("Enhanced visualizations cung cấp:")
print("- Màu sắc và độ rõ nét tốt hơn")
print("- Nhiều góc nhìn khác nhau")
print("- Tính năng tương tác (với plotly)")
print("- Khả năng animation")
print("- Tùy chọn phân tích 2D")
print("- Cải thiện nhãn và chú thích")

# KẾT THÚC PHẦN THAY THẾ
