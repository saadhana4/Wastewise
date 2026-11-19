"use client";

import React from "react";

export const TimelineScrubber: React.FC = () => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none select-none">
      {/* Faint vertical line track */}
      <div className="h-28 w-px bg-gradient-to-b from-transparent via-teal-500/20 to-teal-500/40" />

      {/* Minimal Live marker pill */}
      <div className="my-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#071615]/90 border border-amber-500/30 text-amber-300 text-[11px] font-sans font-medium shadow-[0_0_12px_rgba(245,158,11,0.2)] backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Live</span>
      </div>

      {/* Lower faint line track */}
      <div className="h-28 w-px bg-gradient-to-b from-teal-500/40 via-teal-500/20 to-transparent" />
    </div>
  );
};
