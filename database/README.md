# WasteWise Database & Migrations

This directory contains database initialization scripts, PostGIS extensions, and schema migrations.

## Technologies

* **Database Engine**: PostgreSQL 16
* **Spatial Extension**: PostGIS 3.4
* **ORM**: SQLAlchemy 2.0 with GeoAlchemy2

## Local Setup with Docker Compose

To start PostgreSQL + PostGIS locally:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

## Running Schema Migrations

The initial schema in `migrations/001_initial_schema.sql` establishes:
1. PostGIS and UUID extension installation.
2. User roles and status enums.
3. Tables: `users`, `zones`, `waste_categories`, `hotspots`, `vehicles`.
4. Spatial GiST indexes on geometry columns (`boundary`, `location`, `current_location`).
5. Provisional waste category seeds.

To execute manually via `psql` or Docker:

```bash
docker compose exec db psql -U wastewise_user -d wastewise_db -f /docker-entrypoint-initdb.d/../migrations/001_initial_schema.sql
```
