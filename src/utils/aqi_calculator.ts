export interface AQIResult {
  aqi: number;
  category: string;
  colorClass: string;
  hex: string;
}

// US EPA AQI Breakpoints for PM2.5 (µg/m³)
export const EPA_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50, category: "Good", colorClass: "text-[#4fb8b0]", hex: "#4fb8b0" }, // Using theme teal for "Good"
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100, category: "Moderate", colorClass: "text-[#eab308]", hex: "#eab308" }, // Yellow
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150, category: "Unhealthy (SG)", colorClass: "text-[#f97316]", hex: "#f97316" }, // Orange
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200, category: "Unhealthy", colorClass: "text-[#ef4444]", hex: "#ef4444" }, // Red
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300, category: "Very Unhealthy", colorClass: "text-[#a855f7]", hex: "#a855f7" }, // Purple
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400, category: "Hazardous", colorClass: "text-[#881337]", hex: "#881337" }, // Maroon
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500, category: "Hazardous", colorClass: "text-[#881337]", hex: "#881337" },
];

/**
 * Calculates the US EPA AQI from raw PM2.5 using piecewise linear interpolation.
 */
export function calculateAQI(pm25: number): AQIResult {
  // Truncate PM2.5 to 1 decimal place as per EPA standard
  const c = Math.floor(pm25 * 10) / 10;

  // Find the correct breakpoint bucket
  let bp = EPA_BREAKPOINTS[EPA_BREAKPOINTS.length - 1]; // Default to max
  for (const bucket of EPA_BREAKPOINTS) {
    if (c >= bucket.cLow && c <= bucket.cHigh) {
      bp = bucket;
      break;
    }
  }

  // If PM2.5 is astronomically high (beyond EPA table), clamp to the top bucket logic
  if (c > 500.4) {
    return {
      aqi: 500,
      category: "Hazardous",
      colorClass: bp.colorClass,
      hex: bp.hex
    };
  }

  // Piecewise Linear Interpolation Formula
  const aqiRaw = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow;
  const aqi = Math.round(aqiRaw);

  return {
    aqi,
    category: bp.category,
    colorClass: bp.colorClass,
    hex: bp.hex
  };
}

/**
 * Geopolitical AQI translation based on local air quality standards.
 */
export function getLocalAQIContext(pm25: number, countryCode: string): string {
  const c = Math.round(pm25);

  switch (countryCode) {
    case "IN":
      // India NAQI (24-hr PM2.5)
      if (c <= 30) return "NAQI: Good";
      if (c <= 60) return "NAQI: Satisfactory";
      if (c <= 90) return "NAQI: Moderate";
      if (c <= 120) return "NAQI: Poor";
      if (c <= 250) return "NAQI: Very Poor";
      return "NAQI: Severe";

    case "GB":
      // UK DAQI (PM2.5)
      if (c <= 35) return "DAQI: Low";
      if (c <= 53) return "DAQI: Moderate";
      if (c <= 70) return "DAQI: High";
      return "DAQI: Very High";

    case "AU":
      // Australia NEPM (PM2.5)
      if (c <= 8) return "NEPM: Very Good";
      if (c <= 25) return "NEPM: Good";
      if (c <= 40) return "NEPM: Fair";
      if (c <= 100) return "NEPM: Poor";
      return "NEPM: Very Poor";

    case "US":
    default:
      // US EPA is our global benchmark, return the EPA category
      return `US EPA: ${calculateAQI(pm25).category}`;
  }
}
