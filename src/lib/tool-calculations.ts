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
  toolImpactPct: number;       // evidenceImpact × applicability
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

export interface ToolBusinessCase {
  tool: ToolProfile;
  teamSize: number;
  scenarios: Record<ScenarioType, ToolScenarioResult>;
  verdict: Verdict;
}

export function getVerdict(realisticPaybackMonths: number): Verdict {
  if (realisticPaybackMonths <= 3) return 'strong-buy';
  if (realisticPaybackMonths <= 6) return 'recommended';
  if (realisticPaybackMonths <= 12) return 'marginal';
  return 'not-recommended';
}

export function calculateToolBusinessCase(
  tool: ToolProfile,
  teamSize: number,
  avgSalary: number,
  hoursPerYear: number,
  scenarioConfigs: ScenarioConfigs,
  allFacts: Fact[],
): ToolBusinessCase {
  const hourlyRate = avgSalary / hoursPerYear;
  const annualToolCost = (tool.costPerSeatMonthly * teamSize + tool.fixedMonthlyCost) * 12;
  const metrMultiplier = computeMETRMultiplier(scenarioConfigs.metrConfig);
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];
  const scenarios = {} as Record<ScenarioType, ToolScenarioResult>;

  for (const key of scenarioKeys) {
    const config = scenarioConfigs[key];
    const adoptionFactor = config.adoptionFactor ?? 1.0;
    const allowedCategories = config.sourceCategories ?? [...DEFAULT_SOURCE_CATEGORIES];
    const includeBusinessFacts = config.includeBusinessFacts ?? false;
    const allowedBenefitTypes = config.benefitTypes ?? ['efficiency', 'cost'];

    const filtered = allFacts.filter((f) => {
      if (!config.years.includes(f.year) || !config.dataTypes.includes(f.dataType)) return false;
      if (!includeBusinessFacts && f.scope === 'business') return false;
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
      const toolImpactPct = evidenceImpactPct * applicability;
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

  return { tool, teamSize, scenarios, verdict };
}
