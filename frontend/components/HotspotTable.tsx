import React from "react";
import Link from "next/link";
import { Hotspot } from "@/types";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { ExternalLink, MapPin } from "lucide-react";
import { formatCoordinates } from "@/lib/formatters";

interface HotspotTableProps {
  hotspots: Hotspot[];
  onSelect?: (hotspot: Hotspot) => void;
  showViewAll?: boolean;
}

export const HotspotTable: React.FC<HotspotTableProps> = ({
  hotspots,
  onSelect,
}) => {
  if (hotspots.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 font-sans bg-[#071615]/60 border border-teal-900/30 rounded-xl">
        No hotspot detections logged in database
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-teal-900/30 bg-[#071615]/70 backdrop-blur-md">
      <table className="w-full text-left text-xs font-sans">
        <thead className="border-b border-teal-950/80 bg-[#051110]/90 text-[11px] font-medium text-slate-400">
          <tr>
            <th className="py-3 px-4">Hotspot ID</th>
            <th className="py-3 px-4">Spatial Coordinates</th>
            <th className="py-3 px-4">Severity Tier</th>
            <th className="py-3 px-4">Priority Index</th>
            <th className="py-3 px-4">Est. Mass</th>
            <th className="py-3 px-4">Dispatch Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-950/40 text-slate-300">
          {hotspots.map((hotspot) => {
            const locationStr = formatCoordinates(hotspot.location?.coordinates);

            return (
              <tr
                key={hotspot.id}
                onClick={() => onSelect?.(hotspot)}
                className="transition-colors hover:bg-teal-950/30 cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-mono font-medium text-teal-300">
                  WH-{String(hotspot.id).padStart(3, "0")}
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-teal-500/70 shrink-0" />
                    <span>{locationStr}</span>
                    {hotspot.zone_id && (
                      <span className="text-[10px] text-teal-400/90 bg-teal-950/60 border border-teal-900/40 px-1.5 py-0.5 rounded font-mono ml-1">
                        Z-{hotspot.zone_id}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <SeverityBadge score={hotspot.severity_score} />
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                  {hotspot.priority_score.toFixed(1)}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  {hotspot.estimated_quantity > 0
                    ? `${hotspot.estimated_quantity} kg`
                    : "Pending"}
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={hotspot.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/admin/hotspots/${hotspot.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-teal-400 hover:text-teal-200 transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
