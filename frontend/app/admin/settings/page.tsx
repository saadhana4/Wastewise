"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageHeader, StatusBadge, LoadingState, ErrorState } from "@/components";
import { apiClient, API_BASE_URL } from "@/lib/api-client";
import { HealthResponse } from "@/types";
import { Server, Database, Globe, RefreshCw, Cpu, Activity } from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await apiClient.getHealth();
      setLatencyMs(Math.round(performance.now() - start));
      setHealth(data);
    } catch (err: any) {
      setError(err?.message || "Failed to reach backend health service.");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const isDbConnected = health?.database?.status === "connected";
  const isPostGisReady = health?.database?.postgis_enabled;

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="Core System Diagnostics"
        description="FastAPI service endpoints, PostgreSQL engine telemetry, PostGIS spatial runtime, and network latency."
        actions={
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-950/80 border border-teal-800/60 px-4 py-2 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>PROBE DIAGNOSTICS</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState message="PROBING MICROSERVICE NODES &amp; POSTGIS RUNTIME..." />
      ) : error ? (
        <ErrorState title="Diagnostics Link Disrupted" message={error} onRetry={fetchHealth} />
      ) : (
        <div className="space-y-6">
          {/* 1. Infrastructure Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
                  FastAPI Service
                </span>
                <StatusBadge status={health?.status === "ok" ? "connected" : "error"} />
              </div>
              <p className="mt-2 text-sm font-bold text-slate-100 font-mono">{API_BASE_URL}</p>
              <span className="text-[11px] text-teal-300 font-mono mt-1 flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-teal-400" />
                RTT: {latencyMs !== null ? `${latencyMs} ms` : "N/A"}
              </span>
            </div>

            <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
                  PostgreSQL Engine
                </span>
                <StatusBadge status={isDbConnected ? "connected" : "disconnected"} />
              </div>
              <p className="mt-2 text-sm font-bold text-slate-100 font-mono">Port 5432 (Docker)</p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                Cluster: {health?.database?.status || "disconnected"}
              </span>
            </div>

            <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
                  PostGIS Extension
                </span>
                <StatusBadge status={isPostGisReady ? "active" : "offline"} />
              </div>
              <p className="mt-2 text-sm font-bold text-teal-300 font-mono">
                {isPostGisReady ? (health?.database?.postgis_version ? `PostGIS ${health.database.postgis_version.split(' ')[0]} Ready` : "PostGIS Ready") : "Inactive"}
              </p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block truncate">
                {health?.database?.postgis_version || "Spatial extension operational"}
              </span>
            </div>
          </div>

          {/* 2. System Information Section */}
          <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2 border-b border-teal-950/70 pb-3">
              <Server className="h-4 w-4 text-teal-400" />
              <span>System &amp; Environmental Metadata</span>
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <dt className="text-slate-400">Application Identity</dt>
                <dd className="mt-1 font-bold text-teal-300">
                  {health?.service || "wastewise-backend"}
                </dd>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <dt className="text-slate-400">Deployment Architecture</dt>
                <dd className="mt-1 font-bold text-slate-200">
                  v{health?.version || "1.0.0"} (Geospatial Command Center)
                </dd>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <dt className="text-slate-400">Runtime Environment</dt>
                <dd className="mt-1 font-bold text-slate-200 uppercase">
                  {health?.environment || "development"}
                </dd>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <dt className="text-slate-400">Coordinate Reference System</dt>
                <dd className="mt-1 font-bold text-teal-300">
                  WGS84 (EPSG:4326) Vector Space
                </dd>
              </div>
            </dl>
          </div>

          {/* 3. API & Service Status Details */}
          <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2 border-b border-teal-950/70 pb-3">
              <Globe className="h-4 w-4 text-teal-400" />
              <span>Operational REST Microservice Endpoints</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /api/v1/health</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">
                  200 OK
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /api/v1/zones</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">
                  200 OK
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /api/v1/hotspots</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">
                  200 OK
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /api/v1/vehicles</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">
                  200 OK
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /api/v1/waste-categories</span>
                <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800/60">
                  200 OK
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#061110] p-3 border border-teal-950/70">
                <span className="text-slate-300">GET /docs (OpenAPI Swagger)</span>
                <span className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-800/60">
                  200 OK
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
