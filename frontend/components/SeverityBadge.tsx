import React from "react";

interface SeverityBadgeProps {
  score: number;
  className?: string;
  showScore?: boolean;
}

export const getSeverityLevel = (score: number): { label: "Critical" | "High" | "Medium" | "Low"; color: string } => {
  if (score >= 8.0) return { label: "Critical", color: "text-rose-300 bg-rose-950/40 border-rose-800/60 shadow-[0_0_10px_rgba(244,63,94,0.18)]" };
  if (score >= 6.0) return { label: "High", color: "text-amber-300 bg-amber-950/40 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]" };
  if (score >= 4.0) return { label: "Medium", color: "text-yellow-300 bg-yellow-950/30 border-yellow-800/50" };
  return { label: "Low", color: "text-teal-300 bg-teal-950/40 border-teal-800/50" };
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ score, className = "", showScore = true }) => {
  const { label, color } = getSeverityLevel(score);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase font-mono ${color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      <span>{label}</span>
      {showScore && <span className="opacity-75 font-mono text-[10px]">({score.toFixed(1)})</span>}
    </span>
  );
};
