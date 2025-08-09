#!/usr/bin/env python3
"""
Script để tạo dữ liệu mô phỏng cho các mode 10, 12, 14, 17, 20
cho tính năng Mode Combine trong SHM-BIM-FEM system
"""

import math
import random

def generate_mode_data(base_file_path, output_file_path, target_modes=[10, 12, 14, 17, 20]):
    """
    Tạo dữ liệu mô phỏng cho các mode dựa trên dữ liệu Mode 1 hiện có
    """
    print(f"📁 Reading base data from: {base_file_path}")
    
    # Đọc dữ liệu Mode 1 hiện có
    with open(base_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Parse header và dữ liệu Mode 1
    header = lines[0].strip()
    mode1_data = []
    
    for line in lines[1:]:
        line = line.strip()
        if line:
            parts = line.split('\t')
            if len(parts) >= 3:
                node_id = int(parts[0])
                mode = int(parts[1])
                value = float(parts[2])
                mode1_data.append((node_id, mode, value))
    
    print(f"✅ Parsed {len(mode1_data)} data points for Mode 1")
    
    # Tạo dữ liệu cho các mode mới
    all_data = []
    
    # Giữ lại dữ liệu Mode 1
    all_data.extend(mode1_data)
    
    # Tạo dữ liệu cho các mode mới
    for target_mode in target_modes:
        print(f"🎵 Generating data for Mode {target_mode}...")
        
        for node_id, _, base_value in mode1_data:
            # Tạo variation factor dựa trên mode number
            # Mode cao hơn thường có frequency cao hơn và pattern khác
            mode_factor = 1.0 + (target_mode - 1) * 0.1
            
            # Thêm variation dựa trên node position
            position_factor = 1.0 + 0.2 * math.sin(node_id * math.pi / 100)
            
            # Thêm random noise nhỏ để tạo realistic data
            noise_factor = 1.0 + random.uniform(-0.05, 0.05)
            
            # Tính giá trị mới
            new_value = base_value * mode_factor * position_factor * noise_factor
            
            # Đảm bảo giá trị không âm và reasonable
            new_value = max(0, new_value)
            if new_value > 0:
                new_value = round(new_value, 9)  # 9 decimal places như dữ liệu gốc
            
            all_data.append((node_id, target_mode, new_value))
    
    # Ghi dữ liệu ra file mới
    print(f"💾 Writing extended data to: {output_file_path}")
    
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write(header + '\n')
        
        # Sort by node_id, then by mode
        all_data.sort(key=lambda x: (x[0], x[1]))
        
        for node_id, mode, value in all_data:
            f.write(f"{node_id}\t{mode}\t{value}\n")
    
    print(f"✅ Generated data for {len(target_modes) + 1} modes ({len(all_data)} total data points)")
    
    # Verification
    modes_count = {}
    for _, mode, _ in all_data:
        modes_count[mode] = modes_count.get(mode, 0) + 1
    
    print("📊 Data distribution:")
    for mode in sorted(modes_count.keys()):
        print(f"   Mode {mode}: {modes_count[mode]} data points")

def main():
    """Main function"""
    print("🚀 === GENERATING MULTI-MODE DATA FOR SHM-BIM-FEM ===")
    
    # Set random seed for reproducible results
    random.seed(42)
    
    # Generate extended Damage.txt
    generate_mode_data(
        base_file_path="Data/Damage.txt",
        output_file_path="Data/Damage_MultiMode.txt",
        target_modes=[10, 12, 14, 17, 20]
    )
    
    # Generate extended Healthy.txt
    generate_mode_data(
        base_file_path="Data/Healthy.txt", 
        output_file_path="Data/Healthy_MultiMode.txt",
        target_modes=[10, 12, 14, 17, 20]
    )
    
    print("\n🎉 Multi-mode data generation completed!")
    print("📁 Generated files:")
    print("   - Data/Damage_MultiMode.txt")
    print("   - Data/Healthy_MultiMode.txt")
    print("\n💡 These files contain data for modes: 1, 10, 12, 14, 17, 20")

if __name__ == "__main__":
    main()
