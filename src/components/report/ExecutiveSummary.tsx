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
import { ScenarioResults, ScenarioType } from '@/lib/types';
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
}

const SCENARIO_META: Record<ScenarioType, { labelKey: TranslationKey; color: string }> = {
  pessimistic: { labelKey: 'roi.pessimistic', color: '#ef4444' },
  realistic:   { labelKey: 'roi.realistic',   color: '#f59e0b' },
  optimistic:  { labelKey: 'roi.optimistic',  color: '#10b981' },
};

export default function ExecutiveSummary({ scenarios, totalBudget, teamSize, totalFacts, uniqueSources, yearSpan, hoursPerYear }: ExecutiveSummaryProps) {
  const { t } = useTranslation();
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  const chartData = scenarios.realistic.phaseBreakdown.map((p, i) => ({
    phase: p.phase,
    pessimistic: Math.round(scenarios.pessimistic.phaseBreakdown[i].costSavings / 1000),
    realistic: Math.round(scenarios.realistic.phaseBreakdown[i].costSavings / 1000),
    optimistic: Math.round(scenarios.optimistic.phaseBreakdown[i].costSavings / 1000),
  }));

  const realistic = scenarios.realistic;

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
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: meta.color }}>
                {t(meta.labelKey)}
              </p>
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

      {/* Metrics definition note */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-6">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t('report.metricsNote')}
        </p>
      </div>

      {/* Bar chart */}
      <div className="border border-zinc-200 rounded-lg p-4 mb-6" style={{ minWidth: 700 }}>
        <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          {t('roi.savingsByPhase')}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} tickFormatter={(v) => `${v}K`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatEur((entry.value as number) * 1000)}
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

      {/* Key Implications */}
      <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg p-4">
        <h3 className="text-sm font-bold text-zinc-800 mb-2">{t('report.keyImplications')}</h3>
        <p className="text-sm text-zinc-700 leading-relaxed">
          {t('report.implicationsText', {
            hoursSaved: formatHours(realistic.totalHoursSaved),
            fteSaved: (realistic.totalHoursSaved / hoursPerYear).toFixed(1),
            hoursPerYear,
          })}
        </p>
      </div>
    </section>
  );
}
