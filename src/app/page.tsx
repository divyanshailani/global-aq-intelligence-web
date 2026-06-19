"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import CountryCard from "@/components/CountryCard";
import ForecastDetail from "@/components/ForecastDetail";
import AccuracyProof from "@/components/AccuracyProof";
import DataSources from "@/components/DataSources";
import Footer from "@/components/Footer";
import type {
  ModelMetaJSON,
  AccuracyJSON,
  PredictionJSON,
  CountryCode,
} from "@/types";

const COUNTRY_ORDER: CountryCode[] = ["US", "IN", "AU", "GB"];

export default function Home() {
  const [modelMeta, setModelMeta] = useState<ModelMetaJSON | null>(null);
  const [accuracy, setAccuracy] = useState<AccuracyJSON | null>(null);
  const [predictions, setPredictions] = useState<
    Record<string, PredictionJSON>
  >({});
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metaRes, accRes, inRes, usRes, gbRes, auRes] = await Promise.all(
          [
            fetch("/data/model_meta.json"),
            fetch("/data/accuracy.json"),
            fetch("/data/predictions_IN.json"),
            fetch("/data/predictions_US.json"),
            fetch("/data/predictions_GB.json"),
            fetch("/data/predictions_AU.json"),
          ]
        );

        const [meta, acc, inData, usData, gbData, auData] = await Promise.all([
          metaRes.json() as Promise<ModelMetaJSON>,
          accRes.json() as Promise<AccuracyJSON>,
          inRes.json() as Promise<PredictionJSON>,
          usRes.json() as Promise<PredictionJSON>,
          gbRes.json() as Promise<PredictionJSON>,
          auRes.json() as Promise<PredictionJSON>,
        ]);

        setModelMeta(meta);
        setAccuracy(acc);
        setPredictions({
          IN: inData,
          US: usData,
          GB: gbData,
          AU: auData,
        });
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCardClick = (code: CountryCode) => {
    setSelectedCountry(selectedCountry === code ? null : code);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ambient-bg">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse">
            Loading forecast data...
          </p>
        </div>
      </div>
    );
  }

  if (!modelMeta || !accuracy) {
    return (
      <div className="min-h-screen flex items-center justify-center ambient-bg">
        <p className="text-sm text-rose-400">Failed to load data.</p>
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <Hero />

      {/* Country Forecasts */}
      <section id="forecasts" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400/70 mb-3">
              Real-Time Predictions
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
              Country Forecasts
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Click any country card to expand its 30-day PM2.5 forecast with
              confidence bands and zone breakdowns.
            </p>
          </div>

          {/* Country cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {COUNTRY_ORDER.map((code) => {
              const meta = modelMeta.countries[code];
              const pred = predictions[code];
              if (!meta || !pred) return null;
              return (
                <CountryCard
                  key={code}
                  code={code}
                  meta={meta}
                  forecast={pred.forecast}
                  onClick={() => handleCardClick(code)}
                  isSelected={selectedCountry === code}
                />
              );
            })}
          </div>

          {/* Expanded forecast detail */}
          {selectedCountry && predictions[selectedCountry] && (
            <div className="space-y-5">
              <ForecastDetail
                code={selectedCountry}
                meta={modelMeta.countries[selectedCountry]}
                forecast={predictions[selectedCountry].forecast}
              />
            </div>
          )}
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* Accuracy Proof */}
      <AccuracyProof accuracy={accuracy} modelMeta={modelMeta} />

      {/* Section divider */}
      <div className="section-divider mx-auto max-w-4xl" />

      {/* Data Sources */}
      <DataSources />

      {/* Footer */}
      <Footer />
    </main>
  );
}
