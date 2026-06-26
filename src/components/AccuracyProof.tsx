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
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "12px",
      minWidth: "140px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "8px", fontFamily: "'Inter', sans-serif" }}>
        {d.name}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>Accuracy</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif" }}>{d.accuracy_percentage.toFixed(1)}%</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>MAE</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif" }}>{d.mae.toFixed(2)} µg/m³</span>
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
    <div id="accuracy">
      {/* Validation banner */}
      <div style={{ marginBottom: "24px" }}>
        {live_validation_count === 0 ? (
          <span style={{ fontSize: "11px", color: "var(--text-3)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "999px", padding: "4px 12px", fontFamily: "'Inter', sans-serif" }}>
            Pending Live Validation (0 Days) · Displaying strict temporal holdout backtest
          </span>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(76,175,130,0.08)", border: "1px solid rgba(76,175,130,0.18)", borderRadius: "999px", padding: "4px 12px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--aqi-good)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "11px", color: "var(--aqi-good)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              Live Validated · {live_validation_count} days of real-world production data
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "32px" }}>
          {/* Left — R² Chart */}
          <div className="card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
              Test R² Score by Country
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginBottom: "32px" }}>
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
                    axisLine={{ stroke: "var(--border)" }}
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
            <div className="resp-grid-2" style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {chartData.map((d) => (
                <div
                  key={d.country}
                  className="hover-lift cursor-pointer"
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  <span style={{ fontSize: "18px" }}>{d.flag}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "11px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", margin: 0 }}>
                      Acc {d.accuracy_percentage.toFixed(1)}% · MAE {d.mae.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Leak Prevention */}
          <div className="card" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
              How We Prevent Data Leakage
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginBottom: "32px" }}>
              Every step is designed to ensure the model can&apos;t cheat — these
              metrics reflect real-world performance.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {leakPreventionSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0, background: "var(--surface-raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence explanation */}
            <div style={{ marginTop: "32px", padding: "20px", borderRadius: "8px", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
                Confidence Horizon Decay
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ width: "48px", color: "var(--aqi-good)", fontWeight: 600, flexShrink: 0 }}>7-Day</span>
                  <span style={{ color: "var(--text-2)" }}>{accuracy.confidence_explanation["7_day"]}</span>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ width: "48px", color: "var(--aqi-moderate)", fontWeight: 600, flexShrink: 0 }}>15-Day</span>
                  <span style={{ color: "var(--text-2)" }}>{accuracy.confidence_explanation["15_day"]}</span>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <span style={{ width: "48px", color: "var(--aqi-unhealthy)", fontWeight: 600, flexShrink: 0 }}>30-Day</span>
                  <span style={{ color: "var(--text-2)" }}>{accuracy.confidence_explanation["30_day"]}</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
