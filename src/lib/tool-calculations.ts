import { ToolProfile, Phase, ScenarioType, ScenarioConfigs, Fact } from './types';
import { PHASES, PHASE_WEIGHTS } from './mock-data';
import { computePhaseStats } from './calculations';
import { computeMETRMultiplier } from './calculations';
import { getSourceCategory } from './sources';
import { DEFAULT_SOURCE_CATEGORIES } from './constants';

export interface ToolPhaseResult {
  phase: Phase;
  phaseWeight: number;
  applicability: number;
  evidenceImpactPct: number;   // raw scenario evidence for this phase
  toolImpactPct: number;       // evidenceImpact × applicability (× rate limit factor if enabled)
  hoursSaved: number;
  costSavings: number;
}

export interface ToolScenarioResult {
  scenario: ScenarioType;
  phases: ToolPhaseResult[];
  totalHoursSaved: number;
  totalCostSavings: number;
  annualToolCost: number;
  netSavings: number;
  paybackMonths: number;       // months to recoup annual tool cost
  roiMultiple: number;         // totalCostSavings / annualToolCost
}

export type Verdict = 'strong-buy' | 'recommended' | 'marginal' | 'not-recommended';

export type RateLimitStatus = 'applied' | 'no-data';

export interface ToolBusinessCase {
  tool: ToolProfile;
  teamSize: number;
  scenarios: Record<ScenarioType, ToolScenarioResult>;
  verdict: Verdict;
  rateLimitWeighted: boolean;        // whether rate limit weighting was applied
  rateLimitFactor: number | null;    // effective multiplier (null = no data)
  rateLimitStatus: RateLimitStatus;  // 'applied' or 'no-data'
}

export function getVerdict(realisticPaybackMonths: number): Verdict {
  if (realisticPaybackMonths <= 3) return 'strong-buy';
  if (realisticPaybackMonths <= 6) return 'recommended';
  if (realisticPaybackMonths <= 12) return 'marginal';
  return 'not-recommended';
}

/**
 * Converts a rate-limit score (1–4) into an effectiveness multiplier.
 * Score 4 → 1.0 (no throttling), Score 1 → 0.4 (severe throttling).
 * The curve is: 0.2 + score × 0.2  →  1:0.4, 2:0.6, 3:0.8, 4:1.0
 */
export function rateLimitToFactor(score: 1 | 2 | 3 | 4): number {
  return 0.2 + score * 0.2;
}

export function calculateToolBusinessCase(
  tool: ToolProfile,
  teamSize: number,
  avgSalary: number,
  hoursPerYear: number,
  scenarioConfigs: ScenarioConfigs,
  allFacts: Fact[],
  enableRateLimitWeighting = false,
): ToolBusinessCase {
  const hourlyRate = avgSalary / hoursPerYear;
  const annualToolCost = (tool.costPerSeatMonthly * teamSize + tool.fixedMonthlyCost) * 12;
  const metrMultiplier = computeMETRMultiplier(scenarioConfigs.metrConfig);
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];
  const scenarios = {} as Record<ScenarioType, ToolScenarioResult>;

  // Rate limit weighting
  const hasRateLimitData = tool.rateLimitScore != null;
  const rateLimitFactor = hasRateLimitData ? rateLimitToFactor(tool.rateLimitScore!) : null;
  const effectiveRlFactor = enableRateLimitWeighting && rateLimitFactor != null ? rateLimitFactor : 1.0;

  for (const key of scenarioKeys) {
    const config = scenarioConfigs[key];
    const adoptionFactor = config.adoptionFactor ?? 1.0;
    const allowedCategories = config.sourceCategories ?? [...DEFAULT_SOURCE_CATEGORIES];
    const includeBusinessFacts = config.includeBusinessFacts ?? false;
    const allowedBenefitTypes = config.benefitTypes ?? ['efficiency', 'cost'];

    const filtered = allFacts.filter((f) => {
      if (!config.years.includes(f.year) || !config.dataTypes.includes(f.dataType)) return false;
      if (!includeBusinessFacts && f.scope === 'business') return false;
      if (f.scope === 'ai-tool') return false; // AI tool comparison facts never enter calculations
      const bt = f.benefitType ?? 'efficiency';
      if (!allowedBenefitTypes.includes(bt)) return false;
      const cat = getSourceCategory(f.source);
      const filterCat = cat ?? 'other';
      return allowedCategories.includes(filterCat);
    });

    const stats = computePhaseStats(filtered);

    const phases: ToolPhaseResult[] = PHASES.map((phase) => {
      const phaseStat = stats.find((s) => s.phase === phase);
      const rawMean = phaseStat ? phaseStat.mean : 0;
      const evidenceImpactPct = key === 'optimistic' && scenarioConfigs.metrConfig.enabled
        ? rawMean * metrMultiplier * adoptionFactor
        : rawMean * adoptionFactor;

      const applicability = tool.phaseApplicability[phase];
      const toolImpactPct = evidenceImpactPct * applicability * effectiveRlFactor;
      const phaseWeight = PHASE_WEIGHTS[phase];
      const clampedImpact = Math.min(Math.max(toolImpactPct / 100, 0), 1);
      const hoursSaved = teamSize * hoursPerYear * phaseWeight * clampedImpact;
      const costSavings = hoursSaved * hourlyRate;

      return {
        phase,
        phaseWeight,
        applicability,
        evidenceImpactPct: Math.round(evidenceImpactPct * 10) / 10,
        toolImpactPct: Math.round(toolImpactPct * 10) / 10,
        hoursSaved: Math.round(hoursSaved),
        costSavings: Math.round(costSavings),
      };
    });

    const totalHoursSaved = phases.reduce((s, p) => s + p.hoursSaved, 0);
    const totalCostSavings = phases.reduce((s, p) => s + p.costSavings, 0);
    const netSavings = totalCostSavings - annualToolCost;
    const monthlySavings = totalCostSavings / 12;
    const monthlyToolCost = annualToolCost / 12;
    const paybackMonths = monthlySavings > 0 ? Math.ceil(monthlyToolCost / monthlySavings * 12) : 999;
    const roiMultiple = annualToolCost > 0 ? Math.round((totalCostSavings / annualToolCost) * 10) / 10 : 0;

    scenarios[key] = {
      scenario: key,
      phases,
      totalHoursSaved,
      totalCostSavings,
      annualToolCost,
      netSavings,
      paybackMonths,
      roiMultiple,
    };
  }

  const verdict = getVerdict(scenarios.realistic.paybackMonths);

  return {
    tool,
    teamSize,
    scenarios,
    verdict,
    rateLimitWeighted: enableRateLimitWeighting,
    rateLimitFactor: rateLimitFactor,
    rateLimitStatus: hasRateLimitData ? 'applied' : 'no-data',
  };
}
