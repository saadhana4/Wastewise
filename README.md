# WasteWise — Geospatial AI for Intelligent Waste Detection, Segregation & Collection

WasteWise is a long-term AI + GIS waste-management platform designed to revolutionize municipal waste monitoring, reporting, and collection logistics.

---

## 1. What WasteWise Is

WasteWise combines Earth Observation (satellite and high-resolution aerial imagery), computer vision, spatial clustering, and constrained fleet route optimization to help municipal authorities, inspectors, and drivers manage solid waste proactively.

The eventual full system will:
* Ingest and analyze satellite (e.g. Sentinel-2, Landsat) and aerial/drone imagery
* Automatically detect waste accumulation areas and illegal dumping grounds
* Classify waste materials (Organic, Plastic, Paper, Metal, Construction, Mixed)
* Compute geospatial waste hotspots with severity and priority scoring
* Recommend appropriate collection vehicle types and bin allocations
* Generate capacity-constrained collection routes to minimize emissions and transit time
* Track historical accumulation patterns and forecast future accumulation surges
* Deliver role-based dashboards: **Admin View** (municipal dispatchers), **Inspector View** (field validation), and **Driver View** (turn-by-turn collection navigation)

> **Current Phase Scope**:
> We are currently at **Phase 1 — Project Foundation**. AI inference, satellite pipeline processing, raster GIS map tiling, and vehicle route optimization solvers are reserved for future phases. No fake AI or synthetic mock results are implemented.

---

## 2. Phase

* **Phase 1: Project Foundation (Current)**
  - Establish a clean, scalable, decoupled monorepo.
  - Next.js 15+ App Router frontend shell with TypeScript and Tailwind CSS.
  - FastAPI backend with modular architecture and versioned REST endpoints (`/api/v1`).
  - PostgreSQL + PostGIS database schema with spatial geometries (Polygon boundaries, Point locations).
  - Docker Compose configuration for local PostGIS containerization.
  - Frontend-to-backend API client verifying integration and health connectivity.
  - Comprehensive documentation, environment templates, and Git configurations.

* **Phase 2: Administrative Dashboard & Geospatial Mapping (Upcoming)**
  - Interactive map integration (Leaflet / MapLibre GL) for zone rendering and hotspot markers.
  - Zone boundary management and fleet status tracking.
  - Municipal Admin dashboard interface.

* **Phase 3: AI & Computer Vision Pipelines (Future)**
  - Satellite tile ingestion and preprocessing.
  - Deep learning models for waste detection and multi-class segregation.
  - Automated hotspot generation from detected bounding boxes/masks.

* **Phase 4: Routing & Dispatch Optimization (Future)**
  - Capacitated Vehicle Routing Problem (CVRP) solver.
  - Dynamic stop allocation and collection scheduling.
  - Inspector and Driver web/mobile interfaces.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | FastAPI, Python 3.10+, Uvicorn, Pydantic v2, Pydantic-Settings |
| **Database & GIS** | PostgreSQL 16, PostGIS 3.4, SQLAlchemy 2.0, GeoAlchemy2, Shapely, Psycopg 3 |
| **Infrastructure** | Docker, Docker Compose |
| **Testing** | Pytest, Next.js Compiler / TypeScript TypeCheck |

---

## 4. Repository Structure

```
WasteWise/
├── frontend/                     # Next.js App Router application
│   ├── app/                      # App router pages and layouts
│   │   ├── globals.css           # Global Tailwind CSS styles
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── page.tsx              # Phase 1 test page & connectivity check
│   ├── components/               # Reusable React components
│   │   ├── ConnectionStatus.tsx  # Dynamic backend status badge & latency probe
│   │   └── index.ts
│   ├── lib/                      # Client utilities & API client
│   │   ├── api-client.ts         # Type-safe API client for FastAPI
│   │   └── index.ts
│   ├── types/                    # TypeScript interfaces & GeoJSON definitions
│   │   ├── api.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # FastAPI Python backend service
│   ├── app/
│   │   ├── api/                  # API routing layer
│   │   │   ├── routes/           # Endpoint controllers
│   │   │   │   ├── health.py     # GET /api/v1/health & DB check
│   │   │   │   ├── zones.py      # GET, POST /api/v1/zones
│   │   │   │   ├── hotspots.py   # GET, POST /api/v1/hotspots
│   │   │   │   ├── vehicles.py   # GET, POST /api/v1/vehicles
│   │   │   │   └── waste_categories.py # GET, POST /api/v1/waste-categories
│   │   │   └── api.py            # Aggregated v1 APIRouter
│   │   ├── core/                 # App configuration & settings
│   │   │   └── config.py         # Environment parsing (Pydantic Settings)
│   │   ├── database/             # Database connection & session management
│   │   │   └── session.py        # SQLAlchemy engine, session maker, health probe
│   │   ├── models/               # SQLAlchemy ORM & PostGIS models
│   │   │   ├── user.py           # User entity (ADMIN, INSPECTOR, DRIVER)
│   │   │   ├── zone.py           # Zone entity with PostGIS POLYGON boundary
│   │   │   ├── waste_category.py # Waste categories (Organic, Plastic, etc.)
│   │   │   ├── hotspot.py        # Hotspot entity with PostGIS POINT location
│   │   │   └── vehicle.py        # Vehicle entity with location geometry
│   │   ├── schemas/              # Pydantic v2 validation & GeoJSON serializers
│   │   │   ├── common.py         # GeoJSON Point, Polygon, HealthResponse
│   │   │   ├── user.py           # User DTOs
│   │   │   ├── zone.py           # Zone DTOs with geometry serialization
│   │   │   ├── waste_category.py # Category DTOs
│   │   │   ├── hotspot.py        # Hotspot DTOs with geometry serialization
│   │   │   └── vehicle.py        # Vehicle DTOs with geometry serialization
│   │   ├── services/             # Business logic layer
│   │   │   ├── zone_service.py
│   │   │   ├── hotspot_service.py
│   │   │   ├── vehicle_service.py
│   │   │   └── waste_category_service.py
│   │   └── main.py               # FastAPI application entrypoint & CORS
│   ├── tests/                    # Backend automated test suite
│   │   └── test_api.py           # Endpoint integration tests
│   ├── requirements.txt
│   └── README.md
│
├── database/                     # Database migrations & container init
│   ├── init/
│   │   └── 01-init-postgis.sql   # PostGIS extension initialization script
│   ├── migrations/
│   │   └── 001_initial_schema.sql# PostgreSQL + PostGIS DDL migration
│   └── README.md
│
├── ai/                           # AI & Computer Vision module (Future)
│   └── README.md
├── gis/                          # Geospatial analysis module (Future)
│   └── README.md
├── optimization/                 # Fleet routing & CVRP module (Future)
│   └── README.md
├── datasets/                     # Dataset manifests & acquisition (Future)
│   └── README.md
├── experiments/                  # Experimental models & benchmarks (Future)
│   └── README.md
├── docs/                         # Technical documentation & architecture
│   └── README.md
├── .env.example                  # Environment configuration template
├── .gitignore                    # Clean Git ignore rules
├── docker-compose.yml            # Local PostgreSQL + PostGIS service
└── README.md                     # Root project documentation
```

---

## 5. Local Setup Instructions

### Prerequisites
* **Node.js**: v18+ (tested with v24.x)
* **Python**: v3.10+ (tested with v3.14.x)
* **Docker & Docker Compose**: For local PostgreSQL + PostGIS

---

### Step 1: Clone and Configure Environment

```bash
# Clone the repository
git clone <repository-url>
cd WasteWise

# Create environment file from template
cp .env.example .env
```

Review `.env` and adjust database credentials or ports if necessary.

---

### Step 2: Start the PostgreSQL + PostGIS Database

Run Docker Compose to start the PostGIS container:

```bash
# Start container in detached mode
docker compose up -d

# Verify container is running and healthy
docker compose ps
```

To stop the database:
```bash
docker compose down
```

---

### Step 3: Start the FastAPI Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with live reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend server is accessible at:
* API Root: [http://localhost:8000/](http://localhost:8000/)
* Unversioned Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Step 4: Start the Next.js Frontend

In a separate terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will see the **WasteWise Frontend** test shell displaying:
* `Backend: Connected` status badge with live latency calculation.
* PostGIS database connectivity indicator.
* An interactive API probe suite verifying communication across `/api/v1/zones`, `/api/v1/hotspots`, `/api/v1/vehicles`, and `/api/v1/waste-categories`.

---

## 6. Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API service metadata & documentation links |
| `GET` | `/api/health` | Standard unversioned health endpoint |
| `GET` | `/api/v1/health` | Service status, environment, and PostGIS DB probe |
| `GET` | `/api/v1/zones` | Retrieve all municipal operational zones and boundary polygons |
| `POST` | `/api/v1/zones` | Create a new operational zone with PostGIS boundary |
| `GET` | `/api/v1/hotspots` | Retrieve waste hotspots with coordinates, severity, and status |
| `POST` | `/api/v1/hotspots` | Register a new waste hotspot |
| `GET` | `/api/v1/vehicles` | List collection fleet with capacity and GPS coordinates |
| `POST` | `/api/v1/vehicles` | Register a collection vehicle |
| `GET` | `/api/v1/waste-categories` | List waste categories (Organic, Plastic, Paper, Metal, etc.) |
| `POST` | `/api/v1/waste-categories` | Create a new waste category |

---

## 7. Current Limitations & Scope

* **No Synthetic AI Output**: Model weights and satellite ingestion pipelines are deliberately excluded from Phase 1 to maintain architectural integrity.
* **Minimal Frontend Shell**: The UI serves as a communication verification shell proving frontend-to-backend REST connectivity. The full Admin Dashboard with interactive GIS maps will be styled in Phase 2.
* **Provisional Waste Categories**: Six default categories are pre-configured (`Organic`, `Plastic`, `Paper`, `Metal`, `Construction`, `Mixed`) and will be refined once the target training datasets are selected.

---

## 8. Verification & Test Execution

### Backend Automated Tests
```bash
cd backend
.\.venv\Scripts\python -m pytest -v
```
All 8 test suites validate the root endpoint, health endpoints, CORS, PostGIS models, and Swagger availability.

### Frontend Compilation & TypeCheck
```bash
cd frontend
npm run build
```
Ensures complete TypeScript type soundness and zero App Router errors.
