'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Fact, Phase, ScenarioType, BenefitType, SourceCategoryKey, FilterState, CalculatorInputs } from '@/lib/types';
import { useFilteredFacts } from '@/hooks/useFilteredFacts';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { facts as allFacts, PHASES, PHASE_WEIGHTS } from '@/lib/mock-data';
import { calculateConfiguredScenarios } from '@/lib/calculations';
import FilterBar from '@/components/FilterBar';
import ScenarioSelector from '@/components/ScenarioSelector';
import ScenarioConfigurator from '@/components/analytics/ScenarioConfigurator';
import TemporalToggle from '@/components/TemporalToggle';
import SDLCRibbon from '@/components/SDLCRibbon';
import DistributionChart from '@/components/DistributionChart';
import SparklineCard from '@/components/SparklineCard';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import EvidenceWall from '@/components/EvidenceWall';
import FactDetailPanel from '@/components/FactDetailPanel';
import ExportButton from '@/components/ExportButton';

const PHASE_COLORS: Record<Phase, string> = {
  Discovery: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  'Release & Ops': '#f97316',
};

const SCENARIO_LABEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'roi.pessimistic',
  realistic: 'roi.realistic',
  optimistic: 'roi.optimistic',
};

export default function DashboardPage() {
  const {
    filters,
    filteredFacts,
    phaseStats,
    trendData,
    toggleYear,
    toggleDataType,
    togglePhase,
    setEra,
    toggleCategory,
    setScope,
    toggleBenefitType,
    resetFilters,
    applyScenarioFilters,
  } = useFilteredFacts();

  const { configs, activeScenario, setActiveScenario } = useScenario();
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scenario impact-by-phase chart data
  const scenarioResults = useMemo(() => {
    const defaultItBudget = 50_000_000;
    const defaultAvgSalary = 55_000;
    const defaultInputs: CalculatorInputs = {
      teamSize: Math.round(defaultItBudget / defaultAvgSalary),
      avgSalary: defaultAvgSalary,
      hoursPerYear: 1600,
      itBudget: defaultItBudget,
      includedPhases: [...PHASES],
      phaseWeights: PHASE_WEIGHTS as Record<Phase, number>,
      inhouseRatios: { Discovery: 1, Design: 1, Spec: 1, Dev: 0.2, QA: 1, 'Release & Ops': 1 } as Record<Phase, number>,
      scenarioConfigs: configs,
      transformationCosts: { consulting: 1_050_000, training: 525_000, internal: 525_000 },
      timeframeYears: 1,
    };
    return calculateConfiguredScenarios(defaultInputs, allFacts);
  }, [configs]);

  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

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
  // Track whether filter change came from scenario activation
  const scenarioTriggeredRef = useRef(false);
  const initializedRef = useRef(false);

  // Activate realistic scenario by default on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setActiveScenario('realistic');
      scenarioTriggeredRef.current = true;
      const config = configs.realistic;
      applyScenarioFilters(config.years, config.dataTypes);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When a scenario is activated, apply its filters
  const handleScenarioActivate = useCallback((scenario: ScenarioType) => {
    setActiveScenario(scenario);
    scenarioTriggeredRef.current = true;
    const config = configs[scenario];
    applyScenarioFilters(config.years, config.dataTypes);
  }, [configs, setActiveScenario, applyScenarioFilters]);

  // When scenario is deactivated, reset filters
  const handleScenarioDeactivate = useCallback(() => {
    setActiveScenario(null);
    resetFilters();
  }, [setActiveScenario, resetFilters]);

  // Wrap filter toggles to deactivate scenario on manual change
  const handleToggleYear = useCallback((year: number) => {
    if (activeScenario) setActiveScenario(null);
    toggleYear(year);
  }, [activeScenario, setActiveScenario, toggleYear]);

  const handleToggleDataType = useCallback((dt: Parameters<typeof toggleDataType>[0]) => {
    if (activeScenario) setActiveScenario(null);
    toggleDataType(dt);
  }, [activeScenario, setActiveScenario, toggleDataType]);

  const handleTogglePhase = useCallback((phase: Phase) => {
    if (activeScenario) setActiveScenario(null);
    togglePhase(phase);
  }, [activeScenario, setActiveScenario, togglePhase]);

  const handleToggleCategory = useCallback((cat: SourceCategoryKey) => {
    if (activeScenario) setActiveScenario(null);
    toggleCategory(cat);
  }, [activeScenario, setActiveScenario, toggleCategory]);

  const handleSetScope = useCallback((scope: FilterState['scope']) => {
    if (activeScenario) setActiveScenario(null);
    setScope(scope);
  }, [activeScenario, setActiveScenario, setScope]);

  const handleToggleBenefitType = useCallback((bt: BenefitType) => {
    if (activeScenario) setActiveScenario(null);
    toggleBenefitType(bt);
  }, [activeScenario, setActiveScenario, toggleBenefitType]);

  const handleResetFilters = useCallback(() => {
    if (activeScenario) setActiveScenario(null);
    resetFilters();
  }, [activeScenario, setActiveScenario, resetFilters]);

  const handlePhaseClick = useCallback(
    (phase: Phase) => {
      const params = new URLSearchParams();
      params.set('phases', phase);
      params.set('years', filters.years.join(','));
      params.set('dataTypes', filters.dataTypes.join(','));
      params.set('era', filters.era);
      router.push(`/sources?${params.toString()}`);
    },
    [filters, router]
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {t('dashboard.subtitle')}
          </p>
          <p className="text-xs text-muted/70 mt-1">
            {t('dashboard.interactHint')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton targetRef={contentRef} title={t('dashboard.title')} />
          <TemporalToggle era={filters.era} setEra={setEra} />
        </div>
      </div>

      {/* Scenario Configurator (collapsed by default) */}
      <ScenarioConfigurator defaultOpen={false} />

      {/* Scenario Selector */}
      <ScenarioSelector onActivate={handleScenarioActivate} onDeactivate={handleScenarioDeactivate} />

      <div ref={contentRef} className="space-y-6">
      {/* Filters */}
      <FilterBar
        filters={filters}
        toggleYear={handleToggleYear}
        toggleDataType={handleToggleDataType}
        togglePhase={handleTogglePhase}
        toggleCategory={handleToggleCategory}
        setScope={handleSetScope}
        toggleBenefitType={handleToggleBenefitType}
        resetFilters={handleResetFilters}
      />

      {/* SDLC Phase Ribbon */}
      <SDLCRibbon phaseStats={phaseStats} onPhaseClick={handlePhaseClick} />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Box plot */}
        <DistributionChart phaseStats={phaseStats} onPhaseClick={handlePhaseClick} />

        {/* Sparkline grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
            {t('dashboard.trendByPhase')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trendData.map((trend) => (
              <SparklineCard key={trend.phase} trend={trend} onPhaseClick={handlePhaseClick} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Efficiency Gain by Phase & Scenario */}
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

      {/* Time Series */}
      <TimeSeriesChart facts={filteredFacts} activePhases={filters.phases} />

      {/* Evidence Wall */}
      <EvidenceWall facts={filteredFacts} onSelectFact={setSelectedFact} />
      </div>

      {/* Detail Panel */}
      <FactDetailPanel fact={selectedFact} onClose={() => setSelectedFact(null)} />
    </div>
  );
}
