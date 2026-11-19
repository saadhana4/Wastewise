"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Hotspot, Zone } from "@/types";
import { formatCoordinates } from "@/lib/formatters";
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut, Filter, Compass } from "lucide-react";

interface MapViewProps {
  hotspots: Hotspot[];
  zones?: Zone[];
  selectedHotspotId?: number | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  hotspots,
  zones = [],
  selectedHotspotId,
  onSelectHotspot,
  className = "h-[560px] min-h-[480px] w-full",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Floating controls state
  const [showZones, setShowZones] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high" | "low">("all");

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // Clean up previous leaflet id if container was recycled
      if ((mapContainerRef.current as any)._leaflet_id && !mapInstanceRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Avoid reinitializing if map already exists
      if (!mapInstanceRef.current) {
        try {
          const map = L.map(mapContainerRef.current, {
            center: [12.9716, 77.5946],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
          });

          // Dark themed spatial vector tiles via OpenStreetMap
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map);

          const layerGroup = L.layerGroup().addTo(map);
          layerGroupRef.current = layerGroup;
          mapInstanceRef.current = map;

          // Force invalidateSize after brief layout settlement
          setTimeout(() => {
            if (isMounted && mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 200);
        } catch (err) {
          console.warn("[MapView] Leaflet initialization deferred:", err);
          return;
        }
      }

      if (!isMounted || !mapInstanceRef.current || !layerGroupRef.current) return;
      const map = mapInstanceRef.current;
      const layerGroup = layerGroupRef.current;

      layerGroup.clearLayers();
      const bounds = L.latLngBounds([]);

      // 1. Render Zones (GeoJSON Polygons) if enabled
      if (showZones) {
        zones.forEach((zone) => {
          if (zone.boundary && zone.boundary.coordinates) {
            try {
              const geojsonLayer = L.geoJSON(zone.boundary as any, {
                style: {
                  color: "#14b8a6",
                  weight: 1.5,
                  dashArray: "5, 5",
                  fillColor: "#0d9488",
                  fillOpacity: 0.12,
                },
              });

              geojsonLayer.bindTooltip(
                `<div class="font-mono text-[11px] font-bold text-teal-300 bg-[#081514] px-2 py-1 rounded border border-teal-800/60 uppercase tracking-wider">${zone.name}</div>`,
                { sticky: true }
              );

              geojsonLayer.addTo(layerGroup);
              bounds.extend(geojsonLayer.getBounds());
            } catch (e) {
              console.warn("Could not render zone boundary:", e);
            }
          }
        });
      }

      // Helper for marker colors & halos
      const getMarkerStyle = (sev: number, isSelected: boolean) => {
        if (sev >= 8) {
          return {
            color: "#f43f5e",
            halo: "0 0 16px #f43f5e, 0 0 28px rgba(244,63,94,0.45)",
          };
        }
        if (sev >= 6) {
          return {
            color: "#f59e0b",
            halo: "0 0 12px #f59e0b, 0 0 20px rgba(245,158,11,0.35)",
          };
        }
        if (sev >= 4) {
          return {
            color: "#eab308",
            halo: "0 0 10px #eab308, 0 0 16px rgba(234,179,8,0.3)",
          };
        }
        return {
          color: "#14b8a6",
          halo: "0 0 10px #14b8a6, 0 0 16px rgba(20,184,166,0.3)",
        };
      };

      // 2. Filter & Render Hotspots
      const visibleHotspots = hotspots.filter((h) => {
        if (filterSeverity === "critical") return h.severity_score >= 8.0;
        if (filterSeverity === "high") return h.severity_score >= 6.0 && h.severity_score < 8.0;
        if (filterSeverity === "low") return h.severity_score < 6.0;
        return true;
      });

      visibleHotspots.forEach((h) => {
        if (h.location && h.location.coordinates) {
          const [lng, lat] = h.location.coordinates;
          const isSelected = selectedHotspotId === h.id;
          const style = getMarkerStyle(h.severity_score, isSelected);
          const size = isSelected ? 24 : h.severity_score >= 8.0 ? 20 : 16;

          const markerHtml = `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${style.color};
              border: 2px solid ${isSelected ? "#ffffff" : "rgba(255,255,255,0.85)"};
              border-radius: 50%;
              box-shadow: ${style.halo};
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease-in-out;
            ">
              <span style="width: 4px; height: 4px; background-color: #ffffff; border-radius: 50%;"></span>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: "custom-hotspot-pin",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          const formattedCoords = formatCoordinates(h.location.coordinates);

          const popupContent = `
            <div style="font-family: monospace; min-width: 190px; color: #e2e8f0; padding: 2px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(20,184,166,0.2); padding-bottom: 4px;">
                <strong style="font-size: 12px; color: #f8fafc; font-weight: 700;">WH-${String(h.id).padStart(3, "0")}</strong>
                <span style="
                  font-size: 9px;
                  text-transform: uppercase;
                  font-weight: 700;
                  padding: 1px 5px;
                  border-radius: 4px;
                  background-color: ${style.color}20;
                  color: ${style.color};
                  border: 1px solid ${style.color}50;
                ">${h.status}</span>
              </div>
              <div style="font-size: 11px; line-height: 1.6; color: #94a3b8;">
                <div>SEVERITY: <span style="color: ${style.color}; font-weight: 700;">${h.severity_score.toFixed(1)} / 10</span></div>
                <div>PRIORITY: <span style="color: #f1f5f9;">${h.priority_score.toFixed(1)} / 10</span></div>
                <div>EST. LOAD: <span style="color: #38bdf8;">${h.estimated_quantity > 0 ? `${h.estimated_quantity} kg` : "Pending measurement"}</span></div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">GPS: ${formattedCoords}</div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on("click", () => onSelectHotspot?.(h));

          marker.addTo(layerGroup);
          bounds.extend([lat, lng]);

          if (isSelected) {
            marker.openPopup();
          }
        }
      });

      // Fit bounds if we have points/polygons
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }

    initMap();

    // ResizeObserver to automatically adjust Leaflet on layout changes
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [hotspots, zones, selectedHotspotId, showZones, filterSeverity, onSelectHotspot]);

  // Clean up Leaflet on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleResetView = () => {
    if (mapInstanceRef.current && hotspots.length > 0) {
      const L = (window as any).L;
      if (L) {
        const bounds = L.latLngBounds([]);
        hotspots.forEach((h) => {
          if (h.location?.coordinates) {
            bounds.extend([h.location.coordinates[1], h.location.coordinates[0]]);
          }
        });
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-950/70 bg-[#07100F] shadow-[0_4px_30px_rgba(0,0,0,0.7)] group">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className={className} />

      {/* Subtle Spatial Coordinate Watermark */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none font-mono text-[10px] tracking-wider text-teal-400/80 uppercase bg-[#07100F]/90 px-2.5 py-1 rounded-lg border border-teal-950/80 backdrop-blur-xs">
        BENGALURU MUNICIPAL GRID • EPSG:4326
      </div>

      {/* Minimal Floating Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-1.5 rounded-xl border border-teal-900/40 bg-[#081514]/90 p-1 backdrop-blur-md shadow-lg font-mono text-xs">
        {/* Toggle Zones */}
        <button
          onClick={() => setShowZones((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
            showZones
              ? "bg-[#0D2422] text-teal-300 font-bold border border-teal-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Zone Polygons"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Zones</span>
        </button>

        {/* Severity Filter Dropdown */}
        <div className="flex items-center border-l border-teal-950 px-1">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="bg-transparent text-[11px] text-slate-300 font-mono py-1 px-1.5 rounded focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#081514] text-slate-200">All Severities</option>
            <option value="critical" className="bg-[#081514] text-rose-400">Critical (≥ 8.0)</option>
            <option value="high" className="bg-[#081514] text-amber-400">High (6.0 - 7.9)</option>
            <option value="low" className="bg-[#081514] text-teal-400">Low (&lt; 6.0)</option>
          </select>
        </div>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-1 rounded-lg text-slate-400 hover:bg-[#0D2422] hover:text-teal-300 transition-colors"
          title="Reset Map Bounds"
        >
          <Compass className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
