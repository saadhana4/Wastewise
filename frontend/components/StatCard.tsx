import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  badge,
  trend,
}) => {
  return (
    <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm transition-all hover:border-teal-800/60">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
          {title}
        </span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-950/80 text-teal-300 border border-teal-800/40">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            {unit}
          </span>
        )}
        {badge}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          {trend && (
            <span className="inline-flex items-center font-bold text-teal-300 bg-teal-950/80 border border-teal-800/50 px-1.5 py-0.5 rounded text-[10px]">
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
