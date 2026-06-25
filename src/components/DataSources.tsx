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
    <div id="sources">
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {sources.map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover-lift"
              style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "24px", textDecoration: "none" }}
            >
              {/* Icon */}
              <div style={{
                width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0,
                background: "var(--surface-raised)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
              }}>
                {src.flag}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)", fontFamily: "'Inter', sans-serif", margin: 0 }}>
                    {src.name}
                  </h3>
                  <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-3)", fontFamily: "'Inter', sans-serif" }}>
                    {src.country}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", margin: 0 }}>
                  {src.description}
                </p>
              </div>

              {/* External link icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ marginTop: "4px", flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
      </div>
    </div>
  );
}
