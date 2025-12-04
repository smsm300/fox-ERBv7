@echo off
echo ========================================
echo Fox ERP - Starting Application
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/6] Checking PostgreSQL connection...
cd fox_pos_project
python -c "import psycopg2; conn = psycopg2.connect(dbname='fox_db', user='fox_admin', password='Ebnb@t0t@', host='localhost', port='5444'); print('PostgreSQL connected successfully'); conn.close()" 2>nul
if errorlevel 1 (
    echo [WARNING] PostgreSQL connection failed. Make sure PostgreSQL is running on port 5444
    echo.
)

echo [2/6] Running Django migrations...
python manage.py migrate
if errorlevel 1 (
    echo [ERROR] Migration failed
    cd ..
    pause
    exit /b 1
)

echo [3/6] Loading initial data...
python manage.py load_initial_data
if errorlevel 1 (
    echo [WARNING] Initial data loading failed or already exists
)

echo [4/6] Starting Django Backend on http://localhost:8000...
start "Fox ERP Backend" cmd /k "python manage.py runserver 8000"
timeout /t 5 /nobreak >nul

cd ..

echo [5/6] Installing Frontend dependencies (if needed)...
cd fox-group-erp
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        cd ..
        pause
        exit /b 1
    )
)

echo [6/6] Starting React Frontend on http://localhost:5173...
start "Fox ERP Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo Fox ERP Started Successfully!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Default Login:
echo   Admin    - username: admin    password: admin
echo   Cashier  - username: cashier  password: 123
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:5173

echo.
echo To stop the application, close both terminal windows
echo or press Ctrl+C in each window
echo.
pause
