"use client";

import React from "react";
import Link from "next/link";
import { Hotspot, Vehicle, WasteCategory, Zone } from "@/types";
import { SeverityDistributionChart } from "./SeverityDistributionChart";
import { StatusBadge } from "./StatusBadge";
import {
  Flame,
  Truck,
  Recycle,
  History,
  BarChart3,
  Layers,
  ArrowRight,
} from "lucide-react";

interface LowerAnalyticsProps {
  hotspots: Hotspot[];
  vehicles: Vehicle[];
  categories: WasteCategory[];
  zones: Zone[];
}

export const LowerAnalytics: React.FC<LowerAnalyticsProps> = ({
  hotspots,
  vehicles,
  categories,
  zones,
}) => {
  const totalHotspots = hotspots.length;
  const criticalCount = hotspots.filter((h) => h.severity_score >= 8.0).length;
  const highPriorityCount = hotspots.filter(
    (h) => h.severity_score >= 6.0 && h.severity_score < 8.0
  ).length;

  const clearedCount = hotspots.filter((h) => h.status === "cleared").length;
  const scheduledCount = hotspots.filter((h) => h.status === "scheduled").length;
  const verifiedCount = hotspots.filter((h) => h.status === "verified").length;
  const detectedCount = hotspots.filter((h) => h.status === "detected").length;

  // Fleet stats
  const availableVehicles = vehicles.filter((v) =>
    ["available", "idle", "standby"].includes((v.status || "").toLowerCase())
  ).length;
  const activeVehicles = vehicles.filter((v) =>
    ["active", "on_route", "in_service"].includes((v.status || "").toLowerCase())
  ).length;
  const maintenanceVehicles = vehicles.filter((v) =>
    ["maintenance", "repair", "offline"].includes((v.status || "").toLowerCase())
  ).length;

  const totalCapacityKg = vehicles.reduce((sum, v) => sum + (v.capacity_kg || 0), 0);

  // Tick-segment calculation
  const totalTicks = 24;
  const clearedRatio = totalHotspots > 0 ? clearedCount / totalHotspots : 0;
  const activeTicks = Math.round(clearedRatio * totalTicks);

  return (
    <div className="space-y-6 font-sans select-none">
      {/* 1. Summary KPI Cards with Colored Left Accent */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Hotspots */}
        <div className="relative rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-4 backdrop-blur-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400" />
          <span className="text-xs font-medium text-slate-400">
            Detected Hotspots
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {totalHotspots}
            </span>
            <span className="text-[11px] font-sans text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-900/40">
              {zones.length} Zones
            </span>
          </div>
        </div>

        {/* Card 2: Critical Hotspots */}
        <div className="relative rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-4 backdrop-blur-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
          <span className="text-xs font-medium text-slate-400">
            Critical Hotspots
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
              {criticalCount}
            </span>
            <span className="text-[11px] font-sans text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-900/40">
              Sev ≥ 8.0
            </span>
          </div>
        </div>

        {/* Card 3: Fleet Payload */}
        <div className="relative rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-4 backdrop-blur-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
          <span className="text-xs font-medium text-slate-400">
            Total Fleet Capacity
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
              {totalCapacityKg.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-slate-400">kg</span>
          </div>
        </div>

        {/* Card 4: Categories */}
        <div className="relative rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-4 backdrop-blur-md shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
          <span className="text-xs font-medium text-slate-400">
            Material Taxonomy
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300">
              {categories.length}
            </span>
            <span className="text-[11px] font-sans text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/40">
              Classes
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Severity Gauge (Left) + Execution Progress & Fleet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Semicircular Severity Distribution Gauge */}
        <div className="lg:col-span-1">
          <SeverityDistributionChart hotspots={hotspots} />
        </div>

        {/* Center Column: Collection Dispatch Execution */}
        <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-5 backdrop-blur-md shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-teal-950/60 pb-3">
            <h3 className="text-xs font-semibold text-slate-200">
              Collection Execution Progress
            </h3>
            <span className="text-[11px] font-sans text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-900/40">
              {Math.round(clearedRatio * 100)}% Cleared
            </span>
          </div>

          {/* Tick-Segment Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Dispatch Recovery Rate</span>
              <span className="font-medium font-mono text-white">
                {clearedCount} / {totalHotspots} sites
              </span>
            </div>

            <div className="flex items-center gap-1 py-1">
              {Array.from({ length: totalTicks }).map((_, i) => (
                <div
                  key={i}
                  className={`h-5 flex-1 rounded-xs transition-all ${
                    i < activeTicks
                      ? "bg-teal-400 shadow-[0_0_6px_#14b8a6]"
                      : "bg-[#0B1E1C] border border-teal-950/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Status Breakdown Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-lg bg-[#051110] border border-teal-950/60 flex items-center justify-between">
              <span className="text-slate-400">Detected:</span>
              <span className="font-semibold font-mono text-amber-400">{detectedCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#051110] border border-teal-950/60 flex items-center justify-between">
              <span className="text-slate-400">Verified:</span>
              <span className="font-semibold font-mono text-cyan-400">{verifiedCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#051110] border border-teal-950/60 flex items-center justify-between">
              <span className="text-slate-400">Scheduled:</span>
              <span className="font-semibold font-mono text-purple-400">{scheduledCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#051110] border border-teal-950/60 flex items-center justify-between">
              <span className="text-slate-400">Cleared:</span>
              <span className="font-semibold font-mono text-emerald-400">{clearedCount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Telematics */}
        <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-5 backdrop-blur-md shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-teal-950/60 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                Fleet Status
              </h3>
            </div>
            <Link
              href="/admin/vehicles"
              className="text-xs font-sans text-teal-400 hover:text-teal-200 flex items-center gap-1"
            >
              <span>All Units</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Compact Status Counters */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[#051110] border border-teal-950/60">
              <span className="text-[10px] text-slate-400 block">Available</span>
              <span className="text-base font-bold font-mono text-emerald-300 mt-0.5 block">
                {String(availableVehicles).padStart(2, "0")}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#051110] border border-teal-950/60">
              <span className="text-[10px] text-slate-400 block">Active</span>
              <span className="text-base font-bold font-mono text-cyan-300 mt-0.5 block">
                {String(activeVehicles).padStart(2, "0")}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#051110] border border-teal-950/60">
              <span className="text-[10px] text-slate-400 block">Maint</span>
              <span className="text-base font-bold font-mono text-purple-300 mt-0.5 block">
                {String(maintenanceVehicles).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Compact Vehicle Rows from API */}
          <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
            {vehicles.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#051110] border border-teal-950/60 text-xs"
              >
                <div>
                  <div className="font-mono font-medium text-slate-200">
                    {v.registration_number.replace(/^DEMO-/i, "")}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {v.vehicle_type.replace(/_/g, " ")} • {v.capacity_kg.toLocaleString()} kg
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Waste Composition Matrix & Time-Series Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Categories from API */}
        <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-5 backdrop-blur-md shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-teal-950/60 pb-3">
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                Waste Composition Taxonomy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-800/40">
              API Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-2.5 rounded-lg bg-[#051110] border border-teal-950/60 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <div className="font-medium text-slate-200 truncate">{cat.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    Handling: {cat.handling_type.replace(/_/g, " ")}
                  </div>
                </div>

                <span className="text-[10px] text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-800/40 shrink-0">
                  Awaiting scan
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time-Series Stacked Bars (Clean Minimal Empty State) */}
        <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/75 p-5 backdrop-blur-md shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-teal-950/60 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                Historical Accumulation Trends
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Phase 3 Model
            </span>
          </div>

          <div className="py-8 text-center max-w-sm mx-auto space-y-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-950/50 text-teal-400 border border-teal-800/30">
              <History className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-slate-300">
              Awaiting Operational Accumulation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Historical accumulation curves will populate as continuous satellite scans log multi-week telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
