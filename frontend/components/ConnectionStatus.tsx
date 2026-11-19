"use client";

import React from "react";
import { HealthResponse } from "@/types";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "checking";
  healthData: HealthResponse | null;
  errorMessage?: string | null;
  onRetry: () => void;
  latencyMs?: number | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  healthData,
  errorMessage,
  onRetry,
  latencyMs,
}) => {
  return (
    <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {status === "connected" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            {status === "checking" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                status === "connected"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : status === "checking"
                  ? "bg-amber-400"
                  : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              }`}
            ></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
                Core Telemetry:
              </span>
              <span
                id="backend-connection-status"
                className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  status === "connected"
                    ? "text-emerald-300"
                    : status === "checking"
                    ? "text-amber-300"
                    : "text-rose-400"
                }`}
              >
                {status === "connected"
                  ? "LINK SYNCHRONIZED"
                  : status === "checking"
                  ? "PROBING..."
                  : "DISCONNECTED"}
              </span>
            </div>
            {latencyMs !== null && latencyMs !== undefined && status === "connected" && (
              <p className="text-[10px] text-slate-500 font-mono">Roundtrip: {latencyMs}ms</p>
            )}
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={status === "checking"}
          className="inline-flex items-center justify-center rounded-lg bg-teal-950/80 border border-teal-800/60 px-3 py-1.5 text-xs font-mono font-bold text-teal-300 hover:bg-teal-900/60 transition-colors disabled:opacity-50"
        >
          {status === "checking" ? "PROBING..." : "PROBE TELEMETRY"}
        </button>
      </div>

      {status === "connected" && healthData && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-teal-950/70 pt-4 sm:grid-cols-3 font-mono text-xs">
          <div className="rounded-lg bg-[#061110] p-2.5 border border-teal-950/70">
            <span className="text-[10px] text-slate-400 uppercase block">Microservice</span>
            <p className="font-bold text-teal-300 mt-0.5">{healthData.service}</p>
          </div>
          <div className="rounded-lg bg-[#061110] p-2.5 border border-teal-950/70">
            <span className="text-[10px] text-slate-400 uppercase block">Engine Revision</span>
            <p className="font-bold text-slate-200 mt-0.5">{healthData.version || "1.0.0"}</p>
          </div>
          <div className="rounded-lg bg-[#061110] p-2.5 border border-teal-950/70">
            <span className="text-[10px] text-slate-400 uppercase block">Spatial PostGIS</span>
            <p className="font-bold text-emerald-400 mt-0.5">
              {healthData.database?.postgis_enabled
                ? `Active (${healthData.database.postgis_version || "PostGIS"})`
                : healthData.database?.status === "connected"
                ? "PostgreSQL (PostGIS pending)"
                : "Awaiting DB start"}
            </p>
          </div>
        </div>
      )}

      {status === "disconnected" && (
        <div className="mt-4 rounded-lg border border-rose-950 bg-rose-950/30 p-3 text-xs font-mono text-rose-300">
          <p className="font-bold uppercase tracking-wider">Connection Failure Warning:</p>
          <p className="mt-1 text-rose-400">
            {errorMessage || "Unable to reach FastAPI at http://localhost:8001. Ensure the backend server is running."}
          </p>
        </div>
      )}
    </div>
  );
};
