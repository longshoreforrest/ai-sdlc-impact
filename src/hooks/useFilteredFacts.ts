'use client';

import { useState, useMemo, useCallback } from 'react';
import { Fact, FilterState, Phase, DataType, TemporalEra, PhaseStats, PhaseTrend, EraComparison } from '@/lib/types';
import { facts as allFacts, PHASES, ALL_YEARS } from '@/lib/mock-data';
import { computePhaseStats, computeTrendData, computeEraComparison } from '@/lib/calculations';

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

export function useFilteredFacts() {
  const [filters, setFilters] = useState<FilterState>({
    years: [...ALL_YEARS],
    dataTypes: [...ALL_DATA_TYPES],
    phases: [...PHASES],
    era: 'all',
  });

  const filteredFacts = useMemo(() => {
    let result = allFacts;

    // Year filter
    result = result.filter((f) => filters.years.includes(f.year));

    // Data type filter
    result = result.filter((f) => filters.dataTypes.includes(f.dataType));

    // Phase filter
    result = result.filter((f) => filters.phases.includes(f.phase));

    // Era filter
    if (filters.era === 'early') {
      result = result.filter((f) => f.year <= 2024);
    } else if (filters.era === 'agentic') {
      result = result.filter((f) => f.year >= 2025);
    }

    return result;
  }, [filters]);

  const phaseStats: PhaseStats[] = useMemo(
    () => computePhaseStats(filteredFacts),
    [filteredFacts]
  );

  const trendData: PhaseTrend[] = useMemo(
    () => computeTrendData(filteredFacts),
    [filteredFacts]
  );

  const eraComparison: EraComparison[] = useMemo(
    () => computeEraComparison(allFacts), // Always compare full dataset
    []
  );

  const toggleYear = useCallback((year: number) => {
    setFilters((prev) => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter((y) => y !== year)
        : [...prev.years, year].sort(),
    }));
  }, []);

  const toggleDataType = useCallback((dt: DataType) => {
    setFilters((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dt)
        ? prev.dataTypes.filter((d) => d !== dt)
        : [...prev.dataTypes, dt],
    }));
  }, []);

  const togglePhase = useCallback((phase: Phase) => {
    setFilters((prev) => ({
      ...prev,
      phases: prev.phases.includes(phase)
        ? prev.phases.filter((p) => p !== phase)
        : [...prev.phases, phase],
    }));
  }, []);

  const setEra = useCallback((era: TemporalEra) => {
    setFilters((prev) => ({ ...prev, era }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      years: [...ALL_YEARS],
      dataTypes: [...ALL_DATA_TYPES],
      phases: [...PHASES],
      era: 'all',
    });
  }, []);

  const applyScenarioFilters = useCallback((years: number[], dataTypes: DataType[]) => {
    setFilters((prev) => ({ ...prev, years, dataTypes, era: 'all' }));
  }, []);

  return {
    filters,
    filteredFacts,
    phaseStats,
    trendData,
    eraComparison,
    toggleYear,
    toggleDataType,
    togglePhase,
    setEra,
    resetFilters,
    applyScenarioFilters,
  };
}
