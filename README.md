# Global AQ Intelligence — Frontend

> Next.js frontend for the Global AQ Intelligence platform. Renders 30-day PM2.5 forecasts for India, USA, UK, and Australia with confidence zones, EPA AQI coloring, and weather context.

**Live:** [global-aq-intelligence.vercel.app](https://global-aq-intelligence.vercel.app)

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Recharts

**Backend pipeline:** [global-aq-intelligence-pipeline](https://github.com/divyanshailani/global-aq-intelligence-pipeline)

---

## How It Works

This frontend has zero runtime dependencies on the backend. Data is pre-generated static JSON served from `public/data/`.

```
Backend pipeline runs daily
  └── predict_pipeline.py generates forecasts
       └── exports to data/site_data/
            └── auto-syncs to global-aq-intelligence/public/data/
                 └── Vercel deploys on git push
                      └── user sees fresh forecasts
```

This makes the frontend blazingly fast (fully edge-cached), immune to backend downtime, and trivially deployable.

---

## Data Format

The backend writes 6 JSON files that this app reads:

| File | Contents |
|------|----------|
| `predictions_IN.json` | India 30-day station forecasts |
| `predictions_US.json` | USA 30-day station forecasts |
| `predictions_GB.json` | UK 30-day station forecasts |
| `predictions_AU.json` | Australia 30-day station forecasts |
| `model_meta.json` | Per-country model metadata, confidence tags, R² |
| `accuracy.json` | Backtest metrics, training scores, confidence explanations |

Each `ForecastPoint` includes `mean_pm25`, `min_pm25`, `max_pm25`, `confidence_pct`, `horizon_days`, and `weather_context` (temp, wind, precip).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   └── page.tsx               # Data fetching + component composition
├── components/
│   ├── Hero.tsx               # Above-fold intro
│   ├── CountryCard.tsx        # Sparkline + EPA AQI + weather pill
│   ├── ForecastDetail.tsx     # Expanded 30-day area chart + zone legend
│   ├── PredictionTimeline.tsx # Day-by-day card grid
│   ├── AccuracyProof.tsx      # R² bar chart + leakage prevention methodology
│   ├── DataSources.tsx        # API attribution
│   ├── ConfidenceTag.tsx      # Reusable confidence badge
│   └── Footer.tsx
├── types/
│   └── index.ts               # TypeScript interfaces for all JSON shapes
└── utils/
    └── aqi_calculator.ts      # EPA AQI breakpoints, category colors, local context
```

---

## Key Components

**`CountryCard`** — per-country summary card with:
- 7-day recharts sparkline colored by AQI category
- US EPA AQI score computed client-side from mean PM2.5
- Wind and temperature weather pills from forecast data
- R² score shown inline

**`ForecastDetail`** — expands on card click with:
- 30-day area chart with confidence range band
- EPA AQI `ReferenceArea` background bands (only zones overlapping actual data range)
- Zone reference lines at day 7 and 15
- Custom tooltip showing mean, range, confidence %, stations, weather context
- Zone legend (Days 1–7 / 8–15 / 16–30) with confidence descriptions

**`AccuracyProof`** — model validation section with:
- Horizontal bar chart of per-country test R²
- Data leakage prevention methodology
- Confidence horizon decay explanation pulled from `accuracy.json`

---

## Running Locally

```bash
git clone https://github.com/divyanshailani/global-aq-intelligence-web
cd global-aq-intelligence-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `public/data/` JSONs are already committed so the app renders with real data immediately without needing the backend pipeline running.

**To get fresh forecasts:** run `python3 scripts/predict_pipeline.py` from the backend repo. It auto-syncs the JSONs here.

---

## Deployment

Vercel — push to `main`, Vercel picks it up automatically. No build environment variables required since there is no API layer.

```bash
git add public/data/
git commit -m "data: update forecasts YYYY-MM-DD"
git push origin main
```

---

## Confidence Zones

| Zone | Days | Source | Reliability |
|------|------|--------|-------------|
| High | 1–7 | V7 direct model (h1) + weather interpolation | Direct GBR output |
| Medium | 8–15 | Interpolated between h7 and h14 anchors | Weather-weighted |
| Low | 16–30 | Interpolated between h14 and h30 anchors | Directional trend only |
