#!/bin/bash

echo "========================================"
echo "Fox ERP - Database Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Database configuration
DB_NAME="fox_db"
DB_USER="fox_admin"
DB_PASSWORD="Ebnb@t0t@"
DB_PORT="5444"
SCHEMA_NAME="fox_system"

echo -e "${BLUE}This script will set up the PostgreSQL database for Fox ERP${NC}"
echo ""
echo "Database Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Port: $DB_PORT"
echo "  Schema: $SCHEMA_NAME"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}[ERROR] PostgreSQL is not installed${NC}"
    echo ""
    echo "To install PostgreSQL on Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    exit 1
fi

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}PostgreSQL is not running. Starting...${NC}"
    sudo systemctl start postgresql
    sleep 2
fi

echo -e "${GREEN}PostgreSQL is running${NC}"
echo ""

# Check if running on custom port
echo "Checking PostgreSQL port configuration..."
CURRENT_PORT=$(sudo -u postgres psql -t -c "SHOW port;" 2>/dev/null | xargs)

if [ "$CURRENT_PORT" != "$DB_PORT" ]; then
    echo -e "${YELLOW}[WARNING] PostgreSQL is running on port $CURRENT_PORT, not $DB_PORT${NC}"
    echo ""
    echo "To change PostgreSQL port to $DB_PORT:"
    echo "  1. Edit: sudo nano /etc/postgresql/*/main/postgresql.conf"
    echo "  2. Change: port = $DB_PORT"
    echo "  3. Restart: sudo systemctl restart postgresql"
    echo ""
    read -p "Do you want to continue with port $CURRENT_PORT? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    DB_PORT=$CURRENT_PORT
fi

echo ""
echo "Creating database and user..."
echo ""

# Create user and database
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'User $DB_USER created';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

\c $DB_NAME

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS $SCHEMA_NAME;
GRANT ALL ON SCHEMA $SCHEMA_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;

-- Set search path
ALTER DATABASE $DB_NAME SET search_path TO $SCHEMA_NAME, public;
ALTER USER $DB_USER SET search_path TO $SCHEMA_NAME, public;

\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
    echo ""
    echo "Connection details:"
    echo "  Host: localhost"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo "  Schema: $SCHEMA_NAME"
    echo ""
    
    # Test connection
    echo "Testing connection..."
    PGPASSWORD=$DB_PASSWORD psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Connection test successful!${NC}"
        echo ""
        echo "You can now run: ./start.sh"
    else
        echo -e "${YELLOW}[WARNING] Connection test failed${NC}"
        echo "You may need to configure pg_hba.conf to allow local connections"
        echo ""
        echo "Add this line to /etc/postgresql/*/main/pg_hba.conf:"
        echo "  local   all   $DB_USER   md5"
        echo ""
        echo "Then restart PostgreSQL:"
        echo "  sudo systemctl restart postgresql"
    fi
else
    echo -e "${RED}[ERROR] Database setup failed${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "Setup Complete"
echo "========================================"
