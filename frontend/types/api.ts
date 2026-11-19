export interface DatabaseStatus {
  status: "connected" | "disconnected";
  postgis_enabled: boolean;
  postgis_version: string | null;
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version?: string;
  environment?: string;
  database?: DatabaseStatus;
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: [number, number][][];
}

export interface Zone {
  id: number;
  name: string;
  description?: string;
  boundary: GeoJSONPolygon | null;
  created_at: string;
}

export interface WasteCategory {
  id: number;
  name: string;
  description?: string;
  recyclable: boolean;
  handling_type: string;
  created_at: string;
}

export interface Hotspot {
  id: number;
  zone_id?: number | null;
  location: GeoJSONPoint | null;
  severity_score: number;
  priority_score: number;
  estimated_quantity: number;
  status: string;
  first_detected_at: string;
  last_detected_at: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: string;
  capacity_kg: number;
  status: string;
  current_location: GeoJSONPoint | null;
  created_at: string;
}
