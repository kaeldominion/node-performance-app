#!/bin/bash
# Script to run the database fix SQL on Railway database
# Usage: ./run-fix-sql.sh "postgresql://user:pass@host:port/db"

if [ -z "$1" ]; then
    echo "Usage: ./run-fix-sql.sh \"postgresql://user:pass@host:port/db\""
    echo ""
    echo "Get your DATABASE_URL from Railway:"
    echo "  Railway → Postgres service → Variables tab → DATABASE_URL"
    exit 1
fi

DB_URL="$1"
SCRIPT_PATH="$(dirname "$0")/fix-production-database.sql"

if [ ! -f "$SCRIPT_PATH" ]; then
    echo "Error: SQL script not found at $SCRIPT_PATH"
    exit 1
fi

echo "Connecting to database and running fix script..."
/opt/homebrew/opt/postgresql@15/bin/psql "$DB_URL" -f "$SCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Database fix completed successfully!"
else
    echo "❌ Error running database fix. Check the error messages above."
    exit 1
fi

