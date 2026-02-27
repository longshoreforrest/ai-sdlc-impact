'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fact, Phase, ScenarioType } from '@/lib/types';
import { useFilteredFacts } from '@/hooks/useFilteredFacts';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import FilterBar from '@/components/FilterBar';
import ScenarioSelector from '@/components/ScenarioSelector';
import TemporalToggle from '@/components/TemporalToggle';
import SDLCRibbon from '@/components/SDLCRibbon';
import DistributionChart from '@/components/DistributionChart';
import SparklineCard from '@/components/SparklineCard';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import EvidenceWall from '@/components/EvidenceWall';
import FactDetailPanel from '@/components/FactDetailPanel';
import ExportButton from '@/components/ExportButton';

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
    resetFilters,
    applyScenarioFilters,
  } = useFilteredFacts();

  const { configs, activeScenario, setActiveScenario } = useScenario();
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Track whether filter change came from scenario activation
  const scenarioTriggeredRef = useRef(false);

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

      {/* Scenario Selector */}
      <ScenarioSelector onActivate={handleScenarioActivate} onDeactivate={handleScenarioDeactivate} />

      <div ref={contentRef} className="space-y-6">
      {/* Filters */}
      <FilterBar
        filters={filters}
        toggleYear={handleToggleYear}
        toggleDataType={handleToggleDataType}
        togglePhase={handleTogglePhase}
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
          <div className="grid grid-cols-2 gap-3">
            {trendData.map((trend) => (
              <SparklineCard key={trend.phase} trend={trend} onPhaseClick={handlePhaseClick} />
            ))}
          </div>
        </div>
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
