import React from "react";
import { AlertCircle, RefreshCw, Database } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Telemetry Signal Disrupted",
  message = "Failed to communicate with geospatial API telemetry endpoint.",
  onRetry,
  className = "py-14",
}) => {
  const isDbOffline =
    message?.toLowerCase().includes("database offline") ||
    message?.toLowerCase().includes("database is disconnected") ||
    message?.toLowerCase().includes("connection timeout");

  const displayTitle = isDbOffline ? "Database Offline" : title;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 rounded-xl border ${
        isDbOffline
          ? "border-amber-950/70 bg-[#0d100d]"
          : "border-rose-950/60 bg-[#081514]"
      } ${className}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
          isDbOffline
            ? "bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_14px_rgba(245,158,11,0.25)]"
            : "bg-rose-950/60 text-rose-400 border-rose-800/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
        }`}
      >
        {isDbOffline ? <Database className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
      </div>
      <h3
        className={`mt-3.5 text-base font-bold font-mono tracking-wider uppercase ${
          isDbOffline ? "text-amber-300" : "text-rose-300"
        }`}
      >
        {displayTitle}
      </h3>
      <p
        className={`mt-1.5 max-w-md text-xs leading-relaxed font-mono ${
          isDbOffline ? "text-amber-400/90" : "text-rose-400/90"
        }`}
      >
        {isDbOffline
          ? "PostgreSQL + PostGIS database is currently offline or unreachable. Real-time telemetry is paused until the database container is online."
          : message}
      </p>
      {isDbOffline && (
        <div className="mt-3 max-w-md rounded-md bg-black/40 border border-amber-900/40 px-3 py-1.5 text-[11px] font-mono text-amber-500/80">
          Raw signal: {message}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-mono font-bold transition-colors shadow-xs ${
            isDbOffline
              ? "bg-amber-950/80 border-amber-800/70 text-amber-200 hover:bg-amber-900/60"
              : "bg-rose-950/80 border-rose-800/60 text-rose-200 hover:bg-rose-900/60"
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>RECONNECT DATABASE</span>
        </button>
      )}
    </div>
  );
};
