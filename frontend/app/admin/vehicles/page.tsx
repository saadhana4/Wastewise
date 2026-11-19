"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  PageHeader,
  VehicleTable,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { Vehicle } from "@/types";
import { Truck, RefreshCw, Search, Filter, ShieldCheck, Radio } from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load collection fleet data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        !searchQuery ||
        v.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        v.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  // Derived Fleet Stats
  const totalFleet = vehicles.length;
  const availableCount = vehicles.filter((v) => (v.status || "").toLowerCase() === "available").length;
  const totalCapacityKg = vehicles.reduce((sum, v) => sum + (v.capacity_kg || 0), 0);
  const leadVehicle = vehicles.length > 0 ? vehicles[0] : null;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="Fleet Telematics &amp; Dispatch"
        description="Municipal waste collection units, payload specifications, and real-time GPS coordinates."
        badge={
          <span className="rounded-full bg-teal-950/80 px-3 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-800/60">
            {totalFleet} ACTIVE UNITS
          </span>
        }
        actions={
          <button
            onClick={loadVehicles}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800/60 px-4 py-2 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>SYNC FLEET TELEMETRY</span>
          </button>
        }
      />

      {/* Featured Lead Vehicle Card */}
      {leadVehicle && (
        <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
                    Lead Municipal Unit
                  </span>
                  <h2 className="text-xl font-bold font-mono text-slate-100 tracking-tight capitalize mt-0.5">
                    {leadVehicle.vehicle_type.replace(/_/g, " ")} #{leadVehicle.id}
                  </h2>
                </div>
                <StatusBadge status={leadVehicle.status} />
              </div>

              {/* 4-column metric specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[#061110] p-3 border border-teal-950/70 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">Payload</span>
                  <span className="text-lg font-bold text-teal-300 mt-0.5 block">
                    {leadVehicle.capacity_kg.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-slate-400">kg</span>
                  </span>
                </div>

                <div className="rounded-lg bg-[#061110] p-3 border border-teal-950/70 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">Class Rating</span>
                  <span className="text-lg font-bold text-slate-200 mt-0.5 block capitalize truncate">
                    {leadVehicle.vehicle_type.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="rounded-lg bg-[#061110] p-3 border border-teal-950/70 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">GPS Telemetry</span>
                  <span className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE LINK
                  </span>
                </div>

                <div className="rounded-lg bg-[#061110] p-3 border border-teal-950/70 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block">Sector Anchor</span>
                  <span className="text-xs font-bold text-slate-300 mt-1.5 block truncate">
                    WGS84 EPSG:4326
                  </span>
                </div>
              </div>

              {/* Registration badge */}
              <div className="flex items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 rounded-lg border border-teal-800/60 bg-teal-950/60 px-3 py-1 font-mono font-bold text-xs text-teal-200 tracking-wider">
                  <span className="text-[10px] text-teal-400">IND</span>
                  <span>{leadVehicle.registration_number}</span>
                </div>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                  Telematics Certified
                </span>
              </div>
            </div>

            {/* Vehicle profile visual */}
            <div className="flex items-center justify-center p-6 bg-[#061110] rounded-xl border border-teal-950/80 min-w-[260px]">
              <div className="text-center space-y-2 font-mono">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-teal-950/80 text-teal-300 border border-teal-800/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                  <Truck className="h-8 w-8" />
                </div>
                <span className="text-xs font-bold text-slate-200 block uppercase">
                  Municipal Compactor Unit
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Telematics Node ID: #{leadVehicle.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">Total Registered Fleet</span>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-100">{totalFleet}</p>
        </div>
        <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">Available For Dispatch</span>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-400">{availableCount}</p>
        </div>
        <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">Total Fleet Capacity</span>
          <p className="mt-1 text-2xl font-bold font-mono text-cyan-300">{totalCapacityKg.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-teal-950/80 bg-[#081514] p-3.5 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-teal-500/70" />
          <input
            type="text"
            placeholder="Search by registration or vehicle type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-teal-950/90 bg-[#061110] py-2 pl-9 pr-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-teal-400/80" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-teal-950/90 bg-[#061110] px-3 py-2 text-xs font-mono font-semibold text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Fleet Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="on_route">On Route</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingState message="POLLING FLEET TELEMETRY REPOSITORY..." />
      ) : error ? (
        <ErrorState title="Fleet Telemetry Interrupted" message={error} onRetry={loadVehicles} />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          title="No Vehicles Matching Filter"
          description={
            vehicles.length === 0
              ? "No collection vehicles are currently registered in the database."
              : "Try adjusting your vehicle search terms."
          }
          icon={<Radio className="h-5 w-5 text-teal-400" />}
        />
      ) : (
        <VehicleTable vehicles={filteredVehicles} />
      )}
    </div>
  );
}
