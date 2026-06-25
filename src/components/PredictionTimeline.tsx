"use client";

import React, { useMemo } from "react";
import type { ForecastPoint } from "@/types";
import { calculateAQI } from "@/utils/aqi_calculator";

interface Props {
  forecast: ForecastPoint[];
  countryCode: string;
}

interface DayData {
  dateStr: string;
  pm25: number;
  min: number;
  max: number;
  horizon: number;
  confidencePct: number;
  isToday: boolean;
  isTomorrow: boolean;
  weekday: string;
  monthDay: string;
  zone: "High" | "Medium" | "Directional";
}

function aqiColor(cat: string): string {
  if (cat === "Good") return "#4caf82";
  if (cat === "Moderate") return "#c9a227";
  if (cat === "Unhealthy for Sensitive Groups") return "#bf6f30";
  if (cat === "Unhealthy" || cat === "Very Unhealthy") return "#b85555";
  return "#8f5ca8";
}

function zoneStyle(zone: DayData["zone"]): React.CSSProperties {
  if (zone === "High")
    return { color: "#4caf82", background: "rgba(76,175,130,0.08)", border: "1px solid rgba(76,175,130,0.18)" };
  if (zone === "Medium")
    return { color: "#c9a227", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.18)" };
  return { color: "var(--text-3)", background: "var(--surface-raised)", border: "1px solid var(--border)" };
}

export default function PredictionCalendar({ forecast }: Props) {
  const days: DayData[] = useMemo(() => {
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...forecast].sort(
      (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
    for (const pt of sorted) {
      const existing = dateMap.get(pt.target_date);
      if (!existing || pt.stations >= existing.stations) dateMap.set(pt.target_date, pt);
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const tmw = new Date(now); tmw.setDate(tmw.getDate() + 1);
    const tmwStr = `${tmw.getFullYear()}-${pad(tmw.getMonth() + 1)}-${pad(tmw.getDate())}`;

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
      .slice(-30)
      .map(pt => {
        const d = new Date(pt.target_date);
        return {
          dateStr: pt.target_date,
          pm25: pt.mean_pm25,
          min: pt.min_pm25,
          max: pt.max_pm25,
          horizon: pt.horizon_days,
          confidencePct: pt.confidence_pct,
          isToday: pt.target_date === todayStr,
          isTomorrow: pt.target_date === tmwStr,
          weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
          monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          zone: (pt.horizon_days <= 7 ? "High" : pt.horizon_days <= 15 ? "Medium" : "Directional") as DayData["zone"],
        };
      });
  }, [forecast]);

  if (!days.length) return null;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "8px", overflow: "hidden",
    }}>
      {/* Table header */}
      <div style={{
        padding: "14px 24px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-raised)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <p style={{
          fontSize: "13px", fontWeight: 600, color: "var(--text-1)",
          fontFamily: "'Inter', sans-serif",
        }}>
          Day-by-Day Breakdown
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>
          {days.length} days
        </p>
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: "24px 32px", background: "var(--surface)" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
          gap: "16px" 
        }}>
          {days.map((d) => {
            const aqi = calculateAQI(d.pm25);
            const color = aqiColor(aqi.category);

            return (
              <div 
                key={d.dateStr}
                className="hover-lift"
                style={{
                  background: "var(--surface-raised)",
                  border: `1px solid ${d.isToday ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex", flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                {/* Date & Weekday */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: d.isToday ? "var(--accent)" : "var(--text-1)", fontWeight: d.isToday ? 600 : 500, fontFamily: "'Inter', sans-serif" }}>
                    {d.isToday ? "Today" : d.monthDay}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>
                    {d.weekday}
                  </span>
                </div>
                
                {/* AQI Value */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 700, color: color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {aqi.aqi}
                  </span>
                </div>
                
                {/* Category */}
                <span style={{ fontSize: "12px", color: "var(--text-2)", fontFamily: "'Inter', sans-serif", marginTop: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {aqi.category}
                </span>
                
                {/* Footer stats (PM2.5 and Confidence) */}
                <div style={{ marginTop: "16px", paddingTop: "10px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {d.pm25.toFixed(1)} µg
                  </span>
                  <span style={{ fontSize: "11px", color: zoneStyle(d.zone).color, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                    {d.confidencePct}% Conf
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
