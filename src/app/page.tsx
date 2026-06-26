"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Hero from "@/components/Hero";
import CountryCard from "@/components/CountryCard";
import ForecastDetail from "@/components/ForecastDetail";
import AccuracyProof from "@/components/AccuracyProof";
import DataSources from "@/components/DataSources";
import Footer from "@/components/Footer";
import type { ModelMetaJSON, AccuracyJSON, PredictionJSON, CountryCode } from "@/types";

const COUNTRY_ORDER: CountryCode[] = ["US", "IN", "AU", "GB"];

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "light";
    setTheme(currentTheme);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  if (!theme) return <div style={{ width: 28, height: 28 }} />; // placeholder

  return (
    <button onClick={toggle} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "28px", height: "28px", borderRadius: "6px",
      background: "var(--surface-raised)", border: "1px solid var(--border)",
      color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s"
    }}
      onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
      aria-label="Toggle Dark Mode"
    >
      {theme === "light" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>
      )}
    </button>
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header className="resp-px" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: "50px",
      background: scrolled ? "var(--nav-bg)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "background 0.25s, border-color 0.25s, backdrop-filter 0.25s",
      display: "flex", alignItems: "center", padding: "0 56px",
    }}>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
        Global AQ Intelligence
      </span>
      <div style={{ flex: 1 }} />
      <nav className="resp-nav-links" style={{ display: "flex", gap: "28px" }}>
        {(["Forecasts", "Validation", "Data Sources"] as const).map(label => (
          <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`}
            style={{ fontSize: "13px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            {label}
          </a>
        ))}
        <a href="https://github.com/divyanshailani" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "13px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          GitHub ↗
        </a>
        <div style={{ width: "1px", height: "14px", background: "var(--border)", margin: "auto 0" }} />
        <ThemeToggle />
      </nav>
    </header>
  );
}

// ── Model feature card ───────────────────────────────────────────────────
function ModelCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card hover-lift" style={{ padding: "20px 22px" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "6px", marginBottom: "12px",
        background: "var(--surface-raised)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
      }}>
        {icon}
      </div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "5px", fontFamily: "'Inter', sans-serif" }}>
        {title}
      </p>
      <p style={{ fontSize: "11.5px", color: "var(--text-3)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
        {desc}
      </p>
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, subtitle, maxWidth = 560 }: { eyebrow: string; title: string; subtitle: string; maxWidth?: number }) {
  return (
    <div style={{ marginBottom: "36px" }}>
      <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginBottom: "6px" }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: "26px", fontWeight: 400, letterSpacing: "-0.02em", color: "var(--text-1)", fontFamily: "'Outfit', 'Inter', sans-serif", marginBottom: "10px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: `${maxWidth}px` }}>
        {subtitle}
      </p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [modelMeta, setModelMeta] = useState<ModelMetaJSON | null>(null);
  const [accuracy, setAccuracy] = useState<AccuracyJSON | null>(null);
  const [predictions, setPredictions] = useState<Record<string, PredictionJSON>>({});
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [forecastKey, setForecastKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const forecastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [metaRes, accRes, inRes, usRes, gbRes, auRes] = await Promise.all([
          fetch("/data/model_meta.json"), fetch("/data/accuracy.json"),
          fetch("/data/predictions_IN.json"), fetch("/data/predictions_US.json"),
          fetch("/data/predictions_GB.json"), fetch("/data/predictions_AU.json"),
        ]);
        const [meta, acc, inD, usD, gbD, auD] = await Promise.all([
          metaRes.json(), accRes.json(), inRes.json(), usRes.json(), gbRes.json(), auRes.json(),
        ]);
        setModelMeta(meta); setAccuracy(acc);
        setPredictions({ IN: inD, US: usD, GB: gbD, AU: auD });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  function handleSelect(code: CountryCode) {
    const next = selectedCountry === code ? null : code;
    setSelectedCountry(next);
    setForecastKey(k => k + 1);
    if (next) {
      setTimeout(() => forecastRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }

  const lastRun = useMemo(() => accuracy?.last_pipeline_run || accuracy?.generated_at, [accuracy]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "18px", height: "18px", margin: "0 auto 12px", border: "1.5px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>Loading…</p>
        </div>
      </div>
    );
  }
  if (!modelMeta || !accuracy) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--aqi-unhealthy)", fontFamily: "'Inter', sans-serif" }}>Failed to load data.</p>
      </div>
    );
  }

  const isOpen = selectedCountry !== null;

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{ paddingTop: "50px" }}>
        <Hero lastPipelineRun={lastRun} />
      </div>

      {/* ── FORECASTS SECTION ── */}
      <section id="forecasts" ref={forecastRef} className="resp-px resp-py-sec" style={{ padding: "64px 56px 80px" }}>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
            Forecasts
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>
            {isOpen ? "Click a country to switch · Click again to collapse" : "Click any card to view its full 30-day PM2.5 forecast"}
          </p>
        </div>

        {/* ── 4 COUNTRY CARDS (Horizontal Grid) ── */}
        <div
          className="animate-fade-in"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}
        >
          {COUNTRY_ORDER.map(code => {
            const pred = predictions[code];
            const meta = modelMeta.countries[code];
            if (!meta || !pred) return null;
            return (
              <CountryCard
                key={code} code={code} meta={meta} forecast={pred.forecast}
                onClick={() => handleSelect(code)}
                isSelected={selectedCountry === code}
                stacked={false}
              />
            );
          })}
        </div>

        {/* ── EXPANDED FORECAST (Below) ── */}
        {selectedCountry && predictions[selectedCountry] && (
          <div key={forecastKey} className="animate-fade-in" style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "32px" }}>
            <ForecastDetail
              code={selectedCountry}
              meta={modelMeta.countries[selectedCountry]}
              forecast={predictions[selectedCountry].forecast}
            />
          </div>
        )}
      </section>

      {/* ── MODEL VALIDATION ── */}
      <section id="validation" className="resp-px resp-py-sec" style={{ padding: "64px 56px 80px", borderTop: "1px solid var(--border)" }}>
        <SectionHead
          eyebrow="Model Validation"
          title="How the models work"
          subtitle="Gradient-boosted per-country models on temporally held-out test data. No future feature leakage. Metrics reflect real-world performance."
        />

        {/* 4 explanation cards */}
        <div className="resp-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "36px" }}>
          <ModelCard title="Temporal Split"
            desc="Test data is always from a future period never seen during training."
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V12M12 12L4 7M12 12L20 7M4 7V17L12 22M20 7V17L12 22"/></svg>}
          />
          <ModelCard title="Gradient Boosting"
            desc="XGBoost with lag t-1 to t-7, rolling averages, ERA5 weather covariates per station."
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <ModelCard title="Horizon Anchors"
            desc="Direct predictions at 1, 7, 15, 30 days. Intermediate days weather-interpolated."
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <ModelCard title="Confidence Decay"
            desc="7-day: highest confidence. 15-day: medium. 30-day: directional trend only."
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>}
          />
        </div>

        {/* AccuracyProof has its own header — pass directly */}
        <AccuracyProof accuracy={accuracy} modelMeta={modelMeta} />
      </section>

      {/* ── DATA SOURCES ── */}
      <section id="data-sources" className="resp-px resp-py-sec" style={{ padding: "64px 56px 80px", borderTop: "1px solid var(--border)" }}>
        <SectionHead
          eyebrow="Transparent Sourcing"
          title="Data Sources"
          subtitle="Every prediction is grounded in reference-grade measurements from government agencies and open data platforms."
        />
        <DataSources />
      </section>

      <Footer />
    </>
  );
}
