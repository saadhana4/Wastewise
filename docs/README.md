# WasteWise Documentation

Welcome to the **WasteWise** technical documentation directory.

## Architecture Overview

WasteWise is organized as a clean, decoupled monorepo:

* `frontend/`: Next.js 15 (App Router, TypeScript, Tailwind CSS) providing client interfaces (Admin Dashboard in Phase 1, followed by Inspector and Driver portals).
* `backend/`: FastAPI Python microservice delivering RESTful geospatial APIs, Swagger documentation, and database interaction.
* `database/`: Database migration scripts and schema definitions for PostgreSQL + PostGIS.
* `ai/`: AI models for satellite/aerial imagery analysis and waste classification.
* `gis/`: Geospatial analytics, zone boundary processing, and spatial indexing.
* `optimization/`: Fleet vehicle route optimization and dispatch algorithms.
* `datasets/`: Dataset acquisition metadata, manifest references, and schemas.
* `experiments/`: Research notebooks, benchmark evaluations, and training pipelines.

## Development Phases

* **Phase 1: Project Foundation (Current)**
  - Establish monorepo structure.
  - Setup Next.js frontend shell with API integration check.
  - Setup FastAPI backend with versioned API routes (`/api/v1`).
  - Configure PostgreSQL + PostGIS via Docker Compose and SQLAlchemy/GeoAlchemy2 models.
  - Configure environment schemas, Git rules, and developer documentation.
* **Phase 2: Administrative Dashboard & Geospatial Mapping**
  - Interactive map integration (Leaflet/MapLibre).
  - Zone management and hotspot visualization.
  - Fleet management and initial authentication.
* **Phase 3: AI & Computer Vision Integration**
  - Imagery ingestion pipeline.
  - Waste detection and multi-class classification inference.
  - Automated hotspot generation.
* **Phase 4: Routing & Collection Optimization**
  - Constrained vehicle routing solver.
  - Driver dispatch itinerary interface.
