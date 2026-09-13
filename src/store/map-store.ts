import { create } from 'zustand';

export interface PlotData {
  id: string;
  surveyNo: string;
  finalPlot: string;
  village: string;
  subSector: string;
  schemeId: string;
  schemeName: string;
  zone: string;
  zoneCode: string;
  roadWidthM: number;
  areaSqM: number;
  areaSqYd: number;
  jantriRate: number;
  govtValuation: number;
  stampDuty: number;
  regFee: number;
  totalGovtFee: number;
  maxFAR: number;
  maxHeightM: number;
  groundCoveragePct: number;
  centroid: [number, number];
}

interface AppState {
  selectedPlot: PlotData | null;
  hoveredPlotId: string | null;
  activeSubSector: string; // 'all' or subsector id ('tp1-1a1', etc.)
  isDrawerOpen: boolean;
  searchQuery: string;
  flyTarget: { lng: number; lat: number; zoom?: number } | null;
  mapStyle: 'vector' | 'satellite' | 'dark';

  setSelectedPlot: (plot: PlotData | null) => void;
  setHoveredPlotId: (id: string | null) => void;
  setActiveSubSector: (sectorId: string) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFlyTarget: (target: { lng: number; lat: number; zoom?: number } | null) => void;
  setMapStyle: (style: 'vector' | 'satellite' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPlot: null,
  hoveredPlotId: null,
  activeSubSector: 'all',
  isDrawerOpen: false,
  searchQuery: '',
  flyTarget: null,
  mapStyle: 'vector',

  setSelectedPlot: (plot) => set({ selectedPlot: plot, isDrawerOpen: !!plot }),
  setHoveredPlotId: (id) => set({ hoveredPlotId: id }),
  setActiveSubSector: (sectorId) => set({ activeSubSector: sectorId }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFlyTarget: (target) => set({ flyTarget: target }),
  setMapStyle: (style) => set({ mapStyle: style }),
}));
