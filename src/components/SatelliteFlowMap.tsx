import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FinancialCenter, GoldCorridor } from '../types';

interface SatelliteFlowMapProps {
  centers: FinancialCenter[];
  corridors: GoldCorridor[];
  activeFilter: string;
  selectedCenter: FinancialCenter | null;
  onSelectCenter: (center: FinancialCenter) => void;
  selectedCorridor: GoldCorridor | null;
  onSelectCorridor: (corridor: GoldCorridor | null) => void;
  currentPrice: number;
}

// Compute intermediate geodesic points with quadratic latitude curvature
function getCurvedArcPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints = 50
): [number, number][] {
  // Handle 180 meridian wrap if needed
  let dLon = lon2 - lon1;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;

  const points: [number, number][] = [];
  const dist = Math.hypot(lat2 - lat1, dLon);
  // Curve northward or southward based on hemisphere to emulate great circle flight routes
  const midLat = (lat1 + lat2) / 2;
  const curveOffset = Math.min(22, dist * 0.18) * (midLat >= 0 ? 1 : -1);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Parabolic arc factor (peaks at t = 0.5)
    const arcFactor = 4 * t * (1 - t);
    const lat = lat1 + (lat2 - lat1) * t + curveOffset * arcFactor;
    const lon = lon1 + dLon * t;
    points.push([lat, lon]);
  }
  return points;
}

export const SatelliteFlowMap: React.FC<SatelliteFlowMapProps> = ({
  centers,
  corridors,
  activeFilter,
  selectedCenter,
  onSelectCenter,
  selectedCorridor,
  onSelectCorridor,
  currentPrice,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const canvasLayerRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particleOffsetRef = useRef<number>(0);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter corridors based on user selection
  const filteredCorridors = corridors.filter(c => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'PHYSICAL' && c.category === 'PHYSICAL_BULLION') return true;
    if (activeFilter === 'OTC' && c.category === 'OTC_CLEARING') return true;
    if (activeFilter === 'CENTRAL_BANK' && c.category === 'CENTRAL_BANK') return true;
    if (activeFilter === 'REFINERIES' && c.category === 'REFINERY_FLOW') return true;
    return false;
  });

  // Initialize Leaflet Satellite Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Create Leaflet map centered at London / Eurasia to capture prime gold trading longitude
    const map = L.map(mapContainerRef.current, {
      center: [28, 20],
      zoom: 2.2,
      minZoom: 2,
      maxZoom: 16,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: false,
    });

    // 1. Real Satellite Imagery: ESRI World Imagery HD
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        detectRetina: true,
      }
    ).addTo(map);

    // 2. Translucent National Borders & Coastlines reference overlay for institutional clarity
    const referenceLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        opacity: 0.45,
      }
    ).addTo(map);

    // Custom Canvas Overlay for Animated Gold Flows
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasLayerRef.current = canvas;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
    };

    map.on('move', () => {
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
    });
    map.on('resize', resizeCanvas);
    map.on('zoomend', resizeCanvas);
    resizeCanvas();

    mapRef.current = map;

    // ResizeObserver for dynamic container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        resizeCanvas();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Bullion Hub Markers on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    centers.forEach(center => {
      const isActive = center.status === 'ACTIVE';
      const isSelected = selectedCenter?.id === center.id;

      // Custom institutional HTML marker with pulsing gold halo
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
          <!-- Pulsing gold ring for active sessions -->
          ${
            isActive
              ? '<span class="absolute w-7 h-7 rounded-full bg-[#E5C45A]/25 animate-ping"></span>'
              : ''
          }
          <!-- Halo border -->
          <div class="relative w-4 h-4 rounded-full ${
            isSelected
              ? 'bg-[#E5C45A] border-2 border-white shadow-[0_0_16px_#E5C45A]'
              : isActive
              ? 'bg-[#C9A227] border-2 border-[#080808] shadow-[0_0_10px_rgba(201,162,39,0.7)]'
              : 'bg-[#555] border-2 border-[#080808]'
          } flex items-center justify-center transition-transform group-hover:scale-125">
            <span class="w-1.5 h-1.5 rounded-full ${isActive ? 'bg-black' : 'bg-[#aaa]'}"></span>
          </div>

          <!-- Label chip with dark institutional backdrop -->
          <div class="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-sm bg-[#080808]/90 border border-[#242424] text-[9px] font-mono font-bold tracking-wider ${
            isActive ? 'text-[#F5F5F5] border-[#C9A227]/40' : 'text-[#858585]'
          } pointer-events-none group-hover:border-[#E5C45A] group-hover:text-[#E5C45A] transition-colors shadow-md">
            ${center.name.split(' ')[0].toUpperCase()}
            ${isActive ? '<span class="ml-1 text-[8px] text-[#22c55e]">●</span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-gold-hub-marker',
        html: markerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([center.lat, center.lon], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          onSelectCenter(center);
        });

      markersRef.current.push(marker);
    });
  }, [centers, selectedCenter, onSelectCenter]);

  // Handle Fly-To on selected center
  useEffect(() => {
    if (!mapRef.current || !selectedCenter) return;
    mapRef.current.flyTo([selectedCenter.lat, selectedCenter.lon], 4.5, {
      duration: 1.4,
    });
  }, [selectedCenter]);

  // Real-time Canvas Rendering Loop for Flow Arcs & Traveling Photons
  useEffect(() => {
    const canvas = canvasLayerRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particleOffsetRef.current = (particleOffsetRef.current + 0.007) % 1;
      const offset = particleOffsetRef.current;

      // Draw each active corridor
      filteredCorridors.forEach((corr, index) => {
        const c1 = centers.find(c => c.id === corr.from);
        const c2 = centers.find(c => c.id === corr.to);
        if (!c1 || !c2) return;

        const arcPoints = getCurvedArcPoints(c1.lat, c1.lon, c2.lat, c2.lon, 40);
        const isSelected = selectedCorridor?.id === corr.id;

        // Convert lat/lng to container pixel points
        const pixelPoints: L.Point[] = [];
        for (const pt of arcPoints) {
          const px = map.latLngToContainerPoint(L.latLng(pt[0], pt[1]));
          pixelPoints.push(px);
        }

        if (pixelPoints.length < 2) return;

        // 1. Draw glowing base corridor line
        ctx.beginPath();
        ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
        for (let i = 1; i < pixelPoints.length; i++) {
          ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
        }

        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#E5C45A';
          ctx.shadowBlur = 12;
        } else {
          ctx.strokeStyle =
            corr.category === 'OTC_CLEARING'
              ? 'rgba(229, 196, 90, 0.45)'
              : corr.category === 'PHYSICAL_BULLION'
              ? 'rgba(201, 162, 39, 0.55)'
              : corr.category === 'CENTRAL_BANK'
              ? 'rgba(34, 197, 94, 0.45)'
              : 'rgba(245, 158, 11, 0.45)';
          ctx.lineWidth = isSelected ? 2.5 : 1.6;
          ctx.shadowColor = '#C9A227';
          ctx.shadowBlur = 4;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // 2. Flowing Golden Photon Particles along the geodesic route
        // Stagger multiple particles along busy corridors
        const particleCount = corr.category === 'OTC_CLEARING' ? 3 : 2;
        for (let p = 0; p < particleCount; p++) {
          const t = (offset + index * 0.13 + (p / particleCount)) % 1;
          const targetIndex = t * (pixelPoints.length - 1);
          const idxLow = Math.floor(targetIndex);
          const idxHigh = Math.min(pixelPoints.length - 1, idxLow + 1);
          const frac = targetIndex - idxLow;

          const p1 = pixelPoints[idxLow];
          const p2 = pixelPoints[idxHigh];
          if (!p1 || !p2) continue;

          const curX = p1.x + (p2.x - p1.x) * frac;
          const curY = p1.y + (p2.y - p1.y) * frac;

          // Outer pulse
          ctx.beginPath();
          ctx.arc(curX, curY, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(229, 196, 90, 0.35)';
          ctx.fill();

          // Particle Core
          ctx.beginPath();
          ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#E5C45A';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [filteredCorridors, centers, selectedCorridor]);

  // Fly to region preset
  const handlePreset = (preset: string) => {
    if (!mapRef.current) return;
    switch (preset) {
      case 'GLOBAL':
        mapRef.current.flyTo([28, 20], 2.2, { duration: 1.2 });
        break;
      case 'TRANSATLANTIC':
        mapRef.current.flyTo([46, -38], 3.2, { duration: 1.2 });
        break;
      case 'EURASIA':
        mapRef.current.flyTo([35, 45], 3.2, { duration: 1.2 });
        break;
      case 'ASIAPACIFIC':
        mapRef.current.flyTo([10, 115], 3.2, { duration: 1.2 });
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full bg-[#05070a]" />

      {/* Satellite Controls & Presets Header Overlay */}
      <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#080808]/90 backdrop-blur-md border border-[#242424] rounded-sm px-3.5 py-2 pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C45A] font-bold">
              REAL LIVE SATELLITE VIEW
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#858585] hidden sm:inline border-l border-[#242424] pl-3">
            ESRI REMOTE SENSING ORBIT • 0.5M RESOLUTION
          </span>
        </div>

        {/* Region Quick Fly-To Badges */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {[
            { id: 'GLOBAL', label: 'GLOBAL VIEW' },
            { id: 'TRANSATLANTIC', label: 'LONDON ⇄ NY' },
            { id: 'EURASIA', label: 'SWISS ⇄ DUBAI' },
            { id: 'ASIAPACIFIC', label: 'ASIA PACIFIC' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset.id)}
              className="px-2.5 py-1 rounded-sm bg-[#080808]/85 hover:bg-[#151515] border border-[#242424] hover:border-[#C9A227]/50 text-[9px] font-mono uppercase tracking-wider text-[#bbb] hover:text-[#E5C45A] transition-all cursor-pointer backdrop-blur-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom / Reset Buttons */}
      <div className="absolute bottom-16 right-4 z-[500] flex flex-col gap-1.5">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          title="Zoom In"
          className="w-8 h-8 rounded-sm bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#F5F5F5] font-mono font-bold flex items-center justify-center text-sm transition-colors cursor-pointer backdrop-blur-sm"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          title="Zoom Out"
          className="w-8 h-8 rounded-sm bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#F5F5F5] font-mono font-bold flex items-center justify-center text-sm transition-colors cursor-pointer backdrop-blur-sm"
        >
          -
        </button>
        <button
          onClick={() => handlePreset('GLOBAL')}
          title="Reset Global Extent"
          className="w-8 h-8 rounded-sm bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#E5C45A] font-mono text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
        >
          🌐
        </button>
      </div>
    </div>
  );
};
