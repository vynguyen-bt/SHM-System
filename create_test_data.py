# Tạo file test đơn giản với 651 features
print("Creating test data with 651 features...")

# Tạo header
header_parts = ['Case']
for i in range(651):
    header_parts.append(f'U{i+1}')
for i in range(10):
    header_parts.append(f'DI{i+1}')

header_line = ','.join(header_parts)

# Tạo dữ liệu test (1 dòng)
data_parts = ['0']  # Case
for i in range(651):
    data_parts.append('0.001')  # Giá trị test đơn giản
data_parts.extend(['0', '0', '0.3', '0', '0', '0', '0', '0', '0', '0'])  # DI1-DI10

data_line = ','.join(data_parts)

# Ghi file TEST_651.csv
with open('public/uploads/TEST_651.csv', 'w') as f:
    f.write(header_line + '\n')
    f.write(data_line + '\n')

print(f'Created TEST_651.csv with {len(header_parts)} columns')

# Tạo training data đơn giản (5 dòng)
with open('public/uploads/TRAIN_651.csv', 'w') as f:
    f.write(header_line + '\n')

    for case in range(5):
        data_parts = [str(case)]
        for i in range(651):
            data_parts.append('0.001' if case == 0 else f'{0.001 + case * 0.0001}')

        # DI values
        di_values = ['0'] * 10
        if case > 0:
            di_values[0] = str(case * 0.1)  # DI1 có giá trị
        data_parts.extend(di_values)

        f.write(','.join(data_parts) + '\n')

print(f'Created TRAIN_651.csv with {len(header_parts)} columns and 5 training cases')
print("Test data creation completed!")
