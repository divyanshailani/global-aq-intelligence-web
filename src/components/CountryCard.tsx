"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import ConfidenceTag from "./ConfidenceTag";
import { EPA_BREAKPOINTS, calculateAQI, getLocalAQIContext } from "@/utils/aqi_calculator";
import type { CountryMeta, ForecastPoint } from "@/types";

const TRUE_STATION_COUNT: Record<string, string> = {
  US: "~1,530",
  IN: "~539",
  AU: "~168",
  GB: "~150",
};

interface CountryCardProps {
  code: string;
  meta: CountryMeta;
  forecast: ForecastPoint[];
  onClick: () => void;
  isSelected: boolean;
}

export default function CountryCard({
  code,
  meta,
  forecast,
  onClick,
  isSelected,
}: CountryCardProps) {
  const sparklineData = useMemo(() => {
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...forecast].sort(
      (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
    for (const pt of sorted) {
      if (pt.horizon_days <= 7) {
        dateMap.set(pt.target_date, pt);
      }
    }
    return Array.from(dateMap.values()).slice(-7);
  }, [forecast]);

  const avgPM25 = useMemo(() => {
    if (sparklineData.length === 0) return 0;
    return sparklineData.reduce((acc, pt) => acc + pt.mean_pm25, 0) / sparklineData.length;
  }, [sparklineData]);

  const avgWind = useMemo(() => {
    if (sparklineData.length === 0) return 0;
    const withWind = sparklineData.filter(pt => pt.weather_context?.wind !== undefined);
    if (withWind.length === 0) return 0;
    return withWind.reduce((acc, pt) => acc + (pt.weather_context?.wind || 0), 0) / withWind.length;
  }, [sparklineData]);

  const avgTemp = useMemo(() => {
    if (sparklineData.length === 0) return 0;
    const withTemp = sparklineData.filter(pt => pt.weather_context?.temp !== undefined);
    if (withTemp.length === 0) return 0;
    return withTemp.reduce((acc, pt) => acc + (pt.weather_context?.temp || 0), 0) / withTemp.length;
  }, [sparklineData]);

  const aqiResult = useMemo(() => calculateAQI(avgPM25), [avgPM25]);
  const localContext = useMemo(() => getLocalAQIContext(avgPM25, code), [avgPM25, code]);

  // Sparkline color
  const sparkColor = aqiResult.hex;

  return (
    <button
      onClick={onClick}
      className={`glass-card w-full text-left p-5 sm:p-6 cursor-pointer group relative overflow-hidden ${
        isSelected ? "!border-[#4fb8b0]/25" : ""
      }`}
      style={{
        borderLeft: `3px solid ${isSelected ? '#4fb8b0' : 'rgba(79,184,176,0.15)'}`,
      }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.flag}</span>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {meta.name}
              </h3>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                {code} · {TRUE_STATION_COUNT[code] || meta.station_count} stations
              </p>
            </div>
          </div>
          <ConfidenceTag tag={meta.tag} color={meta.tag_color} />
        </div>

        {/* Sparkline */}
        <div className="h-14 mb-4 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`spark-${code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
              <Area
                type="monotone"
                dataKey="mean_pm25"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#spark-${code})`}
                dot={false}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] mb-0.5" style={{ color: "var(--text-muted)" }}>US EPA AQI (7d)</p>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-3xl font-bold leading-none ${aqiResult.colorClass}`}>
                  {aqiResult.aqi}
                </p>
              </div>
              
              {/* Inline Geopolitics (Zero-Click) */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <span className={`font-medium ${aqiResult.colorClass}`}>{aqiResult.category}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">{localContext}</span>
              </div>
            </div>
            
            {/* Elevated Raw Physics & Accuracy */}
            <div className="text-right flex flex-col items-end">
              <div className="bg-white/5 border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-1.5 mb-2 shadow-sm">
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Raw Mass</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[12px] font-bold text-slate-100">{avgPM25.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-500">µg/m³</span>
                </div>
              </div>
              {meta.accuracy_percentage !== undefined && (
                <p className={`text-[10px] font-bold tracking-wide ${
                  meta.accuracy_percentage >= 80 ? 'text-emerald-400' :
                  meta.accuracy_percentage >= 60 ? 'text-amber-400' : 'text-rose-500'
                }`}>
                  ACCURACY: {meta.accuracy_percentage.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {meta.anchor && (
              <span className="text-[10px] mr-1" style={{ color: "var(--text-muted)" }}>
                Anchor: {meta.anchor}
              </span>
            )}
            {avgWind > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-sm">🌪️</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{avgWind.toFixed(1)} km/h</span>
              </div>
            )}
            {avgTemp !== 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-sm">🌡️</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{avgTemp.toFixed(1)} °C</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg transition-all duration-300"
            style={isSelected ? {
              background: 'rgba(79,184,176,0.06)',
              border: '1px solid rgba(79,184,176,0.15)',
              color: '#4fb8b0',
            } : {
              background: 'rgba(79,184,176,0.10)',
              border: '1px solid rgba(79,184,176,0.25)',
              color: '#4fb8b0',
              boxShadow: '0 0 12px rgba(79,184,176,0.08)',
            }}
          >
            {!isSelected && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4fb8b0' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#4fb8b0' }} />
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
              {isSelected ? 'Collapse forecast' : 'View up to 30-day forecast'}
            </span>
            <svg
              className={`w-3 h-3 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
