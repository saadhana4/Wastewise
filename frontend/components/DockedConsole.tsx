"use client";

import React, { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

interface DockedConsoleProps {
  totalHotspots: number;
  criticalCount: number;
  highPriorityCount: number;
  activeVehicles: number;
  pendingCount: number;
  isShifted?: boolean;
}

export const DockedConsole: React.FC<DockedConsoleProps> = ({
  totalHotspots,
  criticalCount,
  highPriorityCount,
  activeVehicles,
  pendingCount,
  isShifted = false,
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const sampleQuestions = [
    "Critical hotspots",
    "Active fleet",
    "Collection priority",
  ];

  const handleSend = (text?: string) => {
    const q = text || query;
    if (!q) return;
    setAiNotice(
      "AI intelligence module coming in Phase 3. Real-time geospatial inference will activate with deep learning models."
    );
    setTimeout(() => setAiNotice(null), 4000);
  };

  return (
    <div
      className={`fixed bottom-6 z-30 w-full max-w-sm sm:max-w-md select-none transition-all duration-300 pointer-events-auto ${
        isShifted ? "right-4 sm:right-[416px]" : "right-4 sm:right-6"
      }`}
    >
      <div className="rounded-2xl border border-teal-900/30 bg-[#071615]/85 backdrop-blur-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] space-y-2">
        {/* KPI Strip Row (Reference look) */}
        <div className="flex items-center justify-between px-1.5 py-0.5 text-[11px] font-sans text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Hotspots:</span>
            <span className="font-semibold font-mono text-white">{totalHotspots}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Critical:</span>
            <span className="font-semibold font-mono text-rose-300">{criticalCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-slate-400">High:</span>
            <span className="font-semibold font-mono text-amber-300">{highPriorityCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Fleet:</span>
            <span className="font-semibold font-mono text-teal-300">{activeVehicles}</span>
          </div>
        </div>

        {/* Input Bar Pill */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask WasteWise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full rounded-xl border border-teal-900/40 bg-[#051110] py-2 pl-3.5 pr-10 text-xs font-sans text-slate-200 placeholder-slate-500 focus:border-teal-500/50 focus:outline-none transition-all"
          />

          <button
            onClick={() => handleSend()}
            className="absolute right-1.5 p-1.5 rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors"
            title="Submit query"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Suggested Prompts - Shown on focus or small discreet row */}
        {isFocused && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pt-0.5 text-slate-400 font-sans animate-in fade-in duration-150">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">Quick:</span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="px-2 py-0.5 rounded-md bg-teal-950/60 hover:bg-teal-900/60 text-teal-300/80 border border-teal-800/30 whitespace-nowrap transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        )}

        {/* AI Notice Toast */}
        {aiNotice && (
          <div className="p-2 rounded-xl border border-teal-800/40 bg-teal-950/40 text-[11px] font-sans text-teal-200 flex items-start justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span>{aiNotice}</span>
            </div>
            <button
              onClick={() => setAiNotice(null)}
              className="text-teal-400 hover:text-teal-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
