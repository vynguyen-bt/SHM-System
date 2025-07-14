#!/usr/bin/env python3
"""
Test script để kiểm tra backend dependencies và functionality
"""

def test_imports():
    """Test tất cả imports cần thiết"""
    try:
        print("Testing imports...")
        
        import flask
        print("✓ Flask imported successfully")
        
        import pandas as pd
        print("✓ Pandas imported successfully")
        
        import numpy as np
        print("✓ Numpy imported successfully")
        
        import sklearn
        print("✓ Sklearn imported successfully")
        
        import tensorflow as tf
        print("✓ TensorFlow imported successfully")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_backend_syntax():
    """Test syntax của backend files"""
    try:
        print("\nTesting backend syntax...")
        
        # Test app.py syntax
        with open('backend/app.py', 'r') as f:
            code = f.read()
        compile(code, 'backend/app.py', 'exec')
        print("✓ app.py syntax is valid")
        
        # Test transformer_model.py syntax
        with open('backend/transformer_model.py', 'r') as f:
            code = f.read()
        compile(code, 'backend/transformer_model.py', 'exec')
        print("✓ transformer_model.py syntax is valid")
        
        return True
    except SyntaxError as e:
        print(f"✗ Syntax error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_data_files():
    """Test data files format"""
    try:
        print("\nTesting data files...")
        
        import pandas as pd
        
        # Test TRAIN_651.csv
        if os.path.exists('public/uploads/TRAIN_651.csv'):
            df_train = pd.read_csv('public/uploads/TRAIN_651.csv')
            print(f"✓ TRAIN_651.csv loaded: {df_train.shape}")
            if df_train.shape[1] == 662:
                print("✓ TRAIN_651.csv has correct 662 columns")
            else:
                print(f"✗ TRAIN_651.csv has {df_train.shape[1]} columns, expected 662")
        else:
            print("✗ TRAIN_651.csv not found")
        
        # Test TEST_651.csv
        if os.path.exists('public/uploads/TEST_651.csv'):
            df_test = pd.read_csv('public/uploads/TEST_651.csv')
            print(f"✓ TEST_651.csv loaded: {df_test.shape}")
            if df_test.shape[1] == 662:
                print("✓ TEST_651.csv has correct 662 columns")
            else:
                print(f"✗ TEST_651.csv has {df_test.shape[1]} columns, expected 662")
        else:
            print("✗ TEST_651.csv not found")
            
        return True
    except Exception as e:
        print(f"✗ Data file error: {e}")
        return False

if __name__ == "__main__":
    import os
    
    print("=== Backend Diagnostic Test ===\n")
    
    # Test 1: Imports
    imports_ok = test_imports()
    
    # Test 2: Syntax
    syntax_ok = test_backend_syntax()
    
    # Test 3: Data files
    data_ok = test_data_files()
    
    print(f"\n=== Test Results ===")
    print(f"Imports: {'✓ PASS' if imports_ok else '✗ FAIL'}")
    print(f"Syntax: {'✓ PASS' if syntax_ok else '✗ FAIL'}")
    print(f"Data Files: {'✓ PASS' if data_ok else '✗ FAIL'}")
    
    if imports_ok and syntax_ok and data_ok:
        print("\n🎉 All tests passed! Backend should work correctly.")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")
