export interface JdRequirements {
  role_level: string;
  company_stage: string;
  key_outcomes: string[];
  must_have_signals: string[];
  domain: string;
  red_flag_triggers: string[];
}

export interface DimensionScore {
  dimension: string;
  score: number;
  rationale: string;
  evidence_quotes: string[];
}

export interface ScoresResult {
  scores: DimensionScore[];
}

export interface FrameworksResult {
  frameworks_used: string[];
  frameworks_missing: string[];
  notes: string;
}

export interface Strength {
  title: string;
  description: string;
  quote: string;
}

export interface StrengthsResult {
  strengths: Strength[];
}

export type Severity = 'low' | 'medium' | 'high';

export interface RedFlag {
  category: string;
  description: string;
  quote: string;
  severity: Severity;
}

export interface RedFlagsResult {
  red_flags: RedFlag[];
}

export interface Rewrite {
  section: string;
  original: string;
  rewritten: string;
  why: string;
}

export interface RewritesResult {
  rewrites: Rewrite[];
}

export type Bias = 'none' | 'lenient' | 'harsh';

export interface SelfCritiqueResult {
  critique: string;
  adjusted_scores: DimensionScore[] | null;
  bias_detected: Bias;
  missed_signals: string[];
}

export type Verdict = 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire';

export interface AnalysisReport {
  verdict: Verdict;
  overall_score: number;
  summary: string;
  dimensions: DimensionScore[];
  frameworks: FrameworksResult;
  strengths: Strength[];
  red_flags: RedFlag[];
  rewrites: Rewrite[];
  self_critique: SelfCritiqueResult;
  metadata: {
    evaluated_at: string;
    model: string;
  };
}

export interface ProgressEvent {
  type: 'progress';
  step: string;
  label: string;
  progress: number;
  total: number;
}

export interface CompleteEvent {
  type: 'complete';
  report: AnalysisReport;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type SseEvent = ProgressEvent | CompleteEvent | ErrorEvent;

export interface CompileReportInput {
  jd_requirements: JdRequirements;
  scores: DimensionScore[];
  frameworks: FrameworksResult;
  strengths: Strength[];
  red_flags: RedFlag[];
  rewrites: Rewrite[];
  self_critique: SelfCritiqueResult;
}
