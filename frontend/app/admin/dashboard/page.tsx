"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  HeroVisualization,
  HotspotIntelligencePanel,
  LowerAnalytics,
  DockedConsole,
  HotspotTable,
  LoadingState,
  ErrorState,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { Hotspot, Vehicle, Zone, WasteCategory } from "@/types";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);

  // Closed by default, opens only when a hotspot is selected (Requirement 5)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isZoneExpanded, setIsZoneExpanded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lock body scrolling when zone is expanded so the visualization takes over the full viewport
  useEffect(() => {
    if (isZoneExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoneExpanded]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, vData, zData, cData] = await Promise.all([
        apiClient.getHotspots(),
        apiClient.getVehicles(),
        apiClient.getZones(),
        apiClient.getWasteCategories(),
      ]);
      setHotspots(hData);
      setVehicles(vData);
      setZones(zData);
      setCategories(cData);
    } catch (err: any) {
      setError(err?.message || "Failed to load geospatial intelligence from FastAPI backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState message="Synchronizing geospatial command core..." />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState
          title="Geospatial Telemetry Disrupted"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  // Derived metrics from real API data
  const totalHotspots = hotspots.length;
  const criticalHotspots = hotspots.filter((h) => h.severity_score >= 8.0).length;
  const highPriorityHotspots = hotspots.filter(
    (h) => h.severity_score >= 6.0 && h.severity_score < 8.0
  ).length;
  const activeVehicles = vehicles.filter((v) =>
    ["available", "active", "on_route", "in_service"].includes((v.status || "").toLowerCase())
  ).length;
  const pendingCollections = hotspots.filter((h) =>
    ["detected", "verified", "scheduled", "pending"].includes((h.status || "").toLowerCase())
  ).length;

  const priorityHotspots = [...hotspots]
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5);

  return (
    <div className="relative w-full flex flex-col">
      {/* 1. HERO SECTION = FULL-BLEED GRAPH (100vh minus 56px top bar) per Requirement 2 */}
      <section className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Full-bleed canvas with floating toolbar pill, timeline scrubber, and compact legend */}
        <HeroVisualization
          zones={zones}
          hotspots={hotspots}
          vehicles={vehicles}
          categories={categories}
          selectedHotspotId={selectedHotspot?.id}
          onSelectHotspot={(h) => setSelectedHotspot(h)}
          onExpandedChange={(expanded) => setIsZoneExpanded(expanded)}
        />

        {/* Tall Glass Slide-in Detail Panel from Right (Requirement 5, hidden when zone expanded) */}
        {!isZoneExpanded && selectedHotspot && (
          <HotspotIntelligencePanel
            hotspot={selectedHotspot}
            zone={zones.find((z) => z.id === selectedHotspot.zone_id) || null}
            vehicles={vehicles}
            onClose={() => setSelectedHotspot(null)}
          />
        )}

        {/* Docked Console (Bottom-Right, shifts when panel is open, hidden when zone expanded) */}
        {!isZoneExpanded && (
          <DockedConsole
            totalHotspots={totalHotspots}
            criticalCount={criticalHotspots}
            highPriorityCount={highPriorityHotspots}
            activeVehicles={activeVehicles}
            pendingCount={pendingCollections}
            isShifted={!!selectedHotspot}
          />
        )}
      </section>

      {/* 2. BELOW THE FOLD per Requirement 6 (hidden when zone is expanded so visualization takes over full page) */}
      {!isZoneExpanded && (
        <section className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-950/60 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight font-sans">
                Municipal Operations & Analytics
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Sector telemetry, fleet distribution, and priority intervention queue
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-teal-300 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/30">
                {zones.length} Zones Active
              </span>
            </div>
          </div>

          {/* Lower Analytics Panels */}
          <LowerAnalytics
            hotspots={hotspots}
            vehicles={vehicles}
            categories={categories}
            zones={zones}
          />

          {/* Immediate Intervention Queue Table */}
          <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/75 backdrop-blur-md shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-teal-950/60 px-5 py-3.5 bg-[#051110]">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 font-sans">
                  Immediate Intervention Queue
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Ranked by composite threat index (Severity &times; Estimated Mass)
                </p>
              </div>
              <Link
                href="/admin/hotspots"
                className="inline-flex items-center gap-1 text-xs font-sans font-medium text-teal-400 hover:text-teal-200 transition-colors"
              >
                <span>View All Hotspots ({totalHotspots})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <HotspotTable
              hotspots={priorityHotspots}
              onSelect={(h) => setSelectedHotspot(h)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
