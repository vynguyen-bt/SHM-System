# 🔧 Hướng Dẫn Debug SHM-BIM-FEM System

## 📋 Checklist Debug

### 1. ✅ Kiểm tra Python Environment

```bash
# Kiểm tra Python version
python --version

# Kiểm tra pip
pip --version

# Kiểm tra các packages cần thiết
pip list | findstr flask
pip list | findstr pandas
pip list | findstr numpy
pip list | findstr sklearn
pip list | findstr tensorflow
```

**Nếu thiếu packages, cài đặt:**
```bash
pip install flask flask-cors pandas numpy scikit-learn tensorflow
```

### 2. 🚀 Khởi động Backend

**Option A: Backend đầy đủ (với AI model)**
```bash
cd backend
python app.py
```

**Option B: Backend đơn giản (để test)**
```bash
cd backend
python simple_app.py
```

**Kết quả mong đợi:**
```
🚀 Starting SHM-BIM-FEM Backend
📊 Supports 651 features (U1-U651) + 10 damage indices (DI1-DI10)
🌐 Server will run on http://localhost:5000
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[::1]:5000
```

### 3. 🌐 Test API Connection

**Mở browser và truy cập:**
- `http://localhost:5000/` - Health check
- `file:///[PATH]/public/test_api.html` - API test page

**Hoặc test bằng curl:**
```bash
curl http://localhost:5000/
```

### 4. 📊 Kiểm tra Data Files

**Verify file format:**
```bash
# Kiểm tra số cột trong TRAIN_651.csv
powershell "(Get-Content 'public/uploads/TRAIN_651.csv' | Select-Object -First 1) -split ',' | Measure-Object | Select-Object -ExpandProperty Count"

# Kiểm tra số cột trong TEST_651.csv  
powershell "(Get-Content 'public/uploads/TEST_651.csv' | Select-Object -First 1) -split ',' | Measure-Object | Select-Object -ExpandProperty Count"
```

**Kết quả mong đợi:** 662 cột

### 5. 🔍 Debug Frontend

**Mở Browser Developer Tools (F12):**

1. **Console Tab** - Xem JavaScript errors
2. **Network Tab** - Xem API requests/responses
3. **Sources Tab** - Debug JavaScript code

**Common errors to look for:**
- `CORS policy` errors
- `Network Error` (backend not running)
- `404 Not Found` (wrong API endpoint)
- `500 Internal Server Error` (backend crash)

### 6. 📝 Test Step by Step

**Step 1: Test Backend Health**
```javascript
fetch('http://localhost:5000/')
  .then(response => response.json())
  .then(data => console.log('Backend health:', data))
  .catch(error => console.error('Backend error:', error));
```

**Step 2: Test File Upload**
```javascript
const formData = new FormData();
formData.append('train_file', trainFileInput.files[0]);
formData.append('test_file', testFileInput.files[0]);

fetch('http://localhost:5000/upload-files', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload result:', data))
.catch(error => console.error('Upload error:', error));
```

**Step 3: Test Prediction**
```javascript
fetch('http://localhost:5000/predict', {
  method: 'POST'
})
.then(response => response.json())
.then(data => console.log('Prediction result:', data))
.catch(error => console.error('Prediction error:', error));
```

## 🚨 Common Issues & Solutions

### Issue 1: "Python not found"
**Solution:** 
- Install Python 3.7+ from python.org
- Add Python to PATH environment variable

### Issue 2: "Module not found" 
**Solution:**
```bash
pip install flask flask-cors pandas numpy scikit-learn tensorflow
```

### Issue 3: "Port 5000 already in use"
**Solution:**
- Kill process using port 5000: `netstat -ano | findstr :5000`
- Or change port in app.py: `app.run(port=5001)`

### Issue 4: "CORS policy error"
**Solution:** 
- Backend should have `CORS(app)` enabled
- Check if backend is running on correct port

### Issue 5: "File format error"
**Solution:**
- Ensure CSV files have exactly 662 columns
- Use provided TRAIN_651.csv and TEST_651.csv

### Issue 6: "Model training fails"
**Solution:**
- Check TensorFlow installation
- Use simple_app.py for testing without AI model
- Verify data format (651 features + 10 damage indices)

## 📞 Debug Commands

**Check if backend is running:**
```bash
netstat -ano | findstr :5000
```

**Test API manually:**
```bash
curl -X GET http://localhost:5000/
curl -X POST http://localhost:5000/predict
```

**View backend logs:**
- Check terminal where backend is running
- Look for error messages and stack traces

## 🎯 Expected Workflow

1. ✅ Start backend → See "Running on http://localhost:5000"
2. ✅ Open frontend → Load index.html in browser  
3. ✅ Upload files → Use TRAIN_651.csv and TEST_651.csv
4. ✅ Train model → See "Model trained successfully"
5. ✅ Predict → Get damage prediction results

## 📧 If Still Having Issues

1. **Capture error messages** from:
   - Backend terminal output
   - Browser console (F12)
   - Network tab in developer tools

2. **Verify environment**:
   - Python version
   - Installed packages
   - File permissions
   - Port availability

3. **Try simplified version**:
   - Use simple_app.py instead of app.py
   - Test with provided test files
   - Check each step individually
