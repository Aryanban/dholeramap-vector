'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, PlotData } from '@/store/map-store';
import { Search, MapPin, Layers, Share2, Info, Check, Sparkles } from 'lucide-react';

interface SearchItem {
  id: string;
  surveyNo: string;
  finalPlot: string;
  village: string;
  subSector: string;
  areaSqM: number;
  lng: number;
  lat: number;
}

const SUB_SECTORS = [
  { id: 'all', label: 'All TP 1 Master', center: [72.205, 22.300], zoom: 12 },
  { id: 'tp1-1a1', label: 'TP 1A-1 Ambli', center: [72.255, 22.330], zoom: 14 },
  { id: 'tp1-1a2', label: 'TP 1A-2 Kadipur', center: [72.190, 22.290], zoom: 14 },
  { id: 'tp1-1a3', label: 'TP 1A-3 Bhimtalav', center: [72.160, 22.315], zoom: 14 },
  { id: 'tp1-1a4', label: 'TP 1A-4 Hebatpur', center: [72.252, 22.312], zoom: 14 },
  { id: 'tp1-1a5', label: 'TP 1A-5 Commercial', center: [72.222, 22.295], zoom: 14 },
  { id: 'tp1-1b', label: 'TP 1B Central Plaza', center: [72.245, 22.272], zoom: 14 },
];

export default function Header() {
  const {
    activeSubSector,
    setActiveSubSector,
    setFlyTarget,
    isDrawerOpen,
    setIsDrawerOpen,
    mapStyle,
    setMapStyle,
    setSelectedPlot,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/tp1_search_index.json')
      .then((res) => res.json())
      .then((data: SearchItem[]) => setSearchIndex(data))
      .catch((err) => console.error('Error loading search index:', err));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const q = query.toLowerCase().trim();
    const results = searchIndex
      .filter((item) => {
        return (
          item.surveyNo.toLowerCase().includes(q) ||
          item.finalPlot.toLowerCase().includes(q) ||
          item.village.toLowerCase().includes(q) ||
          item.subSector.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);

    setFilteredResults(results);
    setIsDropdownOpen(results.length > 0);
  }, [query, searchIndex]);

  // Handle outside clicks to close search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectResult(item: SearchItem) {
    setQuery(`${item.finalPlot} (Survey ${item.surveyNo})`);
    setIsDropdownOpen(false);

    setFlyTarget({
      lng: item.lng,
      lat: item.lat,
      zoom: 16.5,
    });

    const area = item.areaSqM || 750;
    const jantri = 3200;
    const govt = area * jantri;
    const stamp = Math.round(govt * 0.049);
    const reg = Math.round(govt * 0.01);

    const fullPlot: PlotData = {
      id: item.id,
      surveyNo: item.surveyNo,
      finalPlot: item.finalPlot,
      village: item.village,
      subSector: item.subSector,
      schemeId: 'dholera_tp1',
      schemeName: 'Town Planning Scheme 1',
      zone: 'Residential R-1 / City Center Commercial',
      zoneCode: 'R1_CCC',
      roadWidthM: 30,
      areaSqM: area,
      areaSqYd: Math.round(area * 1.19599),
      jantriRate: jantri,
      govtValuation: govt,
      stampDuty: stamp,
      regFee: reg,
      totalGovtFee: stamp + reg,
      maxFAR: 1.8,
      maxHeightM: 15,
      groundCoveragePct: 45,
      centroid: [item.lng, item.lat],
    };

    setSelectedPlot(fullPlot);
  }

  function handleSubSectorChange(s: (typeof SUB_SECTORS)[0]) {
    setActiveSubSector(s.id);
    setFlyTarget({
      lng: s.center[0],
      lat: s.center[1],
      zoom: s.zoom,
    });
  }

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-[#0A1E3F] flex items-center justify-center text-white font-black text-sm shadow-md tracking-wider">
            DH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                DholeraMap<span className="text-blue-600">.vector</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                WebGL Vector GIS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Town Planning Scheme 1 (TP 1 & Sub-Maps 1A-1 to 1B) • Infinite Vector Sharpness
            </p>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (filteredResults.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search Survey No. (e.g. 399), Final Plot, Ambli, Kadipur..."
              className="w-full h-10 pl-9 pr-4 text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-hidden transition shadow-xs"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setFilteredResults([]);
                }}
                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between">
                <span>TP 1 CADASTRAL MATCHES</span>
                <span>{filteredResults.length} found</span>
              </div>
              {filteredResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="w-full px-3 py-2.5 text-left hover:bg-blue-50/70 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      FP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {item.finalPlot}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          (Survey {item.surveyNo})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.village} • {item.subSector} • {item.areaSqM} sq.m
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    View
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Style Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setMapStyle('vector')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                mapStyle === 'vector'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vector
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                mapStyle === 'satellite'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isDrawerOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Plot Details</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Share URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Sector Filter Navigation Pill Bar */}
      <div className="bg-slate-50/90 border-t border-slate-200 px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 mr-2 shrink-0">
          Sub-Maps:
        </span>
        {SUB_SECTORS.map((s) => {
          const active = activeSubSector === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleSubSectorChange(s)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
