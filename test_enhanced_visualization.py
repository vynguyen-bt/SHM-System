# TEST ENHANCED VISUALIZATION - KHÔNG CẦN FILE EXCEL
# Script này sẽ test enhanced visualization với dữ liệu mẫu

import numpy as np
import matplotlib.pyplot as plt

# Tạo dữ liệu mẫu giống như output của ANN
def create_test_data():
    """Tạo dữ liệu test giống y_pred2 của bạn"""
    # Tạo mảng 600 phần tử (30x20 grid)
    damage_data = np.zeros(600)
    
    # Thêm damage tại vị trí P = [29, 284] như trong code gốc
    damage_data[29] = 0.85   # Damage cao tại element 29
    damage_data[284] = 0.72  # Damage cao tại element 284
    
    # Thêm một số damage ngẫu nhiên mức thấp
    np.random.seed(42)
    random_indices = np.random.choice(600, 15, replace=False)
    damage_data[random_indices] = np.random.uniform(0.05, 0.3, 15)
    
    return damage_data

# Test import enhanced visualization
try:
    from enhanced_3d_visualization import StructuralHealthMonitoringVisualizer
    print("✅ Enhanced visualization import thành công!")
except ImportError as e:
    print(f"❌ Lỗi import: {e}")
    print("Đảm bảo file 'enhanced_3d_visualization.py' trong cùng thư mục")
    exit()

# Khởi tạo visualizer
visualizer = StructuralHealthMonitoringVisualizer(X_size=30, Y_size=20)
print("✅ Visualizer khởi tạo thành công!")

# Tạo dữ liệu test
test_data = create_test_data()
print(f"✅ Dữ liệu test tạo thành công! Shape: {test_data.shape}")
print(f"   Max damage: {np.max(test_data):.3f}")
print(f"   Số vị trí có damage > 0: {np.sum(test_data > 0)}")

print("\n" + "="*50)
print("BẮT ĐẦU TEST CÁC VISUALIZATION METHODS")
print("="*50)

# Test 1: Enhanced 3D Bar Plot
print("\n1. Testing Enhanced 3D Bar Plot...")
try:
    fig1, ax1 = visualizer.enhanced_3d_bar_plot(
        test_data,
        title="TEST - Enhanced 3D Bar Plot",
        show_values=True,
        threshold=0.05
    )
    print("✅ Enhanced 3D Bar Plot: THÀNH CÔNG")
except Exception as e:
    print(f"❌ Enhanced 3D Bar Plot: LỖI - {e}")

# Test 2: Surface Plot
print("\n2. Testing 3D Surface Plot...")
try:
    fig2, ax2 = visualizer.surface_plot_3d(
        test_data,
        title="TEST - 3D Surface Plot"
    )
    print("✅ 3D Surface Plot: THÀNH CÔNG")
except Exception as e:
    print(f"❌ 3D Surface Plot: LỖI - {e}")

# Test 3: Wireframe Plot
print("\n3. Testing 3D Wireframe Plot...")
try:
    fig3, ax3 = visualizer.wireframe_plot_3d(
        test_data,
        title="TEST - 3D Wireframe Plot"
    )
    print("✅ 3D Wireframe Plot: THÀNH CÔNG")
except Exception as e:
    print(f"❌ 3D Wireframe Plot: LỖI - {e}")

# Test 4: Multi-View
print("\n4. Testing Multi-View Comparison...")
try:
    fig4 = visualizer.multi_view_comparison(
        test_data,
        title="TEST - Multi-View Analysis"
    )
    print("✅ Multi-View Comparison: THÀNH CÔNG")
except Exception as e:
    print(f"❌ Multi-View Comparison: LỖI - {e}")

# Test 5: 2D Heatmap & Contour
print("\n5. Testing 2D Heatmap & Contour...")
try:
    fig5 = visualizer.contour_heatmap_2d(
        test_data,
        title="TEST - 2D Analysis"
    )
    print("✅ 2D Heatmap & Contour: THÀNH CÔNG")
except Exception as e:
    print(f"❌ 2D Heatmap & Contour: LỖI - {e}")

# Test 6: Interactive Plotly (optional)
print("\n6. Testing Interactive Plotly Visualization...")
try:
    fig6 = visualizer.interactive_plotly_visualization(
        test_data,
        title="TEST - Interactive Visualization"
    )
    fig6.show()
    print("✅ Interactive Plotly: THÀNH CÔNG - Đã mở trong browser")
except ImportError:
    print("⚠️  Interactive Plotly: PLOTLY CHƯA CÀI ĐẶT")
    print("   Cài đặt bằng: pip install plotly kaleido")
except Exception as e:
    print(f"❌ Interactive Plotly: LỖI - {e}")

# Test 7: Animation (optional)
print("\n7. Testing Animated Rotation...")
try:
    fig7, anim = visualizer.animated_rotation_plot(
        test_data,
        title="TEST - Animation",
        save_animation=False
    )
    print("✅ Animated Rotation: THÀNH CÔNG")
    print("   (Đóng cửa sổ animation để tiếp tục)")
except Exception as e:
    print(f"❌ Animated Rotation: LỖI - {e}")

print("\n" + "="*50)
print("KẾT QUẢ TEST")
print("="*50)
print("Nếu tất cả test đều THÀNH CÔNG, bạn có thể:")
print("1. Sử dụng file 'thay_the_visualization.py' để thay thế code gốc")
print("2. Hoặc sử dụng file 'your_enhanced_ann_code.py' (cần cập nhật đường dẫn Excel)")
print("\nNếu có LỖI, kiểm tra:")
print("- Cài đặt đủ thư viện: matplotlib, numpy, seaborn")
print("- File enhanced_3d_visualization.py trong cùng thư mục")
print("- Python version >= 3.7")

print("\n🎉 TEST HOÀN THÀNH!")
print("Đóng các cửa sổ matplotlib để kết thúc.")
