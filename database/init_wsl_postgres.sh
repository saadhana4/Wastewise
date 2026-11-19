#!/bin/bash
set -e

# Start PostgreSQL service
service postgresql start

# Configure postgresql.conf to listen on all addresses
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
echo "listen_addresses = '*'" >> /etc/postgresql/16/main/postgresql.conf

# Configure pg_hba.conf to allow password connections from localhost / Windows
echo "host all all 127.0.0.1/32 md5" >> /etc/postgresql/16/main/pg_hba.conf
echo "host all all ::1/128 md5" >> /etc/postgresql/16/main/pg_hba.conf
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf
echo "host all all all trust" >> /etc/postgresql/16/main/pg_hba.conf

# Reload/Restart PostgreSQL
service postgresql restart

# Create user and database
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='wastewise_user'\" | grep -q 1 || psql -c \"CREATE USER wastewise_user WITH PASSWORD 'wastewise_secure_password' SUPERUSER;\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='wastewise_db'\" | grep -q 1 || psql -c \"CREATE DATABASE wastewise_db OWNER wastewise_user;\""

# Enable PostGIS on wastewise_db
su - postgres -c "psql -d wastewise_db -c 'CREATE EXTENSION IF NOT EXISTS postgis;'"
su - postgres -c "psql -d wastewise_db -c 'CREATE EXTENSION IF NOT EXISTS postgis_topology;'"
su - postgres -c "psql -d wastewise_db -c 'CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";'"

# Apply initial schema migration
su - postgres -c "psql -d wastewise_db -f /mnt/c/Users/dell/OneDrive/Documents/WasteWise/database/migrations/001_initial_schema.sql"

# Check PostGIS version
su - postgres -c "psql -d wastewise_db -c 'SELECT PostGIS_Full_Version();'"

echo "PostgreSQL and PostGIS setup completed successfully."
