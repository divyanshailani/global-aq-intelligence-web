"use client";

import React from "react";

export default function Hero({ lastPipelineRun }: { lastPipelineRun?: string }) {
  let isStale = false;
  let daysOld = 0;
  let formattedDate = "";

  if (lastPipelineRun) {
    const runDate = new Date(lastPipelineRun);
    formattedDate = runDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const diffMs = Date.now() - runDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > 24) {
      isStale = true;
      daysOld = Math.floor(diffHours / 24);
    }
  }

  return (
    <section className="relative pt-24 sm:pt-32 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Label pill */}
        <div className="inline-flex flex-col items-center gap-3 mb-8 animate-fade-in-up opacity-0">
          {lastPipelineRun && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
                isStale
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-teal-500/10 border border-teal-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStale ? "bg-amber-400" : "bg-teal-400 hero-pulse"
                }`}
              />
              <span
                className={`text-xs font-medium tracking-[0.15em] uppercase ${
                  isStale ? "text-amber-400" : "text-teal-400"
                }`}
              >
                {isStale
                  ? `Forecast Generated: ${formattedDate} (Data is ${daysOld} days old)`
                  : `Forecast Generated: ${formattedDate}`}
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(79,184,176,0.08)', border: '1px solid rgba(79,184,176,0.15)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full hero-pulse" style={{ background: '#4fb8b0' }} />
            <span className="text-xs font-medium tracking-[0.15em] uppercase" style={{ color: '#4fb8b0' }}>
              AI-Powered Air Quality Forecasting
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(212,162,76,0.08)', border: '1px solid rgba(212,162,76,0.25)' }}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: '#d4a24c' }}>
              ⚡ Thermodynamics Engine Active
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 animate-fade-in-up opacity-0 stagger-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Global AQ
          <br />
          <span className="bg-clip-text text-transparent" style={{
            backgroundImage: 'linear-gradient(135deg, #4fb8b0, #6b8ec8, #8b7eb8)',
          }}>
            Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-12 animate-fade-in-up opacity-0 stagger-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          30-day PM2.5 forecasts for 4 countries, powered by weather-aware gradient-boosted models
          trained on <span style={{ color: '#d4a24c' }}>1.6M+</span> daily observations from government reference stations.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-6 sm:gap-10 max-w-lg mx-auto animate-fade-in-up opacity-0 stagger-3">
          {[
            { value: "4", label: "Countries", color: "#4fb8b0" },
            { value: "200+", label: "Stations", color: "#6b8ec8" },
            { value: "1.6M", label: "Data Points", color: "#d4a24c" },
            { value: "30d", label: "Forecast", color: "#8b7eb8" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
