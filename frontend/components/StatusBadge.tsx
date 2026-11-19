import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalized = (status || "").toLowerCase().trim();

  let styles = "bg-teal-950/40 text-slate-400 border-teal-900/60";

  if (["available", "active", "cleared", "connected", "ok", "operational"].includes(normalized)) {
    styles = "bg-emerald-950/40 text-emerald-300 border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
  } else if (["detected", "warning", "assigned", "scheduled", "checking", "pending"].includes(normalized)) {
    styles = "bg-amber-950/40 text-amber-300 border-amber-800/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
  } else if (["critical", "danger", "unavailable", "disconnected", "error", "offline"].includes(normalized)) {
    styles = "bg-rose-950/40 text-rose-300 border-rose-800/60 shadow-[0_0_8px_rgba(244,63,94,0.18)]";
  } else if (["on_route", "in_service", "verified", "processing"].includes(normalized)) {
    styles = "bg-cyan-950/40 text-cyan-300 border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.15)]";
  } else if (["maintenance"].includes(normalized)) {
    styles = "bg-purple-950/40 text-purple-300 border-purple-800/60 shadow-[0_0_8px_rgba(168,85,247,0.15)]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest font-mono ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90 shadow-[0_0_5px_currentColor]" />
      {status ? status.replace(/_/g, " ") : "Unknown"}
    </span>
  );
};
