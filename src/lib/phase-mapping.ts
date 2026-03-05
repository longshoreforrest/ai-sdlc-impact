import { Phase, ROIPhaseBreakdown, ScenarioResults } from './types';
import { PHASES } from './mock-data';

export interface GroupedPhaseRow {
  label: string;
  phases: Phase[]; // original phases in this group
  weight: number;
  hoursSaved: number;
  costSavings: number;
  included: boolean;
  inhouseRatio: number; // weighted average
  medianImpact: number; // weighted average by hours
}

/** Default 1:1 mapping */
export function getDefaultPhaseMapping(): Record<Phase, string> {
  const m = {} as Record<Phase, string>;
  for (const p of PHASES) m[p] = p;
  return m;
}

/** Check whether the mapping differs from default */
export function isMappingCustom(mapping: Record<Phase, string> | undefined): boolean {
  if (!mapping) return false;
  return PHASES.some((p) => mapping[p] !== p);
}

/** Group phase breakdown rows by mapping */
export function groupPhaseBreakdown(
  breakdown: ROIPhaseBreakdown[],
  mapping: Record<Phase, string> | undefined
): GroupedPhaseRow[] {
  const m = mapping ?? getDefaultPhaseMapping();
  const groups = new Map<string, ROIPhaseBreakdown[]>();
  const order: string[] = [];

  for (const row of breakdown) {
    const label = m[row.phase] || row.phase;
    if (!groups.has(label)) {
      groups.set(label, []);
      order.push(label);
    }
    groups.get(label)!.push(row);
  }

  return order.map((label) => {
    const rows = groups.get(label)!;
    const totalHours = rows.reduce((s, r) => s + r.hoursSaved, 0);
    const totalCost = rows.reduce((s, r) => s + r.costSavings, 0);
    const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
    const anyIncluded = rows.some((r) => r.included);

    // Weighted average inhouse ratio by cost
    const inhouseRatio = totalCost > 0
      ? rows.reduce((s, r) => s + r.costSavings * r.inhouseRatio, 0) / totalCost
      : rows[0].inhouseRatio;

    // Weighted average impact by hours
    const medianImpact = totalHours > 0
      ? rows.reduce((s, r) => s + r.hoursSaved * r.medianImpact, 0) / totalHours
      : rows.reduce((s, r) => s + r.medianImpact, 0) / rows.length;

    return {
      label,
      phases: rows.map((r) => r.phase),
      weight: totalWeight,
      hoursSaved: Math.round(totalHours),
      costSavings: Math.round(totalCost),
      included: anyIncluded,
      inhouseRatio,
      medianImpact: Math.round(medianImpact * 10) / 10,
    };
  });
}

/** Group scenario results for all three scenarios */
export function groupAllScenarios(
  scenarios: ScenarioResults,
  mapping: Record<Phase, string> | undefined
): Record<string, GroupedPhaseRow[]> {
  return {
    pessimistic: groupPhaseBreakdown(scenarios.pessimistic.phaseBreakdown, mapping),
    realistic: groupPhaseBreakdown(scenarios.realistic.phaseBreakdown, mapping),
    optimistic: groupPhaseBreakdown(scenarios.optimistic.phaseBreakdown, mapping),
  };
}
