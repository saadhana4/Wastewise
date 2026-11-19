from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "WasteWise API"
    assert "docs" in data


def test_unversioned_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "wastewise-backend"


def test_v1_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "wastewise-backend"
    assert "database" in data


def test_v1_waste_categories():
    response = client.get("/api/v1/waste-categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 6
    names = [c["name"] for c in data]
    for required in ["Organic", "Plastic", "Paper", "Metal", "Construction", "Mixed"]:
        assert required in names


def test_v1_zones():
    response = client.get("/api/v1/zones")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_v1_hotspots():
    response = client.get("/api/v1/hotspots")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_v1_single_hotspot_404():
    response = client.get("/api/v1/hotspots/999999")
    assert response.status_code == 404


def test_v1_vehicles():
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_swagger_docs():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text.lower()
