import React from "react";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#0a0a0e] text-slate-200 p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">System Admin Panel</h1>
          <p className="text-slate-400 mt-2">V11 Global Inference Architecture Management</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Indicator */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-4 text-slate-100">API Link Health</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-200 text-sm">Open-Meteo Satellite Array</span>
                </div>
                <p className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded inline-block mb-2">
                  STATUS: LIVE_EXTRACTION
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Inference is actively pulling 3D Aerosol Optical Depth (AOD) vectors from the European CAMS framework. 
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">PostgreSQL DB Fallback</span>
                  <span className="text-slate-500 font-mono text-xs">STANDBY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Routing Status */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Dynamic Routing Matrix</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Global Network</p>
                  <p className="text-xs text-slate-500">IN, US, AU (All) | GB (1d, 7d)</p>
                </div>
                <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded font-mono border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  V11 Active
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-200">GB Long-Term Fallback</p>
                  <p className="text-xs text-slate-500">Great Britain (14d, 30d)</p>
                </div>
                <span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-400 rounded font-mono border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  V9 Active
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500">
                Router automatically delegates to V9 baseline to prevent long-term overfitting in high-stability oceanic climates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
