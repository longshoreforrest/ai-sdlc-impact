'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import { facts } from '@/lib/mock-data';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { computeTrendData } from '@/lib/calculations';
import { getSourceCategory, buildSources } from '@/lib/sources';
import type { SourceCategory } from '@/lib/sources';
import type { DataType, Phase, BenefitType } from '@/lib/types';
import type { TranslationKey } from '@/lib/i18n';
import ExportButton from '@/components/ExportButton';
import FactBrowser from '@/components/analytics/FactBrowser';
import { useTranslation } from '@/lib/i18n';

const dataTypeColors: Record<DataType, string> = {
  empirical: '#10b981',
  survey: '#3b82f6',
  vendor: '#8b5cf6',
  anecdotal: '#f97316',
  info: '#a1a1aa',
};

const dataTypeBadgeColors: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
  info: 'bg-zinc-500/20 text-zinc-400',
};

const credibilityColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#10b981',
};

const PHASE_COLORS: Record<Phase, string> = {
  Discovery: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  'Release & Ops': '#f97316',
};

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal', 'info'];
const SOURCE_CATEGORIES: SourceCategory[] = ['social-media', 'scientific', 'sap', 'salesforce'];
const BENEFIT_TYPES: BenefitType[] = ['efficiency', 'cost', 'other'];

type ScopeFilter = 'all' | 'sdlc' | 'business';

interface AnalyticsFilters {
  years: number[];
  dataTypes: DataType[];
  phases: Phase[];
  hasLink: 'all' | 'yes' | 'no';
  category: 'all' | SourceCategory;
  scope: ScopeFilter;
  benefitTypes: BenefitType[];
  dateRange: [string, string];
  search: string;
}

const ALL_PUBLISH_DATES = facts.map((f) => f.publishDate).filter(Boolean).sort();
const GLOBAL_MIN_DATE = ALL_PUBLISH_DATES[0] || '2023-01-01';
const GLOBAL_MAX_DATE = ALL_PUBLISH_DATES[ALL_PUBLISH_DATES.length - 1] || '2026-12-31';

function dateToDays(d: string): number {
  return Math.floor(new Date(d + 'T00:00:00Z').getTime() / 86400000);
}
function daysToDate(days: number): string {
  return new Date(days * 86400000).toISOString().slice(0, 10);
}

const GLOBAL_MIN_DAYS = dateToDays(GLOBAL_MIN_DATE);
const GLOBAL_MAX_DAYS = dateToDays(GLOBAL_MAX_DATE);

const defaultFilters: AnalyticsFilters = {
  years: [...ALL_YEARS],
  dataTypes: [...ALL_DATA_TYPES],
  phases: [...PHASES],
  hasLink: 'all',
  scope: 'all',
  benefitTypes: [...BENEFIT_TYPES],
  category: 'all',
  dateRange: [GLOBAL_MIN_DATE, GLOBAL_MAX_DATE],
  search: '',
};

function FilterToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
        active
          ? 'bg-accent-dim text-accent border-accent/30'
          : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
      }`}
    >
      {children}
    </button>
  );
}

const categoryColors: Record<string, string> = {
  scientific: '#06b6d4',
  'social-media': '#ec4899',
  sap: '#f59e0b',
  salesforce: '#00a1e0',
  other: '#a1a1aa',
};

const categoryLabelKeys: Record<string, string> = {
  scientific: 'sources.scientific',
  'social-media': 'sources.socialMedia',
  sap: 'sources.sap',
  salesforce: 'sources.salesforce',
  other: 'scenario.categoryOther',
};


export default function AnalyticsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedPhases, setSelectedPhases] = useState<Phase[]>([...PHASES]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<DataType[]>([...ALL_DATA_TYPES]);
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dtKeys: Record<DataType, TranslationKey> = {
    empirical: 'common.empirical',
    survey: 'common.survey',
    vendor: 'common.vendor',
    anecdotal: 'common.anecdotal',
    info: 'common.info',
  };

  const toggleFilterYear = useCallback((year: number) => {
    setFilters((prev) => ({
      ...prev,
      years: prev.years.includes(year) ? prev.years.filter((y) => y !== year) : [...prev.years, year].sort(),
    }));
  }, []);

  const toggleFilterDataType = useCallback((dt: DataType) => {
    setFilters((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dt) ? prev.dataTypes.filter((d) => d !== dt) : [...prev.dataTypes, dt],
    }));
  }, []);

  const toggleFilterPhase = useCallback((phase: Phase) => {
    setFilters((prev) => ({
      ...prev,
      phases: prev.phases.includes(phase) ? prev.phases.filter((p) => p !== phase) : [...prev.phases, phase],
    }));
  }, []);

  const toggleFilterBenefitType = useCallback((bt: BenefitType) => {
    setFilters((prev) => ({
      ...prev,
      benefitTypes: prev.benefitTypes.includes(bt) ? prev.benefitTypes.filter((b) => b !== bt) : [...prev.benefitTypes, bt],
    }));
  }, []);

  const setFilterCategory = useCallback((value: 'all' | SourceCategory) => {
    setFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const setFilterScope = useCallback((value: ScopeFilter) => {
    setFilters((prev) => ({ ...prev, scope: value }));
  }, []);

  const setFilterHasLink = useCallback((value: 'all' | 'yes' | 'no') => {
    setFilters((prev) => ({ ...prev, hasLink: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const isFilterDefault =
    filters.years.length === ALL_YEARS.length &&
    filters.dataTypes.length === ALL_DATA_TYPES.length &&
    filters.phases.length === PHASES.length &&
    filters.hasLink === 'all' &&
    filters.category === 'all' &&
    filters.scope === 'all' &&
    filters.benefitTypes.length === BENEFIT_TYPES.length &&
    filters.dateRange[0] === GLOBAL_MIN_DATE &&
    filters.dateRange[1] === GLOBAL_MAX_DATE &&
    filters.search === '';

  const activeFilterCount = [
    filters.years.length < ALL_YEARS.length,
    filters.dataTypes.length < ALL_DATA_TYPES.length,
    filters.phases.length < PHASES.length,
    filters.hasLink !== 'all',
    filters.category !== 'all',
    filters.scope !== 'all',
    filters.benefitTypes.length < BENEFIT_TYPES.length,
    filters.dateRange[0] !== GLOBAL_MIN_DATE || filters.dateRange[1] !== GLOBAL_MAX_DATE,
    filters.search !== '',
  ].filter(Boolean).length;

  // Filter facts based on filter state
  const filteredFacts = useMemo(() => {
    let result = facts.filter((f) => {
      if (!filters.years.includes(f.year)) return false;
      if (!filters.dataTypes.includes(f.dataType)) return false;
      if (!filters.phases.includes(f.phase)) return false;
      if (filters.scope === 'sdlc' && f.scope === 'business') return false;
      if (filters.scope === 'business' && f.scope !== 'business') return false;
      const bt = f.benefitType ?? 'efficiency';
      if (!filters.benefitTypes.includes(bt)) return false;
      if (f.publishDate && (f.publishDate < filters.dateRange[0] || f.publishDate > filters.dateRange[1])) return false;
      return true;
    });

    // Apply source-level filters (hasLink, category, search) by building sources first
    if (filters.hasLink !== 'all' || filters.category !== 'all' || filters.search) {
      const sources = buildSources(result);
      let filteredSources = sources;
      if (filters.hasLink === 'yes') filteredSources = filteredSources.filter((s) => !!s.url);
      if (filters.hasLink === 'no') filteredSources = filteredSources.filter((s) => !s.url);
      if (filters.category !== 'all') filteredSources = filteredSources.filter((s) => s.category === filters.category);
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        filteredSources = filteredSources.filter((s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.facts.some((f) => f.description.toLowerCase().includes(q))
        );
      }
      const allowedSourceNames = new Set(filteredSources.map((s) => s.name));
      result = result.filter((f) => allowedSourceNames.has(f.source));
    }

    return result;
  }, [filters]);

  const trendFacts = useMemo(
    () => filteredFacts.filter((f) => selectedDataTypes.includes(f.dataType)),
    [filteredFacts, selectedDataTypes]
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

  const stats = useMemo(() => {
    const totalFacts = filteredFacts.length;
    const uniqueSources = new Set(filteredFacts.map((f) => f.source)).size;
    const years = filteredFacts.map((f) => f.year);
    const yearSpan = years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : '—';
    const avgCredibility = totalFacts > 0
      ? filteredFacts.reduce((sum, f) => sum + f.credibility, 0) / totalFacts
      : 0;

    // Facts by year
    const byYear = ALL_YEARS.map((year) => ({
      year: String(year),
      count: filteredFacts.filter((f) => f.year === year).length,
    }));

    // Facts by data type
    const dataTypes: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];
    const byDataType = dataTypes.map((dt) => ({
      dataType: dt,
      label: dt.charAt(0).toUpperCase() + dt.slice(1),
      count: filteredFacts.filter((f) => f.dataType === dt).length,
    }));

    // Facts by phase
    const byPhase = PHASES.map((phase) => ({
      phase,
      count: filteredFacts.filter((f) => f.phase === phase).length,
    }));

    // Facts by source category
    const categoryCounts: Record<string, number> = { scientific: 0, 'social-media': 0, sap: 0, salesforce: 0, other: 0 };
    filteredFacts.forEach((f) => {
      const cat = getSourceCategory(f.source) ?? 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // Facts by scope
    const sdlcFacts = filteredFacts.filter((f) => f.scope !== 'business').length;
    const businessFacts = filteredFacts.filter((f) => f.scope === 'business').length;

    // Year × Phase cross-tabulation
    const yearPhaseMatrix = PHASES.map((phase) => {
      const row: Record<string, number | string> = { phase };
      ALL_YEARS.forEach((year) => {
        row[String(year)] = filteredFacts.filter(
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
        row[String(year)] = filteredFacts.filter(
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
      const phaseFacts = filteredFacts.filter((f) => f.phase === phase);
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
    filteredFacts.forEach((f) => {
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
      byCategory,
      sdlcFacts,
      businessFacts,
      yearPhaseMatrix,
      yearDataTypeMatrix,
      maxYearPhase,
      maxYearDt,
      credByPhase,
      topSources,
    };
  }, [filteredFacts]);

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

      {/* Collapsible Filters */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{t('common.filters')}</span>
            {!isFilterDefault && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent font-medium">
                {activeFilterCount}
              </span>
            )}
            {!isFilterDefault && (
              <span className="text-xs text-muted">
                ({filteredFacts.length} / {facts.length} {t('common.facts')})
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        {filtersOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-border/50">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder={t('sources.searchPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {/* Years */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.year')}</span>
                <div className="flex gap-1">
                  {ALL_YEARS.map((year) => (
                    <FilterToggleButton key={year} active={filters.years.includes(year)} onClick={() => toggleFilterYear(year)}>
                      {year}
                    </FilterToggleButton>
                  ))}
                </div>
              </div>

              {/* Data Types */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.type')}</span>
                <div className="flex gap-1">
                  {ALL_DATA_TYPES.map((dt) => (
                    <FilterToggleButton key={dt} active={filters.dataTypes.includes(dt)} onClick={() => toggleFilterDataType(dt)}>
                      {t(dtKeys[dt])}
                    </FilterToggleButton>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.phase')}</span>
                <div className="flex gap-1">
                  {PHASES.map((phase) => (
                    <FilterToggleButton key={phase} active={filters.phases.includes(phase)} onClick={() => toggleFilterPhase(phase)}>
                      {phase}
                    </FilterToggleButton>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.category')}</span>
                <div className="flex gap-1">
                  <FilterToggleButton active={filters.category === 'all'} onClick={() => setFilterCategory('all')}>
                    {t('sources.all')}
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.category === 'scientific'} onClick={() => setFilterCategory('scientific')}>
                    {t('sources.scientific')}
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.category === 'social-media'} onClick={() => setFilterCategory('social-media')}>
                    {t('sources.socialMedia')}
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.category === 'sap'} onClick={() => setFilterCategory('sap')}>
                    {t('sources.sap')}
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.category === 'salesforce'} onClick={() => setFilterCategory('salesforce')}>
                    {t('sources.salesforce')}
                  </FilterToggleButton>
                </div>
              </div>

              {/* Scope */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.scope')}</span>
                <div className="flex gap-1">
                  <FilterToggleButton active={filters.scope === 'all'} onClick={() => setFilterScope('all')}>
                    {t('sources.all')}
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.scope === 'sdlc'} onClick={() => setFilterScope('sdlc')}>
                    SDLC
                  </FilterToggleButton>
                  <FilterToggleButton active={filters.scope === 'business'} onClick={() => setFilterScope('business')}>
                    Business
                  </FilterToggleButton>
                </div>
              </div>

              {/* Benefit Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.benefitType')}</span>
                <div className="flex gap-1">
                  {BENEFIT_TYPES.map((bt) => (
                    <FilterToggleButton key={bt} active={filters.benefitTypes.includes(bt)} onClick={() => toggleFilterBenefitType(bt)}>
                      {t(`sources.benefitType_${bt}` as TranslationKey)}
                    </FilterToggleButton>
                  ))}
                </div>
              </div>

              {/* Has Link */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.link')}</span>
                <div className="flex gap-1">
                  {(['all', 'yes', 'no'] as const).map((v) => (
                    <FilterToggleButton key={v} active={filters.hasLink === v} onClick={() => setFilterHasLink(v)}>
                      {v === 'all' ? t('sources.any') : v === 'yes' ? t('sources.hasLink') : t('sources.noLink')}
                    </FilterToggleButton>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {!isFilterDefault && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('common.reset')}
                </button>
              )}

              {/* Date Range Slider */}
              <div className="w-full pt-3 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-medium uppercase tracking-wider shrink-0">{t('sources.dateRange')}</span>
                  <span className="text-xs text-accent tabular-nums font-medium shrink-0">{filters.dateRange[0]}</span>
                  <div className="relative flex-1 h-8 min-w-[200px]">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border rounded-full" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1 bg-accent/40 rounded-full"
                      style={{
                        left: `${GLOBAL_MAX_DAYS > GLOBAL_MIN_DAYS ? ((dateToDays(filters.dateRange[0]) - GLOBAL_MIN_DAYS) / (GLOBAL_MAX_DAYS - GLOBAL_MIN_DAYS)) * 100 : 0}%`,
                        right: `${GLOBAL_MAX_DAYS > GLOBAL_MIN_DAYS ? 100 - ((dateToDays(filters.dateRange[1]) - GLOBAL_MIN_DAYS) / (GLOBAL_MAX_DAYS - GLOBAL_MIN_DAYS)) * 100 : 0}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={GLOBAL_MIN_DAYS}
                      max={GLOBAL_MAX_DAYS}
                      step={1}
                      value={dateToDays(filters.dateRange[0])}
                      onChange={(e) => {
                        const d = daysToDate(Number(e.target.value));
                        setFilters((prev) => ({
                          ...prev,
                          dateRange: [d <= prev.dateRange[1] ? d : prev.dateRange[1], prev.dateRange[1]],
                        }));
                      }}
                      className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <input
                      type="range"
                      min={GLOBAL_MIN_DAYS}
                      max={GLOBAL_MAX_DAYS}
                      step={1}
                      value={dateToDays(filters.dateRange[1])}
                      onChange={(e) => {
                        const d = daysToDate(Number(e.target.value));
                        setFilters((prev) => ({
                          ...prev,
                          dateRange: [prev.dateRange[0], d >= prev.dateRange[0] ? d : prev.dateRange[0]],
                        }));
                      }}
                      className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-accent tabular-nums font-medium shrink-0">{filters.dateRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={contentRef} className="space-y-8">
      {/* A) Hero Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('analytics.totalFacts'), value: stats.totalFacts, detail: `${stats.sdlcFacts} SDLC · ${stats.businessFacts} Business` },
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
            {'detail' in card && card.detail && (
              <p className="text-xs text-muted mt-1">{card.detail}</p>
            )}
          </div>
        ))}
      </div>

      {/* Fact Browser */}
      <FactBrowser facts={filteredFacts} />

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

      {/* B) Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

        {/* Facts by Category */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {t('analytics.factsByCategory')}
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.byCategory}
              layout="vertical"
              margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#71717a', fontSize: 12 }}
                width={80}
                tickFormatter={(v: string) => t(categoryLabelKeys[v] as Parameters<typeof t>[0])}
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
                labelFormatter={(v) => t(categoryLabelKeys[String(v)] as Parameters<typeof t>[0])}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={barClick((p) => {
                  const cat = p.category as string;
                  if (cat === 'other') {
                    drillDown({});
                  } else {
                    drillDown({ category: cat });
                  }
                })}
              >
                {stats.byCategory.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={categoryColors[entry.category] || '#a1a1aa'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
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
