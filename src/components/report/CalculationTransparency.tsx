'use client';

import { useMemo } from 'react';
import { CalculatorInputs, ScenarioType, Fact, Phase } from '@/lib/types';
import { ScenarioResults, ScenarioFactMapping } from '@/lib/types';
import { computeMETRMultiplier } from '@/lib/calculations';
import { getSourceCategory, SourceCategory } from '@/lib/sources';
import { PHASES } from '@/lib/mock-data';
import { formatEur as formatEurBase, formatHours as formatHoursBase } from '@/lib/formatters';

// LaTeX-safe formatters that avoid non-breaking spaces in math mode
function formatEur(value: number, latex?: boolean): string {
  if (!latex) return formatEurBase(value);
  if (Math.abs(value) >= 1_000_000) return `\\text{€${(value / 1_000_000).toFixed(1)}M}`;
  if (Math.abs(value) >= 1_000) return `\\text{€${Math.round(value / 1_000)}K}`;
  return `\\text{€${value.toFixed(0)}}`;
}

function formatHours(value: number, latex?: boolean): string {
  if (!latex) return formatHoursBase(value);
  if (value >= 1_000) return `\\text{${(value / 1_000).toFixed(1)}K}`;
  return `\\text{${value.toFixed(0)}}`;
}
import { useTranslation } from '@/lib/i18n';
import { groupPhaseBreakdown, isMappingCustom } from '@/lib/phase-mapping';
import type { SourceCategoryFilter } from '@/lib/constants';
import { DEFAULT_SOURCE_CATEGORIES } from '@/lib/constants';
import Formula from './Formula';

interface CalculationTransparencyProps {
  inputs: CalculatorInputs;
  scenarios: ScenarioResults;
  factMapping: ScenarioFactMapping;
  allFacts: Fact[];
}

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  pessimistic: '#ef4444',
  realistic: '#f59e0b',
  optimistic: '#10b981',
};

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  pessimistic: 'Pessimistic',
  realistic: 'Realistic',
  optimistic: 'Optimistic',
};

interface FilterStep {
  label: string;
  remaining: number;
  excluded: number;
  detail?: string;
}

function computeFilterPipeline(
  allFacts: Fact[],
  inputs: CalculatorInputs,
  scenarioKey: ScenarioType
): FilterStep[] {
  const config = inputs.scenarioConfigs[scenarioKey];
  const steps: FilterStep[] = [];
  let remaining = allFacts;

  steps.push({ label: 'All facts in database', remaining: remaining.length, excluded: 0 });

  // Year filter
  const afterYear = remaining.filter((f) => config.years.includes(f.year));
  steps.push({
    label: `Year filter (${config.years.join(', ')})`,
    remaining: afterYear.length,
    excluded: remaining.length - afterYear.length,
    detail: `Keep facts from ${config.years.join(', ')}`,
  });
  remaining = afterYear;

  // Data type filter
  const afterDt = remaining.filter((f) => config.dataTypes.includes(f.dataType));
  steps.push({
    label: `Data type filter (${config.dataTypes.join(', ')})`,
    remaining: afterDt.length,
    excluded: remaining.length - afterDt.length,
  });
  remaining = afterDt;

  // Scope filter
  const includeBusinessFacts = config.includeBusinessFacts ?? false;
  if (!includeBusinessFacts) {
    const afterScope = remaining.filter((f) => f.scope !== 'business');
    steps.push({
      label: 'Scope filter (SDLC only)',
      remaining: afterScope.length,
      excluded: remaining.length - afterScope.length,
      detail: 'Exclude business process facts',
    });
    remaining = afterScope;
  }

  // Benefit type filter
  const allowedBenefitTypes = config.benefitTypes ?? ['efficiency', 'cost'];
  const afterBt = remaining.filter((f) => allowedBenefitTypes.includes(f.benefitType ?? 'efficiency'));
  if (remaining.length !== afterBt.length) {
    steps.push({
      label: `Benefit type filter (${allowedBenefitTypes.join(', ')})`,
      remaining: afterBt.length,
      excluded: remaining.length - afterBt.length,
    });
    remaining = afterBt;
  }

  // Source category filter
  const allowedCategories = config.sourceCategories ?? [...DEFAULT_SOURCE_CATEGORIES];
  const afterCat = remaining.filter((f) => {
    const cat = getSourceCategory(f.source);
    const filterCat: SourceCategoryFilter = cat ?? 'other';
    return allowedCategories.includes(filterCat);
  });
  if (remaining.length !== afterCat.length) {
    steps.push({
      label: `Source category filter (${allowedCategories.join(', ')})`,
      remaining: afterCat.length,
      excluded: remaining.length - afterCat.length,
    });
  }

  return steps;
}

function FilterPipelineDiagram({ steps, color }: { steps: FilterStep[]; color: string }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-stretch gap-0">
          {/* Connector line */}
          <div className="flex flex-col items-center w-8 shrink-0">
            <div
              className="w-3 h-3 rounded-full border-2 shrink-0"
              style={{ borderColor: i === 0 ? '#71717a' : step.excluded > 0 ? color : '#10b981', backgroundColor: i === steps.length - 1 ? color : 'white' }}
            />
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 min-h-[24px]" style={{ backgroundColor: '#d4d4d8' }} />
            )}
          </div>
          {/* Step content */}
          <div className="pb-3 -mt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-700">{step.label}</span>
              <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color }}>
                {step.remaining}
              </span>
              {step.excluded > 0 && (
                <span className="text-xs text-zinc-400 tabular-nums">
                  (-{step.excluded})
                </span>
              )}
            </div>
            {step.detail && (
              <p className="text-xs text-zinc-400 mt-0.5">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkedExample({ inputs, scenarios, scenario }: { inputs: CalculatorInputs; scenarios: ScenarioResults; scenario: ScenarioType }) {
  const result = scenarios[scenario];
  const color = SCENARIO_COLORS[scenario];
  const hourlyRate = inputs.avgSalary / inputs.hoursPerYear;
  const phaseMapping = inputs.phaseMapping;
  const grouped = groupPhaseBreakdown(result.phaseBreakdown, phaseMapping);
  const hasMapping = isMappingCustom(phaseMapping);

  // Find the phase with highest savings for the example
  const examplePhase = grouped.reduce((best, p) => p.costSavings > best.costSavings ? p : best, grouped[0]);

  return (
    <div className="border rounded-lg p-4 space-y-3" style={{ borderColor: `${color}40` }}>
      <h4 className="text-sm font-bold" style={{ color }}>
        {SCENARIO_LABELS[scenario]} — Worked Example
      </h4>

      {/* Step 1: Hourly rate */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-700">Step 1: Hourly Rate</p>
        <Formula math={String.raw`r = \frac{${formatEur(inputs.avgSalary, true)}}{${inputs.hoursPerYear}} = ${formatEur(Math.round(hourlyRate), true)}\text{/hr}`} block />
      </div>

      {/* Step 2: Phase hours saved */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-700">
          Step 2: Hours Saved — {examplePhase.label}
          {hasMapping && examplePhase.phases.length > 1 && (
            <span className="text-zinc-400 font-normal ml-1">({examplePhase.phases.join(' + ')})</span>
          )}
        </p>
        <Formula math={String.raw`H = ${inputs.teamSize} \times ${inputs.hoursPerYear} \times ${(examplePhase.weight * 100).toFixed(0)}\% \times ${examplePhase.medianImpact}\% \times ${inputs.timeframeYears || 1}\text{yr} = ${formatHours(examplePhase.hoursSaved)}`} block />
      </div>

      {/* Step 3: Cost savings */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-700">Step 3: Cost Savings — {examplePhase.label}</p>
        <Formula math={String.raw`C = ${formatHours(examplePhase.hoursSaved)} \times ${formatEur(Math.round(hourlyRate), true)} = ${formatEur(examplePhase.costSavings, true)}`} block />
      </div>

      {/* Step 4: Totals */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-700">Step 4: Sum All Phases</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-1 text-zinc-500">Phase</th>
              <th className="text-right py-1 text-zinc-500">Weight</th>
              <th className="text-right py-1 text-zinc-500">Impact</th>
              <th className="text-right py-1 text-zinc-500">Hours</th>
              <th className="text-right py-1 text-zinc-500">Savings</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((p) => (
              <tr key={p.label} className="border-b border-zinc-100">
                <td className="py-1 text-zinc-700 font-medium">
                  {p.label}
                  {!p.included && <span className="text-zinc-400 ml-1">(excl.)</span>}
                </td>
                <td className="py-1 text-right tabular-nums">{(p.weight * 100).toFixed(0)}%</td>
                <td className="py-1 text-right tabular-nums">{p.medianImpact}%</td>
                <td className="py-1 text-right tabular-nums">{formatHours(p.hoursSaved)}</td>
                <td className="py-1 text-right tabular-nums">{formatEur(p.costSavings)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-zinc-200 font-bold">
              <td className="py-1" colSpan={3}>Total</td>
              <td className="py-1 text-right tabular-nums" style={{ color }}>{formatHours(result.totalHoursSaved)}</td>
              <td className="py-1 text-right tabular-nums" style={{ color }}>{formatEur(result.totalCostSavings)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Step 5: ROI */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-zinc-700">Step 5: Return on Investment</p>
        <Formula math={String.raw`\text{Net ROI} = ${formatEur(result.totalCostSavings, true)} - ${formatEur(result.totalInvestment, true)} = ${formatEur(result.netROI, true)}`} block />
        <Formula math={String.raw`\text{ROI Ratio} = \frac{${formatEur(result.totalCostSavings, true)}}{${formatEur(result.totalInvestment, true)}} = ${result.roiRatio}\text{x}`} block />
      </div>
    </div>
  );
}

export default function CalculationTransparency({ inputs, scenarios, factMapping, allFacts }: CalculationTransparencyProps) {
  const { t } = useTranslation();
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  const pipelines = useMemo(() => {
    return Object.fromEntries(
      scenarioKeys.map((key) => [key, computeFilterPipeline(allFacts, inputs, key)])
    ) as Record<ScenarioType, FilterStep[]>;
  }, [allFacts, inputs]);

  return (
    <div className="space-y-8">
      {/* Section: How Data Flows Into Scenarios */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 mb-2">
          Data Filtering Pipeline
        </h3>
        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
          Each scenario starts with the full database of {allFacts.length} facts and applies a series of filters.
          The filters are configured in the Scenario Configurator and determine which data points inform each projection.
          Below is the exact filter chain for each scenario, showing how many facts pass through each step.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarioKeys.map((key) => (
            <div key={key} className="border border-zinc-200 rounded-lg p-4">
              <h4 className="text-sm font-bold mb-3" style={{ color: SCENARIO_COLORS[key] }}>
                {SCENARIO_LABELS[key]}
              </h4>
              <FilterPipelineDiagram steps={pipelines[key]} color={SCENARIO_COLORS[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* Section: From Filtered Facts to Phase Statistics */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 mb-2">
          From Filtered Facts to Phase Impact
        </h3>
        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
          After filtering, facts are grouped by SDLC phase. For each phase, the arithmetic mean of all
          impact percentages is computed. This mean is then multiplied by the scenario&apos;s adoption factor (&beta;)
          to produce the final impact estimate. The optimistic scenario may additionally apply the METR
          capability multiplier if enabled.
        </p>

        {/* Decision tree for impact calculation */}
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
          <p className="text-xs font-medium text-zinc-700 uppercase tracking-wider mb-3">Impact Calculation Decision Tree</p>
          <div className="text-sm text-zinc-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">1.</span>
              <span>Group filtered facts by SDLC phase</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">2.</span>
              <span>Compute <Formula math="\bar{\eta}_p = \text{mean}(\text{impactPct})" /> for each phase</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">3.</span>
              <div>
                <span>Apply adoption factor: </span>
                <Formula math="\eta_p = \bar{\eta}_p \times \beta" />
              </div>
            </div>
            <div className="flex items-start gap-2 pl-6 border-l-2 border-emerald-300 ml-2">
              <span className="text-emerald-600 shrink-0">3a.</span>
              <div>
                <span className="text-emerald-700">Optimistic + METR enabled: </span>
                <Formula math="\eta_p = \bar{\eta}_p \times M_{\text{eff}} \times \beta" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">4.</span>
              <span>Clamp: <Formula math="\eta_p = \min(\max(\eta_p, 0), 1)" /> — impact cannot exceed 100% or go below 0%</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">5.</span>
              <span>Calculate hours: <Formula math="H_p = N \times H_{\text{year}} \times w_p \times \eta_p \times T" /></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 shrink-0">6.</span>
              <span>Calculate savings: <Formula math="C_p = H_p \times r" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Worked Examples with Actual Numbers */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 mb-2">
          Worked Examples with Actual Values
        </h3>
        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
          Below are the complete calculation traces for each scenario using the current input parameters.
          Every number shown comes from the configured inputs and filtered data — nothing is hidden or approximated.
        </p>

        {/* Input Parameters Summary */}
        <div className="border border-zinc-200 rounded-lg p-4 mb-4 bg-zinc-50">
          <p className="text-xs font-medium text-zinc-700 uppercase tracking-wider mb-2">Input Parameters Used</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500">Team Size (N)</p>
              <p className="font-bold tabular-nums">{inputs.teamSize}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Avg Salary (S<sub>avg</sub>)</p>
              <p className="font-bold tabular-nums">{formatEur(inputs.avgSalary)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Hours/Year (H<sub>year</sub>)</p>
              <p className="font-bold tabular-nums">{inputs.hoursPerYear}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Timeframe (T)</p>
              <p className="font-bold tabular-nums">{inputs.timeframeYears || 1} year{(inputs.timeframeYears || 1) > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scenarioKeys.map((key) => (
            <WorkedExample key={key} inputs={inputs} scenarios={scenarios} scenario={key} />
          ))}
        </div>
      </div>

      {/* Section: Investment Breakdown */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 mb-2">
          Investment Calculation
        </h3>
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 space-y-2">
          <Formula math={String.raw`I_{\text{tooling}} = ${inputs.teamSize} \times \text{€20/mo} \times 12 \times ${inputs.timeframeYears || 1} = ${formatEur(inputs.teamSize * 20 * 12 * (inputs.timeframeYears || 1), true)}`} block />
          {inputs.transformationCosts.consulting > 0 && (
            <Formula math={String.raw`I_{\text{consulting}} = ${formatEur(inputs.transformationCosts.consulting, true)} \quad\text{(one-time)}`} block />
          )}
          {inputs.transformationCosts.training > 0 && (
            <Formula math={String.raw`I_{\text{training}} = ${formatEur(inputs.transformationCosts.training, true)} \quad\text{(one-time)}`} block />
          )}
          {inputs.transformationCosts.internal > 0 && (
            <Formula math={String.raw`I_{\text{internal}} = ${formatEur(inputs.transformationCosts.internal, true)} \quad\text{(one-time)}`} block />
          )}
          <div className="border-t border-zinc-200 pt-2">
            <Formula math={String.raw`I_{\text{total}} = ${formatEur(scenarios.realistic.totalInvestment, true)}`} block />
          </div>
        </div>
      </div>
    </div>
  );
}
