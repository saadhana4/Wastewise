"""
WasteWise - Demo Geospatial Data Seeder
Inserts ~5 zones, ~25 hotspots with varied severities, and ~6 vehicles.
All demo rows are prefixed with 'DEMO' so they can be identified and purged later.
"""
import sys
import os
import random

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from geoalchemy2.elements import WKTElement
from app.database.session import SessionLocal
from app.models.zone import Zone
from app.models.hotspot import Hotspot
from app.models.vehicle import Vehicle


def seed_demo_data():
    db = SessionLocal()
    try:
        # Check if DEMO data already exists
        existing_demo_zones = db.query(Zone).filter(Zone.name.like("DEMO%")).count()
        if existing_demo_zones > 0:
            print(f"[SEED] Demo data already present ({existing_demo_zones} demo zones found). Purging old demo data first...")
            # Delete demo hotspots
            demo_zone_ids = [z.id for z in db.query(Zone).filter(Zone.name.like("DEMO%")).all()]
            db.query(Hotspot).filter(Hotspot.zone_id.in_(demo_zone_ids)).delete(synchronize_session=False)
            db.query(Zone).filter(Zone.name.like("DEMO%")).delete(synchronize_session=False)
            db.query(Vehicle).filter(Vehicle.registration_number.like("DEMO%")).delete(synchronize_session=False)
            db.commit()
            print("[SEED] Purged previous demo records.")

        print("[SEED] Creating 5 municipal demo zones around Bengaluru...")

        # 5 distinct zones with valid WGS84 Polygons (lon, lat)
        zones_data = [
            {
                "name": "DEMO - Central Ward 1",
                "desc": "Commercial and high-density administrative sector",
                "polygon": "POLYGON((77.585 12.965, 77.605 12.965, 77.605 12.985, 77.585 12.985, 77.585 12.965))",
                "center": (77.595, 12.975),
            },
            {
                "name": "DEMO - Koramangala Sector 4",
                "desc": "Mixed commercial-residential high-volume transit zone",
                "polygon": "POLYGON((77.615 12.925, 77.635 12.925, 77.635 12.945, 77.615 12.945, 77.615 12.925))",
                "center": (77.625, 12.935),
            },
            {
                "name": "DEMO - Indiranagar East",
                "desc": "Retail hospitality corridor with heavy organic generation",
                "polygon": "POLYGON((77.630 12.968, 77.652 12.968, 77.652 12.988, 77.630 12.988, 77.630 12.968))",
                "center": (77.641, 12.978),
            },
            {
                "name": "DEMO - Jayanagar South",
                "desc": "Residential sector with segregated compost programs",
                "polygon": "POLYGON((77.575 12.915, 77.598 12.915, 77.598 12.935, 77.575 12.935, 77.575 12.915))",
                "center": (77.586, 12.925),
            },
            {
                "name": "DEMO - Whitefield Tech Zone",
                "desc": "Suburban enterprise park and logistics corridor",
                "polygon": "POLYGON((77.735 12.960, 77.760 12.960, 77.760 12.985, 77.735 12.985, 77.735 12.960))",
                "center": (77.747, 12.972),
            },
        ]

        created_zones = []
        for zd in zones_data:
            z = Zone(
                name=zd["name"],
                description=zd["desc"],
                boundary=WKTElement(zd["polygon"], srid=4326),
            )
            db.add(z)
            created_zones.append((z, zd["center"]))
        db.commit()

        # Reload zones to get assigned IDs
        for z, _ in created_zones:
            db.refresh(z)
        print(f"[SEED] Inserted {len(created_zones)} demo zones.")

        # Seed 25 Hotspots distributed across zones with varied severities
        # Distribution: 4 Critical (>= 8.0), 8 High (6.0-7.9), 8 Medium (4.0-5.9), 5 Low (< 4.0)
        severities = [
            # Critical
            8.8, 9.2, 8.4, 8.1,
            # High
            7.6, 6.9, 7.2, 6.4, 7.8, 6.7, 7.1, 6.2,
            # Medium
            5.4, 4.8, 5.8, 4.2, 5.1, 4.6, 5.9, 4.5,
            # Low
            3.2, 2.7, 3.8, 2.1, 3.5,
        ]

        statuses = ["detected", "verified", "scheduled", "cleared", "detected", "verified"]

        print("[SEED] Creating 25 demo hotspots...")
        for i, sev in enumerate(severities):
            # assign to one of the demo zones
            zone_idx = i % len(created_zones)
            zone_obj, (c_lon, c_lat) = created_zones[zone_idx]

            # offset slightly from zone center
            offset_lon = (random.random() - 0.5) * 0.016
            offset_lat = (random.random() - 0.5) * 0.016
            lon = c_lon + offset_lon
            lat = c_lat + offset_lat

            p_point = f"POINT({lon:.6f} {lat:.6f})"
            priority = round(sev * 0.9 + random.uniform(0.1, 0.9), 1)
            priority = min(priority, 10.0)
            quantity = round(random.uniform(80, 1100), 0)

            status = statuses[i % len(statuses)]
            if sev >= 8.0 and status == "cleared":
                status = "detected"

            hotspot = Hotspot(
                zone_id=zone_obj.id,
                location=WKTElement(p_point, srid=4326),
                severity_score=sev,
                priority_score=priority,
                estimated_quantity=quantity,
                status=status,
            )
            db.add(hotspot)
        db.commit()
        print("[SEED] Inserted 25 demo hotspots with varied severities.")

        # Seed 6 Vehicles
        print("[SEED] Creating 6 demo vehicles...")
        vehicles_data = [
            ("DEMO-KA-01-WW-2001", "compactor", 5000.0, "available", 77.595, 12.975),
            ("DEMO-KA-01-WW-2002", "compactor", 6500.0, "active", 77.625, 12.935),
            ("DEMO-KA-01-WW-2003", "tipper", 3500.0, "active", 77.641, 12.978),
            ("DEMO-KA-01-WW-2004", "e-rickshaw", 800.0, "available", 77.586, 12.925),
            ("DEMO-KA-01-WW-2005", "compactor", 5000.0, "maintenance", 77.747, 12.972),
            ("DEMO-KA-01-WW-2006", "tipper", 4000.0, "available", 77.600, 12.970),
        ]

        for reg, vtype, cap, st, v_lon, v_lat in vehicles_data:
            veh = Vehicle(
                registration_number=reg,
                vehicle_type=vtype,
                capacity_kg=cap,
                status=st,
                current_location=WKTElement(f"POINT({v_lon:.6f} {v_lat:.6f})", srid=4326),
            )
            db.add(veh)
        db.commit()
        print("[SEED] Inserted 6 demo vehicles.")

        print("\n[SUCCESS] Demo dataset successfully seeded!")
        print(f"Total Demo Zones: {len(created_zones)}")
        print(f"Total Demo Hotspots: {len(severities)}")
        print(f"Total Demo Vehicles: {len(vehicles_data)}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed demo data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
