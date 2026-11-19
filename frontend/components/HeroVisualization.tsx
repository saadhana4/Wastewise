"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Hotspot, Zone, Vehicle, WasteCategory } from "@/types";
import { NetworkVisualization, NetworkVisualizationHandle } from "./NetworkVisualization";
import { TimelineScrubber } from "./TimelineScrubber";
import {
  Network,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
} from "lucide-react";

// Client-only dynamic map import for SSR safety
const MapView = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-[#050B0A] font-sans text-xs text-teal-400">
        <span className="animate-pulse">Loading GIS spatial canvas...</span>
      </div>
    ),
  }
);

interface HeroVisualizationProps {
  zones: Zone[];
  hotspots: Hotspot[];
  vehicles?: Vehicle[];
  categories?: WasteCategory[];
  selectedHotspotId?: number | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  onExpandedChange?: (isExpanded: boolean, zoneId: number | null) => void;
  className?: string;
}

export const HeroVisualization: React.FC<HeroVisualizationProps> = ({
  zones,
  hotspots,
  vehicles = [],
  categories = [],
  selectedHotspotId,
  onSelectHotspot,
  onExpandedChange,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"network" | "map">("network");
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const networkRef = useRef<NetworkVisualizationHandle>(null);

  // Filter hotspots if user toggled filter
  const displayedHotspots =
    filterSeverity === "critical"
      ? hotspots.filter((h) => h.severity_score >= 8.0)
      : hotspots;

  return (
    <div className={`relative h-full w-full overflow-hidden select-none ${className}`}>
      {/* 1. Left Edge: Minimal Timeline Scrubber per Requirement 2 (hidden when expanded) */}
      {!isExpanded && <TimelineScrubber />}

      {/* 2. Floating Top-Center Toolbar Pill (matching dash2.png, hidden when expanded) */}
      {!isExpanded && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#071615]/85 border border-teal-500/20 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {/* Network | Map Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("network")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans transition-all ${
                activeTab === "network"
                  ? "bg-teal-500/20 text-teal-300 font-medium border border-teal-500/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            title="Force Network Graph"
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Network</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans transition-all ${
              activeTab === "map"
                ? "bg-teal-500/20 text-teal-300 font-medium border border-teal-500/40 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Geospatial Map"
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>

        {/* Thin Divider */}
        <div className="h-4 w-px bg-teal-900/50 mx-1" />

        {/* Zoom In (+) */}
        <button
          onClick={() => networkRef.current?.zoomIn()}
          className="p-1 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-950/40 transition-colors"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        {/* Zoom Out (-) */}
        <button
          onClick={() => networkRef.current?.zoomOut()}
          className="p-1 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-950/40 transition-colors"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        {/* Thin Divider */}
        <div className="h-4 w-px bg-teal-900/50 mx-1" />

        {/* Reset View Center */}
        <button
          onClick={() => networkRef.current?.resetZoom()}
          className="p-1 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-950/40 transition-colors"
          title="Reset Center View"
          aria-label="Reset view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Filter Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className={`p-1 rounded-lg transition-colors ${
              filterSeverity !== "all"
                ? "text-amber-400 bg-amber-950/40"
                : "text-slate-400 hover:text-teal-300 hover:bg-teal-950/40"
            }`}
            title="Filter Detections"
            aria-label="Filter"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>

          {showFilterMenu && (
            <div className="absolute top-full mt-2 -left-12 w-36 rounded-xl border border-teal-900/40 bg-[#071615]/95 p-1 shadow-2xl backdrop-blur-md z-40 text-xs font-sans space-y-0.5">
              <button
                onClick={() => {
                  setFilterSeverity("all");
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  filterSeverity === "all"
                    ? "bg-teal-950/80 text-teal-300 font-medium"
                    : "text-slate-300 hover:bg-teal-950/40"
                }`}
              >
                All Detections
              </button>
              <button
                onClick={() => {
                  setFilterSeverity("critical");
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  filterSeverity === "critical"
                    ? "bg-rose-950/80 text-rose-300 font-medium"
                    : "text-slate-300 hover:bg-teal-950/40"
                }`}
              >
                Critical Only (≥8)
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 3. Main Full-Bleed Canvas */}
      <div className="h-full w-full">
        {activeTab === "network" ? (
          <NetworkVisualization
            ref={networkRef}
            zones={zones}
            hotspots={displayedHotspots}
            vehicles={vehicles}
            categories={categories}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={onSelectHotspot}
            onExpandedChange={(expanded, zId) => {
              setIsExpanded(expanded);
              onExpandedChange?.(expanded, zId);
            }}
            className="h-full w-full"
          />
        ) : (
          <MapView
            zones={zones}
            hotspots={displayedHotspots}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={onSelectHotspot}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
};
