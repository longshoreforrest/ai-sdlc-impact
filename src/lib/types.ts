export type Phase = 'Strategy' | 'Design' | 'Spec' | 'Dev' | 'QA' | 'DevOps';

export type DataType = 'empirical' | 'survey' | 'vendor' | 'anecdotal';

export type TemporalEra = 'all' | 'early' | 'agentic';

export interface Fact {
  id: string;
  phase: Phase;
  impactPct: number; // percentage impact (negative = slower, positive = improvement)
  year: number;
  publishDate: string; // yyyy-mm-dd
  source: string;
  sourceUrl?: string;
  dataType: DataType;
  description: string;
  sampleSize?: string;
  credibility: 1 | 2 | 3; // 1=low, 2=medium, 3=high
}

export interface PhaseStats {
  phase: Phase;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count: number;
  sourceCount: number;
}

export interface TrendPoint {
  year: number;
  mean: number;
  count: number;
}

export interface PhaseTrend {
  phase: Phase;
  points: TrendPoint[];
}

export interface EraComparison {
  phase: Phase;
  earlyMean: number;
  agenticMean: number;
  delta: number;
}

export interface FilterState {
  years: number[];
  dataTypes: DataType[];
  phases: Phase[];
  era: TemporalEra;
}

export interface ScenarioConfig {
  years: number[];
  dataTypes: DataType[];
}

export interface METRConfig {
  enabled: boolean;
  doublingPeriodMonths: number;
  futureOffsetMonths: number;
}

export interface ScenarioConfigs {
  pessimistic: ScenarioConfig;
  realistic: ScenarioConfig;
  optimistic: ScenarioConfig;
  metrConfig: METRConfig;
}

export interface PhaseFactGroup {
  phase: Phase;
  facts: Fact[];
  medianImpact: number;
}

export interface ScenarioFactMapping {
  pessimistic: PhaseFactGroup[];
  realistic: PhaseFactGroup[];
  optimistic: PhaseFactGroup[];
}

export interface TransformationCosts {
  consulting: number;  // External consulting EUR
  training: number;    // Training & upskilling EUR
  internal: number;    // Internal implementation EUR
}

export interface CalculatorInputs {
  teamSize: number;
  avgSalary: number;
  hoursPerYear: number;
  itBudget: number;
  includedPhases: Phase[];
  phaseWeights: Record<Phase, number>;
  scenarioConfigs: ScenarioConfigs;
  transformationCosts: TransformationCosts;
}

export type ScenarioType = 'pessimistic' | 'realistic' | 'optimistic';

export interface ROIPhaseBreakdown {
  phase: Phase;
  weight: number;
  medianImpact: number;
  hoursSaved: number;
  costSavings: number;
  included: boolean;
}

export interface ROIResult {
  totalHoursSaved: number;
  totalCostSavings: number;
  toolingCost: number;
  consultingCost: number;
  trainingCost: number;
  internalCost: number;
  totalInvestment: number;
  netROI: number;
  roiRatio: number;
  phaseBreakdown: ROIPhaseBreakdown[];
}

export interface ScenarioResults {
  pessimistic: ROIResult;
  realistic: ROIResult;
  optimistic: ROIResult;
}
