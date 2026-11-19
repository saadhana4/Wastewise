"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Settings,
  FileCode2,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface AdminTopNavProps {
  isOnline?: boolean;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Waste Map", href: "/admin/map" },
  { name: "Hotspots", href: "/admin/hotspots" },
  { name: "Fleet", href: "/admin/vehicles" },
  { name: "Routes", href: "/admin/routes" },
  { name: "Analytics", href: "/admin/analytics" },
];

export const AdminTopNav: React.FC<AdminTopNavProps> = ({ isOnline = true }) => {
  const pathname = usePathname();
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setIsAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b border-teal-950/40 bg-[#06100F]/95 backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-4 lg:px-6">
        {/* Left: Brand Identity + Horizontal Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Logo Mark + Title */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-600/30 border border-teal-500/30 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.25)] transition-all group-hover:border-teal-400/50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2v6" />
                <path d="M12 16v6" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="M2 12h6" />
                <path d="M16 12h6" />
                <path d="m4.93 19.07 4.24-4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold tracking-tight text-white leading-tight">
                WasteWise
              </span>
              <span className="text-[10px] text-teal-400/80 font-normal leading-tight">
                Geospatial waste intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Horizontal Navigation (Replaces Sidebar) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/admin/dashboard" && pathname === "/admin") ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative h-14 flex items-center px-3 text-[13px] transition-colors ${
                    isActive
                      ? "text-teal-300 font-medium after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-teal-400 after:shadow-[0_0_8px_#2dd4bf]"
                      : "text-slate-400 hover:text-slate-200 font-normal"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Notifications, Online Dot, Avatar Menu */}
        <div className="flex items-center gap-3">
          {/* Search Input (Ctrl+K) */}
          <div className="hidden lg:flex items-center relative w-48 xl:w-56 transition-all focus-within:w-64">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search... [ ⌘K ]"
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#0a1817]/60 border border-teal-900/30 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:bg-[#0c201e]/80 transition-all font-sans"
            />
          </div>

          {/* Notification Icon */}
          <button
            className="relative p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-[#091716]"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#14b8a6]" />
          </button>

          {/* System Online Dot */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30 text-[11px] font-sans text-emerald-300"
            title={isOnline ? "PostGIS & Telemetry Online" : "Service Offline"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              }`}
            />
            <span className="hidden sm:inline text-[10px] text-emerald-300/90 font-medium">
              Live
            </span>
          </div>

          {/* Admin Avatar & Dropdown (Settings + API Docs overflow) */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              onClick={() => setIsAvatarOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-1 hover:ring-teal-500/40 transition-all"
              aria-label="User profile & overflow menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-teal-900 to-emerald-700 text-teal-200 font-semibold text-xs border border-teal-500/40 shadow-xs">
                WL
              </div>
              <ChevronDown
                className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                  isAvatarOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isAvatarOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-teal-950/80 bg-[#071615]/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-teal-950/60 mb-1">
                  <p className="text-xs font-semibold text-white">Municipal Lead</p>
                  <p className="text-[11px] text-teal-400/80">Command Center-01</p>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-teal-950/40 rounded-lg transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-teal-400" />
                    <span>Settings & Config</span>
                  </Link>

                  <a
                    href="http://localhost:8001/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsAvatarOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-teal-950/40 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode2 className="h-3.5 w-3.5 text-teal-400" />
                      <span>API Documentation</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-teal-950/60 px-3 py-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Role: Municipal Admin
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-teal-950/80 bg-[#071615]/98 px-4 py-3 backdrop-blur-xl space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/dashboard" && pathname === "/admin");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-teal-950/60 text-teal-300 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-teal-950/30"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
