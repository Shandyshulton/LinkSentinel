export type RiskLevel = "low" | "suspicious" | "high";
export type CheckStatus = "completed" | "failed";

export interface Check {
  id: number;
  url: string;
  domain: string;
  status: CheckStatus;
  risk_level: RiskLevel | null;
  risk_score: number | null;
  reasons: string[];
  error_message: string | null;
  created_at: string;
}

export interface StatsRiskBucket {
  level: RiskLevel;
  count: number;
  percentage: number;
}

export interface Stats {
  total_attempts: number;
  results_available: number;
  failed_count: number;
  buckets: StatsRiskBucket[];
}

export interface Settings {
  save_history: boolean;
  risk_warnings: boolean;
  reminder_notifications: boolean;
}
