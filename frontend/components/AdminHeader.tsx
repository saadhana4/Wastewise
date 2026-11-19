"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell, User, Search, Terminal, Radio } from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  section?: string;
  isOnline?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  title = "COMMAND CENTER",
  section = "REAL-TIME GEOSPATIAL INTELLIGENCE",
  isOnline = true,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-teal-950/70 bg-[#07100F]/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Command Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="admin-mobile-toggle"
          onClick={onToggleSidebar}
          className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-[#0B1E1C] hover:text-teal-300 lg:hidden border border-teal-900/30 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            {title}
          </span>
          <span className="text-slate-600 text-xs hidden sm:inline">//</span>
          <span className="hidden text-[10px] text-teal-500/80 font-semibold tracking-wider sm:inline uppercase">
            {section}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Search */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search coordinates, zones, vehicles... [ ⌘K ]"
          className="w-full h-8 pl-8 pr-12 rounded-lg bg-[#0B1E1C]/60 border border-teal-900/40 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:bg-[#0D2422]/80 transition-all font-mono"
        />
        <kbd className="absolute right-2.5 text-[9px] font-mono text-slate-500 bg-[#081514] px-1.5 py-0.5 rounded border border-teal-950 pointer-events-none">
          CMD
        </kbd>
      </div>

      {/* Right: Telemetry Health, Notifications, Admin Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Online Status Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-teal-900/40 bg-[#091716] px-2.5 py-0.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
            }`}
          />
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-300 uppercase">
            {isOnline ? "SYSTEM ONLINE" : "OFFLINE"}
          </span>
        </div>

        {/* Notifications Icon Button */}
        <button
          className="relative rounded-lg p-1.5 text-slate-400 hover:bg-[#0B1E1C] hover:text-slate-200 transition-colors border border-transparent hover:border-teal-900/40"
          title="Telemetry Alerts"
          aria-label="View alerts"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#14b8a6]" />
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-teal-950/80">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D2422] text-teal-400 border border-teal-500/30 font-mono text-[10px] font-bold">
            OPS
          </div>
          <div className="hidden xl:block text-left font-mono">
            <span className="text-[11px] font-bold text-slate-200 block leading-tight">
              MUNICIPAL LEAD
            </span>
            <span className="text-[9px] text-teal-500/80 block leading-tight">
              CENTER-01
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


