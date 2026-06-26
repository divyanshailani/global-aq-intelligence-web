"use client";

import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import ConfidenceTag from "./ConfidenceTag";
import { calculateAQI, getLocalAQIContext } from "@/utils/aqi_calculator";
import type { CountryMeta, ForecastPoint } from "@/types";

const STATION_COUNT: Record<string, string> = { US: "1,565", IN: "590", AU: "201", GB: "367" };

function aqiColor(cat: string): string {
  if (cat === "Good") return "#4caf82";
  if (cat === "Moderate") return "#c9a227";
  if (cat === "Unhealthy for Sensitive Groups") return "#bf6f30";
  if (cat === "Unhealthy" || cat === "Very Unhealthy") return "#b85555";
  return "#8f5ca8";
}

function aqiBadge(cat: string): React.CSSProperties {
  if (cat === "Good") return { background: "rgba(76,175,130,0.08)", color: "#4caf82", border: "1px solid rgba(76,175,130,0.18)" };
  if (cat === "Moderate") return { background: "rgba(201,162,39,0.08)", color: "#c9a227", border: "1px solid rgba(201,162,39,0.18)" };
  if (cat === "Unhealthy for Sensitive Groups") return { background: "rgba(191,111,48,0.08)", color: "#bf6f30", border: "1px solid rgba(191,111,48,0.18)" };
  if (cat === "Unhealthy" || cat === "Very Unhealthy") return { background: "rgba(184,85,85,0.08)", color: "#b85555", border: "1px solid rgba(184,85,85,0.18)" };
  return { background: "rgba(143,92,168,0.08)", color: "#8f5ca8", border: "1px solid rgba(143,92,168,0.18)" };
}

interface CountryCardProps {
  code: string;
  meta: CountryMeta;
  forecast: ForecastPoint[];
  onClick: () => void;
  isSelected: boolean;
  stacked?: boolean; // ← stacked = in the left column when forecast is open
}

export default function CountryCard({ code, meta, forecast, onClick, isSelected, stacked = false }: CountryCardProps) {
  const sparklineData = useMemo(() => {
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...forecast].sort(
      (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
    for (const pt of sorted) {
      if (pt.horizon_days <= 7) dateMap.set(pt.target_date, pt);
    }
    return Array.from(dateMap.values()).slice(-7);
  }, [forecast]);

  const avgPM25 = useMemo(() => {
    if (!sparklineData.length) return 0;
    return sparklineData.reduce((a, p) => a + p.mean_pm25, 0) / sparklineData.length;
  }, [sparklineData]);

  const avgWind = useMemo(() => {
    const pts = sparklineData.filter(p => p.weather_context?.wind !== undefined);
    if (!pts.length) return 0;
    return pts.reduce((a, p) => a + (p.weather_context?.wind || 0), 0) / pts.length;
  }, [sparklineData]);

  const avgTemp = useMemo(() => {
    const pts = sparklineData.filter(p => p.weather_context?.temp !== undefined);
    if (!pts.length) return 0;
    return pts.reduce((a, p) => a + (p.weather_context?.temp || 0), 0) / pts.length;
  }, [sparklineData]);

  const aqiResult = useMemo(() => calculateAQI(avgPM25), [avgPM25]);
  const localContext = useMemo(() => getLocalAQIContext(avgPM25, code), [avgPM25, code]);
  const color = aqiColor(aqiResult.category);

  // ── Unused compact block - removed ──
  if (false) {
    return (
      <button
        onClick={onClick}
        className={`country-compact-row${isSelected ? " active" : ""}`}
      >
        <span style={{ fontSize: "20px", flexShrink: 0 }}>{meta.flag}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif" }}>
            {meta.name}
          </p>
          <p style={{ fontSize: "10px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginTop: "1px" }}>
            {STATION_COUNT[code]} stations
          </p>
        </div>
        {/* Mini sparkline */}
        <div style={{ width: "52px", height: "28px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`csg-${code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
              <Area
                type="monotone" dataKey="mean_pm25"
                stroke={color} strokeWidth={1.5}
                fill={`url(#csg-${code})`} dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "18px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
            {aqiResult.aqi}
          </p>
          <p style={{ fontSize: "9px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>AQI</p>
        </div>
      </button>
    );
  }

  // ── FULL MODE: expanded grid card ──
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background: "var(--surface)",
        border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
        borderTop: isSelected ? `2px solid var(--accent)` : `1px solid var(--border)`,
        borderRadius: "8px",
        padding: "0",
        cursor: "pointer",
        transition: "border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-hover)";
          el.style.background = "var(--surface-hover)";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.background = "var(--surface)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }
      }}
    >
      {/* Card header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px", lineHeight: 1 }}>{meta.flag}</span>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.2, fontFamily: "'Inter', sans-serif" }}>
              {meta.name}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>
              {STATION_COUNT[code]} stations
            </p>
          </div>
        </div>
        <ConfidenceTag tag={meta.tag} color={meta.tag_color} />
      </div>

      {/* Card body */}
      <div style={{ padding: "20px 20px 16px" }}>

        {/* Sparkline */}
        <div style={{ height: stacked ? "40px" : "56px", marginBottom: stacked ? "10px" : "16px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`sg-${code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
              <Area type="monotone" dataKey="mean_pm25"
                stroke={color} strokeWidth={1.5}
                fill={`url(#sg-${code})`} dot={false}
                isAnimationActive animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AQI + category */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: stacked ? "8px" : "12px" }}>
          <span style={{ fontSize: stacked ? "28px" : "40px", fontWeight: 700, letterSpacing: "-0.03em", color, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>
            {aqiResult.aqi}
          </span>
          <span style={{ ...aqiBadge(aqiResult.category), display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
            {aqiResult.category}
          </span>
        </div>

        {/* PM2.5 + weather */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: stacked ? "8px" : "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "var(--text-2)", fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "var(--text-3)", marginRight: "4px" }}>PM2.5</span>
            {avgPM25.toFixed(1)} µg/m³
          </span>
          {avgWind > 0 && (
            <span style={{ fontSize: "11px", color: "var(--text-3)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 8px", fontFamily: "'JetBrains Mono', monospace" }}>
              {avgWind.toFixed(1)} km/h
            </span>
          )}
          {avgTemp !== 0 && (
            <span style={{ fontSize: "11px", color: "var(--text-3)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 8px", fontFamily: "'JetBrains Mono', monospace" }}>
              {avgTemp.toFixed(1)}°C
            </span>
          )}
        </div>

        {/* Context — hidden in stacked mode */}
        {!stacked && (
          <p style={{ fontSize: "11px", color: "var(--text-3)", lineHeight: 1.55, marginBottom: "14px", fontFamily: "'Inter', sans-serif" }}>
            {localContext}
          </p>
        )}

        {/* CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "12px", borderTop: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: "12px", color: isSelected ? "var(--accent)" : "var(--text-3)", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
            {stacked ? (isSelected ? "Viewing forecast →" : "Switch forecast") : (isSelected ? "Close forecast" : "View 30-day forecast")}
          </span>
          {!stacked && (
            <svg
              style={{ width: "13px", height: "13px", color: "var(--accent)", transform: isSelected ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
