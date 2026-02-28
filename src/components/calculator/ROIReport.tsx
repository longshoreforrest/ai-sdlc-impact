'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ScenarioResults, ScenarioType, ScenarioFactMapping, TransformationCosts } from '@/lib/types';
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
  timeframeYears?: number;
  transformationCosts?: TransformationCosts;
}

const SCENARIO_META: Record<ScenarioType, { labelKey: TranslationKey; modelKey: TranslationKey; color: string; bgClass: string; icon: React.ReactNode }> = {
  pessimistic: { labelKey: 'roi.pessimistic', modelKey: 'scenario.modelPessimistic', color: '#ef4444', bgClass: 'card-glow-red', icon: <TrendingDown className="w-4 h-4 text-red-400" /> },
  realistic:   { labelKey: 'roi.realistic',   modelKey: 'scenario.modelRealistic',   color: '#f59e0b', bgClass: 'card-glow-amber', icon: <Minus className="w-4 h-4 text-amber-400" /> },
  optimistic:  { labelKey: 'roi.optimistic',  modelKey: 'scenario.modelOptimistic',  color: '#10b981', bgClass: 'card-glow-green', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
};

const PHASE_COLORS = ['#f59e0b', '#8b5cf6', '#06b6d4', '#3b82f6', '#10b981', '#f97316'];

export default function ROIReport({ scenarios, totalBudget, teamSize, factMapping, totalFactCount, timeframeYears = 1, transformationCosts }: ROIReportProps) {
  const { t } = useTranslation();
  const timeframeSuffix = timeframeYears > 1 ? ` (${timeframeYears} ${t('calculator.years')})` : '';
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

  // Pie chart data: cost savings per phase per scenario
  const pieData = useMemo(() => {
    return scenarioKeys.map((key) => ({
      key,
      data: scenarios[key].phaseBreakdown
        .filter((p) => p.included && p.costSavings > 0)
        .map((p) => ({ name: p.phase, value: p.costSavings })),
    }));
  }, [scenarios]);

  // Multi-year projection: cumulative net ROI over 10 years
  const projectionData = useMemo(() => {
    const annualTooling = teamSize * 20 * 12;
    const oneTimeCosts = (transformationCosts?.consulting ?? 0) + (transformationCosts?.training ?? 0) + (transformationCosts?.internal ?? 0);

    // Annual savings per scenario (divide current totals by timeframeYears to get per-year)
    const annualSavings: Record<ScenarioType, number> = {
      pessimistic: scenarios.pessimistic.totalCostSavings / timeframeYears,
      realistic: scenarios.realistic.totalCostSavings / timeframeYears,
      optimistic: scenarios.optimistic.totalCostSavings / timeframeYears,
    };

    return Array.from({ length: 10 }, (_, i) => {
      const year = i + 1;
      const cumulativeInvestment = oneTimeCosts + annualTooling * year;
      const row: Record<string, number | string> = { year: `${t('calculator.year')} ${year}` };
      for (const key of scenarioKeys) {
        row[key] = Math.round(annualSavings[key] * year - cumulativeInvestment);
      }
      return row;
    });
  }, [scenarios, teamSize, transformationCosts, timeframeYears, t]);

  // Scale for projection chart
  const projMax = Math.max(...projectionData.map((r) => Math.abs(r.optimistic as number)), Math.abs(projectionData[0].pessimistic as number));
  const projUseM = projMax >= 1_000_000;
  const projDiv = projUseM ? 1_000_000 : 1_000;
  const projSuffix = projUseM ? 'M' : 'K';

  const projectionScaled = projectionData.map((r) => ({
    year: r.year,
    pessimistic: Math.round((r.pessimistic as number) / projDiv * 10) / 10,
    realistic: Math.round((r.realistic as number) / projDiv * 10) / 10,
    optimistic: Math.round((r.optimistic as number) / projDiv * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* IT Budget Banner */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">{t('calculator.itBudget')}</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
              {formatEur(totalBudget)}
            </p>
            <p className="text-xs text-muted mt-1">
              {teamSize} {teamSize !== 1 ? t('roi.developers') : t('roi.developer')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted uppercase tracking-wider">{t('transformation.totalInvestment')}{timeframeSuffix}</p>
            <p className="text-lg font-bold tabular-nums text-red-400 mt-1">
              -{formatEur(scenarios.realistic.totalInvestment)}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {scenarioKeys.map((key) => {
          const meta = SCENARIO_META[key];
          const result = scenarios[key];
          const budgetPct = totalBudget > 0 ? (result.netROI / totalBudget) * 100 : 0;
          return (
            <div
              key={key}
              className={`bg-surface rounded-xl border border-border p-5 ${meta.bgClass}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {meta.icon}
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: meta.color }}>
                  {t(meta.labelKey)}
                </span>
              </div>
              <p className="text-[10px] text-muted mb-4">{t(meta.modelKey)}</p>

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
          {t('roi.savingsByPhase')} (EUR {scaleSuffix})
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
              tickFormatter={(v) => `${v}${scaleSuffix}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-border rounded-lg p-3 shadow-xl text-xs">
                    <p className="font-medium text-foreground mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatEur((entry.value as number) * divisor)}
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

      {/* Pie Charts: Cost Savings by Phase per Scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {pieData.map(({ key, data: slices }) => {
          const meta = SCENARIO_META[key];
          return (
            <div key={key} className="bg-surface rounded-xl border border-border p-4">
              <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: meta.color }}>
                {t(meta.labelKey)} — {t('roi.costSavings')}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {slices.map((entry, i) => (
                      <Cell key={entry.name} fill={PHASE_COLORS[i % PHASE_COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      return (
                        <div className="bg-white border border-border rounded-lg p-2 shadow-xl text-xs">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p style={{ color: item.payload?.fill }}>{formatEur(item.value as number)}</p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', color: '#71717a' }}
                    formatter={(value) => <span className="text-muted">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Multi-Year Projection */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">
          {t('roi.projection')} (EUR {projSuffix})
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projectionScaled} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={{ stroke: '#d4d4d8' }}
              tickLine={false}
              tickFormatter={(v) => `${v}${projSuffix}`}
            />
            {/* Zero line */}
            <CartesianGrid strokeDasharray="0" stroke="#d4d4d8" horizontalPoints={[0]} vertical={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-border rounded-lg p-3 shadow-xl text-xs">
                    <p className="font-medium text-foreground mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {formatEur((entry.value as number) * projDiv)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
            <Line type="monotone" dataKey="pessimistic" name={t('roi.pessimistic')} stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="realistic" name={t('roi.realistic')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="optimistic" name={t('roi.optimistic')} stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted mt-2 italic">
          {t('roi.projectionNote')}
        </p>
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
