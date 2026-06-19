"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import type { CountryMeta, ForecastPoint } from "@/types";
import ConfidenceTag from "./ConfidenceTag";
import PredictionCalendar from "./PredictionTimeline";
import { EPA_BREAKPOINTS } from "@/utils/aqi_calculator";

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
  confidence: string;
  confidencePct: number;
  stations: number;
  zone: "7d" | "15d" | "30d";
  weather?: {
    temp: number;
    wind: number;
    precip: number;
  };
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  const zoneColors: Record<string, { bg: string; text: string; label: string }> = {
    "7d": { bg: "bg-[#4fb8b0]/15", text: "text-[#4fb8b0]", label: "7-Day (High)" },
    "15d": { bg: "bg-[#d4a24c]/15", text: "text-[#d4a24c]", label: "15-Day (Medium)" },
    "30d": { bg: "bg-[#d4847a]/15", text: "text-[#d4847a]", label: "30-Day (Low)" },
  };

  const zone = zoneColors[d.zone];

  return (
    <div className="glass-card-static p-3 min-w-[180px] !rounded-lg text-xs">
      <p className="text-slate-300 font-semibold mb-2">{d.date}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Mean PM2.5</span>
          <span className="text-slate-200 font-bold">{d.mean.toFixed(1)} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Range</span>
          <span className="text-slate-400">
            {d.min.toFixed(1)} – {d.max.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Confidence</span>
          <span className="text-slate-400">{d.confidencePct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Horizon</span>
          <span className="text-slate-400">Day {d.horizon}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Zone</span>
          <span className={`${zone.bg} ${zone.text} px-1.5 py-0.5 rounded text-[10px] font-semibold`}>
            {zone.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Stations</span>
          <span className="text-slate-400">{d.stations}</span>
        </div>
        {d.weather && (
          <div className="flex justify-between pt-1 border-t border-slate-700/50 mt-1">
            <span className="text-slate-500">Weather</span>
            <span className="text-slate-400">🌪️ {d.weather.wind} km/h  🌡️ {d.weather.temp}°C</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForecastDetail({
  code,
  meta,
  forecast,
}: ForecastDetailProps) {
  const chartData = useMemo(() => {
    // Group by date, pick latest data per date
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...forecast].sort(
      (a, b) =>
        new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );

    for (const pt of sorted) {
      const existing = dateMap.get(pt.target_date);
      if (!existing || pt.stations >= existing.stations) {
        dateMap.set(pt.target_date, pt);
      }
    }

    const entries = Array.from(dateMap.values())
      .sort(
        (a, b) =>
          new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
      )
      .slice(-30);

    return entries.map((pt, idx): ChartDataPoint => {
      const zone: "7d" | "15d" | "30d" =
        idx < 7 ? "7d" : idx < 15 ? "15d" : "30d";
      const d = new Date(pt.target_date);
      return {
        date: pt.target_date,
        shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
        mean: Number(pt.mean_pm25.toFixed(2)),
        min: Number(pt.min_pm25.toFixed(2)),
        max: Number(pt.max_pm25.toFixed(2)),
        range: [Number(pt.min_pm25.toFixed(2)), Number(pt.max_pm25.toFixed(2))],
        horizon: pt.horizon_days,
        confidence: pt.confidence,
        confidencePct: pt.confidence_pct,
        stations: pt.stations,
        zone,
        weather: pt.weather_context,
      };
    });
  }, [forecast]);

  // Stats
  const stats = useMemo(() => {
    if (chartData.length === 0)
      return { avg: 0, min: 0, max: 0, avgConfidence: 0 };
    const means = chartData.map((d) => d.mean);
    const avg = means.reduce((a, b) => a + b, 0) / means.length;
    const min = Math.min(...chartData.map((d) => d.min));
    const max = Math.max(...chartData.map((d) => d.max));
    const avgConfidence =
      chartData.reduce((a, b) => a + b.confidencePct, 0) / chartData.length;
    return { avg, min, max, avgConfidence };
  }, [chartData]);

  const zoneInfo = [
    {
      label: "Days 1–7",
      style: "High Confidence",
      color: "text-[#4fb8b0]",
      bg: "bg-[#4fb8b0]/8",
      border: "border-[#4fb8b0]/15",
      barColor: "bg-[#4fb8b0]",
      desc: "Solid — direct lag features",
    },
    {
      label: "Days 8–15",
      style: "Medium Confidence",
      color: "text-[#d4a24c]",
      bg: "bg-[#d4a24c]/8",
      border: "border-[#d4a24c]/15",
      barColor: "bg-[#d4a24c]",
      desc: "Dashed — Direct Horizon Anchors + Weather-Weighted Interpolation",
    },
    {
      label: "Days 16–30",
      style: "Directional Only",
      color: "text-[#d4847a]",
      bg: "bg-[#d4847a]/8",
      border: "border-[#d4847a]/15",
      barColor: "bg-[#d4847a]",
      desc: "Dotted — extended trend",
    },
  ];

  return (
    <>
      <div className="animate-fade-in-up opacity-0 glass-card-static p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.flag}</span>
          <div>
            <h3 className="text-xl font-bold text-slate-100">
              {meta.name}{" "}
              <span className="text-sm font-normal text-slate-500">
                — 30-Day Forecast
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{meta.reason}</p>
          </div>
        </div>
        <ConfidenceTag tag={meta.tag} color={meta.tag_color} size="md" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "30d Avg PM2.5", value: `${stats.avg.toFixed(1)}`, unit: "µg/m³" },
          { label: "Min Recorded", value: `${stats.min.toFixed(1)}`, unit: "µg/m³" },
          { label: "Max Recorded", value: `${stats.max.toFixed(1)}`, unit: "µg/m³" },
          { label: "Avg Confidence", value: `${stats.avgConfidence.toFixed(0)}`, unit: "%" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.02] rounded-lg px-3 py-2.5 border border-white/[0.04]"
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              {s.label}
            </p>
            <p className="text-lg font-bold text-slate-200 mt-0.5">
              {s.value}
              <span className="text-[10px] text-slate-500 font-normal ml-1">
                {s.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72 sm:h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-7d-${code}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4fb8b0" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#4fb8b0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`grad-range-${code}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
              tickLine={false}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={40}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Smart Background Banding */}
            {EPA_BREAKPOINTS.filter(bp => {
              // Only render band if it overlaps with the actual data range on the chart
              const overlapMin = Math.max(bp.cLow, stats.min);
              const overlapMax = Math.min(bp.cHigh, stats.max);
              return overlapMin <= overlapMax;
            }).map((bp) => (
              <ReferenceArea
                key={bp.category}
                y1={bp.cLow}
                y2={bp.cHigh >= 500 ? undefined : bp.cHigh}
                fill={bp.hex}
                fillOpacity={0.05}
                strokeOpacity={0}
              />
            ))}

            {/* Confidence range band */}
            <Area
              type="monotone"
              dataKey="range"
              stroke="none"
              fill={`url(#grad-range-${code})`}
              fillOpacity={1}
              isAnimationActive={true}
              animationDuration={1200}
            />

            {/* Reference lines for zone boundaries */}
            {chartData.length > 7 && (
              <ReferenceLine
                x={chartData[6]?.shortDate}
                stroke="rgba(79,184,176,0.15)"
                strokeDasharray="4 4"
                label=""
              />
            )}
            {chartData.length > 15 && (
              <ReferenceLine
                x={chartData[14]?.shortDate}
                stroke="rgba(212,162,76,0.15)"
                strokeDasharray="4 4"
                label=""
              />
            )}

            {/* Mean line */}
            <Area
              type="monotone"
              dataKey="mean"
              stroke="#4fb8b0"
              strokeWidth={1.5}
              fill={`url(#grad-7d-${code})`}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "#4fb8b0",
                strokeWidth: 2,
                fill: "var(--bg-primary)",
              }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zone legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {zoneInfo.map((z) => (
          <div
            key={z.label}
            className={`${z.bg} ${z.border} border rounded-lg px-3 py-2.5`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-2 h-0.5 ${z.barColor} rounded-full`} />
              <span className={`text-xs font-semibold ${z.color}`}>{z.label}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {z.style} · {z.desc}
            </p>
          </div>
        ))}
      </div>
      </div>

      {/* Day-by-day prediction cards — rendered OUTSIDE the chart card */}
      <PredictionCalendar forecast={forecast} countryCode={code} />
    </>
  );
}
