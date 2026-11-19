"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  StatCard,
  SeverityDistributionChart,
  LoadingState,
  ErrorState,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { Hotspot, Vehicle, WasteCategory, Zone } from "@/types";
import { Flame, Truck, Recycle, Layers, History, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, vData, cData, zData] = await Promise.all([
        apiClient.getHotspots(),
        apiClient.getVehicles(),
        apiClient.getWasteCategories(),
        apiClient.getZones(),
      ]);
      setHotspots(hData);
      setVehicles(vData);
      setCategories(cData);
      setZones(zData);
    } catch (err: any) {
      setError(err?.message || "Failed to load operational analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState message="AGGREGATING OPERATIONAL TELEMETRY METRICS..." />;
  }

  if (error) {
    return <ErrorState title="Analytics Link Failed" message={error} onRetry={loadData} />;
  }

  // Real aggregate calculations
  const totalQuantityKg = hotspots.reduce((acc, h) => acc + (h.estimated_quantity || 0), 0);
  const recyclableCategories = categories.filter((c) => c.recyclable).length;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="Operational Analytics &amp; Yield"
        description="Geospatial telemetry aggregations derived from live PostGIS database entities."
        badge={
          <span className="rounded-full bg-teal-950/80 px-3 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-800/60">
            LIVE TELEMETRY
          </span>
        }
        actions={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800/60 px-4 py-2 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-all shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>SYNC METRICS</span>
          </button>
        }
      />

      {/* Real Baseline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recorded Hotspots"
          value={hotspots.length}
          subtitle={`Across ${zones.length} mapped zones`}
          icon={<Flame className="h-4 w-4 text-amber-400" />}
        />
        <StatCard
          title="Est. Waste Accumulated"
          value={totalQuantityKg > 0 ? `${totalQuantityKg.toLocaleString()} kg` : "Pending Data"}
          subtitle="Estimated mass volume"
          icon={<Layers className="h-4 w-4 text-teal-400" />}
        />
        <StatCard
          title="Waste Categories"
          value={categories.length}
          subtitle={`${recyclableCategories} recyclable types`}
          icon={<Recycle className="h-4 w-4 text-emerald-400" />}
        />
        <StatCard
          title="Fleet Capacity"
          value={`${vehicles.reduce((s, v) => s + (v.capacity_kg || 0), 0).toLocaleString()} kg`}
          subtitle={`${vehicles.length} total vehicles`}
          icon={<Truck className="h-4 w-4 text-cyan-400" />}
        />
      </div>

      {/* Hotspot Threat Distribution */}
      <SeverityDistributionChart hotspots={hotspots} />

      {/* Waste Categories Breakdown */}
      <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm space-y-4">
        <div className="border-b border-teal-950/70 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
            Registered Waste Categories &amp; Handling Types
          </h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Material segregation protocols stored in PostgreSQL database
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{cat.name}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                      cat.recyclable
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    {cat.recyclable ? "Recyclable" : "Non-Recyclable"}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  {cat.description || "No handling notes recorded."}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-teal-950/60 text-[10px] text-slate-500">
                Protocol: {cat.handling_type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Intelligence Placeholders */}
      <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-teal-950/70 pb-3">
          <History className="h-4 w-4 text-teal-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
            Historical Intelligence (Temporal Multi-Week Analysis)
          </h3>
        </div>
        <p className="text-[11px] font-mono text-slate-400">
          Collection history will populate this analysis as operational data accumulates across municipal cycles:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5 space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              Accumulation Forecasting
            </span>
            <span className="text-[10px] text-amber-400/90 block">
              Requires multi-day operational telemetry.
            </span>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5 space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
              Turnaround Velocity
            </span>
            <span className="text-[10px] text-amber-400/90 block">
              Requires completed dispatch cycles.
            </span>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5 space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Recycle className="h-3.5 w-3.5 text-emerald-400" />
              Diversion Ratio
            </span>
            <span className="text-[10px] text-amber-400/90 block">
              Requires weighbridge telemetry log.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
