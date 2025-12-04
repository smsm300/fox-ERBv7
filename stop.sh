#!/bin/bash

echo "========================================"
echo "Fox ERP - Stopping Application"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if PID file exists
if [ -f ".fox_erp_pids" ]; then
    echo "Reading PIDs from .fox_erp_pids..."
    BACKEND_PID=$(sed -n '1p' .fox_erp_pids)
    FRONTEND_PID=$(sed -n '2p' .fox_erp_pids)
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Backend stopped${NC}"
        else
            echo -e "${YELLOW}Backend process not found${NC}"
        fi
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Frontend stopped${NC}"
        else
            echo -e "${YELLOW}Frontend process not found${NC}"
        fi
    fi
    
    rm .fox_erp_pids
    echo ""
    echo -e "${GREEN}All services stopped successfully${NC}"
else
    echo -e "${YELLOW}No PID file found. Trying to find processes...${NC}"
    
    # Try to find and kill Django process
    DJANGO_PID=$(ps aux | grep "manage.py runserver" | grep -v grep | awk '{print $2}')
    if [ ! -z "$DJANGO_PID" ]; then
        echo "Found Django process (PID: $DJANGO_PID), stopping..."
        kill $DJANGO_PID 2>/dev/null
        echo -e "${GREEN}Django stopped${NC}"
    fi
    
    # Try to find and kill Vite process
    VITE_PID=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
    if [ ! -z "$VITE_PID" ]; then
        echo "Found Vite process (PID: $VITE_PID), stopping..."
        kill $VITE_PID 2>/dev/null
        echo -e "${GREEN}Vite stopped${NC}"
    fi
    
    if [ -z "$DJANGO_PID" ] && [ -z "$VITE_PID" ]; then
        echo -e "${YELLOW}No running processes found${NC}"
    fi
fi

echo ""
echo "========================================"
echo "Cleanup complete"
echo "========================================"
