"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  PageHeader,
  HotspotTable,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { Hotspot } from "@/types";
import { Search, Filter, RefreshCw, Flame, Radio } from "lucide-react";

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const loadHotspots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getHotspots();
      setHotspots(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load hotspots from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotspots();
  }, [loadHotspots]);

  // Filtered hotspots
  const filteredHotspots = useMemo(() => {
    return hotspots.filter((h) => {
      const idMatch = String(h.id).includes(searchQuery.trim());
      const coords = h.location?.coordinates;
      const coordsMatch = coords
        ? `${coords[0]},${coords[1]}`.includes(searchQuery.trim())
        : false;
      const matchesSearch = !searchQuery || idMatch || coordsMatch;

      const matchesStatus =
        statusFilter === "all" ||
        (h.status || "").toLowerCase() === statusFilter.toLowerCase();

      let matchesSeverity = true;
      if (severityFilter === "critical") matchesSeverity = h.severity_score >= 8.0;
      else if (severityFilter === "high")
        matchesSeverity = h.severity_score >= 6.0 && h.severity_score < 8.0;
      else if (severityFilter === "medium")
        matchesSeverity = h.severity_score >= 4.0 && h.severity_score < 6.0;
      else if (severityFilter === "low") matchesSeverity = h.severity_score < 4.0;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [hotspots, searchQuery, statusFilter, severityFilter]);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="Waste Hotspot Registry"
        description="Active spatial detection nodes, volumetric accumulation vectors, and collection priority indices."
        badge={
          <span className="rounded-full bg-teal-950/80 px-3 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-800/60">
            {hotspots.length} DETECTED SITES
          </span>
        }
        actions={
          <button
            onClick={loadHotspots}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800/60 px-4 py-2 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>SYNC HOTSPOTS</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-teal-950/80 bg-[#081514] p-3.5 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-teal-500/70" />
          <input
            type="text"
            placeholder="Search by Hotspot ID or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-teal-950/90 bg-[#061110] py-2 pl-9 pr-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-teal-400/80">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-teal-950/90 bg-[#061110] px-3 py-2 text-xs font-mono font-semibold text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="detected">Detected</option>
            <option value="verified">Verified</option>
            <option value="scheduled">Scheduled</option>
            <option value="cleared">Cleared</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-teal-950/90 bg-[#061110] px-3 py-2 text-xs font-mono font-semibold text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (&ge; 8.0)</option>
            <option value="high">High (6.0 - 7.9)</option>
            <option value="medium">Medium (4.0 - 5.9)</option>
            <option value="low">Low (&lt; 4.0)</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingState message="SCANNING POSTGIS VECTOR RECORDS..." />
      ) : error ? (
        <ErrorState title="Telemetry Disruption" message={error} onRetry={loadHotspots} />
      ) : filteredHotspots.length === 0 ? (
        <EmptyState
          title="No Hotspot Detections Matching Filter"
          description={
            hotspots.length === 0
              ? "No waste hotspots have been recorded in the database yet."
              : "Try adjusting your spatial coordinate filter or search query."
          }
          icon={<Radio className="h-5 w-5 text-teal-400" />}
        />
      ) : (
        <HotspotTable hotspots={filteredHotspots} />
      )}
    </div>
  );
}
