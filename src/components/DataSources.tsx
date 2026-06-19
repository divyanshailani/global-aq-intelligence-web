"use client";

import React from "react";

const sources = [
  {
    name: "U.S. EPA AQS",
    country: "United States",
    flag: "🇺🇸",
    description: "Reference-grade air quality monitoring stations",
    url: "https://www.epa.gov/aqs",
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/20",
  },
  {
    name: "CPCB",
    country: "India",
    flag: "🇮🇳",
    description: "Central Pollution Control Board continuous monitoring",
    url: "https://cpcb.nic.in",
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/20",
  },
  {
    name: "DEFRA AURN",
    country: "United Kingdom",
    flag: "🇬🇧",
    description: "Automatic Urban & Rural Network sensors",
    url: "https://uk-air.defra.gov.uk",
    color: "from-red-500/20 to-red-600/10",
    borderColor: "border-red-500/20",
  },
  {
    name: "NSW EPA",
    country: "Australia",
    flag: "🇦🇺",
    description: "New South Wales Environment Protection Authority",
    url: "https://www.epa.nsw.gov.au",
    color: "from-yellow-500/20 to-yellow-600/10",
    borderColor: "border-yellow-500/20",
  },
  {
    name: "OpenAQ",
    country: "Global",
    flag: "🌐",
    description: "Open-source platform aggregating air quality data worldwide",
    url: "https://openaq.org",
    color: "from-violet-500/20 to-violet-600/10",
    borderColor: "border-violet-500/20",
  },
  {
    name: "NASA FIRMS",
    country: "Global",
    flag: "🛰️",
    description: "Fire Information for Resource Management — wildfire & smoke emissions via satellite",
    url: "https://firms.modaps.eosdis.nasa.gov",
    color: "from-rose-500/20 to-orange-600/10",
    borderColor: "border-rose-500/20",
  },
  {
    name: "Open-Meteo",
    country: "Global",
    flag: "🌤️",
    description: "Provides historical ERA5 satellite data and live 16-day meteorological forecasts powering the thermodynamics engine.",
    url: "https://open-meteo.com/",
    color: "from-teal-500/20 to-teal-600/10",
    borderColor: "border-teal-500/20",
  },
];

export default function DataSources() {
  return (
    <section id="sources" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400/70 mb-3">
            Transparent Sourcing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
            Data Sources
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Every prediction is grounded in reference-grade measurements from
            government agencies and open data platforms.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group glass-card p-5 flex items-start gap-4 hover:border-white/[0.12] transition-all duration-300`}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${src.color} border ${src.borderColor} flex items-center justify-center shrink-0`}
              >
                <span className="text-lg">{src.flag}</span>
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {src.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {src.country}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {src.description}
                </p>
              </div>

              {/* External link icon */}
              <svg
                className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
