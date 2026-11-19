# WasteWise Backend

FastAPI service powering geospatial data management, waste hotspot tracking, and municipal resource operations.

## Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── zones.py
│   │   │   ├── hotspots.py
│   │   │   ├── vehicles.py
│   │   │   └── waste_categories.py
│   │   └── api.py
│   ├── core/
│   │   └── config.py
│   ├── database/
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   ├── zone.py
│   │   ├── waste_category.py
│   │   ├── hotspot.py
│   │   └── vehicle.py
│   ├── schemas/
│   │   ├── common.py
│   │   ├── user.py
│   │   ├── zone.py
│   │   ├── waste_category.py
│   │   ├── hotspot.py
│   │   └── vehicle.py
│   ├── services/
│   │   ├── zone_service.py
│   │   ├── hotspot_service.py
│   │   ├── vehicle_service.py
│   │   └── waste_category_service.py
│   └── main.py
├── requirements.txt
└── README.md
```

## Setup & Running Locally

### 1. Create and Activate Virtual Environment

```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Linux / macOS:
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Interactive Documentation

* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Exposed Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Unversioned health check |
| `GET` | `/api/v1/health` | Detailed service health & DB connectivity |
| `GET` | `/api/v1/zones` | Retrieve all municipal zones & boundaries |
| `POST` | `/api/v1/zones` | Create a new operational zone |
| `GET` | `/api/v1/hotspots` | Retrieve waste hotspots with coordinates |
| `POST` | `/api/v1/hotspots` | Register new hotspot |
| `GET` | `/api/v1/vehicles` | List collection vehicles & locations |
| `POST` | `/api/v1/vehicles` | Register collection vehicle |
| `GET` | `/api/v1/waste-categories` | Retrieve waste categories |
| `POST` | `/api/v1/waste-categories` | Create waste category |
