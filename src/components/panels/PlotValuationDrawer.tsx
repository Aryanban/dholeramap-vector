'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/map-store';
import { generatePlotPDF } from '@/lib/pdf-generator';
import {
  X,
  FileText,
  Share2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Compass,
  Download,
  CheckCircle2,
} from 'lucide-react';

export default function PlotValuationDrawer() {
  const { selectedPlot, isDrawerOpen, setIsDrawerOpen } = useAppStore();
  const [isFemaleExempt, setIsFemaleExempt] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'valuation' | 'specs'>('valuation');

  if (!isDrawerOpen || !selectedPlot) {
    return null;
  }

  const areaSqM = selectedPlot.areaSqM || 750;
  const areaSqYd = selectedPlot.areaSqYd || Math.round(areaSqM * 1.19599);
  const jantriRate = selectedPlot.jantriRate || 3200;
  const govtValuation = areaSqM * jantriRate;

  // Stamp Duty calculation (4.9%, 0% if female allottee)
  const stampDutyRate = isFemaleExempt ? 0 : 0.049;
  const stampDuty = Math.round(govtValuation * stampDutyRate);
  const regFee = Math.round(govtValuation * 0.01);
  const totalRevenueDuty = stampDuty + regFee;

  const govtValLakh = (govtValuation / 100000).toFixed(2);

  async function handleDownloadPDF() {
    if (!selectedPlot) return;
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await generatePlotPDF(selectedPlot);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DSIR_TP1_${selectedPlot.finalPlot}_Dossier.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleWhatsAppShare() {
    if (!selectedPlot) return;
    const text = encodeURIComponent(
      `🏛️ *DHOLERA SIR — STATUTORY PLOT DOSSIER*\n` +
        `• Scheme: Town Planning Scheme 1 (${selectedPlot.subSector})\n` +
        `• Final Plot: ${selectedPlot.finalPlot} (Survey ${selectedPlot.surveyNo})\n` +
        `• Village: ${selectedPlot.village}\n` +
        `• Area: ${areaSqM.toLocaleString()} sq.m (${areaSqYd.toLocaleString()} sq.yd)\n` +
        `• Road Frontage: ${selectedPlot.roadWidthM}m TP Road\n` +
        `• Govt Jantri Valuation: ₹${govtValLakh} Lakhs (@ ₹${jantriRate.toLocaleString()}/sq.m)\n` +
        `• Total Revenue Duty: ₹${totalRevenueDuty.toLocaleString()}\n` +
        `🔗 View Interactive Vector Map: https://dholeramap-vector.vercel.app`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <aside className="fixed top-28 right-4 bottom-6 z-30 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="p-4 bg-[#0A1E3F] text-white flex items-start justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Statutory Gujarat Plot
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-0.5">{selectedPlot.finalPlot}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Survey {selectedPlot.surveyNo} • {selectedPlot.village} • {selectedPlot.subSector}
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'valuation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Valuation & Jantri
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'specs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cadastral Specs
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'valuation' ? (
          <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-semibold text-slate-500">Allotted Area</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {areaSqM.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">sq.m</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {areaSqYd.toLocaleString()} sq.yd
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-semibold text-slate-500">Govt Valuation</span>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  ₹{govtValLakh} <span className="text-xs font-normal">Lakh</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">
                  @ ₹{jantriRate.toLocaleString()}/sq.m
                </span>
              </div>
            </div>

            {/* Gujarat Statutory Jantri Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Statutory Revenue Duties
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Jantri 2026
                </span>
              </div>

              {/* Female Exemption Toggle */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer text-xs text-slate-700 font-medium hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isFemaleExempt}
                  onChange={(e) => setIsFemaleExempt(e.target.checked)}
                  className="rounded-sm text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Female Allottee / Buyer (100% Stamp Exemption)</span>
              </label>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Gujarat Stamp Duty ({isFemaleExempt ? '0%' : '4.9%'}):</span>
                  <span className="font-bold text-slate-900">
                    {isFemaleExempt ? '₹0 (Exempt)' : `₹${stampDuty.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee (1.0%):</span>
                  <span className="font-bold text-slate-900">₹{regFee.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Total Gujarat Revenue Duty:</span>
                  <span className="text-blue-700 font-black">
                    ₹{totalRevenueDuty.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Development Guidelines */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Town Planning Regulations
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Max FSI/FAR</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedPlot.maxFAR}</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Max Height</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedPlot.maxHeightM}m
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500">Ground Cov.</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedPlot.groundCoveragePct}%
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Cadastral Specs Tab */
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Scheme Name</span>
                <span className="font-bold text-slate-900">Town Planning Scheme 1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Sub-Sector Pocket</span>
                <span className="font-bold text-blue-600">{selectedPlot.subSector}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Revenue Village</span>
                <span className="font-bold text-slate-900">{selectedPlot.village}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Road Corridor Width</span>
                <span className="font-bold text-slate-900">{selectedPlot.roadWidthM} Meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Statutory Land Use</span>
                <span className="font-bold text-slate-900 text-right">{selectedPlot.zone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Statutory Approval</span>
                <span className="font-semibold text-emerald-600">Sanctioned (Sec 50 Act 1976)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
        <button
          onClick={handleWhatsAppShare}
          className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Share Official PDF via WhatsApp
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          {isGeneratingPdf ? (
            <span>Generating Deed PDF...</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Official Deed PDF
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
