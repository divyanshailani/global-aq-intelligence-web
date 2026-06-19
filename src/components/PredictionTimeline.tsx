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
  date: Date;
  pm25: number;
  min: number;
  max: number;
  horizon: number;
  confidencePct: number;
  stations: number;
  isToday: boolean;
  isTomorrow: boolean;
  weekday: string;
  monthDay: string;
}



function confZone(h: number) {
  if (h <= 7) return { label: "High", color: "text-slate-300", dot: "bg-slate-300" };
  if (h <= 15) return { label: "Medium", color: "text-slate-400", dot: "bg-slate-400" };
  return { label: "Low", color: "text-slate-500", dot: "bg-slate-500" };
}

/* shared day-cell renderer */
function DayCell({ d }: { d: DayData; maxPm: number }) {
  const aqi = calculateAQI(d.pm25);
  return (
    <div
      className={`rounded-lg p-2 sm:p-3 text-center transition-all duration-300 cursor-default
        border hover:border-white/[0.10] flex flex-col justify-between h-full
        ${d.isToday ? "border-[#4fb8b0]/25 bg-[#4fb8b0]/[0.06]" :
          d.isTomorrow ? "border-[#8b7eb8]/25 bg-[#8b7eb8]/[0.06]" :
          "border-white/[0.04] bg-white/[0.02]"}
      `}
      style={{ borderBottomWidth: '3px', borderBottomColor: aqi.hex }}
    >
      <div>
        <p className={`text-[10px] font-semibold mb-0.5 ${d.isToday ? "text-[#4fb8b0]" : d.isTomorrow ? "text-[#8b7eb8]" : "text-slate-500"}`}>
          {d.isToday ? "Today" : d.isTomorrow ? "Tmw" : d.weekday}
        </p>
        <p className="text-[9px] text-slate-600 mb-1 hidden sm:block">{d.monthDay}</p>
      </div>
      <div className="mt-1">
        <p className={`text-xl sm:text-2xl font-black ${aqi.colorClass}`}>{aqi.aqi}</p>
        <p className="text-[9px] text-slate-500 mt-0.5 font-medium">{d.pm25.toFixed(1)} µg/m³</p>
      </div>
    </div>
  );
}

export default function PredictionCalendar({ forecast }: Props) {
  const days: DayData[] = useMemo(() => {
    const dateMap = new Map<string, ForecastPoint>();
    const sorted = [...forecast].sort(
      (a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );
    for (const pt of sorted) {
      const existing = dateMap.get(pt.target_date);
      if (!existing || pt.stations >= existing.stations) {
        dateMap.set(pt.target_date, pt);
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tmw = new Date(today);
    tmw.setDate(tmw.getDate() + 1);

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
      .slice(-30)
      .map(pt => {
        const d = new Date(pt.target_date);
        d.setHours(0, 0, 0, 0);
        return {
          dateStr: pt.target_date,
          date: d,
          pm25: pt.mean_pm25,
          min: pt.min_pm25,
          max: pt.max_pm25,
          horizon: pt.horizon_days,
          confidencePct: pt.confidence_pct,
          stations: pt.stations,
          isToday: d.getTime() === today.getTime(),
          isTomorrow: d.getTime() === tmw.getTime(),
          weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
          monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
      });
  }, [forecast]);

  if (days.length === 0) return null;

  const tomorrow = days.find(d => d.isTomorrow) || days.find(d => d.horizon === 1) || days[0];
  const weekDays = days.filter(d => d.horizon >= 1 && d.horizon <= 7);
  const week2 = days.filter(d => d.horizon >= 8 && d.horizon <= 15);
  const week3plus = days.filter(d => d.horizon >= 16);
  const maxPm = Math.max(...days.map(d => d.pm25), 1);

  const aqiWeek1 = calculateAQI(weekDays.length > 0 ? Math.max(...weekDays.map(d => d.pm25)) : 0);
  const aqiWeek2 = calculateAQI(week2.length > 0 ? Math.max(...week2.map(d => d.pm25)) : 0);
  const aqiWeek3 = calculateAQI(week3plus.length > 0 ? Math.max(...week3plus.map(d => d.pm25)) : 0);

  return (
    <div className="mt-8 space-y-5">

      {/* ═══ CARD 1: Tomorrow + 7-Day ═══ */}
      <div className="forecast-card p-5 sm:p-6" style={{ borderLeft: `3px solid ${aqiWeek1.hex}` }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${aqiWeek1.hex}1E` }}>
            <svg className="w-4 h-4" style={{ color: aqiWeek1.hex }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">7-Day Forecast</h4>
            <p className="text-[11px] text-slate-500">High confidence · Direct lag features</p>
          </div>
        </div>

        {/* Tomorrow Hero */}
        {(() => {
          const aqi = calculateAQI(tomorrow.pm25);
          return (
            <div className="rounded-lg border border-white/[0.05] p-4 sm:p-5 mb-4 relative overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: aqi.hex }}
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundColor: aqi.hex }}></div>
              <div className="relative flex items-center justify-between z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4fb8b0' }}>
                      {tomorrow.isTomorrow ? "Tomorrow" : `Day ${tomorrow.horizon}`}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${confZone(tomorrow.horizon).color} bg-white/[0.04]`}>
                      <span className={`w-1 h-1 rounded-full ${confZone(tomorrow.horizon).dot}`} />
                      {tomorrow.confidencePct}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{tomorrow.monthDay}</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl sm:text-5xl font-black tracking-tight ${aqi.colorClass}`}>
                    {aqi.aqi}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">{tomorrow.pm25.toFixed(1)} µg/m³ · US EPA {aqi.category}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 7-Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map(d => <DayCell key={d.dateStr} d={d} maxPm={maxPm} />)}
        </div>
      </div>

      {/* ═══ CARD 2: Days 8–15 ═══ */}
      {week2.length > 0 && (
        <div className="forecast-card p-5 sm:p-6" style={{ borderLeft: `3px solid ${aqiWeek2.hex}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${aqiWeek2.hex}1A` }}>
              <svg className="w-3.5 h-3.5" style={{ color: aqiWeek2.hex }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Days 8–15</h4>
              <p className="text-[11px] text-slate-500">Medium confidence · Direct Horizon Anchors + Weather-Weighted Interpolation</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {week2.map(d => <DayCell key={d.dateStr} d={d} maxPm={maxPm} />)}
          </div>
        </div>
      )}

      {/* ═══ CARD 3: Days 16–30 ═══ */}
      {week3plus.length > 0 && (
        <div className="forecast-card p-5 sm:p-6" style={{ borderLeft: `3px solid ${aqiWeek3.hex}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${aqiWeek3.hex}1A` }}>
              <svg className="w-3.5 h-3.5" style={{ color: aqiWeek3.hex }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Days 16–30</h4>
              <p className="text-[11px] text-slate-500">Directional trend · Treat as estimates</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {week3plus.map(d => <DayCell key={d.dateStr} d={d} maxPm={maxPm} />)}
          </div>
        </div>
      )}

    </div>
  );
}
