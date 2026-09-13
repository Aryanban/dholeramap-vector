'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore, PlotData } from '@/store/map-store';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Compass, Maximize2, Plus, Minus, Box } from 'lucide-react';

const STYLE_URLS = {
  vector: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'ESRI World Imagery',
      },
    },
    layers: [
      {
        id: 'esri-satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
};

export default function VectorMapViewer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const hoverPopupRef = useRef<any>(null);

  const {
    selectedPlot,
    setSelectedPlot,
    hoveredPlotId,
    setHoveredPlotId,
    flyTarget,
    mapStyle,
  } = useAppStore();

  const [is3D, setIs3D] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12.2);

  // Initialize MapLibre GL
  useEffect(() => {
    let mapInstance: any = null;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const maplibreModule = await import('maplibre-gl'); const maplibregl: any = (maplibreModule as any).default || maplibreModule;

      const styleDef =
        mapStyle === 'satellite' ? STYLE_URLS.satellite : STYLE_URLS[mapStyle];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleDef as any,
        center: [72.205, 22.300], // Center of TP 1
        zoom: 12.2,
        pitch: 0,
        bearing: 0,
        maxBounds: [
          [72.05, 22.18], // Southwest
          [72.35, 22.42], // Northeast
        ],
      });

      hoverPopupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: 'custom-vector-popup',
      });

      map.on('load', () => {
        addVectorLayers(map);
      });

      map.on('zoom', () => {
        setZoomLevel(map.getZoom());
      });

      mapInstance = map;
      mapRef.current = map;
    }

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapStyle]);

  function addVectorLayers(map: any) {
    if (!map) return;

    // 1. Sub-Sectors Polygon Source & Layers
    if (!map.getSource('tp1-sectors')) {
      map.addSource('tp1-sectors', {
        type: 'geojson',
        data: '/data/tp1_sectors.geojson',
      });

      // Sub-Sector Fill
      map.addLayer({
        id: 'tp1-sectors-fill',
        type: 'fill',
        source: 'tp1-sectors',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.35,
        },
      });

      // Sub-Sector Outlines
      map.addLayer({
        id: 'tp1-sectors-line',
        type: 'line',
        source: 'tp1-sectors',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        },
      });

      // Sub-Sector English Text Labels
      map.addLayer({
        id: 'tp1-sectors-label',
        type: 'symbol',
        source: 'tp1-sectors',
        layout: {
          'text-field': ['get', 'code'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.1,
        },
        paint: {
          'text-color': '#0A1E3F',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2.5,
        },
      });
    }

    // 2. TP 1 Major Road Corridors
    if (!map.getSource('tp1-roads')) {
      map.addSource('tp1-roads', {
        type: 'geojson',
        data: '/data/tp1_roads.geojson',
      });

      // Road white casing
      map.addLayer({
        id: 'tp1-roads-casing',
        type: 'line',
        source: 'tp1-roads',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': ['+', ['get', 'lineWidth'], 3],
          'line-opacity': 0.9,
        },
      });

      // Road colored line
      map.addLayer({
        id: 'tp1-roads-line',
        type: 'line',
        source: 'tp1-roads',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'lineWidth'],
          'line-opacity': 0.95,
        },
      });

      // Road labels
      map.addLayer({
        id: 'tp1-roads-label',
        type: 'symbol',
        source: 'tp1-roads',
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-letter-spacing': 0.08,
          'text-offset': [0, 0.6],
        },
        paint: {
          'text-color': '#0F172A',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2,
        },
      });
    }

    // 3. Cadastral Plots (2,867 plots)
    if (!map.getSource('tp1-plots')) {
      map.addSource('tp1-plots', {
        type: 'geojson',
        data: '/data/tp1_plots.geojson',
      });

      // Plot Polygon Fill
      map.addLayer({
        id: 'tp1-plots-fill',
        type: 'fill',
        source: 'tp1-plots',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], selectedPlot?.id || ''],
            '#2563EB',
            ['==', ['get', 'id'], hoveredPlotId || ''],
            '#60A5FA',
            '#F8FAFC',
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedPlot?.id || ''],
            0.85,
            ['==', ['get', 'id'], hoveredPlotId || ''],
            0.6,
            0.4,
          ],
        },
      });

      // Plot Polygon Vector Outlines (Crisp 1px borders)
      map.addLayer({
        id: 'tp1-plots-line',
        type: 'line',
        source: 'tp1-plots',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'id'], selectedPlot?.id || ''],
            '#1D4ED8',
            ['==', ['get', 'id'], hoveredPlotId || ''],
            '#2563EB',
            '#94A3B8',
          ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedPlot?.id || ''],
            3,
            ['==', ['get', 'id'], hoveredPlotId || ''],
            2,
            0.8,
          ],
        },
      });

      // Plot Numbers Dynamic Typography (Visible when zoomed into neighborhood level)
      map.addLayer({
        id: 'tp1-plots-label',
        type: 'symbol',
        source: 'tp1-plots',
        minzoom: 14.2,
        layout: {
          'text-field': ['get', 'finalPlot'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#1E293B',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2,
        },
      });

      // Interactive Events: Hover & Tooltip
      map.on('mousemove', 'tp1-plots-fill', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        map.getCanvas().style.cursor = 'pointer';
        const feat = e.features[0];
        const props = feat.properties;
        setHoveredPlotId(props.id);

        const html = `
          <div class="p-2 text-xs font-sans">
            <div class="font-black text-blue-700">${props.finalPlot} <span class="text-slate-500 font-normal">(Survey ${props.surveyNo})</span></div>
            <div class="text-[11px] text-slate-600 mt-0.5">${props.village} • ${props.subSector}</div>
            <div class="text-[11px] font-bold text-slate-900 mt-1">${props.areaSqM} sq.m • ₹${(props.govtValuation / 100000).toFixed(2)} Lakhs</div>
          </div>
        `;
        hoverPopupRef.current
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      });

      map.on('mouseleave', 'tp1-plots-fill', () => {
        map.getCanvas().style.cursor = '';
        setHoveredPlotId(null);
        hoverPopupRef.current.remove();
      });

      // Click Plot Event
      map.on('click', 'tp1-plots-fill', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;

        const plot: PlotData = {
          id: props.id,
          surveyNo: props.surveyNo,
          finalPlot: props.finalPlot,
          village: props.village,
          subSector: props.subSector,
          schemeId: props.schemeId || 'dholera_tp1',
          schemeName: props.schemeName || 'Town Planning Scheme 1',
          zone: props.zone,
          zoneCode: props.zoneCode,
          roadWidthM: props.roadWidthM,
          areaSqM: props.areaSqM,
          areaSqYd: props.areaSqYd,
          jantriRate: props.jantriRate,
          govtValuation: props.govtValuation,
          stampDuty: props.stampDuty,
          regFee: props.regFee,
          totalGovtFee: props.totalGovtFee,
          maxFAR: props.maxFAR,
          maxHeightM: props.maxHeightM,
          groundCoveragePct: props.groundCoveragePct,
          centroid: [e.lngLat.lng, e.lngLat.lat],
        };

        setSelectedPlot(plot);

        // Smooth camera center
        map.easeTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          zoom: Math.max(map.getZoom(), 15.5),
          duration: 900,
        });
      });
    }
  }

  // Update plot highlight styles when selectedPlot or hoveredPlotId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer('tp1-plots-fill')) return;

    map.setPaintProperty('tp1-plots-fill', 'fill-color', [
      'case',
      ['==', ['get', 'id'], selectedPlot?.id || ''],
      '#2563EB',
      ['==', ['get', 'id'], hoveredPlotId || ''],
      '#60A5FA',
      '#F8FAFC',
    ]);

    map.setPaintProperty('tp1-plots-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'id'], selectedPlot?.id || ''],
      0.85,
      ['==', ['get', 'id'], hoveredPlotId || ''],
      0.6,
      0.4,
    ]);

    map.setPaintProperty('tp1-plots-line', 'line-color', [
      'case',
      ['==', ['get', 'id'], selectedPlot?.id || ''],
      '#1D4ED8',
      ['==', ['get', 'id'], hoveredPlotId || ''],
      '#2563EB',
      '#94A3B8',
    ]);

    map.setPaintProperty('tp1-plots-line', 'line-width', [
      'case',
      ['==', ['get', 'id'], selectedPlot?.id || ''],
      3,
      ['==', ['get', 'id'], hoveredPlotId || ''],
      2,
      0.8,
    ]);
  }, [selectedPlot, hoveredPlotId]);

  // Handle fly requests
  useEffect(() => {
    if (!mapRef.current || !flyTarget) return;
    mapRef.current.flyTo({
      center: [flyTarget.lng, flyTarget.lat],
      zoom: flyTarget.zoom || 15.5,
      essential: true,
      duration: 1800,
    });
  }, [flyTarget]);

  function toggle3D() {
    if (!mapRef.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    mapRef.current.easeTo({
      pitch: next3D ? 50 : 0,
      bearing: next3D ? -25 : 0,
      duration: 1000,
    });
  }

  function resetNorth() {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 800,
    });
    setIs3D(false);
  }

  function fitTP1() {
    if (!mapRef.current) return;
    mapRef.current.fitBounds(
      [
        [72.128, 22.250],
        [72.274, 22.345],
      ],
      { padding: 60, duration: 1200 }
    );
  }

  return (
    <div className="relative w-full h-full bg-[#f8fafc]">
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full outline-hidden" />

      {/* Floating Status Indicator */}
      <div className="absolute top-28 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
        <span>TP 1 Vector GIS (WebGL • 2,867 Cadastral Plots)</span>
        <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-100 rounded-md">
          Zoom {zoomLevel.toFixed(1)}x
        </span>
      </div>

      {/* Map Control Tools (Right Bottom) */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <button
            onClick={toggle3D}
            className={`w-10 h-10 flex items-center justify-center transition cursor-pointer ${
              is3D ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle 3D Perspective"
          >
            <Box className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            onClick={resetNorth}
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Reset North"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={fitTP1}
          className="h-10 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
          title="Fit Full TP 1 Boundary"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit TP 1</span>
        </button>
      </div>
    </div>
  );
}
