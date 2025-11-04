@echo off
echo ========================================
echo Baguio PineLodge - Server Startup
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and add your PayPal credentials
    echo.
    echo Run: copy .env.example .env
    echo Then edit .env with your credentials
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [INFO] Starting PayPal Payout Server...
echo [INFO] Server will run on http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
