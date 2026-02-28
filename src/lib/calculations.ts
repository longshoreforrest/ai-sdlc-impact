import { Fact, Phase, PhaseStats, PhaseTrend, TrendPoint, EraComparison, CalculatorInputs, ROIResult, ROIPhaseBreakdown, ScenarioResults, ScenarioType, PhaseFactGroup, ScenarioFactMapping, METRConfig } from './types';
import { TOOLING_COST_PER_SEAT_MONTHLY, ERA_BOUNDARY_YEAR, SCENARIO_KEYS } from './constants';
import { PHASES, PHASE_WEIGHTS } from './mock-data';

function quartile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (base + 1 < sorted.length) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function computePhaseStats(facts: Fact[]): PhaseStats[] {
  return PHASES.map((phase) => {
    const phaseFacts = facts.filter((f) => f.phase === phase);
    const values = phaseFacts.map((f) => f.impactPct).sort((a, b) => a - b);
    const sourceCount = new Set(phaseFacts.map((f) => f.source)).size;

    if (values.length === 0) {
      return { phase, min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, count: 0, sourceCount: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      phase,
      min: values[0],
      q1: quartile(values, 0.25),
      median: quartile(values, 0.5),
      q3: quartile(values, 0.75),
      max: values[values.length - 1],
      mean: sum / values.length,
      count: values.length,
      sourceCount,
    };
  });
}

export function computeTrendData(facts: Fact[]): PhaseTrend[] {
  return PHASES.map((phase) => {
    const phaseFacts = facts.filter((f) => f.phase === phase);
    const yearMap = new Map<number, number[]>();

    for (const f of phaseFacts) {
      if (!yearMap.has(f.year)) yearMap.set(f.year, []);
      yearMap.get(f.year)!.push(f.impactPct);
    }

    const points: TrendPoint[] = [];
    for (const [year, values] of yearMap) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      points.push({ year, mean: Math.round(mean * 10) / 10, count: values.length });
    }
    points.sort((a, b) => a.year - b.year);

    return { phase, points };
  });
}

export function computeEraComparison(facts: Fact[]): EraComparison[] {
  return PHASES.map((phase) => {
    const early = facts.filter((f) => f.phase === phase && f.year <= ERA_BOUNDARY_YEAR);
    const agentic = facts.filter((f) => f.phase === phase && f.year > ERA_BOUNDARY_YEAR);

    const earlyMean = early.length > 0
      ? early.reduce((s, f) => s + f.impactPct, 0) / early.length
      : 0;
    const agenticMean = agentic.length > 0
      ? agentic.reduce((s, f) => s + f.impactPct, 0) / agentic.length
      : 0;

    return {
      phase,
      earlyMean: Math.round(earlyMean * 10) / 10,
      agenticMean: Math.round(agenticMean * 10) / 10,
      delta: Math.round((agenticMean - earlyMean) * 10) / 10,
    };
  });
}

/**
 * Normalize phase weights so that included phases sum to 1.0.
 * Excluded phases get weight 0.
 */
export function normalizeWeights(
  baseWeights: Record<string, number>,
  includedPhases: Phase[]
): Record<string, number> {
  const sum = PHASES.reduce(
    (s, p) => s + (includedPhases.includes(p) ? (baseWeights[p] || 0) : 0),
    0
  );
  const result: Record<string, number> = {};
  for (const p of PHASES) {
    result[p] = includedPhases.includes(p) && sum > 0
      ? (baseWeights[p] || 0) / sum
      : 0;
  }
  return result;
}

/**
 * Compute default phase weights from the actual data distribution.
 */
export function computeDefaultWeightsFromData(allFacts: Fact[]): Record<Phase, number> {
  const counts: Record<string, number> = {};
  for (const p of PHASES) counts[p] = 0;
  for (const f of allFacts) counts[f.phase] = (counts[f.phase] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const weights: Record<string, number> = {};
  for (const p of PHASES) {
    weights[p] = total > 0 ? counts[p] / total : PHASE_WEIGHTS[p];
  }
  return weights as Record<Phase, number>;
}

export function calculateROI(inputs: CalculatorInputs, phaseStats: PhaseStats[]): ROIResult {
  const { teamSize, avgSalary, hoursPerYear, includedPhases, phaseWeights, inhouseRatios, transformationCosts } = inputs;
  const timeframeYears = inputs.timeframeYears || 1;
  const hourlyRate = avgSalary / hoursPerYear;

  const phaseBreakdown: ROIPhaseBreakdown[] = PHASES.map((phase) => {
    const stats = phaseStats.find((s) => s.phase === phase);
    const medianImpact = stats ? stats.median / 100 : 0;
    const weight = phaseWeights[phase];
    const included = includedPhases.includes(phase);
    const inhouseRatio = inhouseRatios?.[phase] ?? 1;

    const hoursSaved = included ? teamSize * hoursPerYear * weight * medianImpact * inhouseRatio * timeframeYears : 0;
    const costSavings = hoursSaved * hourlyRate;

    return {
      phase,
      weight,
      medianImpact: Math.round(medianImpact * 1000) / 10,
      hoursSaved: Math.round(hoursSaved),
      costSavings: Math.round(costSavings),
      included,
    };
  });

  const totalHoursSaved = phaseBreakdown.reduce((s, p) => s + p.hoursSaved, 0);
  const totalCostSavings = phaseBreakdown.reduce((s, p) => s + p.costSavings, 0);
  const toolingCost = teamSize * 20 * 12 * timeframeYears; // €20/month per seat, recurring
  const consultingCost = transformationCosts.consulting;   // one-time
  const trainingCost = transformationCosts.training;       // one-time
  const internalCost = transformationCosts.internal;       // one-time
  const totalInvestment = toolingCost + consultingCost + trainingCost + internalCost;
  const netROI = totalCostSavings - totalInvestment;
  const roiRatio = totalInvestment > 0 ? totalCostSavings / totalInvestment : 0;

  return {
    totalHoursSaved,
    totalCostSavings,
    toolingCost,
    consultingCost,
    trainingCost,
    internalCost,
    totalInvestment,
    netROI,
    roiRatio: Math.round(roiRatio * 10) / 10,
    phaseBreakdown,
  };
}

function calculateScenario(
  inputs: CalculatorInputs,
  phaseStats: PhaseStats[],
  impactSelector: (stats: PhaseStats) => number
): ROIResult {
  const { teamSize, avgSalary, hoursPerYear, includedPhases, phaseWeights, inhouseRatios, transformationCosts } = inputs;
  const timeframeYears = inputs.timeframeYears || 1;
  const hourlyRate = avgSalary / hoursPerYear;

  const phaseBreakdown: ROIPhaseBreakdown[] = PHASES.map((phase) => {
    const stats = phaseStats.find((s) => s.phase === phase);
    const impact = stats ? impactSelector(stats) / 100 : 0;
    const clampedImpact = Math.max(impact, 0);
    const weight = phaseWeights[phase];
    const included = includedPhases.includes(phase);
    const inhouseRatio = inhouseRatios?.[phase] ?? 1;

    const hoursSaved = included ? teamSize * hoursPerYear * weight * clampedImpact * inhouseRatio * timeframeYears : 0;
    const costSavings = hoursSaved * hourlyRate;

    return {
      phase,
      weight,
      medianImpact: Math.round(impact * 1000) / 10,
      hoursSaved: Math.round(hoursSaved),
      costSavings: Math.round(costSavings),
      included,
    };
  });

  const totalHoursSaved = phaseBreakdown.reduce((s, p) => s + p.hoursSaved, 0);
  const totalCostSavings = phaseBreakdown.reduce((s, p) => s + p.costSavings, 0);
  const toolingCost = teamSize * 20 * 12 * timeframeYears; // €20/month per seat, recurring
  const consultingCost = transformationCosts.consulting;   // one-time
  const trainingCost = transformationCosts.training;       // one-time
  const internalCost = transformationCosts.internal;       // one-time
  const totalInvestment = toolingCost + consultingCost + trainingCost + internalCost;
  const netROI = totalCostSavings - totalInvestment;
  const roiRatio = totalInvestment > 0 ? totalCostSavings / totalInvestment : 0;

  return {
    totalHoursSaved,
    totalCostSavings,
    toolingCost,
    consultingCost,
    trainingCost,
    internalCost,
    totalInvestment,
    netROI,
    roiRatio: Math.round(roiRatio * 10) / 10,
    phaseBreakdown,
  };
}

export function calculateScenarioROI(inputs: CalculatorInputs, phaseStats: PhaseStats[]): ScenarioResults {
  return {
    pessimistic: calculateScenario(inputs, phaseStats, (s) => s.q1),
    realistic: calculateScenario(inputs, phaseStats, (s) => s.median),
    optimistic: calculateScenario(inputs, phaseStats, (s) => s.q3),
  };
}

export function computeMETRMultiplier(config: METRConfig): number {
  if (!config.enabled || config.doublingPeriodMonths <= 0) return 1;
  const rawMultiplier = Math.pow(2, config.futureOffsetMonths / config.doublingPeriodMonths);
  const elasticity = config.adoptionElasticity ?? 0.5;
  return Math.pow(rawMultiplier, elasticity);
}

export function calculateConfiguredScenarios(
  inputs: CalculatorInputs,
  allFacts: Fact[]
): { scenarios: ScenarioResults; factMapping: ScenarioFactMapping } {
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];
  const scenarios = {} as ScenarioResults;
  const factMapping = {} as ScenarioFactMapping;
  const metrMultiplier = computeMETRMultiplier(inputs.scenarioConfigs.metrConfig);

  for (const key of scenarioKeys) {
    const config = inputs.scenarioConfigs[key];
    const adoptionFactor = config.adoptionFactor ?? 1.0;
    const filtered = allFacts.filter(
      (f) => config.years.includes(f.year) && config.dataTypes.includes(f.dataType)
    );
    const stats = computePhaseStats(filtered);

    // For optimistic with METR enabled, apply METR multiplier then adoption factor
    const impactSelector = key === 'optimistic' && inputs.scenarioConfigs.metrConfig.enabled
      ? (s: PhaseStats) => s.mean * metrMultiplier * adoptionFactor
      : (s: PhaseStats) => s.mean * adoptionFactor;

    scenarios[key] = calculateScenario(inputs, stats, impactSelector);

    // Build fact groups per phase
    factMapping[key] = PHASES.map((phase) => {
      const phaseFacts = filtered.filter((f) => f.phase === phase);
      const values = phaseFacts.map((f) => f.impactPct);
      const rawMean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const medianImpact = key === 'optimistic' && inputs.scenarioConfigs.metrConfig.enabled
        ? rawMean * metrMultiplier * adoptionFactor
        : rawMean * adoptionFactor;
      return { phase, facts: phaseFacts, medianImpact };
    });
  }

  return { scenarios, factMapping };
}
