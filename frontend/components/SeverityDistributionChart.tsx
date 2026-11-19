"use client";

import React from "react";
import { Hotspot } from "@/types";

interface SeverityDistributionChartProps {
  hotspots: Hotspot[];
}

export const SeverityDistributionChart: React.FC<SeverityDistributionChartProps> = ({ hotspots }) => {
  const total = hotspots.length;

  const counts = {
    critical: hotspots.filter((h) => h.severity_score >= 8.0).length,
    high: hotspots.filter((h) => h.severity_score >= 6.0 && h.severity_score < 8.0).length,
    medium: hotspots.filter((h) => h.severity_score >= 4.0 && h.severity_score < 6.0).length,
    low: hotspots.filter((h) => h.severity_score < 4.0).length,
  };

  const getPercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // SVG Gauge calculations
  // Semicircle arc: radius = 80, center = (100, 95)
  // Total arc length = pi * radius = 251.3
  const radius = 70;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // ~219.9

  // Calculate arc offsets
  const pctCrit = total > 0 ? counts.critical / total : 0;
  const pctHigh = total > 0 ? counts.high / total : 0;
  const pctMed = total > 0 ? counts.medium / total : 0;
  const pctLow = total > 0 ? counts.low / total : 0;

  const lenCrit = pctCrit * arcLength;
  const lenHigh = pctHigh * arcLength;
  const lenMed = pctMed * arcLength;
  const lenLow = pctLow * arcLength;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#081514]/90 p-5 shadow-xs backdrop-blur-md flex flex-col justify-between">
      {/* Single-line header */}
      <div className="flex items-center justify-between border-b border-teal-950/70 pb-3">
        <h3 className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase truncate">
          HOTSPOT SEVERITY DISTRIBUTION
        </h3>
        <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/40">
          {total} ACTIVE
        </span>
      </div>

      {/* Semicircle SVG Gauge (Reference 3 Aesthetic) */}
      <div className="py-4 flex flex-col items-center justify-center relative">
        <svg viewBox="0 0 200 115" className="w-52 h-28 overflow-visible">
          {/* Background track arc */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="#0b2321"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {total > 0 && (
            <>
              {/* Low Arc (Teal) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#14b8a6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenLow} ${arcLength * 2}`}
                strokeDashoffset="0"
                transform="rotate(-180 100 100)"
              />

              {/* Medium Arc (Gold/Yellow) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#eab308"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenMed} ${arcLength * 2}`}
                strokeDashoffset={`${-lenLow}`}
                transform="rotate(-180 100 100)"
              />

              {/* High Arc (Amber) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenHigh} ${arcLength * 2}`}
                strokeDashoffset={`${-(lenLow + lenMed)}`}
                transform="rotate(-180 100 100)"
              />

              {/* Critical Arc (Rose/Magenta) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#f43f5e"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenCrit} ${arcLength * 2}`}
                strokeDashoffset={`${-(lenLow + lenMed + lenHigh)}`}
                transform="rotate(-180 100 100)"
                style={{ filter: "drop-shadow(0 0 6px rgba(244,63,94,0.5))" }}
              />
            </>
          )}

          {/* Central Metric Value */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            className="font-mono text-2xl font-bold fill-slate-100"
          >
            {total}
          </text>
          <text
            x="100"
            y="102"
            textAnchor="middle"
            className="font-mono text-[9px] uppercase tracking-widest fill-slate-400"
          >
            TOTAL HOTSPOTS
          </text>
        </svg>
      </div>

      {/* Legend Rows with Guaranteed Agreement */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-950/70 text-xs font-mono">
        {/* Critical */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#061110] border border-teal-950/60">
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] shrink-0" />
            <span className="text-[10px] text-slate-300 truncate">Critical (≥8)</span>
          </div>
          <span className="font-bold text-rose-300 text-[11px] shrink-0">
            {counts.critical} ({getPercent(counts.critical)}%)
          </span>
        </div>

        {/* High */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#061110] border border-teal-950/60">
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] shrink-0" />
            <span className="text-[10px] text-slate-300 truncate">High (6-8)</span>
          </div>
          <span className="font-bold text-amber-300 text-[11px] shrink-0">
            {counts.high} ({getPercent(counts.high)}%)
          </span>
        </div>

        {/* Medium */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#061110] border border-teal-950/60">
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15] shrink-0" />
            <span className="text-[10px] text-slate-300 truncate">Medium (4-6)</span>
          </div>
          <span className="font-bold text-yellow-300 text-[11px] shrink-0">
            {counts.medium} ({getPercent(counts.medium)}%)
          </span>
        </div>

        {/* Low */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#061110] border border-teal-950/60">
          <div className="flex items-center gap-1.5 truncate">
            <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf] shrink-0" />
            <span className="text-[10px] text-slate-300 truncate">Low (&lt;4)</span>
          </div>
          <span className="font-bold text-teal-300 text-[11px] shrink-0">
            {counts.low} ({getPercent(counts.low)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
