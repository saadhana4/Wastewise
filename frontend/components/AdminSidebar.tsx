"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  Flame,
  Truck,
  Route as RouteIcon,
  BarChart3,
  Settings as SettingsIcon,
  Recycle,
  X,
  ExternalLink,
  Cpu,
  Radio,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const overviewNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Waste Map", href: "/admin/map", icon: MapIcon },
  { name: "Hotspots", href: "/admin/hotspots", icon: Flame },
  { name: "Fleet", href: "/admin/vehicles", icon: Truck },
  { name: "Routes", href: "/admin/routes", icon: RouteIcon },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const systemNav = [
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  // Close drawer on Escape key press (for mobile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Narrow Elegant Command Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col bg-[#081514] border-r border-teal-950/70 transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-teal-950/60 px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D2422] text-teal-400 border border-teal-500/20 group-hover:border-teal-400/40 transition-colors">
              <Recycle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-widest text-slate-100 uppercase">
                  WASTEWISE
                </span>
                <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-teal-950/80 text-teal-400 border border-teal-800/50">
                  AI
                </span>
              </div>
              <span className="text-[8.5px] tracking-wider text-slate-500 font-medium block uppercase">
                GEOSPATIAL WASTE INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0B1E1C] hover:text-slate-200 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* OVERVIEW Group */}
          <div>
            <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              OVERVIEW
            </span>
            <nav className="mt-1.5 space-y-0.5">
              {overviewNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                      isActive
                        ? "bg-[#0D2422]/90 text-teal-300 font-semibold border-l-2 border-teal-400 shadow-[inset_0_0_12px_rgba(20,184,166,0.12)]"
                        : "text-slate-400 hover:bg-[#0B1E1C]/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* SYSTEM Group */}
          <div>
            <span className="px-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              SYSTEM
            </span>
            <nav className="mt-1.5 space-y-0.5">
              {systemNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                      isActive
                        ? "bg-[#0D2422]/90 text-teal-300 font-semibold border-l-2 border-teal-400 shadow-[inset_0_0_12px_rgba(20,184,166,0.12)]"
                        : "text-slate-400 hover:bg-[#0B1E1C]/60 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <a
                href="http://localhost:8001/docs"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-400 hover:bg-[#0B1E1C]/60 hover:text-slate-200 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span>API Docs</span>
                </div>
                <span className="text-[10px] font-mono text-teal-600">:8001</span>
              </a>
            </nav>
          </div>
        </div>

        {/* System Intelligence Telemetry Footer */}
        <div className="border-t border-teal-950/60 p-3 bg-[#061110]">
          <div className="rounded-lg bg-[#081716] p-2.5 border border-teal-900/30 text-[10.5px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-teal-400 animate-pulse" />
                TELEMETRY
              </span>
              <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 text-[9.5px] font-mono text-slate-500 leading-tight">
              PostGIS Spatial • EPSG:4326
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};


