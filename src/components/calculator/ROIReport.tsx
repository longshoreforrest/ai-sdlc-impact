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
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ScenarioResults, ScenarioType, ScenarioFactMapping } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { formatEur, formatHours } from '@/lib/formatters';
import ScenarioSources from './ScenarioSources';

interface ROIReportProps {
  scenarios: ScenarioResults;
  totalBudget: number;
  teamSize: number;
  factMapping?: ScenarioFactMapping;
  totalFactCount?: number;
}

const SCENARIO_META: Record<ScenarioType, { labelKey: TranslationKey; color: string; bgClass: string; icon: React.ReactNode }> = {
  pessimistic: { labelKey: 'roi.pessimistic', color: '#ef4444', bgClass: 'card-glow-red', icon: <TrendingDown className="w-4 h-4 text-red-400" /> },
  realistic:   { labelKey: 'roi.realistic',   color: '#f59e0b', bgClass: 'card-glow-amber', icon: <Minus className="w-4 h-4 text-amber-400" /> },
  optimistic:  { labelKey: 'roi.optimistic',  color: '#10b981', bgClass: 'card-glow-green', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
};

export default function ROIReport({ scenarios, totalBudget, teamSize, factMapping, totalFactCount }: ROIReportProps) {
  const { t } = useTranslation();
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  // Build chart data comparing scenarios by phase
  const chartData = scenarios.realistic.phaseBreakdown.map((p, i) => ({
    phase: p.phase,
    pessimistic: Math.round(scenarios.pessimistic.phaseBreakdown[i].costSavings / 1000),
    realistic: Math.round(scenarios.realistic.phaseBreakdown[i].costSavings / 1000),
    optimistic: Math.round(scenarios.optimistic.phaseBreakdown[i].costSavings / 1000),
  }));

  return (
    <div className="space-y-6">
      {/* Total Budget Banner */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">{t('roi.totalBudget')}</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
              {formatEur(totalBudget)}
            </p>
            <p className="text-xs text-muted mt-1">
              {teamSize} {teamSize !== 1 ? t('roi.developers') : t('roi.developer')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted uppercase tracking-wider">{t('transformation.totalInvestment')}</p>
            <p className="text-lg font-bold tabular-nums text-red-400 mt-1">
              -{formatEur(scenarios.realistic.totalInvestment)}
              <span className="text-xs text-muted font-normal ml-1">{t('roi.perYear')}</span>
            </p>
            <div className="text-xs text-muted mt-1 space-y-0.5">
              <p>{t('transformation.toolingCost')}: {formatEur(scenarios.realistic.toolingCost)}</p>
              {scenarios.realistic.consultingCost > 0 && (
                <p>{t('transformation.consulting')}: {formatEur(scenarios.realistic.consultingCost)}</p>
              )}
              {scenarios.realistic.trainingCost > 0 && (
                <p>{t('transformation.training')}: {formatEur(scenarios.realistic.trainingCost)}</p>
              )}
              {scenarios.realistic.internalCost > 0 && (
                <p>{t('transformation.internal')}: {formatEur(scenarios.realistic.internalCost)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Three Scenario Cards */}
      <div className="grid grid-cols-3 gap-4">
        {scenarioKeys.map((key) => {
          const meta = SCENARIO_META[key];
          const result = scenarios[key];
          const budgetPct = totalBudget > 0 ? (result.netROI / totalBudget) * 100 : 0;
          return (
            <div
              key={key}
              className={`bg-surface rounded-xl border border-border p-5 ${meta.bgClass}`}
            >
              <div className="flex items-center gap-2 mb-4">
                {meta.icon}
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: meta.color }}>
                  {t(meta.labelKey)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted">{t('roi.hoursSaved')}</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatHours(result.totalHoursSaved)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t('roi.costSavings')}</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatEur(result.totalCostSavings)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t('roi.netRoi')}</p>
                  <p className="text-xl font-bold tabular-nums" style={{ color: meta.color }}>
                    {formatEur(result.netROI)}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted">{t('roi.roiRatio')}</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                    {result.roiRatio}x
                  </p>
                </div>
                {totalBudget > 0 && (
                  <div>
                    <p className="text-xs text-muted">{t('roi.pctBudget')}</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color: meta.color }}>
                      {budgetPct >= 0 ? '+' : ''}{budgetPct.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grouped Bar Chart */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">
          {t('roi.savingsByPhase')}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="phase"
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={{ stroke: '#d4d4d8' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={{ stroke: '#d4d4d8' }}
              tickLine={false}
              tickFormatter={(v) => `${v}K`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-border rounded-lg p-3 shadow-xl text-xs">
                    <p className="font-medium text-foreground mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatEur((entry.value as number) * 1000)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '11px', color: '#71717a' }}
            />
            <Bar dataKey="pessimistic" name={t('roi.pessimistic')} fill="#ef4444" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="realistic" name={t('roi.realistic')} fill="#f59e0b" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar dataKey="optimistic" name={t('roi.optimistic')} fill="#10b981" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Comparison Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted font-medium uppercase tracking-wider px-4 py-3">{t('roi.phaseColumn')}</th>
              <th className="text-center text-xs text-muted font-medium uppercase tracking-wider px-4 py-3">{t('roi.weightColumn')}</th>
              {scenarioKeys.map((key) => (
                <th key={key} className="text-right text-xs font-medium uppercase tracking-wider px-4 py-3" style={{ color: SCENARIO_META[key].color }}>
                  {t(SCENARIO_META[key].labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.realistic.phaseBreakdown.map((row, i) => (
              <tr key={row.phase} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                <td className={`px-4 py-3 font-medium ${!row.included ? 'opacity-40 line-through' : ''}`}>
                  {row.phase}
                  {!row.included && (
                    <span className="ml-2 text-xs text-muted no-underline">{t('common.excluded')}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-muted">{(row.weight * 100).toFixed(0)}%</td>
                {scenarioKeys.map((key) => {
                  const s = scenarios[key].phaseBreakdown[i];
                  return (
                    <td key={key} className="px-4 py-3 text-right tabular-nums">
                      <span style={{ color: SCENARIO_META[key].color }}>{s.medianImpact}%</span>
                      <span className="text-muted text-xs ml-1">({formatEur(s.costSavings)})</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-surface-hover/50">
              <td className="px-4 py-3 font-bold">{t('roi.total')}</td>
              <td className="px-4 py-3"></td>
              {scenarioKeys.map((key) => (
                <td key={key} className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: SCENARIO_META[key].color }}>
                  {formatEur(scenarios[key].netROI)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Data Sources */}
      {factMapping && totalFactCount != null && (
        <ScenarioSources factMapping={factMapping} totalFactCount={totalFactCount} />
      )}

      {/* Data Basis Note */}
      <p className="text-xs text-muted italic leading-relaxed">
        {t('roi.dataBasis')}
      </p>
    </div>
  );
}
