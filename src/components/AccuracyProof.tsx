"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { AccuracyJSON, ModelMetaJSON } from "@/types";

interface AccuracyProofProps {
  accuracy: AccuracyJSON;
  modelMeta: ModelMetaJSON;
}

const countryColors: Record<string, { bar: string; text: string }> = {
  US: { bar: "#34d399", text: "text-emerald-400" },
  IN: { bar: "#22d3ee", text: "text-cyan-400" },
  AU: { bar: "#60a5fa", text: "text-blue-400" },
  GB: { bar: "#fbbf24", text: "text-amber-400" },
};

function CustomBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { country: string; name: string; accuracy_percentage: number; mae: number } }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card-static p-3 !rounded-lg text-xs min-w-[140px]">
      <p className="text-slate-300 font-semibold mb-1.5">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Accuracy</span>
          <span className="text-slate-200 font-bold">{d.accuracy_percentage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">MAE</span>
          <span className="text-slate-200 font-bold">{d.mae.toFixed(2)} µg/m³</span>
        </div>
      </div>
    </div>
  );
}

export default function AccuracyProof({
  accuracy,
  modelMeta,
}: AccuracyProofProps) {
  const { live_validation_count } = accuracy;

  const chartData = Object.entries(accuracy.training_metrics).map(
    ([code, metrics]) => ({
      country: code,
      name: modelMeta.countries[code]?.name ?? code,
      flag: modelMeta.countries[code]?.flag ?? "",
      accuracy_percentage: metrics.accuracy_percentage,
      mae: metrics.mae,
    })
  );

  // Sort by R² descending
  chartData.sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);

  const leakPreventionSteps = [
    {
      icon: "🔀",
      title: "Temporal Train/Test Split",
      desc: "Strict chronological splitting — test data is always from a future period never seen during training.",
    },
    {
      icon: "🚫",
      title: "No Future Feature Leakage",
      desc: "Only lagged features (t-1, t-2, ...) are used. No same-day or future values leak into training.",
    },
    {
      icon: "📊",
      title: "Chronological Holdout Validation",
      desc: "Model is validated on rolling windows that simulate real deployment conditions.",
    },
    {
      icon: "🔗",
      title: "Direct Horizon Anchors + Weather-Weighted Interpolation",
      desc: "Anchor horizons are predicted directly; intermediate days are interpolated with weather context.",
    },
  ];

  return (
    <section id="accuracy" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400/70 mb-3">
            Model Validation
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Accuracy Proof
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Rigorous evaluation metrics and data leakage prevention — because
            trustworthy forecasts demand transparent validation.
          </p>
          <div className="mt-6 flex justify-center">
            {live_validation_count === 0 ? (
              <span className="text-xs text-slate-500/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                Pending Live Validation (0 Days) - Displaying strict temporal holdout backtest.
              </span>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 text-emerald-400 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="h-2 w-2 rounded-full animate-pulse bg-green-500"></div>
                Live Validated on {live_validation_count} days of real-world production data.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — R² Chart */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              Test R² Score by Country
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Higher is better (1.0 = perfect). Evaluated on held-out future data.
            </p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={false} />
                  <Bar
                    dataKey="accuracy_percentage"
                    radius={[0, 6, 6, 0]}
                    barSize={28}
                    isAnimationActive={true}
                    animationDuration={1500}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.country}
                        fill={countryColors[entry.country]?.bar ?? "#94a3b8"}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric pills */}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {chartData.map((d) => (
                <div
                  key={d.country}
                  className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]"
                >
                  <span className="text-base">{d.flag}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 truncate">{d.name}</p>
                    <p
                      className={`text-xs font-bold ${countryColors[d.country]?.text ?? "text-slate-300"}`}
                    >
                      Accuracy {d.accuracy_percentage.toFixed(1)}% · MAE {d.mae.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Leak Prevention */}
          <div className="glass-card-static p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              How We Prevent Data Leakage
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Every step is designed to ensure the model can&apos;t cheat — these
              metrics reflect real-world performance.
            </p>

            <div className="space-y-4">
              {leakPreventionSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-0.5">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence explanation */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/[0.04] to-violet-500/[0.04] border border-cyan-500/10">
              <h4 className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                Confidence Horizon Decay
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="w-14 text-emerald-400 font-semibold shrink-0">
                    7-Day
                  </span>
                  <span className="text-slate-400">
                    {accuracy.confidence_explanation["7_day"]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-14 text-amber-400 font-semibold shrink-0">
                    15-Day
                  </span>
                  <span className="text-slate-400">
                    {accuracy.confidence_explanation["15_day"]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-14 text-rose-400 font-semibold shrink-0">
                    30-Day
                  </span>
                  <span className="text-slate-400">
                    {accuracy.confidence_explanation["30_day"]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
