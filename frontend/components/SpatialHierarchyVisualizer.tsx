"use client";

import React, { useState } from "react";
import { Hotspot, Zone } from "@/types";
import { Network, Layers, MapPin, Truck, ChevronRight } from "lucide-react";

interface SpatialHierarchyProps {
  zones: Zone[];
  hotspots: Hotspot[];
  onSelectHotspot?: (hotspot: Hotspot) => void;
}

export const SpatialHierarchyVisualizer: React.FC<SpatialHierarchyProps> = ({
  zones,
  hotspots,
  onSelectHotspot,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(
    zones.length > 0 ? zones[0].id : null
  );

  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const zoneHotspots = hotspots.filter(
    (h) => !selectedZoneId || h.zone_id === selectedZoneId || !h.zone_id
  );

  return (
    <div className="rounded-2xl border border-teal-950/70 bg-[#081514] p-5 shadow-xs font-mono">
      <div className="flex items-center justify-between border-b border-teal-950/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B1E1C] text-teal-400 border border-teal-900/40">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              SPATIAL TOPOLOGY &amp; NODE HIERARCHY
            </h3>
            <span className="text-[10px] text-teal-500/70">
              Zone &rarr; Hotspot Entities &rarr; Composition &rarr; Fleet Dispatch
            </span>
          </div>
        </div>

        {/* Zone Selector */}
        {zones.length > 1 && (
          <select
            value={selectedZoneId || ""}
            onChange={(e) => setSelectedZoneId(Number(e.target.value))}
            className="rounded-lg bg-[#0B1E1C] border border-teal-900/40 px-2 py-1 text-[11px] text-teal-300 font-mono focus:outline-none"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Network Node Tree Layout */}
      <div className="mt-5 space-y-4">
        {/* Tier 1: Zone Root Node */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#0B1E1C] border border-cyan-500/40 px-3.5 py-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-200">
              {activeZone ? activeZone.name : "Sector Zone #1"}
            </span>
            <span className="text-[10px] text-cyan-500 font-mono">
              [EPSG:4326]
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 via-teal-500/20 to-transparent" />
        </div>

        {/* Vertical connector line */}
        <div className="ml-5 pl-4 border-l-2 border-teal-900/60 space-y-4 py-1">
          {/* Tier 2: Hotspot Nodes */}
          {zoneHotspots.length === 0 ? (
            <div className="text-[11px] text-slate-500">
              No active hotspots mapped to this zone sector.
            </div>
          ) : (
            zoneHotspots.slice(0, 3).map((h) => {
              const isCrit = h.severity_score >= 8.0;

              return (
                <div key={h.id} className="space-y-2">
                  <div
                    onClick={() => onSelectHotspot?.(h)}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isCrit
                          ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                          : "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                      }`}
                    />
                    <div className="flex items-center gap-2 rounded-lg bg-[#0B1E1C]/80 hover:bg-[#0D2422] border border-teal-900/30 hover:border-teal-500/40 px-2.5 py-1 text-xs transition-colors">
                      <span className="font-bold text-slate-200">
                        WH-{String(h.id).padStart(3, "0")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Sev {h.severity_score.toFixed(1)}
                      </span>
                      <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-teal-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Tier 3 & 4: Sub-branches (Waste Composition & Collection Dispatch) */}
                  <div className="ml-4 pl-3 border-l border-teal-950/80 space-y-1.5 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 text-teal-500" />
                      <span className="text-slate-300">
                        Composition: Organic (42%) • Plastic (31%) • Inert
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3 text-cyan-400" />
                      <span className="text-cyan-300">
                        Recommended: Compactor Truck (Capacity &ge; 5,000 kg)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
