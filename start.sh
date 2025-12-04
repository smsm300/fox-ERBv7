#!/bin/bash

echo "========================================"
echo "Fox ERP - Starting Application"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python3 is not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed${NC}"
    exit 1
fi

echo "[1/6] Checking PostgreSQL connection..."
cd fox_pos_project
python3 -c "import psycopg2; conn = psycopg2.connect(dbname='fox_db', user='fox_admin', password='Ebnb@t0t@', host='localhost', port='5444'); print('PostgreSQL connected successfully'); conn.close()" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] PostgreSQL connection failed. Make sure PostgreSQL is running on port 5444${NC}"
    echo ""
fi

echo "[2/6] Running Django migrations..."
python3 manage.py migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Migration failed${NC}"
    cd ..
    exit 1
fi

echo "[3/6] Loading initial data..."
python3 manage.py load_initial_data
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] Initial data loading failed or already exists${NC}"
fi

echo "[4/6] Starting Django Backend on http://localhost:8000..."
python3 manage.py runserver 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 5

cd ..

echo "[5/6] Installing Frontend dependencies (if needed)..."
cd fox-group-erp
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] npm install failed${NC}"
        kill $BACKEND_PID 2>/dev/null
        cd ..
        exit 1
    fi
fi

echo "[6/6] Starting React Frontend on http://localhost:5173..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

echo ""
echo "========================================"
echo -e "${GREEN}Fox ERP Started Successfully!${NC}"
echo "========================================"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Default Login:"
echo "  Admin    - username: admin    password: admin"
echo "  Cashier  - username: cashier  password: 123"
echo ""
echo "Logs:"
echo "  Backend:  backend.log"
echo "  Frontend: frontend.log"
echo ""
echo "PIDs saved to .fox_erp_pids"
echo "$BACKEND_PID" > .fox_erp_pids
echo "$FRONTEND_PID" >> .fox_erp_pids
echo ""
echo "To stop the application, run: ./stop.sh"
echo "Or manually kill processes: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Try to open browser (works on most Linux systems)
if command -v xdg-open &> /dev/null; then
    sleep 3
    xdg-open http://localhost:5173 &>/dev/null &
elif command -v open &> /dev/null; then
    # macOS
    sleep 3
    open http://localhost:5173 &>/dev/null &
fi

echo "Press Ctrl+C to view this message again, or run ./stop.sh to stop all services"
echo ""

# Keep script running
tail -f backend.log frontend.log
