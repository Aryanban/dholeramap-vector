'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/panels/Header';
import PlotValuationDrawer from '@/components/panels/PlotValuationDrawer';

const VectorMapViewer = dynamic(
  () => import('@/components/map/VectorMapViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center text-white font-black text-lg shadow-xl">
          DH
        </div>
        <p className="mt-4 text-sm font-bold text-slate-700">
          Initializing Dholera TP 1 WebGL Vector Engine...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Loading 2,867 cadastral polygons & sub-sectors
        </p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col">
      <Suspense fallback={null}>
        <Header />
        <div className="relative flex-1 w-full h-full">
          <VectorMapViewer />
          <PlotValuationDrawer />
        </div>
      </Suspense>
    </main>
  );
}
