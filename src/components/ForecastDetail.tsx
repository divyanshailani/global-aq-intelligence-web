"use client";

import React, { useMemo, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { CountryMeta, ForecastPoint } from "@/types";
import ConfidenceTag from "./ConfidenceTag";
import PredictionCalendar from "./PredictionTimeline";
import { calculateAQI } from "@/utils/aqi_calculator";

interface ForecastDetailProps {
  code: string;
  meta: CountryMeta;
  forecast: ForecastPoint[];
}

interface ChartDataPoint {
  date: string;
  shortDate: string;
  mean: number;
  min: number;
  max: number;
  range: [number, number];
  horizon: number;
  confidencePct: number;
  weather?: { temp: number; wind: number; precip: number };
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const aqi = calculateAQI(d.mean);

  return (
    <div style={{
      background: "var(--surface-raised)",
      border: "1px solid var(--border)",
      borderRadius: "8px", padding: "12px 16px",
      minWidth: "200px", fontSize: "12px",
      fontFamily: "'Inter', sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: "10px" }}>{d.date}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {[
          ["Mean PM2.5", `${d.mean.toFixed(1)} µg/m³`],
          ["AQI", `${aqi.aqi} — ${aqi.category}`],
          ["Range", `${d.min.toFixed(1)} – ${d.max.toFixed(1)}`],
          ["Confidence", `${d.confidencePct}%`],
          ["Horizon", `Day ${d.horizon}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
            <span style={{ color: "var(--text-3)" }}>{label}</span>
            <span style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
          </div>
        ))}
        {d.weather && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", paddingTop: "6px", borderTop: "1px solid var(--border)", marginTop: "2px" }}>
            <span style={{ color: "var(--text-3)" }}>Weather</span>
            <span style={{ color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
              {d.weather.wind} km/h · {d.weather.temp}°C
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForecastDetail({ code, meta, forecast }: ForecastDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [code]);

  const shiftedForecast = useMemo(() => {
    if (!forecast || forecast.length === 0) return [];
    
    const timezones: Record<string, string> = {
      IN: "Asia/Kolkata",
      AU: "Australia/Sydney",
      US: "America/New_York",
      GB: "Europe/London",
      UK: "Europe/London",
    };
    const tz = timezones[code] || "UTC";
    
    // Get today's date in target timezone
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const m = parts.find(p => p.type === "month")?.value;
    const d = parts.find(p => p.type === "day")?.value;
    const y = parts.find(p => p.type === "year")?.value;
    const todayTz = new Date(`${y}-${m}-${d}T00:00:00Z`);

    // Sort original forecast to maintain chronological order
    const sortedOriginal = [...forecast].sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());
    
    // Create a mapping from old dates to new dynamic dates starting from today
    const uniqueDates = Array.from(new Set(sortedOriginal.map(f => f.target_date)));
    const dateMapping = new Map<string, string>();
    uniqueDates.forEach((oldDate, i) => {
      const newDate = new Date(todayTz.getTime() + i * 24 * 60 * 60 * 1000);
      const newDateStr = newDate.toISOString().split('T')[0];
      dateMapping.set(oldDate, newDateStr);
    });

    return sortedOriginal.map(f => ({
      ...f,
      target_date: dateMapping.get(f.target_date) || f.target_date
    }));
  }, [forecast, code]);

  const chartData = useMemo(() => {
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...shiftedForecast].sort(
      (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
    for (const pt of sorted) {
      const existing = dateMap.get(pt.target_date);
      if (!existing || pt.stations >= existing.stations) dateMap.set(pt.target_date, pt);
    }
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
      .slice(-30)
      .map((pt): ChartDataPoint => {
        const d = new Date(pt.target_date);
        return {
          date: pt.target_date,
          shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
          mean: Number(pt.mean_pm25.toFixed(2)),
          min: Number(pt.min_pm25.toFixed(2)),
          max: Number(pt.max_pm25.toFixed(2)),
          range: [Number(pt.min_pm25.toFixed(2)), Number(pt.max_pm25.toFixed(2))],
          horizon: pt.horizon_days,
          confidencePct: pt.confidence_pct,
          weather: pt.weather_context,
        };
      });
  }, [forecast]);

  const stats = useMemo(() => {
    if (!chartData.length) return { avg: 0, min: 0, max: 0, avgConf: 0 };
    const means = chartData.map(d => d.mean);
    return {
      avg: means.reduce((a, b) => a + b, 0) / means.length,
      min: Math.min(...chartData.map(d => d.min)),
      max: Math.max(...chartData.map(d => d.max)),
      avgConf: chartData.reduce((a, b) => a + b.confidencePct, 0) / chartData.length,
    };
  }, [chartData]);

  const statPills = [
    { label: "30d Avg PM2.5", value: stats.avg.toFixed(1), unit: "µg/m³" },
    { label: "Min PM2.5",     value: stats.min.toFixed(1), unit: "µg/m³" },
    { label: "Max PM2.5",     value: stats.max.toFixed(1), unit: "µg/m³" },
    { label: "Avg Confidence", value: stats.avgConf.toFixed(0), unit: "%" },
  ];

  return (
    <div ref={containerRef} className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", scrollMarginTop: "100px" }}>

      {/* ── Top Card: Header & Stats ── */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px",
        overflow: "hidden",
      }}>
        {/* Card header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid var(--border)",
          background: "var(--surface-raised)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{meta.flag}</span>
            <div>
              <p style={{
                fontSize: "15px", fontWeight: 600, color: "var(--text-1)",
                fontFamily: "'Inter', sans-serif", lineHeight: 1.2,
              }}>
                {meta.name}
                <span style={{
                  color: "var(--text-3)", fontWeight: 400,
                  marginLeft: "8px", fontSize: "13px",
                }}>
                  — 30-Day PM2.5 Forecast
                </span>
              </p>
              {meta.reason && (
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>
                  {meta.reason}
                </p>
              )}
            </div>
          </div>
          <ConfidenceTag tag={meta.tag} color={meta.tag_color} size="md" />
        </div>

        <div style={{ padding: "24px" }}>
          {/* Stat pills */}
          <div className="resp-grid-2-cols" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px", marginBottom: "24px",
          }}>
            {statPills.map(s => (
              <div key={s.label} style={{
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                borderRadius: "6px", padding: "14px 16px",
              }}>
                <p style={{
                  fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--text-3)",
                  marginBottom: "6px", fontFamily: "'Inter', sans-serif",
                }}>
                  {s.label}
                </p>
                <p style={{
                  fontSize: "20px", fontWeight: 700, color: "var(--text-1)",
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
                }}>
                  {s.value}
                  <span style={{
                    fontSize: "11px", color: "var(--text-3)",
                    fontWeight: 400, marginLeft: "4px",
                  }}>
                    {s.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* Area chart */}
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`mean-fill-${code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`range-fill-${code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--text-3)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--text-3)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 10, fill: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(chartData.length / 8))}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false} tickLine={false} width={40}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Confidence band */}
                <Area
                  type="monotone" dataKey="range"
                  stroke="none" fill={`url(#range-fill-${code})`}
                  fillOpacity={1} isAnimationActive animationDuration={1000}
                />
                {/* Mean line — muted teal accent */}
                <Area
                  type="monotone" dataKey="mean"
                  stroke="var(--accent)" strokeWidth={2}
                  fill={`url(#mean-fill-${code})`}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--accent)", strokeWidth: 2, fill: "var(--surface)" }}
                  isAnimationActive animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day-by-day calendar */}
      <PredictionCalendar forecast={shiftedForecast} countryCode={code} />
    </div>
  );
}
