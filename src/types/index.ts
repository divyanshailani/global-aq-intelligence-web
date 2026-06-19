// ─── Data Types for Global AQ Intelligence ───

export interface CountryMeta {
  name: string;
  flag: string;
  confidence: string;
  tag: string;
  tag_color: string;
  reason: string;
  test_r2: number;
  test_mae: number;
  station_count?: number;
  last_data_date?: string;
  forecast_days?: number;
  anchor?: string;
}

export interface ModelMetaJSON {
  generated_at: string;
  model_version: string;
  countries: Record<string, CountryMeta>;
  accuracy: {
    mae: number | null;
    r2: number | null;
    source: string;
    sample_count: number;
    live_validation_count: number;
    note: string;
  };
}

export interface ForecastPoint {
  target_date: string;
  horizon_days: number;
  confidence: string;
  confidence_pct: number;
  mean_pm25: number;
  min_pm25: number;
  max_pm25: number;
  stations: number;
  weather_context?: {
    temp: number;
    wind: number;
    precip: number;
  };
}

export interface PredictionJSON {
  country: string;
  meta: {
    name: string;
    flag: string;
    confidence: string;
    tag: string;
    tag_color: string;
    reason: string;
    test_r2: number;
    test_mae: number;
  };
  generated_at: string;
  last_data_date: string;
  forecast: ForecastPoint[];
  station_count: number;
}

export interface TrainingMetric {
  r2: number;
  mae: number;
}

export interface AccuracyJSON {
  generated_at: string;
  last_pipeline_run?: string;
  mae: number | null;
  r2: number | null;
  source: string;
  sample_count: number;
  live_validation_count: number;
  training_metrics: Record<string, TrainingMetric>;
  confidence_explanation: {
    "7_day": string;
    "15_day": string;
    "30_day": string;
  };
}

export type CountryCode = "IN" | "US" | "GB" | "AU";
