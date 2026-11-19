import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No intelligence records detected",
  description = "No telemetry or geospatial records currently match this filter.",
  icon,
  action,
  className = "py-14",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 rounded-xl border border-teal-950/60 bg-[#081514] ${className}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/50">
        {icon || <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="mt-3.5 text-sm font-bold font-mono tracking-wider uppercase text-slate-200">{title}</h3>
      <p className="mt-1 max-w-sm text-xs font-mono text-slate-400 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
