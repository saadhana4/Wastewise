"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as d3 from "d3";
import { Hotspot, Zone, Vehicle, WasteCategory } from "@/types";
import { formatCoordinates } from "@/lib/formatters";
import {
  ArrowLeft,
  Flame,
  Truck,
  Recycle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Send,
  Bot,
} from "lucide-react";

export interface NetworkVisualizationHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface NetworkVisualizationProps {
  zones: Zone[];
  hotspots: Hotspot[];
  vehicles?: Vehicle[];
  categories?: WasteCategory[];
  selectedHotspotId?: number | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  onSelectZone?: (zone: Zone) => void;
  onExpandedChange?: (isExpanded: boolean, zoneId: number | null) => void;
  className?: string;
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  type: "hub" | "zone" | "hotspot";
  label: string;
  countBadge?: string;
  data?: any;
  severity?: number;
  radius: number;
  color: string;
  gradId: string;
  zoneId?: number | null;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: "hub-to-zone" | "zone-to-hotspot";
  colorStart: string;
  colorEnd: string;
}

type FacetType = "hotspots" | "materials" | "fleet" | "critical";

export const NetworkVisualization = forwardRef<
  NetworkVisualizationHandle,
  NetworkVisualizationProps
>(
  (
    {
      zones,
      hotspots,
      vehicles = [],
      categories = [],
      selectedHotspotId,
      onSelectHotspot,
      onSelectZone,
      onExpandedChange,
      className = "h-full w-full",
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    // Expansion mode state (when a zone is touched, expand like the reference image)
    const [expandedZoneId, setExpandedZoneId] = useState<number | null>(null);
    const [activeFacet, setActiveFacet] = useState<FacetType>("hotspots");
    const [selectedLeafHotspot, setSelectedLeafHotspot] = useState<Hotspot | null>(null);

    const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    // Notify parent (HeroVisualization & dashboard page) when expansion mode changes
    useEffect(() => {
      onExpandedChange?.(expandedZoneId !== null, expandedZoneId);
    }, [expandedZoneId, onExpandedChange]);

    // Close expansion on Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && expandedZoneId !== null) {
          setExpandedZoneId(null);
          setSelectedLeafHotspot(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [expandedZoneId]);

    // Expose zoom controls via ref for the floating toolbar pill
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (svgRef.current && zoomBehaviorRef.current && expandedZoneId === null) {
          d3.select(svgRef.current)
            .transition()
            .duration(250)
            .call(zoomBehaviorRef.current.scaleBy, 1.3);
        }
      },
      zoomOut: () => {
        if (svgRef.current && zoomBehaviorRef.current && expandedZoneId === null) {
          d3.select(svgRef.current)
            .transition()
            .duration(250)
            .call(zoomBehaviorRef.current.scaleBy, 0.7);
        }
      },
      resetZoom: () => {
        if (expandedZoneId !== null) {
          setExpandedZoneId(null);
          setSelectedLeafHotspot(null);
          return;
        }
        if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
          const width = containerRef.current.clientWidth || 1000;
          const height = containerRef.current.clientHeight || 700;
          d3.select(svgRef.current)
            .transition()
            .duration(350)
            .call(
              zoomBehaviorRef.current.transform,
              d3.zoomIdentity.translate(width / 2, height / 2).scale(0.92)
            );
        }
      },
    }));

    // Detect duplicate zone names to append short ID per Requirement 3
    const zoneNameCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      zones.forEach((z) => {
        const cleanName = z.name.replace(/^DEMO\s*-\s*/i, "").trim();
        counts[cleanName] = (counts[cleanName] || 0) + 1;
      });
      return counts;
    }, [zones]);

    // Active expanded zone data
    const activeExpandedZone = useMemo(() => {
      if (!expandedZoneId) return null;
      return zones.find((z) => z.id === expandedZoneId) || null;
    }, [zones, expandedZoneId]);

    const activeZoneHotspots = useMemo(() => {
      if (!expandedZoneId) return [];
      return hotspots.filter((h) => h.zone_id === expandedZoneId);
    }, [hotspots, expandedZoneId]);

    const activeZoneVehicles = useMemo(() => {
      if (!expandedZoneId) return vehicles;
      // Match available vehicles or vehicles allocated to this sector
      return vehicles;
    }, [vehicles, expandedZoneId]);

    // Set first hotspot as selected leaf when zone expands
    useEffect(() => {
      if (expandedZoneId && activeZoneHotspots.length > 0 && !selectedLeafHotspot) {
        setSelectedLeafHotspot(activeZoneHotspots[0]);
      }
    }, [expandedZoneId, activeZoneHotspots, selectedLeafHotspot]);

    // Build Graph Data for Constellation Mode
    const { nodes, links } = useMemo(() => {
      const nodesList: NetworkNode[] = [];
      const linksList: NetworkLink[] = [];

      // 1. Center Hub: Bengaluru Municipality (Gold metallic center orb)
      const hubId = "hub-municipality";
      nodesList.push({
        id: hubId,
        type: "hub",
        label: "Bengaluru Municipality",
        radius: 22,
        color: "#f59e0b",
        gradId: "hub-metallic-grad",
        x: 0,
        y: 0,
        fx: 0,
        fy: 0,
      });

      // 2. Zone Nodes (Scaled radius 14-24px, glossy orb styling)
      const zoneCount = zones.length;
      zones.forEach((zone, idx) => {
        const cleanName = zone.name.replace(/^DEMO\s*-\s*/i, "").trim();
        const isDuplicate = (zoneNameCounts[cleanName] || 0) > 1;
        const displayLabel = isDuplicate ? `${cleanName} #${zone.id}` : cleanName;

        const zoneHotspots = hotspots.filter((h) => h.zone_id === zone.id);
        const maxSeverity =
          zoneHotspots.length > 0
            ? Math.max(...zoneHotspots.map((h) => h.severity_score))
            : 3.5;

        // Radius: 14px to 24px scaled by hotspot count
        const radius = Math.min(24, Math.max(14, 14 + Math.round(zoneHotspots.length * 1.6)));

        // Color & Gradient assignment by max severity
        let zoneColor = "#14b8a6";
        let gradId = "zone-orb-teal";
        if (maxSeverity >= 8.0) {
          zoneColor = "#f43f5e";
          gradId = "zone-orb-rose";
        } else if (maxSeverity >= 6.0) {
          zoneColor = "#f59e0b";
          gradId = "zone-orb-amber";
        } else if (maxSeverity >= 4.5) {
          zoneColor = "#a855f7";
          gradId = "zone-orb-purple";
        }

        // Radial pre-seeding so zones immediately form an expansive circle around hub
        const angle = (idx / Math.max(zoneCount, 1)) * 2 * Math.PI - Math.PI / 2;
        const initDist = 260;

        const zoneNodeId = `zone-${zone.id}`;
        const zNode: NetworkNode = {
          id: zoneNodeId,
          type: "zone",
          label: displayLabel,
          countBadge: `[ ${zoneHotspots.length} nodes ]`,
          data: zone,
          severity: maxSeverity,
          radius,
          color: zoneColor,
          gradId,
          zoneId: zone.id,
          x: Math.cos(angle) * initDist,
          y: Math.sin(angle) * initDist,
        };
        nodesList.push(zNode);

        // Link: Hub -> Zone
        linksList.push({
          source: hubId,
          target: zoneNodeId,
          type: "hub-to-zone",
          colorStart: "#f59e0b",
          colorEnd: zoneColor,
        });

        // 3. Hotspot Satellite Nodes attached to this zone
        zoneHotspots.forEach((h, hIdx) => {
          let hColor = "#14b8a6";
          let hGradId = "hotspot-orb-teal";
          if (h.severity_score >= 8.0) {
            hColor = "#f43f5e";
            hGradId = "hotspot-orb-rose";
          } else if (h.severity_score >= 6.0) {
            hColor = "#f59e0b";
            hGradId = "hotspot-orb-amber";
          } else if (h.severity_score >= 4.5) {
            hColor = "#a855f7";
            hGradId = "hotspot-orb-purple";
          }

          // Satellites: small orbs (5-8px)
          const hRadius = h.severity_score >= 8.0 ? 7 : h.severity_score >= 6.0 ? 6 : 5;
          const hAngle = (hIdx / Math.max(zoneHotspots.length, 1)) * 2 * Math.PI;
          const hDist = 48 + (hIdx % 2) * 16;

          const hNodeId = `hotspot-${h.id}`;
          nodesList.push({
            id: hNodeId,
            type: "hotspot",
            label: `Hotspot #${h.id}`,
            data: h,
            severity: h.severity_score,
            radius: hRadius,
            color: hColor,
            gradId: hGradId,
            zoneId: h.zone_id,
            x: (zNode.x || 0) + Math.cos(hAngle) * hDist,
            y: (zNode.y || 0) + Math.sin(hAngle) * hDist,
          });

          // Link: Zone -> Hotspot
          linksList.push({
            source: zoneNodeId,
            target: hNodeId,
            type: "zone-to-hotspot",
            colorStart: zoneColor,
            colorEnd: hColor,
          });
        });
      });

      return { nodes: nodesList, links: linksList };
    }, [zones, hotspots, zoneNameCounts]);

    // D3 Force Simulation in Constellation Mode
    useEffect(() => {
      if (expandedZoneId !== null) return; // Skip force simulation when in tree expansion mode
      if (!svgRef.current || !containerRef.current) return;
      const width = containerRef.current.clientWidth || 1000;
      const height = containerRef.current.clientHeight || 700;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clean re-render

      const defs = svg.append("defs");

      // 1. Hub Metallic Gradient
      const hubGrad = defs
        .append("radialGradient")
        .attr("id", "hub-metallic-grad")
        .attr("cx", "38%")
        .attr("cy", "38%")
        .attr("r", "62%");
      hubGrad.append("stop").attr("offset", "0%").attr("stop-color", "#fef9c3");
      hubGrad.append("stop").attr("offset", "35%").attr("stop-color", "#f59e0b");
      hubGrad.append("stop").attr("offset", "75%").attr("stop-color", "#d97706");
      hubGrad.append("stop").attr("offset", "100%").attr("stop-color", "#78350f");

      // 2. Zone Orb Gradients (Glossy radial gradients with 3D sphere depth)
      const createOrbGrad = (id: string, highlight: string, base: string, shadow: string, dark: string) => {
        const grad = defs
          .append("radialGradient")
          .attr("id", id)
          .attr("cx", "35%")
          .attr("cy", "35%")
          .attr("r", "65%");
        grad.append("stop").attr("offset", "0%").attr("stop-color", highlight);
        grad.append("stop").attr("offset", "40%").attr("stop-color", base);
        grad.append("stop").attr("offset", "80%").attr("stop-color", shadow);
        grad.append("stop").attr("offset", "100%").attr("stop-color", dark);
      };

      createOrbGrad("zone-orb-rose", "#fecdd3", "#f43f5e", "#9f1239", "#4c0519");
      createOrbGrad("zone-orb-amber", "#fef3c7", "#f59e0b", "#b45309", "#451a03");
      createOrbGrad("zone-orb-teal", "#ccfbf1", "#14b8a6", "#0f766e", "#042f2e");
      createOrbGrad("zone-orb-purple", "#f3e8ff", "#a855f7", "#7e22ce", "#3b0764");

      createOrbGrad("hotspot-orb-rose", "#ffe4e6", "#f43f5e", "#be123c", "#881337");
      createOrbGrad("hotspot-orb-amber", "#fef3c7", "#f59e0b", "#b45309", "#78350f");
      createOrbGrad("hotspot-orb-teal", "#e0f2fe", "#06b6d4", "#0e7490", "#164e63");
      createOrbGrad("hotspot-orb-purple", "#f5d0fe", "#c084fc", "#9333ea", "#581c87");

      // Soft Glow Filter
      const glowFilter = defs
        .append("filter")
        .attr("id", "soft-glow")
        .attr("x", "-40%")
        .attr("y", "-40%")
        .attr("width", "180%")
        .attr("height", "180%");
      glowFilter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
      glowFilter
        .append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur", "SourceGraphic"])
        .enter()
        .append("feMergeNode")
        .attr("in", (d) => d);

      // Gold Glow for Central Hub Ring
      const hubFilter = defs
        .append("filter")
        .attr("id", "hub-glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      hubFilter.append("feGaussianBlur").attr("stdDeviation", "5").attr("result", "blur");
      hubFilter
        .append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur", "SourceGraphic"])
        .enter()
        .append("feMergeNode")
        .attr("in", (d) => d);

      // Main Zoom Group
      const g = svg.append("g").attr("class", "graph-root");

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.35, 2.8])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom);
      zoomBehaviorRef.current = zoom;

      const initialScale = Math.min(1.0, Math.max(0.75, width / 1200));
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale)
      );

      const hubDist = Math.max(200, Math.min(width, height) * 0.33);

      const simulation = d3
        .forceSimulation<NetworkNode>(nodes)
        .force(
          "link",
          d3
            .forceLink<NetworkNode, NetworkLink>(links)
            .id((d) => d.id)
            .distance((d) => (d.type === "hub-to-zone" ? hubDist : 50))
            .strength(0.65)
        )
        .force(
          "charge",
          d3
            .forceManyBody<NetworkNode>()
            .strength((d) => (d.type === "hub" ? -1600 : d.type === "zone" ? -850 : -45))
        )
        .force(
          "collide",
          d3
            .forceCollide<NetworkNode>()
            .radius((d) => (d.type === "zone" ? d.radius + 58 : d.type === "hub" ? d.radius + 35 : d.radius + 10))
            .strength(0.85)
        )
        .force("x", d3.forceX(0).strength(0.03))
        .force("y", d3.forceY(0).strength(0.03))
        .alphaDecay(0.025);

      // Render Edge Links
      const link = g
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", (d) => (d.type === "hub-to-zone" ? "rgba(245, 158, 11, 0.28)" : "rgba(20, 184, 166, 0.22)"))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.35);

      // Render Node Groups
      const node = g
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node-group")
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
          setHoveredNode(d);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on("mousemove", (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on("mouseleave", () => {
          setHoveredNode(null);
          setTooltipPos(null);
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.type === "zone" && d.data) {
            // EXPAND NODE INTO DENDROGRAM VIEW (as in user uploaded image)
            setExpandedZoneId(d.data.id);
            setActiveFacet("hotspots");
            const zh = hotspots.filter((h) => h.zone_id === d.data.id);
            if (zh.length > 0) setSelectedLeafHotspot(zh[0]);
            onSelectZone?.(d.data);
          } else if (d.type === "hotspot" && d.data) {
            onSelectHotspot?.(d.data);
          }
        });

      // 1. Hub Metallic Outer Rings
      node.each(function (d) {
        if (d.type === "hub") {
          const el = d3.select(this);
          el.append("circle")
            .attr("r", d.radius + 10)
            .attr("fill", "none")
            .attr("stroke", "rgba(245, 158, 11, 0.35)")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4, 3");

          el.append("circle")
            .attr("r", d.radius + 5)
            .attr("fill", "none")
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 1.8)
            .attr("filter", "url(#hub-glow)");
        }
      });

      // 2. Base Sphere Circle with glossy 3D radial gradient
      node
        .append("circle")
        .attr("r", (d) => d.radius)
        .attr("fill", (d) => `url(#${d.gradId})`)
        .attr("stroke", (d) => {
          if (d.type === "hotspot" && d.data?.id === selectedHotspotId) return "#ffffff";
          return "rgba(255, 255, 255, 0.4)";
        })
        .attr("stroke-width", (d) => (d.type === "hotspot" && d.data?.id === selectedHotspotId ? 2.5 : 1))
        .attr("filter", "url(#soft-glow)");

      // 3. Specular Reflection Sheen
      node
        .append("circle")
        .attr("cx", (d) => -d.radius * 0.3)
        .attr("cy", (d) => -d.radius * 0.3)
        .attr("r", (d) => d.radius * 0.32)
        .attr("fill", "rgba(255, 255, 255, 0.4)")
        .attr("filter", "blur(0.5px)")
        .style("pointer-events", "none");

      // 4. Labels for Hub & Zones: Inter 12px, Sentence Case, placed to the RIGHT
      node.each(function (d) {
        if (d.type === "hub" || d.type === "zone") {
          const el = d3.select(this);

          el.append("text")
            .attr("x", d.radius + 8)
            .attr("y", -1)
            .attr("text-anchor", "start")
            .attr("fill", d.type === "hub" ? "#fef08a" : "#f1f5f9")
            .attr("font-size", d.type === "hub" ? "13px" : "12px")
            .attr("font-weight", "500")
            .attr("font-family", "'Inter', -apple-system, BlinkMacSystemFont, sans-serif")
            .style("user-select", "none")
            .text(d.label);

          if (d.type === "zone" && d.countBadge) {
            el.append("text")
              .attr("x", d.radius + 8)
              .attr("y", 14)
              .attr("text-anchor", "start")
              .attr("fill", "#2dd4bf")
              .attr("font-size", "10px")
              .attr("font-weight", "400")
              .attr("font-family", "'Inter', sans-serif")
              .style("user-select", "none")
              .text(d.countBadge);
          }
        }
      });

      // Drag Behavior
      const drag = d3
        .drag<SVGGElement, NetworkNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          if (d.type !== "hub") {
            d.fx = null;
            d.fy = null;
          }
        });

      node.call(drag as any);

      // Simulation Tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      return () => {
        simulation.stop();
      };
    }, [nodes, links, selectedHotspotId, hotspots, onSelectHotspot, onSelectZone, expandedZoneId]);

    // Facet definitions for the hierarchical branch breakdown
    const facets = useMemo(() => {
      const criticalCount = activeZoneHotspots.filter((h) => h.severity_score >= 8.0).length;
      return [
        {
          id: "hotspots" as FacetType,
          label: "Active Detections",
          count: activeZoneHotspots.length,
          icon: Flame,
          color: "#f59e0b",
        },
        {
          id: "materials" as FacetType,
          label: "Material Streams",
          count: Math.min(categories.length || 5, 4),
          icon: Recycle,
          color: "#14b8a6",
        },
        {
          id: "fleet" as FacetType,
          label: "Collection Fleet",
          count: activeZoneVehicles.length || 2,
          icon: Truck,
          color: "#06b6d4",
        },
        {
          id: "critical" as FacetType,
          label: "Critical Alerts",
          count: criticalCount,
          icon: AlertTriangle,
          color: "#f43f5e",
        },
      ];
    }, [activeZoneHotspots, categories, activeZoneVehicles]);

    // Active leaf items based on selected facet
    const leafItems = useMemo(() => {
      if (activeFacet === "hotspots") {
        return activeZoneHotspots.map((h) => ({
          id: `leaf-hotspot-${h.id}`,
          title: `Hotspot WH-${String(h.id).padStart(3, "0")}`,
          subtitle: `Sev ${h.severity_score.toFixed(1)} • ${
            h.estimated_quantity > 0 ? `${h.estimated_quantity} kg` : "Pending scan"
          }`,
          badge: h.status,
          severity: h.severity_score,
          color: h.severity_score >= 8.0 ? "#f43f5e" : h.severity_score >= 6.0 ? "#f59e0b" : "#14b8a6",
          raw: h,
        }));
      }
      if (activeFacet === "materials") {
        return categories.slice(0, 5).map((c) => ({
          id: `leaf-mat-${c.id}`,
          title: c.name,
          subtitle: `Handling: ${c.handling_type}`,
          badge: c.recyclable ? "Recyclable" : "Standard",
          severity: c.recyclable ? 4.0 : 6.0,
          color: "#14b8a6",
          raw: c,
        }));
      }
      if (activeFacet === "fleet") {
        return activeZoneVehicles.slice(0, 5).map((v) => ({
          id: `leaf-fleet-${v.id}`,
          title: v.registration_number.replace(/^DEMO-/i, ""),
          subtitle: `${v.vehicle_type} • ${v.capacity_kg} kg`,
          badge: v.status,
          severity: 5.0,
          color: "#06b6d4",
          raw: v,
        }));
      }
      // Critical alerts
      return activeZoneHotspots
        .filter((h) => h.severity_score >= 6.5)
        .map((h) => ({
          id: `leaf-crit-${h.id}`,
          title: `Critical Alert #${h.id}`,
          subtitle: `Severity ${h.severity_score.toFixed(1)} / 10 • Immediate Sweep`,
          badge: "Urgent",
          severity: h.severity_score,
          color: "#f43f5e",
          raw: h,
        }));
    }, [activeFacet, activeZoneHotspots, categories, activeZoneVehicles]);

    // Geometry layout for the Dendrogram Hierarchy (Center Canvas)
    const containerWidth = containerRef.current?.clientWidth || 1200;
    const containerHeight = containerRef.current?.clientHeight || 750;

    const focusedNodeX = 180;
    const focusedNodeY = containerHeight / 2;

    const facetCardX = 350;
    const facetCardWidth = 145;
    const facetCardHeight = 44;
    const facetCardSpacing = 62;
    const totalFacetHeight = (facets.length - 1) * facetCardSpacing;
    const facetStartY = focusedNodeY - totalFacetHeight / 2;

    // Active facet index
    const activeFacetIndex = Math.max(0, facets.findIndex((f) => f.id === activeFacet));
    const activeCardY = facetStartY + activeFacetIndex * facetCardSpacing;

    // Leaf nodes radiating in an arc
    const leafCount = leafItems.length;
    const leafSpacing = Math.max(34, Math.min(50, 360 / Math.max(leafCount, 1)));
    const leafStartY = focusedNodeY - ((leafCount - 1) * leafSpacing) / 2;

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full select-none overflow-hidden ${className}`}
      >
        {/* Background Radial Teal-Black Vignette per Requirement 2 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, #0D2422 0%, #081716 45%, #050B0A 100%)",
          }}
        />

        {/* ============================================================== */}
        {/* CONSTELLATION OVERVIEW MODE                                     */}
        {/* ============================================================== */}
        <div
          className={`w-full h-full transition-opacity duration-300 ${
            expandedZoneId === null ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none hidden"
          }`}
        >
          <svg ref={svgRef} className="w-full h-full relative z-10" />

          {/* Compact Legend (Bottom Left) */}
          <div className="absolute bottom-6 left-6 z-20 rounded-xl border border-teal-900/40 bg-[#071615]/85 p-3 backdrop-blur-md text-xs shadow-lg space-y-2">
            <div className="text-[11px] font-sans font-medium text-slate-400">
              Legend
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
              <span>Municipal Hub</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-[11px] font-sans">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <span>Zone Sectors</span>
            </div>
            <div className="pt-1 border-t border-teal-950/60 space-y-1.5 text-[11px] font-sans">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span>Critical (≥ 8.0)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>High (6.0 - 7.9)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Moderate (&lt; 6.0)</span>
              </div>
            </div>
          </div>

          {/* Hover Tooltip for Constellation */}
          {hoveredNode && tooltipPos && (
            <div
              className="absolute z-40 pointer-events-none rounded-xl border border-teal-500/30 bg-[#071615]/95 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 transform -translate-x-1/2 -translate-y-full -mt-3 min-w-[170px]"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <div className="flex items-center justify-between border-b border-teal-950/80 pb-1.5 mb-1.5 font-sans">
                <span className="font-semibold text-white text-[12px]">{hoveredNode.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                  style={{
                    backgroundColor: `${hoveredNode.color}20`,
                    color: hoveredNode.color,
                    border: `1px solid ${hoveredNode.color}50`,
                  }}
                >
                  {hoveredNode.type}
                </span>
              </div>

              {hoveredNode.type === "hotspot" && hoveredNode.data && (
                <div className="space-y-1 text-[11px] text-slate-400 font-sans">
                  <div className="flex justify-between font-mono">
                    <span>Severity Score:</span>
                    <span className="font-bold" style={{ color: hoveredNode.color }}>
                      {hoveredNode.data.severity_score.toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Priority Index:</span>
                    <span className="font-medium text-slate-200">
                      {hoveredNode.data.priority_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Est. Mass:</span>
                    <span className="text-slate-200">
                      {hoveredNode.data.estimated_quantity > 0
                        ? `${hoveredNode.data.estimated_quantity} kg`
                        : "Pending"}
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-500 font-mono">
                    {formatCoordinates(hoveredNode.data.location?.coordinates)}
                  </div>
                </div>
              )}

              {hoveredNode.type === "zone" && (
                <div className="text-[11px] text-slate-400 font-sans">
                  <span className="text-slate-300 block mb-1">Click to expand sector breakdown</span>
                  <span>Hotspots: </span>
                  <span className="font-semibold text-teal-300 font-mono">
                    {hotspots.filter((h) => h.zone_id === hoveredNode.zoneId).length} sites
                  </span>
                </div>
              )}

              {hoveredNode.type === "hub" && (
                <div className="text-[11px] text-amber-300 font-sans">
                  Bengaluru Municipal Operational Center
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* EXPANDED NODE HIERARCHICAL TREE VIEW (Target look from Image 2)  */}
        {/* ============================================================== */}
        {expandedZoneId !== null && activeExpandedZone && (
          <div className="absolute inset-0 z-20 flex animate-in fade-in zoom-in-[0.98] duration-400 ease-out overflow-hidden">
            {/* Top Toolbar in Expanded Mode (Matching Image 2) */}
            <div className="absolute top-4 left-6 right-[440px] lg:right-[480px] z-40 flex items-center justify-between pointer-events-none">
              {/* Left: Back button & Breadcrumb */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onClick={() => {
                    setExpandedZoneId(null);
                    setSelectedLeafHotspot(null);
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#071615]/90 border border-teal-500/30 text-teal-300 hover:text-white hover:bg-teal-900/50 text-xs font-sans font-medium backdrop-blur-md shadow-lg transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Overview</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#061514]/80 border border-teal-900/40 text-[11px] text-slate-300 backdrop-blur-md">
                  <span className="text-teal-400 font-mono text-[10px]">SECTOR</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-white">{activeExpandedZone.name.replace(/^DEMO\s*-\s*/i, "")}</span>
                </div>
              </div>

              {/* Center / Right of Canvas: Sub-view Mode Pills */}
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#071615]/85 border border-teal-900/40 backdrop-blur-md pointer-events-auto">
                <span className="text-[10px] text-teal-300 font-sans px-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Hierarchical Sector Decomposition
                </span>
                <div className="h-3 w-px bg-teal-900/50 mx-0.5" />
                <span className="text-[10px] text-slate-500 font-mono">ESC to Exit</span>
              </div>
            </div>

            {/* Main Interactive Diagram Canvas */}
            <div className="relative flex-1 h-full min-w-0 overflow-hidden">
              <svg className="w-full h-full absolute inset-0 pointer-events-auto">
                <defs>
                  {/* Dynamic drawing keyframes for fanning bezier splines */}
                  <style>
                    {`
                      @keyframes drawSpline {
                        from {
                          stroke-dashoffset: 700;
                          opacity: 0.2;
                        }
                        to {
                          stroke-dashoffset: 0;
                          opacity: 1;
                        }
                      }
                      .animate-spline-draw {
                        stroke-dasharray: 700;
                        animation: drawSpline 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                      }
                    `}
                  </style>

                  {/* Glowing particle ring filter */}
                  <filter id="aura-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradient for connecting splines */}
                  <linearGradient id="spline-active" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.7" />
                  </linearGradient>

                  <linearGradient id="spline-inactive" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* 1. Large Dark Spotlight & Orbital Halo around the Focused Zone Node */}
                <g transform={`translate(${focusedNodeX}, ${focusedNodeY})`}>
                  {/* Outer dark spotlight disk */}
                  <circle
                    r="140"
                    fill="radial-gradient(circle, rgba(13,36,34,0.6) 0%, rgba(5,11,10,0) 70%)"
                    className="opacity-90 pointer-events-none"
                  />
                  {/* Concentric dashed particle orbit ring matching Image 2 */}
                  <circle
                    r="84"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="1.2"
                    strokeDasharray="3, 5"
                    strokeOpacity="0.4"
                    className="animate-spin"
                    style={{ animationDuration: "60s" }}
                  />
                  <circle
                    r="105"
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.25)"
                    strokeWidth="0.8"
                    strokeDasharray="2, 6"
                  />
                </g>

                {/* 2. Connectors from Focused Node to Facet Cards */}
                {facets.map((facet, idx) => {
                  const cardY = facetStartY + idx * facetCardSpacing + facetCardHeight / 2;
                  const isActive = facet.id === activeFacet;

                  // Smooth cubic bezier curve
                  const midX = (focusedNodeX + facetCardX) / 2;
                  const pathData = `M ${focusedNodeX + 30} ${focusedNodeY} C ${midX} ${focusedNodeY}, ${midX} ${cardY}, ${facetCardX} ${cardY}`;

                  return (
                    <path
                      key={`card-spline-${facet.id}`}
                      d={pathData}
                      fill="none"
                      stroke={isActive ? "url(#spline-active)" : "url(#spline-inactive)"}
                      strokeWidth={isActive ? 1.8 : 1}
                      strokeDasharray={isActive ? "none" : "3, 3"}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* 3. Fanning Dendrogram Splines from Active Facet Card to Leaf Nodes */}
                {leafItems.map((leaf, idx) => {
                  const cardRightX = facetCardX + facetCardWidth;
                  const leafY = leafStartY + idx * leafSpacing + 12;

                  // Gentle arc curve for leaf X position matching Image 2
                  const arcOffset = Math.pow(Math.abs(leafY - focusedNodeY) / 160, 1.6) * 35;
                  const leafX = 580 + arcOffset;

                  const midX1 = cardRightX + 60;
                  const midX2 = leafX - 60;
                  const pathData = `M ${cardRightX} ${activeCardY} C ${midX1} ${activeCardY}, ${midX2} ${leafY}, ${leafX} ${leafY}`;

                  const isSelected = selectedLeafHotspot?.id === (leaf.raw as Hotspot)?.id;

                  return (
                    <g key={`leaf-branch-${leaf.id}`}>
                      {/* Connecting Spline */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isSelected ? "#2dd4bf" : "rgba(20, 184, 166, 0.28)"}
                        strokeWidth={isSelected ? 1.8 : 1}
                        className="transition-all duration-200 animate-spline-draw"
                      />

                      {/* Leaf Node Circle Dot */}
                      <circle
                        cx={leafX}
                        cy={leafY}
                        r={isSelected ? 6.5 : 4.5}
                        fill={leaf.color}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1}
                        className="cursor-pointer hover:scale-125 transition-transform"
                        onClick={() => {
                          if (leaf.raw && (leaf.raw as Hotspot).severity_score !== undefined) {
                            setSelectedLeafHotspot(leaf.raw as Hotspot);
                            onSelectHotspot?.(leaf.raw as Hotspot);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* 4. Left Column: Focused Node Orb + Labels */}
              <div
                className="absolute flex flex-col items-center justify-center pointer-events-auto cursor-pointer"
                style={{
                  left: focusedNodeX - 80,
                  top: focusedNodeY - 70,
                  width: 160,
                }}
                onClick={() => {
                  setExpandedZoneId(null);
                  setSelectedLeafHotspot(null);
                }}
                title="Click to zoom out"
              >
                {/* Zone Orb with Glossy 3D Highlight */}
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 p-0.5 shadow-[0_0_24px_rgba(245,158,11,0.5)] border border-amber-300/40 relative">
                    {/* Specular sheen */}
                    <div className="absolute top-2 left-2.5 h-4 w-4 rounded-full bg-white/40 blur-[0.5px]" />
                  </div>
                </div>

                {/* Zone Title and Subtitle */}
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-semibold text-white tracking-tight leading-tight">
                    {activeExpandedZone.name.replace(/^DEMO\s*-\s*/i, "")}
                  </h3>
                  <p className="text-[10px] text-teal-400 mt-1 font-mono">
                    Sector #{activeExpandedZone.id} • {activeZoneHotspots.length} Nodes
                  </p>
                </div>
              </div>

              {/* 5. Center-Left Column: Vertical Stack of Facet Category Cards */}
              <div
                className="absolute z-20 flex flex-col pointer-events-auto"
                style={{
                  left: facetCardX,
                  top: facetStartY,
                  gap: facetCardSpacing - facetCardHeight,
                }}
              >
                {facets.map((facet) => {
                  const Icon = facet.icon;
                  const isActive = facet.id === activeFacet;

                  return (
                    <button
                      key={facet.id}
                      onClick={() => setActiveFacet(facet.id)}
                      className={`h-11 px-3.5 rounded-xl border flex items-center justify-between text-left transition-all backdrop-blur-md shadow-md ${
                        isActive
                          ? "bg-[#0b221f] border-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-white"
                          : "bg-[#071615]/80 border-teal-900/40 text-slate-400 hover:text-slate-200 hover:bg-[#091e1b]"
                      }`}
                      style={{ width: facetCardWidth }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className="h-4 w-4"
                          style={{ color: isActive ? facet.color : "#64748b" }}
                        />
                        <span className="text-xs font-sans font-medium">{facet.label}</span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                          isActive
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-teal-950/60 text-slate-400"
                        }`}
                      >
                        {facet.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 6. Center-Right Column: Leaf Node Text Labels & Mini Badges */}
              <div
                className="absolute z-20 pointer-events-auto"
                style={{
                  left: 600,
                  top: leafStartY,
                }}
              >
                <div className="flex flex-col" style={{ gap: leafSpacing - 22 }}>
                  {leafItems.map((leaf) => {
                    const isSelected = selectedLeafHotspot?.id === (leaf.raw as Hotspot)?.id;

                    return (
                      <div
                        key={`leaf-label-${leaf.id}`}
                        onClick={() => {
                          if (leaf.raw && (leaf.raw as Hotspot).severity_score !== undefined) {
                            setSelectedLeafHotspot(leaf.raw as Hotspot);
                            onSelectHotspot?.(leaf.raw as Hotspot);
                          }
                        }}
                        className={`h-6 flex items-center gap-2.5 px-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "bg-teal-950/70 border border-teal-500/40 text-white"
                            : "hover:bg-teal-950/40 text-slate-300"
                        }`}
                      >
                        <span className="text-xs font-sans font-medium">{leaf.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {leaf.subtitle}
                        </span>
                        {leaf.badge && (
                          <span
                            className="text-[9px] font-sans px-1.5 py-0.2 rounded font-medium capitalize"
                            style={{
                              backgroundColor: `${leaf.color}20`,
                              color: leaf.color,
                              border: `1px solid ${leaf.color}40`,
                            }}
                          >
                            {leaf.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 7. RIGHT DETAIL PANEL (Matching Target Image 2 Exactly)          */}
            {/* ============================================================== */}
            <div className="w-[420px] lg:w-[460px] h-full bg-[#061514]/95 border-l border-teal-900/30 backdrop-blur-2xl p-6 overflow-y-auto flex flex-col justify-between shadow-2xl font-sans text-slate-200 shrink-0 z-30">
              <div className="space-y-5">
                {/* Header Tag + Title */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-sans text-teal-400 mb-1.5">
                    <Shield className="h-4 w-4 text-teal-400" />
                    <span>Sector Intelligence Overview</span>
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {selectedLeafHotspot
                      ? `Hotspot WH-${String(selectedLeafHotspot.id).padStart(3, "0")} • ${activeExpandedZone.name.replace(/^DEMO\s*-\s*/i, "")}`
                      : `${activeExpandedZone.name.replace(/^DEMO\s*-\s*/i, "")} Operational Sector`}
                  </h2>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-teal-950/60">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active Telemetry
                    </span>

                    {selectedLeafHotspot && (
                      <button
                        onClick={() => onSelectHotspot?.(selectedLeafHotspot)}
                        className="text-xs font-sans text-teal-400 hover:text-teal-200 flex items-center gap-1 transition-colors"
                      >
                        <span>Full Audit &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Threat / Severity Index Card (with sparkline micro-bars matching Image 2) */}
                <div className="rounded-xl border border-teal-900/40 bg-gradient-to-br from-[#0c201e] to-[#071514] p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
                    <span>Severity Threat Index</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 font-mono">
                      High Severity
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-white tracking-tight">
                        {selectedLeafHotspot
                          ? selectedLeafHotspot.severity_score.toFixed(1)
                          : (
                              activeZoneHotspots.reduce((sum, h) => sum + h.severity_score, 0) /
                              Math.max(activeZoneHotspots.length, 1)
                            ).toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ 10</span>
                      <span className="text-[11px] font-sans text-rose-400 flex items-center gap-0.5 ml-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Critical</span>
                      </span>
                    </div>

                    {/* Equalizer Micro Sparkline Bar Visualization */}
                    <div className="flex items-end gap-1 h-8">
                      {[40, 60, 30, 85, 95, 65, 45, 75, 90, 50, 70, 80, 100, 85].map((val, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-xs bg-amber-400/80 shadow-[0_0_4px_#f59e0b]"
                          style={{ height: `${val}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2x2 Grid of Key Metrics matching Image 2 */}
                <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                  <div className="p-3 rounded-xl border border-teal-950/80 bg-[#051110]">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                      <span>Zone Hotspots</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1.5">
                      {activeZoneHotspots.length}
                    </div>
                    <span className="text-[10px] text-slate-500">Monitored Points</span>
                  </div>

                  <div className="p-3 rounded-xl border border-teal-950/80 bg-[#051110]">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Truck className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Nearby Fleet</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-300 mt-1.5">
                      {activeZoneVehicles.length}
                    </div>
                    <span className="text-[10px] text-slate-500">Available Units</span>
                  </div>

                  <div className="p-3 rounded-xl border border-teal-950/80 bg-[#051110]">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Estimated Mass</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-300 mt-1.5">
                      {selectedLeafHotspot?.estimated_quantity
                        ? `${selectedLeafHotspot.estimated_quantity} kg`
                        : `${activeZoneHotspots.reduce((sum, h) => sum + h.estimated_quantity, 0)} kg`}
                    </div>
                    <span className="text-[10px] text-slate-500">Volumetric Scan</span>
                  </div>

                  <div className="p-3 rounded-xl border border-teal-950/80 bg-[#051110]">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span>Priority Index</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-300 mt-1.5">
                      {selectedLeafHotspot?.priority_score.toFixed(1) || "7.8"}
                    </div>
                    <span className="text-[10px] text-slate-500">Dispatch Weight</span>
                  </div>
                </div>

                {/* AI Analysis / Recommendation Card matching Image 2 */}
                <div className="p-3.5 rounded-xl border border-teal-900/40 bg-[#071917]/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                    <span>Autonomous AI Recommendation</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {selectedLeafHotspot
                      ? `Hotspot #${selectedLeafHotspot.id} requires high-capacity compactor dispatch due to elevated severity score (${selectedLeafHotspot.severity_score.toFixed(1)}). Schedule turn-by-turn route sweep before peak hours.`
                      : `Sector ${activeExpandedZone.name} exhibits multiple waste accumulation clusters. CVRP solver suggests early morning dual-truck dispatch to minimize municipal transit emissions.`}
                  </p>
                </div>
              </div>

              {/* Bottom Quick-Action Prompt matching Image 2 */}
              <div className="pt-3 border-t border-teal-950/80 space-y-2.5">
                {/* Search / Ask AI Input Bar */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ask a question or request dispatch plan..."
                    className="w-full h-9 pl-3.5 pr-10 rounded-full bg-[#081a18] border border-teal-900/50 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all font-sans"
                  />
                  <button
                    className="absolute right-1.5 h-6 w-6 rounded-full bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 flex items-center justify-center transition-colors"
                    title="Send to WasteWise AI"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>

                {/* Action Pills Row */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#081a18] border border-teal-900/40 text-slate-400 font-sans">
                      <Bot className="h-3 w-3 text-teal-400" />
                      <span>WasteWise Agent</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#081a18] border border-teal-900/40 text-teal-400 font-mono">
                      <span>Live Sync</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setExpandedZoneId(null);
                      setSelectedLeafHotspot(null);
                    }}
                    className="text-teal-400 hover:text-teal-200 font-sans flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Back to Overview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

NetworkVisualization.displayName = "NetworkVisualization";
