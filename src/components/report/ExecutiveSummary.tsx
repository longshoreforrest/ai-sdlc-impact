'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ScenarioResults, ScenarioType, CalculatorInputs } from '@/lib/types';
import { formatEur, formatHours } from '@/lib/formatters';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface ExecutiveSummaryProps {
  scenarios: ScenarioResults;
  totalBudget: number;
  teamSize: number;
  totalFacts: number;
  uniqueSources: number;
  yearSpan: string;
  hoursPerYear: number;
  inputs: CalculatorInputs;
}

const SCENARIO_META: Record<ScenarioType, { labelKey: TranslationKey; modelKey: TranslationKey; color: string }> = {
  pessimistic: { labelKey: 'roi.pessimistic', modelKey: 'scenario.modelPessimistic', color: '#ef4444' },
  realistic:   { labelKey: 'roi.realistic',   modelKey: 'scenario.modelRealistic',   color: '#f59e0b' },
  optimistic:  { labelKey: 'roi.optimistic',  modelKey: 'scenario.modelOptimistic',  color: '#10b981' },
};

export default function ExecutiveSummary({ scenarios, totalBudget, teamSize, totalFacts, uniqueSources, yearSpan, hoursPerYear, inputs }: ExecutiveSummaryProps) {
  const { t } = useTranslation();
  const timeframeYears = inputs.timeframeYears || 1;
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  // Determine chart scale: use millions if max value >= 1M, otherwise thousands
  const maxSavings = Math.max(
    ...scenarios.optimistic.phaseBreakdown.map((p) => Math.abs(p.costSavings))
  );
  const useMillions = maxSavings >= 1_000_000;
  const divisor = useMillions ? 1_000_000 : 1_000;
  const scaleSuffix = useMillions ? 'M' : 'K';

  const chartData = scenarios.realistic.phaseBreakdown.map((p, i) => ({
    phase: p.phase,
    pessimistic: Math.round(scenarios.pessimistic.phaseBreakdown[i].costSavings / divisor * 10) / 10,
    realistic: Math.round(scenarios.realistic.phaseBreakdown[i].costSavings / divisor * 10) / 10,
    optimistic: Math.round(scenarios.optimistic.phaseBreakdown[i].costSavings / divisor * 10) / 10,
  }));

  // Impact % per phase per scenario
  const impactData = scenarios.realistic.phaseBreakdown.map((p, i) => ({
    phase: p.phase,
    pessimistic: scenarios.pessimistic.phaseBreakdown[i].medianImpact,
    realistic: scenarios.realistic.phaseBreakdown[i].medianImpact,
    optimistic: scenarios.optimistic.phaseBreakdown[i].medianImpact,
  }));

  const realistic = scenarios.realistic;

  // Payback period: months to recover total investment from monthly savings
  const monthlySavings = realistic.totalCostSavings / 12;
  const paybackMonths = monthlySavings > 0
    ? Math.ceil(realistic.totalInvestment / monthlySavings)
    : Infinity;

  return (
    <section id="executive-summary">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
        1. {t('report.executiveSummary')}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {t('report.execSummaryIntro')}
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {scenarioKeys.map((key) => {
          const meta = SCENARIO_META[key];
          const result = scenarios[key];
          return (
            <div key={key} className="border border-zinc-200 rounded-lg p-4">
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: meta.color }}>
                {t(meta.labelKey)}
                {timeframeYears > 1 && ` (${timeframeYears} ${t('calculator.years')})`}
              </p>
              <p className="text-[10px] text-zinc-500 mb-3">{t(meta.modelKey)}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-500">{t('roi.hoursSaved')}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatHours(result.totalHoursSaved)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('roi.costSavings')}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatEur(result.totalCostSavings)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('roi.netRoi')}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatEur(result.netROI)}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500">{t('roi.roiRatio')}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                    {result.roiRatio}x
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payback Period — CFO / Investor highlight */}
      {paybackMonths < Infinity && (
        <div className="border border-zinc-200 rounded-lg p-4 mb-6 flex items-center gap-6">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{t('report.paybackPeriod')}</p>
            <p className="text-2xl font-bold tabular-nums text-zinc-900">
              {t('report.paybackMonths', { months: paybackMonths })}
            </p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed flex-1">
            {t('report.paybackNote')}
          </p>
        </div>
      )}

      {/* Metrics definition note */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-6">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t('report.metricsNote')}
        </p>
      </div>

      {/* Bar chart */}
      <div className="border border-zinc-200 rounded-lg p-4 mb-6" style={{ minWidth: 700 }}>
        <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          {t('roi.savingsByPhase')} (EUR {scaleSuffix})
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} tickFormatter={(v) => `${v}${scaleSuffix}`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatEur((entry.value as number) * divisor)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
            <Bar dataKey="pessimistic" name={t('roi.pessimistic')} fill="#ef4444" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="realistic" name={t('roi.realistic')} fill="#f59e0b" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="optimistic" name={t('roi.optimistic')} fill="#10b981" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Impact % by Phase */}
      <div className="border border-zinc-200 rounded-lg p-4 mb-6" style={{ minWidth: 700 }}>
        <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          {t('analytics.impactByPhase')}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={impactData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}%
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
            <Bar dataKey="pessimistic" name={t('roi.pessimistic')} fill="#ef4444" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="realistic" name={t('roi.realistic')} fill="#f59e0b" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="optimistic" name={t('roi.optimistic')} fill="#10b981" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-phase breakdown table — CTO / Engineer / Designer / PM */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
          {t('report.phaseBreakdownTitle')}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-3">
          {t('report.phaseBreakdownIntro')}
        </p>
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('common.phase')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('roi.weightColumn')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('report.inhouseRatios')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('roi.hoursSaved')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('roi.costSavings')}</th>
              </tr>
            </thead>
            <tbody>
              {realistic.phaseBreakdown.map((p) => {
                const inhouseRatio = inputs.inhouseRatios?.[p.phase] ?? 1;
                return (
                  <tr key={p.phase} className={`border-b border-zinc-100 ${!p.included ? 'text-zinc-400' : ''}`}>
                    <td className="px-3 py-2 font-medium">{p.phase}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{(p.weight * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{Math.round(inhouseRatio * 100)}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatHours(p.hoursSaved)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatEur(p.costSavings)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-zinc-200 font-bold">
                <td className="px-3 py-2">{t('roi.total')}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {Math.round(realistic.phaseBreakdown.filter(p => p.included).reduce((s, p) => s + p.weight, 0) * 100)}%
                </td>
                <td className="px-3 py-2" />
                <td className="px-3 py-2 text-right tabular-nums">{formatHours(realistic.totalHoursSaved)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatEur(realistic.totalCostSavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {t('report.inhouseNote')}
        </p>
      </div>

      {/* Narrative paragraph */}
      <p className="text-sm text-zinc-700 leading-relaxed">
        {t('report.narrative', {
          totalFacts,
          uniqueSources,
          yearSpan,
          hoursSaved: formatHours(realistic.totalHoursSaved),
          teamSize,
          costSavings: formatEur(realistic.totalCostSavings),
          roiRatio: realistic.roiRatio,
        })}
      </p>

      {/* Strategic Context — CEO / Consultant / Investor */}
      <div className="mt-6 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg p-4">
        <h3 className="text-sm font-bold text-zinc-800 mb-2">{t('report.strategyContext')}</h3>
        <p className="text-sm text-zinc-700 leading-relaxed">
          {t('report.strategyContextText')}
        </p>
      </div>

      {/* Key Implications — PM / CTO */}
      <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg p-4">
        <h3 className="text-sm font-bold text-zinc-800 mb-2">{t('report.keyImplications')}</h3>
        <p className="text-sm text-zinc-700 leading-relaxed">
          {t('report.implicationsText', {
            hoursSaved: formatHours(realistic.totalHoursSaved),
            fteSaved: (realistic.totalHoursSaved / hoursPerYear).toFixed(1),
            hoursPerYear,
          })}
        </p>
      </div>

      {/* Scalability Note — Investor */}
      <div className="mt-4 border-l-4 border-emerald-400 bg-emerald-50 rounded-r-lg p-4">
        <h3 className="text-sm font-bold text-zinc-800 mb-2">{t('report.investorContext')}</h3>
        <p className="text-sm text-zinc-700 leading-relaxed">
          {t('report.investorContextText')}
        </p>
      </div>
    </section>
  );
}
