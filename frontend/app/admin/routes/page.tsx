"use client";

import React from "react";
import { PageHeader } from "@/components";
import { Route as RouteIcon, MapPin, Truck, AlertTriangle, Layers, Compass } from "lucide-react";

export default function RoutesPage() {
  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      <PageHeader
        title="Collection Routing &amp; Autonomous Dispatch"
        description="Capacitated Vehicle Routing Problem (CVRP) engine, graph pathfinding, and topological fleet guidance."
        badge={
          <span className="rounded-full bg-teal-950/80 px-3 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-800/60">
            PHASE 4 ARCHITECTURE
          </span>
        }
      />

      {/* Routing Engine Architecture Spec */}
      <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-8 text-center max-w-3xl mx-auto shadow-lg space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/50 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          <RouteIcon className="h-6 w-6" />
        </div>

        <h2 className="text-base font-bold font-mono uppercase tracking-wider text-slate-100">
          Autonomous Route Optimization Pipeline
        </h2>

        <p className="text-xs font-mono text-slate-400 leading-relaxed max-w-xl mx-auto">
          In Phase 4, the CVRP optimization engine will compute emission-minimized, topological turn-by-turn routes factoring real-time traffic graphs and compactor capacities. Zero synthetic routes are fabricated.
        </p>

        {/* Multi-parameter routing criteria breakdown */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left font-mono">
          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Waste Threat Index</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Critical score (&ge;8.0) overflowing nodes receive priority dispatch window.
            </p>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Truck className="h-4 w-4" />
              <span>Payload Constraints</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Exact gross vehicle weight (GVW) limits enforced per municipal unit.
            </p>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Layers className="h-4 w-4" />
              <span>Material Segregation</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Dispatches segregated compactors for compostable vs hazardous streams.
            </p>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
              <MapPin className="h-4 w-4" />
              <span>Spatial Clustering</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              K-Means &amp; DBSCAN spatial grouping to eliminate inter-sector transit deadhead.
            </p>
          </div>

          <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5 sm:col-span-2">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
              <Compass className="h-4 w-4" />
              <span>Road Graph Topology</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Turn-by-turn navigation compiled over OpenStreetMap (OSM) weighted edges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
