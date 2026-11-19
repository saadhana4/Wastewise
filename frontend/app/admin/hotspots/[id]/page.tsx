"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  PageHeader,
  SeverityBadge,
  StatusBadge,
  LoadingState,
  ErrorState,
} from "@/components";
import { apiClient } from "@/lib/api-client";
import { Hotspot, Zone } from "@/types";
import { formatCoordinates } from "@/lib/formatters";
import { ArrowLeft, MapPin, Calendar, Scale, AlertOctagon, Building2, Sparkles, ShieldCheck } from "lucide-react";

// Client-only dynamic map for preview
const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full flex items-center justify-center bg-[#050e0d] border border-teal-950/80 rounded-xl">
        <LoadingState message="PINPOINTING COORDINATES..." />
      </div>
    ),
  }
);

export default function HotspotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const hotspotId = Number(resolvedParams.id);

  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const [hData, zData] = await Promise.all([
          apiClient.getHotspotById(hotspotId),
          apiClient.getZones(),
        ]);
        setHotspot(hData);
        setZones(zData);
      } catch (err: any) {
        setError(err?.message || `Failed to load details for Hotspot #${hotspotId}`);
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(hotspotId)) {
      fetchDetails();
    }
  }, [hotspotId]);

  if (loading) {
    return <LoadingState message={`RETRIEVING NODE TELEMETRY #WH-${hotspotId}...`} />;
  }

  if (error || !hotspot) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/hotspots"
          className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-200 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>RETURN TO HOTSPOT REGISTRY</span>
        </Link>
        <ErrorState
          title="Hotspot Node Disconnected"
          message={error || "Hotspot telemetry record does not exist in database."}
        />
      </div>
    );
  }

  const coords = hotspot.location?.coordinates;
  const relatedZone = zones.find((z) => z.id === hotspot.zone_id);

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/admin/hotspots"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-400 hover:text-teal-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>&larr; BACK TO HOTSPOT INVENTORY</span>
        </Link>
      </div>

      <PageHeader
        title={`HOTSPOT NODE #WH-${hotspot.id.toString().padStart(3, "0")}`}
        description="Detailed geospatial inspection, severity ratings, and operational status."
        badge={<StatusBadge status={hotspot.status} />}
        actions={
          <div className="flex items-center gap-2">
            <SeverityBadge score={hotspot.severity_score} />
          </div>
        }
      />

      {/* Main Grid: Details & Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-200 border-b border-teal-950/70 pb-3">
              Geospatial &amp; Threat Attributes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <span className="text-slate-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                  Severity Rating
                </span>
                <span className="text-2xl font-bold text-rose-300">
                  {hotspot.severity_score.toFixed(1)} <span className="text-xs text-slate-500">/ 10.0</span>
                </span>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <span className="text-slate-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <Scale className="h-3.5 w-3.5 text-amber-400" />
                  Priority Score
                </span>
                <span className="text-2xl font-bold text-amber-300">
                  {hotspot.priority_score.toFixed(1)} <span className="text-xs text-slate-500">/ 10.0</span>
                </span>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <span className="text-slate-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <Scale className="h-3.5 w-3.5 text-teal-400" />
                  Estimated Waste Quantity
                </span>
                <span className="text-2xl font-bold text-teal-300">
                  {hotspot.estimated_quantity > 0 ? `${hotspot.estimated_quantity.toLocaleString()} kg` : "Not estimated"}
                </span>
              </div>

              <div className="rounded-lg border border-teal-950/70 bg-[#061110] p-3.5">
                <span className="text-slate-400 flex items-center gap-1.5 mb-1 text-[11px]">
                  <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                  Municipal Sector / Zone
                </span>
                <span className="text-sm font-bold text-slate-200 mt-1 block">
                  {relatedZone ? relatedZone.name : hotspot.zone_id ? `Sector #${hotspot.zone_id}` : "Unassigned"}
                </span>
              </div>
            </div>

            {/* Spatial & Temporal Attributes */}
            <div className="border-t border-teal-950/70 pt-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  Geographic Coordinates (WGS84 EPSG:4326)
                </span>
                <span className="font-bold text-teal-300">
                  {formatCoordinates(coords)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  First Detected At
                </span>
                <span className="text-slate-300">
                  {new Date(hotspot.first_detected_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  Last Updated
                </span>
                <span className="text-slate-300">
                  {new Date(hotspot.updated_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* AI Analysis State (Honest) */}
            <div className="p-3.5 rounded-lg bg-[#061110] border border-teal-950/80 space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                  AI Analysis Status
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed font-sans">
                AI analysis module not active yet. Computer vision and material classification models will activate in Phase 3.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Location Map Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-950/80 bg-[#081514] p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-teal-400" />
              Pinpoint Spatial Lock
            </h3>
            <MapView
              hotspots={[hotspot]}
              zones={zones}
              selectedHotspotId={hotspot.id}
              className="h-[340px] w-full rounded-lg overflow-hidden border border-teal-950/80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
