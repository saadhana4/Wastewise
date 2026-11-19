"use client";

import React from "react";
import { Flame, AlertTriangle, AlertOctagon, Truck, Clock } from "lucide-react";

interface IntelligenceStripProps {
  totalHotspots: number;
  criticalCount: number;
  highPriorityCount: number;
  activeVehicles: number;
  pendingCount: number;
  zonesCount: number;
}

export const IntelligenceStrip: React.FC<IntelligenceStripProps> = ({
  totalHotspots,
  criticalCount,
  highPriorityCount,
  activeVehicles,
  pendingCount,
  zonesCount,
}) => {
  return (
    <div className="w-full rounded-2xl border border-teal-950/70 bg-[#081514]/90 p-3 sm:p-4 backdrop-blur-md shadow-xs font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-teal-950/80">
        {/* Item 1: Total Hotspots */}
        <div className="flex items-center gap-3 px-2 sm:px-3 pt-2 sm:pt-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1E1C] text-teal-400 border border-teal-900/40">
            <Flame className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {String(totalHotspots).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              TOTAL HOTSPOTS
            </div>
          </div>
        </div>

        {/* Item 2: Critical Hotspots */}
        <div className="flex items-center gap-3 px-2 sm:px-3 pt-2 sm:pt-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950/30 text-rose-400 border border-rose-900/40">
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-rose-400">
              {String(criticalCount).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              CRITICAL (≥ 8.0)
            </div>
          </div>
        </div>

        {/* Item 3: High Priority */}
        <div className="flex items-center gap-3 px-2 sm:px-3 pt-2 sm:pt-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-950/30 text-amber-400 border border-amber-900/40">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400">
              {String(highPriorityCount).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              HIGH PRIORITY
            </div>
          </div>
        </div>

        {/* Item 4: Active Fleet */}
        <div className="flex items-center gap-3 px-2 sm:px-3 pt-2 sm:pt-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950/30 text-cyan-400 border border-cyan-900/40">
            <Truck className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-cyan-300">
              {String(activeVehicles).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              ACTIVE VEHICLES
            </div>
          </div>
        </div>

        {/* Item 5: Pending Collections */}
        <div className="flex items-center gap-3 px-2 sm:px-3 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950/30 text-emerald-400 border border-emerald-900/40">
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-300">
              {String(pendingCount).padStart(2, "0")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              PENDING DISPATCH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
