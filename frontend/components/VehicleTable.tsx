import React from "react";
import { Vehicle } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Truck, MapPin } from "lucide-react";
import { formatCoordinates } from "@/lib/formatters";

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export const VehicleTable: React.FC<VehicleTableProps> = ({ vehicles }) => {
  if (vehicles.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-mono bg-[#081514] border border-teal-950/60 rounded-xl">
        NO FLEET UNITS REGISTERED IN DATABASE
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-teal-950/70 bg-[#081514]">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-teal-950/90 bg-[#061110] text-[10px] font-mono uppercase tracking-widest text-teal-400/80">
          <tr>
            <th className="py-3 px-4">Unit ID</th>
            <th className="py-3 px-4">Registration</th>
            <th className="py-3 px-4">Vehicle Class</th>
            <th className="py-3 px-4">Payload Rating</th>
            <th className="py-3 px-4">Operational Status</th>
            <th className="py-3 px-4">GPS Telemetry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-teal-950/50 bg-[#081514] text-slate-300">
          {vehicles.map((v) => {
            const locationStr = formatCoordinates(v.current_location?.coordinates);

            return (
              <tr key={v.id} className="transition-colors hover:bg-teal-950/30">
                <td className="py-3.5 px-4 font-mono font-bold text-teal-300">
                  #{v.id}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-950/80 text-teal-300 border border-teal-800/40">
                      <Truck className="h-3.5 w-3.5" />
                    </div>
                    <span>{v.registration_number}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 capitalize text-slate-300 font-mono">
                  {v.vehicle_type.replace(/_/g, " ")}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                  {v.capacity_kg.toLocaleString()} kg
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={v.status} />
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-teal-500/70" />
                    <span>{locationStr}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
