@echo off
echo ========================================
echo    SHM-BIM-FEM Server Restart Script
echo ========================================
echo.

echo [1/4] Stopping any existing servers...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im http-server.exe 2>nul
echo Done.

echo.
echo [2/4] Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Starting new server...
cd /d "%~dp0"
echo Current directory: %CD%

echo.
echo Choose server type:
echo 1. Python HTTP Server (port 8080)
echo 2. Node.js HTTP Server (port 8080)
echo 3. Python HTTP Server (port 3000)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Starting Python server on port 8080...
    start "SHM-BIM-FEM Server" cmd /k "cd public && python -m http.server 8080"
    echo Server started! Open: http://localhost:8080
) else if "%choice%"=="2" (
    echo Starting Node.js server on port 8080...
    start "SHM-BIM-FEM Server" cmd /k "cd public && npx http-server -p 8080"
    echo Server started! Open: http://localhost:8080
) else if "%choice%"=="3" (
    echo Starting Python server on port 3000...
    start "SHM-BIM-FEM Server" cmd /k "cd public && python -m http.server 3000"
    echo Server started! Open: http://localhost:3000
) else (
    echo Invalid choice. Starting default Python server on port 8080...
    start "SHM-BIM-FEM Server" cmd /k "cd public && python -m http.server 8080"
    echo Server started! Open: http://localhost:8080
)

echo.
echo [4/4] Opening test page...
timeout /t 3 /nobreak >nul
start http://localhost:8080/test-direct.html

echo.
echo ========================================
echo Server restart completed!
echo Test page should open automatically.
echo ========================================
pause
