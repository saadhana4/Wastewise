"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { PageHeader, LoadingState, ErrorState } from "@/components";
import { apiClient } from "@/lib/api-client";
import { Hotspot, Zone } from "@/types";
import { formatCoordinates } from "@/lib/formatters";
import { Layers, RefreshCw, MapPin, Radio } from "lucide-react";

// Client-only dynamic import of MapView to avoid Leaflet SSR issues
const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[650px] w-full flex items-center justify-center bg-[#050e0d] border border-teal-950/80 rounded-xl">
        <LoadingState message="INITIALIZING CARTODB DARK MATTER VECTOR ENGINE..." />
      </div>
    ),
  }
);

export default function WasteMapPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, zData] = await Promise.all([
        apiClient.getHotspots(),
        apiClient.getZones(),
      ]);
      setHotspots(hData);
      setZones(zData);
    } catch (err: any) {
      setError(err?.message || "Failed to load GIS map data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="GIS Geospatial Intelligence"
        description="Multi-layer municipal vector mapping, PostGIS polygon boundaries, and real-time waste hotspot detection clusters."
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800/60 px-4 py-2 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>SYNC VECTOR TELEMETRY</span>
          </button>
        }
      />

      {error ? (
        <ErrorState title="GIS Telemetry Disrupted" message={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map Canvas */}
          <div className="lg:col-span-3 rounded-xl border border-teal-950/80 bg-[#081514] p-3 shadow-xl">
            <MapView
              hotspots={hotspots}
              zones={zones}
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={(h) => setSelectedHotspotId(h.id)}
              className="h-[680px] w-full rounded-lg overflow-hidden border border-teal-950/70"
            />
          </div>

          {/* Side Panel: Active GIS Layer Inspector */}
          <div className="flex flex-col gap-4">
            {/* Zones Summary */}
            <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-950 text-teal-400 border border-teal-800/50">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <span>Municipal Sectors ({zones.length})</span>
              </div>
              <p className="mt-1 text-[11px] font-mono text-slate-400">
                PostGIS MultiPolygon boundaries
              </p>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {zones.map((z) => (
                  <div
                    key={z.id}
                    className="rounded-lg border border-teal-950/70 bg-[#061110] p-2.5 text-xs font-mono"
                  >
                    <span className="font-bold text-teal-300 block">{z.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {z.description || "Active municipal collection sector"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspots Pin List */}
            <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                  Hotspot Nodes ({hotspots.length})
                </span>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-900/60 font-semibold">
                  SRID 4326
                </span>
              </div>
              <p className="mt-1 text-[11px] font-mono text-slate-400">Select node to focus camera</p>
              
              <div className="mt-3 space-y-2 overflow-y-auto max-h-[380px] pr-1 flex-1">
                {hotspots.map((h) => {
                  const isSelected = selectedHotspotId === h.id;
                  const coords = h.location?.coordinates;

                  return (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspotId(h.id)}
                      className={`w-full text-left rounded-lg border p-2.5 text-xs font-mono transition-all ${
                        isSelected
                          ? "border-teal-400/80 bg-teal-950/70 text-slate-100 shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                          : "border-teal-950/70 bg-[#061110] text-slate-300 hover:border-teal-800/60 hover:bg-[#071615]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-300">#WH-{h.id.toString().padStart(3, "0")}</span>
                        <span className={`font-bold ${h.severity_score >= 8.0 ? "text-rose-400" : h.severity_score >= 6.0 ? "text-amber-400" : "text-teal-400"}`}>
                          {h.severity_score.toFixed(1)} / 10
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
                        <span className="capitalize">{h.status}</span>
                        <span>{formatCoordinates(coords)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
