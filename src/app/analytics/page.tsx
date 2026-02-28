'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { facts, PHASE_WEIGHTS } from '@/lib/mock-data';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { computeTrendData, calculateConfiguredScenarios } from '@/lib/calculations';
import type { DataType, Phase, CalculatorInputs, ScenarioType } from '@/lib/types';
import { useScenario } from '@/contexts/ScenarioContext';
import ExportButton from '@/components/ExportButton';
import ScenarioConfigurator from '@/components/analytics/ScenarioConfigurator';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const dataTypeColors: Record<DataType, string> = {
  empirical: '#10b981',
  survey: '#3b82f6',
  vendor: '#8b5cf6',
  anecdotal: '#f97316',
};

const dataTypeBadgeColors: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
};

const credibilityColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#10b981',
};

const PHASE_COLORS: Record<Phase, string> = {
  Strategy: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  DevOps: '#f97316',
};

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  pessimistic: '#ef4444',
  realistic: '#f59e0b',
  optimistic: '#10b981',
};

const SCENARIO_LABEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'roi.pessimistic',
  realistic: 'roi.realistic',
  optimistic: 'roi.optimistic',
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { configs: scenarioConfigs } = useScenario();
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedPhases, setSelectedPhases] = useState<Phase[]>([...PHASES]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<DataType[]>([...ALL_DATA_TYPES]);

  const trendFacts = useMemo(
    () => facts.filter((f) => selectedDataTypes.includes(f.dataType)),
    [selectedDataTypes]
  );

  const trendData = useMemo(() => {
    const allTrends = computeTrendData(trendFacts);
    return allTrends.filter((t) => selectedPhases.includes(t.phase));
  }, [trendFacts, selectedPhases]);

  // Reshape trend data into rows keyed by year for Recharts LineChart
  const trendChartData = useMemo(() => {
    return ALL_YEARS.map((year) => {
      const row: Record<string, number | string | undefined> = { year: String(year) };
      trendData.forEach((t) => {
        const pt = t.points.find((p) => p.year === year);
        row[t.phase] = pt?.mean;
        row[`${t.phase}_count`] = pt?.count;
      });
      return row;
    });
  }, [trendData]);

  // Build default calculator inputs to compute scenario ROI from current scenario configs
  const scenarioResults = useMemo(() => {
    const defaultItBudget = 100_000_000;
    const defaultAvgSalary = 55_000;
    const defaultInputs: CalculatorInputs = {
      teamSize: Math.round(defaultItBudget / defaultAvgSalary),
      avgSalary: defaultAvgSalary,
      hoursPerYear: 1600,
      itBudget: defaultItBudget,
      includedPhases: [...PHASES],
      phaseWeights: PHASE_WEIGHTS as Record<Phase, number>,
      inhouseRatios: { Strategy: 1, Design: 1, Spec: 1, Dev: 0.2, QA: 1, DevOps: 1 } as Record<Phase, number>,
      scenarioConfigs,
      transformationCosts: { consulting: 2_000_000, training: 1_000_000, internal: 1_000_000 },
      timeframeYears: 1,
    };
    return calculateConfiguredScenarios(defaultInputs, facts);
  }, [scenarioConfigs]);

  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  // Chart data: impact % grouped by scenario, with phases as bars
  const impactByPhaseData = useMemo(() => {
    return scenarioKeys.map((key) => {
      const row: Record<string, string | number> = { scenario: t(SCENARIO_LABEL_KEYS[key]) };
      for (const phase of PHASES) {
        const breakdown = scenarioResults.scenarios[key].phaseBreakdown.find((p) => p.phase === phase);
        row[phase] = breakdown ? breakdown.medianImpact : 0;
      }
      return row;
    });
  }, [scenarioResults, t]);

  const stats = useMemo(() => {
    const totalFacts = facts.length;
    const uniqueSources = new Set(facts.map((f) => f.source)).size;
    const years = facts.map((f) => f.year);
    const yearSpan = `${Math.min(...years)}–${Math.max(...years)}`;
    const avgCredibility =
      facts.reduce((sum, f) => sum + f.credibility, 0) / totalFacts;

    // Facts by year
    const byYear = ALL_YEARS.map((year) => ({
      year: String(year),
      count: facts.filter((f) => f.year === year).length,
    }));

    // Facts by data type
    const dataTypes: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];
    const byDataType = dataTypes.map((dt) => ({
      dataType: dt,
      label: dt.charAt(0).toUpperCase() + dt.slice(1),
      count: facts.filter((f) => f.dataType === dt).length,
    }));

    // Facts by phase
    const byPhase = PHASES.map((phase) => ({
      phase,
      count: facts.filter((f) => f.phase === phase).length,
    }));

    // Year × Phase cross-tabulation
    const yearPhaseMatrix = PHASES.map((phase) => {
      const row: Record<string, number | string> = { phase };
      ALL_YEARS.forEach((year) => {
        row[String(year)] = facts.filter(
          (f) => f.phase === phase && f.year === year
        ).length;
      });
      return row;
    });

    // Year × DataType cross-tabulation
    const yearDataTypeMatrix = dataTypes.map((dt) => {
      const row: Record<string, number | string> = {
        dataType: dt.charAt(0).toUpperCase() + dt.slice(1),
        rawDataType: dt,
      };
      ALL_YEARS.forEach((year) => {
        row[String(year)] = facts.filter(
          (f) => f.dataType === dt && f.year === year
        ).length;
      });
      return row;
    });

    // Max values for heatmap intensity
    const allYearPhaseCounts = yearPhaseMatrix.flatMap((row) =>
      ALL_YEARS.map((y) => row[String(y)] as number)
    );
    const maxYearPhase = Math.max(...allYearPhaseCounts, 1);

    const allYearDtCounts = yearDataTypeMatrix.flatMap((row) =>
      ALL_YEARS.map((y) => row[String(y)] as number)
    );
    const maxYearDt = Math.max(...allYearDtCounts, 1);

    // Credibility by phase
    const credByPhase = PHASES.map((phase) => {
      const phaseFacts = facts.filter((f) => f.phase === phase);
      return {
        phase,
        low: phaseFacts.filter((f) => f.credibility === 1).length,
        medium: phaseFacts.filter((f) => f.credibility === 2).length,
        high: phaseFacts.filter((f) => f.credibility === 3).length,
      };
    });

    // Top 10 sources
    const sourceMap = new Map<
      string,
      {
        count: number;
        phases: Set<string>;
        dataTypes: Set<string>;
        totalImpact: number;
      }
    >();
    facts.forEach((f) => {
      const entry = sourceMap.get(f.source) || {
        count: 0,
        phases: new Set<string>(),
        dataTypes: new Set<string>(),
        totalImpact: 0,
      };
      entry.count++;
      entry.phases.add(f.phase);
      entry.dataTypes.add(f.dataType);
      entry.totalImpact += f.impactPct;
      sourceMap.set(f.source, entry);
    });
    const topSources = [...sourceMap.entries()]
      .map(([name, data]) => ({
        name,
        count: data.count,
        phases: [...data.phases].sort(),
        dataTypes: [...data.dataTypes].sort(),
        avgImpact: data.totalImpact / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalFacts,
      uniqueSources,
      yearSpan,
      avgCredibility,
      byYear,
      byDataType,
      byPhase,
      yearPhaseMatrix,
      yearDataTypeMatrix,
      maxYearPhase,
      maxYearDt,
      credByPhase,
      topSources,
    };
  }, []);

  function drillDown(params: Record<string, string>) {
    const search = new URLSearchParams(params).toString();
    router.push(`/sources?${search}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function barClick(handler: (payload: any) => void) {
    return (data: unknown) => {
      const d = data as { payload?: Record<string, string> };
      if (d?.payload) handler(d.payload);
    };
  }

  function heatmapBg(count: number, max: number) {
    if (count === 0) return 'bg-transparent';
    const intensity = Math.round((count / max) * 100);
    if (intensity >= 80) return 'bg-accent/80 text-white';
    if (intensity >= 60) return 'bg-accent/60 text-white';
    if (intensity >= 40) return 'bg-accent/40 text-foreground';
    if (intensity >= 20) return 'bg-accent/20 text-foreground';
    return 'bg-accent/10 text-foreground';
  }

  function togglePhase(phase: Phase) {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  }

  function toggleDataType(dt: DataType) {
    setSelectedDataTypes((prev) =>
      prev.includes(dt) ? prev.filter((d) => d !== dt) : [...prev, dt]
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('analytics.title')}
          </h1>
        <p className="text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          {t('analytics.description', { totalFacts: stats.totalFacts, uniqueSources: stats.uniqueSources, yearSpan: stats.yearSpan })}
        </p>
        <p className="text-xs text-muted/70 mt-2 italic">
          {t('analytics.tip')}
        </p>
        </div>
        <ExportButton targetRef={contentRef} title={t('analytics.title')} />
      </div>

      {/* Scenario Configurator */}
      <ScenarioConfigurator />

      {/* Scenario Comparison Charts */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          {t('analytics.impactByPhase')}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={impactByPhaseData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="scenario" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border text-xs" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '8px 12px' }}>
                    <p style={{ color: '#a1a1aa', marginBottom: 4 }}>{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}%
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
            {PHASES.map((phase) => (
              <Bar key={phase} dataKey={phase} name={phase} fill={PHASE_COLORS[phase]} fillOpacity={0.7} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div ref={contentRef} className="space-y-8">
      {/* A) Hero Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('analytics.totalFacts'), value: stats.totalFacts },
          { label: t('analytics.uniqueSources'), value: stats.uniqueSources },
          { label: t('analytics.yearSpan'), value: stats.yearSpan },
          {
            label: t('analytics.avgCredibility'),
            value: stats.avgCredibility.toFixed(1) + ' / 3',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <p className="text-xs text-muted uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* E) Impact Trends Over Time */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          {t('analytics.impactTrends')}
        </h2>

        {/* Phase toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-muted mr-1">{t('common.phase')}:</span>
          {PHASES.map((phase) => {
            const active = selectedPhases.includes(phase);
            return (
              <button
                key={phase}
                onClick={() => togglePhase(phase)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-border text-muted bg-transparent hover:bg-surface-hover'
                }`}
                style={active ? { backgroundColor: PHASE_COLORS[phase] } : undefined}
              >
                {phase}
              </button>
            );
          })}
        </div>

        {/* Data type toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-muted mr-1">{t('common.type')}:</span>
          {ALL_DATA_TYPES.map((dt) => {
            const active = selectedDataTypes.includes(dt);
            return (
              <button
                key={dt}
                onClick={() => toggleDataType(dt)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-border text-muted bg-transparent hover:bg-surface-hover'
                }`}
                style={active ? { backgroundColor: dataTypeColors[dt] } : undefined}
              >
                {t(`common.${dt}` as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div
                    className="rounded-lg border text-xs"
                    style={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      padding: '8px 12px',
                    }}
                  >
                    <p style={{ color: '#a1a1aa', marginBottom: 4 }}>{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}%{' '}
                        <span style={{ color: '#71717a' }}>
                          (n=
                          {(entry.payload as Record<string, number>)[
                            `${entry.dataKey as string}_count`
                          ] ?? 0}
                          )
                        </span>
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
            />
            {trendData.map((t) => (
              <Line
                key={t.phase}
                type="monotone"
                dataKey={t.phase}
                name={t.phase}
                stroke={PHASE_COLORS[t.phase]}
                strokeWidth={2}
                dot={{ r: 4, fill: PHASE_COLORS[t.phase] }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted text-xs py-2 pr-3">{t('common.phase')}</th>
                {ALL_YEARS.map((y) => (
                  <th key={y} className="text-center text-muted text-xs py-2 px-3">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trendData.map((t) => (
                <tr
                  key={t.phase}
                  className="border-b border-border/50"
                >
                  <td className="py-1.5 pr-3 font-medium" style={{ color: PHASE_COLORS[t.phase] }}>
                    {t.phase}
                  </td>
                  {ALL_YEARS.map((year) => {
                    const pt = t.points.find((p) => p.year === year);
                    return (
                      <td key={year} className="text-center px-3 py-1.5">
                        {pt ? (
                          <button
                            onClick={() =>
                              drillDown({
                                years: String(year),
                                phases: t.phase,
                                ...(selectedDataTypes.length < ALL_DATA_TYPES.length
                                  ? { dataTypes: selectedDataTypes.join(',') }
                                  : {}),
                              })
                            }
                            className="text-foreground hover:text-accent transition-colors cursor-pointer"
                          >
                            {pt.mean >= 0 ? '+' : ''}
                            {pt.mean}%{' '}
                            <span className="text-muted text-xs">({pt.count})</span>
                          </button>
                        ) : (
                          <span className="text-muted">&mdash;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* B) Three-column Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Facts by Year */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.factsByYear')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.byYear}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
                fillOpacity={0.8}
                cursor="pointer"
                onClick={barClick((p) => drillDown({ years: p.year }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facts by Data Type */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.factsByDataType')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.byDataType}
              layout="vertical"
              margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: '#71717a', fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={barClick((p) => drillDown({ dataTypes: p.dataType }))}
              >
                {stats.byDataType.map((entry) => (
                  <Cell
                    key={entry.dataType}
                    fill={dataTypeColors[entry.dataType as DataType]}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facts by SDLC Phase */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.factsByPhase')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.byPhase}
              layout="vertical"
              margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="phase"
                tick={{ fill: '#71717a', fontSize: 12 }}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                fill="#06b6d4"
                fillOpacity={0.8}
                cursor="pointer"
                onClick={barClick((p) => drillDown({ phases: p.phase }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* C) Cross-tabulation Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Year × Phase */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.yearPhase')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-muted text-xs py-2 pr-3">{t('common.phase')}</th>
                  {ALL_YEARS.map((y) => (
                    <th key={y} className="text-center text-muted text-xs py-2 px-2">
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.yearPhaseMatrix.map((row) => (
                  <tr key={row.phase as string}>
                    <td className="text-foreground py-1.5 pr-3 font-medium">
                      {row.phase as string}
                    </td>
                    {ALL_YEARS.map((y) => {
                      const count = row[String(y)] as number;
                      return (
                        <td key={y} className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => count > 0 && drillDown({ years: String(y), phases: row.phase as string })}
                            disabled={count === 0}
                            className={`inline-block w-10 rounded px-2 py-0.5 text-xs font-medium transition-opacity ${heatmapBg(count, stats.maxYearPhase)} ${count > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Year × Data Type */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.yearDataType')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-muted text-xs py-2 pr-3">{t('common.type')}</th>
                  {ALL_YEARS.map((y) => (
                    <th key={y} className="text-center text-muted text-xs py-2 px-2">
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.yearDataTypeMatrix.map((row) => (
                  <tr key={row.dataType as string}>
                    <td className="text-foreground py-1.5 pr-3 font-medium">
                      {row.dataType as string}
                    </td>
                    {ALL_YEARS.map((y) => {
                      const count = row[String(y)] as number;
                      return (
                        <td key={y} className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => count > 0 && drillDown({ years: String(y), dataTypes: row.rawDataType as string })}
                            disabled={count === 0}
                            className={`inline-block w-10 rounded px-2 py-0.5 text-xs font-medium transition-opacity ${heatmapBg(count, stats.maxYearDt)} ${count > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* D) Source Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Credibility by Phase */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.credByPhase')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.credByPhase}
              layout="vertical"
              margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="phase"
                tick={{ fill: '#71717a', fontSize: 12 }}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
              />
              <Bar dataKey="high" stackId="cred" name="High (3)" fill={credibilityColors[3]} fillOpacity={0.8} cursor="pointer" onClick={barClick((p) => drillDown({ phases: p.phase }))} />
              <Bar dataKey="medium" stackId="cred" name="Medium (2)" fill={credibilityColors[2]} fillOpacity={0.8} cursor="pointer" onClick={barClick((p) => drillDown({ phases: p.phase }))} />
              <Bar dataKey="low" stackId="cred" name="Low (1)" fill={credibilityColors[1]} fillOpacity={0.8} radius={[0, 4, 4, 0]} cursor="pointer" onClick={barClick((p) => drillDown({ phases: p.phase }))} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Sources */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.top10Sources')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted text-xs py-2 pr-2">{t('analytics.colHash')}</th>
                  <th className="text-left text-muted text-xs py-2 pr-2">{t('analytics.colSource')}</th>
                  <th className="text-center text-muted text-xs py-2 px-2">{t('analytics.colFacts')}</th>
                  <th className="text-center text-muted text-xs py-2 px-2">{t('analytics.colPhases')}</th>
                  <th className="text-center text-muted text-xs py-2 px-2">{t('analytics.colTypes')}</th>
                  <th className="text-right text-muted text-xs py-2">{t('analytics.colAvgImpact')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSources.map((src, i) => (
                  <tr
                    key={src.name}
                    className="border-b border-border/50 cursor-pointer hover:bg-surface-hover transition-colors"
                    onClick={() => drillDown({
                      phases: src.phases.join(','),
                      dataTypes: src.dataTypes.join(','),
                    })}
                  >
                    <td className="text-muted py-1.5 pr-2 text-xs">{i + 1}</td>
                    <td className="text-foreground py-1.5 pr-2 max-w-[180px] truncate" title={src.name}>
                      {src.name}
                    </td>
                    <td className="text-center text-foreground py-1.5 px-2 font-medium">
                      {src.count}
                    </td>
                    <td className="text-center text-muted py-1.5 px-2 text-xs">
                      {src.phases.length}
                    </td>
                    <td className="text-center py-1.5 px-2">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {src.dataTypes.map((dt) => (
                          <span
                            key={dt}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${dataTypeBadgeColors[dt as DataType]}`}
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right py-1.5 font-medium">
                      <span className={src.avgImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {src.avgImpact >= 0 ? '+' : ''}{src.avgImpact.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
