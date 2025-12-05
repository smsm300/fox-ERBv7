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

echo "[1/7] Setting up Python virtual environment..."
cd fox_pos_project

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to create virtual environment${NC}"
        cd ..
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

echo "[2/7] Installing Python dependencies..."
if [ ! -f "venv/.installed" ]; then
    echo "Installing requirements..."
    pip install --upgrade pip
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install requirements${NC}"
        deactivate
        cd ..
        exit 1
    fi
    touch venv/.installed
else
    echo "Dependencies already installed"
fi

echo "[3/7] Checking PostgreSQL connection..."
python3 -c "import psycopg2; conn = psycopg2.connect(dbname='fox_db', user='fox_admin', password='Ebnb@t0t@', host='localhost', port='5444'); print('PostgreSQL connected successfully'); conn.close()" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] PostgreSQL connection failed. Make sure PostgreSQL is running on port 5444${NC}"
    echo ""
fi

echo "[4/7] Running Django migrations..."
python3 manage.py migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Migration failed${NC}"
    deactivate
    cd ..
    exit 1
fi

echo "[5/7] Creating superuser (if needed)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@fox.com', 'admin')" | python3 manage.py shell 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Admin user ready (username: admin, password: admin)${NC}"
else
    echo -e "${YELLOW}[INFO] Admin user may already exist${NC}"
fi

echo "[6/7] Starting Django Backend on http://localhost:8000..."
python3 manage.py runserver 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 5

cd ..

echo "[7/7] Installing Frontend dependencies (if needed)..."
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
else
    echo "Dependencies already installed"
fi

echo "Starting React Frontend on http://localhost:5173..."
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
