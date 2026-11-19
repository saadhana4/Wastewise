"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hotspot, Zone, Vehicle } from "@/types";
import { SeverityBadge } from "./SeverityBadge";
import { formatCoordinates } from "@/lib/formatters";
import {
  X,
  MapPin,
  Truck,
  Scale,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface HotspotIntelligencePanelProps {
  hotspot: Hotspot | null;
  zone?: Zone | null;
  vehicles?: Vehicle[];
  onClose: () => void;
}

export const HotspotIntelligencePanel: React.FC<HotspotIntelligencePanelProps> = ({
  hotspot,
  zone,
  vehicles = [],
  onClose,
}) => {
  // Requirement 5: Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!hotspot) return null;

  const isCritical = hotspot.severity_score >= 8.0;

  // Match available vehicle
  const matchedVehicle = vehicles.find((v) => {
    if (hotspot.estimated_quantity > 500) {
      return v.vehicle_type === "compactor" && v.status === "available";
    }
    return v.status === "available";
  });

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-14 bottom-0 right-0 w-80 sm:w-96 z-40 bg-[#061514]/95 border-l border-teal-900/30 backdrop-blur-2xl shadow-[-16px_0_40px_rgba(0,0,0,0.8)] p-5 overflow-y-auto font-sans flex flex-col text-slate-200"
      >
        {/* Header: ID, Severity, Zone, Close Button */}
        <div className="flex items-center justify-between border-b border-teal-950/70 pb-3">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white font-mono">
                WH-{String(hotspot.id).padStart(3, "0")}
              </span>
              <SeverityBadge score={hotspot.severity_score} />
            </div>
            <div className="text-xs text-teal-400/90 mt-1 flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 text-teal-400 shrink-0" />
              <span className="truncate">{zone ? zone.name : "Unassigned Sector"}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0D2422] hover:text-white transition-colors shrink-0"
            title="Close Panel (Esc)"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Priority Index Metric */}
        <div className="py-4 border-b border-teal-950/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
              Priority Index
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                {hotspot.priority_score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 10.0</span>
            </div>
          </div>

          <div className="h-10 w-10 rounded-full border border-teal-500/30 bg-[#0D2422] flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.2)]">
            <span
              className={`h-3 w-3 rounded-full ${
                isCritical ? "bg-rose-500 animate-ping" : "bg-amber-400"
              }`}
            />
          </div>
        </div>

        {/* Telemetry Breakdown */}
        <div className="py-4 border-b border-teal-950/70 space-y-3 text-xs">
          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
            Telemetry Breakdown
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-teal-400" />
                Estimated Mass:
              </span>
              <span className="font-medium text-slate-100 font-mono">
                {hotspot.estimated_quantity > 0
                  ? `${hotspot.estimated_quantity} kg`
                  : "Pending sensor scan"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" />
                Status:
              </span>
              <span className="capitalize text-slate-200 font-medium">
                {hotspot.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-400" />
                Detected:
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {new Date(hotspot.first_detected_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                Coordinates:
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {formatCoordinates(hotspot.location?.coordinates)}
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Resource Dispatch */}
        <div className="py-4 space-y-2.5 text-xs flex-1">
          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block">
            Recommended Allocation
          </span>

          {matchedVehicle ? (
            <div className="p-3 rounded-xl border border-teal-900/40 bg-[#071615] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-teal-400" />
                  {matchedVehicle.registration_number}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Type: <span className="capitalize text-slate-200">{matchedVehicle.vehicle_type}</span> ({matchedVehicle.capacity_kg} kg capacity)
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-amber-900/40 bg-[#0f1715] text-amber-300/90 text-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">No dedicated truck idling</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Fleet optimization solver will schedule on next routing sweep.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-teal-950/70">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Acknowledge Telemetry</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
