"use client";
import React, { useState, useEffect } from "react";

function useCounter(endValue: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);
  
  return count;
}

function StatItem({ v, l, i }: { v: string, l: string, i: number }) {
  let target = 0;
  let suffix = "";
  
  if (v === "4") { target = 4; }
  else if (v === "2,000+") { target = 2000; suffix = "+"; }
  else if (v === "3.3M") { target = 33; suffix = "M"; } 
  else if (v === "30d") { target = 30; suffix = "d"; }

  const count = useCounter(target, 2000 + (i * 300));

  let display = count.toString();
  if (v === "3.3M") {
    display = (count / 10).toFixed(1);
  } else if (v === "2,000+") {
    display = count.toLocaleString("en-US");
  }

  return (
    <div style={{
      padding: "14px 24px",
      borderRight: i < 3 ? "1px solid var(--border)" : "none",
      textAlign: "center",
    }}>
      <p className="tabular-nums" style={{
        fontSize: "20px", fontWeight: 500, letterSpacing: "-0.02em",
        color: "var(--text-1)", lineHeight: 1,
        fontFamily: "'Outfit', monospace", marginBottom: "3px",
      }}>
        {display}{suffix}
      </p>
      <p style={{
        fontSize: "9px", fontWeight: 500, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--text-3)", fontFamily: "'Inter', sans-serif",
      }}>
        {l}
      </p>
    </div>
  );
}

function StepCard({ n, icon, title, desc, delay }: { n: string; icon: React.ReactNode; title: string; desc: string; delay: string }) {
  return (
    <div className="step-card animate-fade-in" style={{ flex: "1 1 0", minWidth: "180px", animationDelay: delay, opacity: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
          background: "var(--surface-raised)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)",
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "9px", fontWeight: 500, color: "var(--text-3)",
          fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          Step {n}
        </span>
      </div>
      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)", marginBottom: "5px", fontFamily: "'Inter', sans-serif" }}>
        {title}
      </p>
      <p style={{ fontSize: "11.5px", color: "var(--text-3)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
        {desc}
      </p>
    </div>
  );
}

export default function Hero({ lastPipelineRun }: { lastPipelineRun?: string }) {
  let isStale = false;
  let formattedDate = "";
  if (lastPipelineRun) {
    const d = new Date(lastPipelineRun);
    formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    isStale = (Date.now() - d.getTime()) > 86400000;
  }

  return (
    <section style={{ padding: "56px 56px 64px", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>

      {/* Decorative Background Element: Left (Particulate Cluster) */}
      <div style={{ position: "absolute", left: "-5%", top: "5%", zIndex: 0, opacity: 0.6, animation: "spin 90s linear infinite", pointerEvents: "none" }}>
        <svg width="280" height="280" viewBox="0 0 100 100" fill="none" stroke="var(--border)" strokeWidth="0.5">
          <circle cx="50" cy="50" r="35" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="22" stroke="var(--border)" fill="rgba(234, 227, 209, 0.1)" />
          {/* Nodes */}
          <circle cx="50" cy="15" r="5" fill="var(--surface-raised)" stroke="var(--border)" />
          <circle cx="85" cy="50" r="7" fill="var(--surface-raised)" stroke="var(--border)" />
          <circle cx="25" cy="75" r="6" fill="var(--surface-raised)" stroke="var(--border)" />
          <circle cx="68" cy="80" r="4" fill="var(--surface-raised)" stroke="var(--border)" />
          <circle cx="20" cy="35" r="5" fill="var(--surface-raised)" stroke="var(--border)" />
          {/* Connecting lines */}
          <line x1="50" y1="20" x2="50" y2="28" />
          <line x1="78" y1="50" x2="72" y2="50" />
          <line x1="29" y1="71" x2="35" y2="65" />
        </svg>
      </div>

      {/* Decorative Background Element: Right (Atmospheric Rings) */}
      <div style={{ position: "absolute", right: "-8%", top: "35%", zIndex: 0, opacity: 0.5, animation: "spin 120s linear infinite reverse", pointerEvents: "none" }}>
        <svg width="320" height="320" viewBox="0 0 100 100" fill="none" stroke="var(--border)" strokeWidth="0.5">
          <ellipse cx="50" cy="50" rx="45" ry="12" transform="rotate(30 50 50)" />
          <ellipse cx="50" cy="50" rx="45" ry="12" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="45" ry="12" transform="rotate(90 50 50)" />
          <circle cx="50" cy="50" r="10" fill="var(--surface-raised)" stroke="var(--border)" />
          <circle cx="50" cy="50" r="4" fill="var(--border)" />
        </svg>
      </div>

      {/* Centered headline block */}
      <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "center", marginBottom: "56px", position: "relative", zIndex: 1 }}>

        {/* Status pill */}
        {lastPipelineRun && (
          <div className="animate-fade-in" style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "999px", padding: "4px 12px", marginBottom: "24px",
            opacity: 0, animationDelay: "0.1s"
          }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: isStale ? "var(--aqi-moderate)" : "var(--aqi-good)",
              display: "inline-block",
              animation: isStale ? "none" : "pulse-dot 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: "11px", color: "var(--text-2)", fontFamily: "'Inter', sans-serif" }}>
              {isStale ? `Data as of ${formattedDate}` : `Updated ${formattedDate}`}
            </span>
          </div>
        )}

        {/* Headline — Outfit weight 300 */}
        <h1 className="animate-text-reveal" style={{
          fontSize: "clamp(38px, 4.8vw, 58px)",
          fontWeight: 300,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
          color: "var(--text-1)",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          marginBottom: "18px",
          opacity: 0, animationDelay: "0.15s"
        }}>
          Global Air Quality<br />
          <span style={{ color: "var(--text-2)", fontWeight: 300 }}>Intelligence</span>
        </h1>

        <p className="animate-fade-in" style={{
          fontSize: "14px", color: "var(--text-3)", lineHeight: 1.72,
          fontFamily: "'Inter', sans-serif", maxWidth: "520px", margin: "0 auto 32px",
          opacity: 0, animationDelay: "0.3s"
        }}>
          Up to 30-day PM2.5 forecasts across 4 countries, powered by gradient-boosted models
          trained on 3.3M+ government monitoring observations.
        </p>

        {/* Inline stat bar */}
        <div className="animate-fade-in" style={{
          display: "inline-flex",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "8px", overflow: "hidden",
          opacity: 0, animationDelay: "0.4s"
        }}>
          {[
            { v: "4",      l: "Countries" },
            { v: "2,000+", l: "Stations" },
            { v: "3.3M",   l: "Observations" },
            { v: "30d",    l: "Horizon" },
          ].map((s, i) => (
            <StatItem key={s.l} v={s.v} l={s.l} i={i} />
          ))}
        </div>
      </div>

      {/* How it works — 4 step cards */}
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <p className="animate-fade-in" style={{
          fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--text-3)",
          fontFamily: "'Inter', sans-serif", textAlign: "center", marginBottom: "20px",
          opacity: 0, animationDelay: "0.6s"
        }}>
          How it works
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <StepCard n="01" title="Sensor Ingestion" delay="0.7s"
            desc="PM2.5 readings collected daily from 2,000+ EPA, CPCB, NSW EPA, and DEFRA stations via OpenAQ."
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>}
          />
          <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", color: "var(--text-3)", fontSize: "16px", flexShrink: 0, paddingBottom: "16px", opacity: 0, animationDelay: "0.8s" }}>→</div>
          <StepCard n="02" title="Feature Engineering" delay="0.8s"
            desc="Lag features t-1 to t-7, rolling averages, ERA5 temperature, wind, precipitation per station."
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", color: "var(--text-3)", fontSize: "16px", flexShrink: 0, paddingBottom: "16px", opacity: 0, animationDelay: "0.9s" }}>→</div>
          <StepCard n="03" title="Gradient Boosted Models" delay="0.9s"
            desc="One XGBoost model per country. Temporal train/test split. Direct horizon anchors at 1, 7, 15, 30d."
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>}
          />
          <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", color: "var(--text-3)", fontSize: "16px", flexShrink: 0, paddingBottom: "16px", opacity: 0, animationDelay: "1.0s" }}>→</div>
          <StepCard n="04" title="30-Day Forecast" delay="1.0s"
            desc="Intermediate days weather-interpolated. AQI via US EPA breakpoints. Confidence decays with horizon."
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
        </div>
      </div>
    </section>
  );
}
