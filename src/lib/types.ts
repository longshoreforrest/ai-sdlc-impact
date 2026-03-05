export type Phase = 'Discovery' | 'Design' | 'Spec' | 'Dev' | 'QA' | 'Release & Ops';

export type DataType = 'empirical' | 'survey' | 'vendor' | 'anecdotal' | 'info';

export type TemporalEra = 'all' | 'early' | 'agentic';

export type FactScope = 'sdlc' | 'business';

export type BenefitType = 'efficiency' | 'cost' | 'other';

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
  scope?: FactScope; // 'sdlc' (default) or 'business' — business = operational process improvements, not SDLC
  benefitType?: BenefitType; // 'efficiency' (default), 'cost', or 'other'
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
  sourceCategories?: ('social-media' | 'scientific' | 'sap' | 'salesforce' | 'other')[];
  adoptionFactor?: number; // β: organizational adoption multiplier (0.1–1.5)
  includeBusinessFacts?: boolean; // false by default — only SDLC facts used in calculations
  benefitTypes?: BenefitType[]; // default: ['efficiency', 'cost'] — which benefit types to include
}

export interface METRConfig {
  enabled: boolean;
  doublingPeriodMonths: number;
  futureOffsetMonths: number;
  adoptionElasticity: number; // 0.1–3.0, dampens how much AI capability translates to workflow efficiency
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
  inhouseRatios: Record<Phase, number>; // 0-1, where 1 = 100% inhouse
  scenarioConfigs: ScenarioConfigs;
  transformationCosts: TransformationCosts;
  timeframeYears: number;
}

export type ScenarioType = 'pessimistic' | 'realistic' | 'optimistic';

export interface ROIPhaseBreakdown {
  phase: Phase;
  weight: number;
  medianImpact: number;
  hoursSaved: number;
  costSavings: number;
  included: boolean;
  inhouseRatio: number; // 0-1, portion that is inhouse
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
