'use client';

import { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, RotateCcw, ChevronDown, X, Search, Plus, FileSpreadsheet } from 'lucide-react';
import { facts, PHASES, ALL_YEARS } from '@/lib/mock-data';
import { DataType, Phase, Fact } from '@/lib/types';
import { getSourceSuggestions } from '@/lib/suggestions';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { exportSourcesToExcel } from '@/lib/export-excel';
import { SourceCategory, SourceEntry, buildSources } from '@/lib/sources';
import SuggestSourcePanel from '@/components/sources/SuggestSourcePanel';

const categoryBadge: Record<string, { label: string; className: string }> = {
  'social-media': { label: 'Social Media', className: 'bg-pink-500/20 text-pink-400' },
  scientific: { label: 'Scientific Reference', className: 'bg-cyan-500/20 text-cyan-400' },
};

const DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];
const SOURCE_CATEGORIES: SourceCategory[] = ['social-media', 'scientific'];

const dataTypeBadgeColors: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
};

interface SourceFilters {
  years: number[];
  dataTypes: DataType[];
  phases: Phase[];
  hasLink: 'all' | 'yes' | 'no';
  category: 'all' | SourceCategory;
  dateRange: [string, string];
}

// Date helpers for range slider
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

const defaultFilters: SourceFilters = {
  years: [...ALL_YEARS],
  dataTypes: [...DATA_TYPES],
  phases: [...PHASES],
  hasLink: 'all',
  category: 'all',
  dateRange: [GLOBAL_MIN_DATE, GLOBAL_MAX_DATE],
};

function ToggleButton({
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


function CredibilityDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5" title={`Credibility: ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level ? 'bg-accent' : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}

function parseUrlFilters(searchParams: URLSearchParams): { filters: SourceFilters; fromDashboard: boolean } {
  const phasesParam = searchParams.get('phases');
  const yearsParam = searchParams.get('years');
  const dataTypesParam = searchParams.get('dataTypes');

  if (!phasesParam && !yearsParam && !dataTypesParam) return { filters: defaultFilters, fromDashboard: false };

  const phases = phasesParam
    ? phasesParam.split(',').filter((p): p is Phase => PHASES.includes(p as Phase))
    : [...PHASES];
  const years = yearsParam
    ? yearsParam.split(',').map(Number).filter((y) => (ALL_YEARS as readonly number[]).includes(y))
    : [...ALL_YEARS];
  const dataTypes = dataTypesParam
    ? dataTypesParam.split(',').filter((d): d is DataType => DATA_TYPES.includes(d as DataType))
    : [...DATA_TYPES];

  return {
    filters: {
      years: years.length > 0 ? years : [...ALL_YEARS],
      dataTypes: dataTypes.length > 0 ? dataTypes : [...DATA_TYPES],
      phases: phases.length > 0 ? phases : [...PHASES],
      hasLink: 'all',
      category: 'all',
      dateRange: [GLOBAL_MIN_DATE, GLOBAL_MAX_DATE] as [string, string],
    },
    fromDashboard: true,
  };
}

export default function SourcesPage() {
  return (
    <Suspense>
      <SourcesPageContent />
    </Suspense>
  );
}

function SourcesPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const parsed = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const [filters, setFilters] = useState<SourceFilters>(() => parsed.filters);
  const [fromDashboard, setFromDashboard] = useState(parsed.fromDashboard);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestionCount, setSuggestionCount] = useState(0);

  const dtKeys: Record<DataType, TranslationKey> = {
    empirical: 'common.empirical',
    survey: 'common.survey',
    vendor: 'common.vendor',
    anecdotal: 'common.anecdotal',
  };

  useEffect(() => {
    setSuggestionCount(getSourceSuggestions().length);
  }, []);

  const toggleExpand = useCallback((name: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

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

  const setHasLink = useCallback((value: 'all' | 'yes' | 'no') => {
    setFilters((prev) => ({ ...prev, hasLink: value }));
  }, []);

  const setCategory = useCallback((value: 'all' | SourceCategory) => {
    setFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery('');
    setFromDashboard(false);
  }, []);

  const isDefault =
    filters.years.length === ALL_YEARS.length &&
    filters.dataTypes.length === DATA_TYPES.length &&
    filters.phases.length === PHASES.length &&
    filters.hasLink === 'all' &&
    filters.category === 'all' &&
    filters.dateRange[0] === GLOBAL_MIN_DATE &&
    filters.dateRange[1] === GLOBAL_MAX_DATE &&
    searchQuery === '';

  const filteredFacts = useMemo(() => {
    return facts.filter((f) => {
      if (!filters.years.includes(f.year)) return false;
      if (!filters.dataTypes.includes(f.dataType)) return false;
      if (!filters.phases.includes(f.phase)) return false;
      if (f.publishDate && (f.publishDate < filters.dateRange[0] || f.publishDate > filters.dateRange[1])) return false;
      return true;
    });
  }, [filters.years, filters.dataTypes, filters.phases, filters.dateRange]);

  const totalSources = useMemo(() => buildSources(facts).length, []);

  const sources = useMemo(() => {
    let result = buildSources(filteredFacts);
    if (filters.hasLink === 'yes') result = result.filter((s) => !!s.url);
    if (filters.hasLink === 'no') result = result.filter((s) => !s.url);
    if (filters.category !== 'all') result = result.filter((s) => s.category === filters.category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.facts.some((f) => f.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [filteredFacts, filters.hasLink, filters.category, searchQuery]);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('sources.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {isDefault
              ? <>{t('sources.sourcesAcross', { count: sources.length, dataPoints: filteredFacts.length })}</>
              : <><span className="text-foreground font-medium">{t('sources.filteredCount', { filtered: sources.length, total: totalSources, filteredPoints: filteredFacts.length, totalPoints: facts.length })}</span></>
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportSourcesToExcel(sources, `sources-${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 text-emerald-600 text-sm font-medium hover:bg-emerald-600/20 transition-colors"
            title={t('sources.exportExcel')}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t('sources.exportExcel')}
          </button>
          <button
            onClick={() => setSuggestOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors relative"
          >
            <Plus className="w-4 h-4" />
            {t('sources.suggestSource')}
            {suggestionCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                {suggestionCount}
              </span>
            )}
          </button>
          {fromDashboard && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-dim rounded-lg border border-accent/20">
              <span className="text-xs text-accent font-medium">{t('sources.filteredFromDashboard')}</span>
              <button
                onClick={resetFilters}
                className="p-0.5 rounded hover:bg-accent/20 text-accent transition-colors"
                title="Clear dashboard filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('sources.searchPlaceholder')}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-surface rounded-xl border border-border">
        {/* Years */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.year')}</span>
          <div className="flex gap-1">
            {ALL_YEARS.map((year) => (
              <ToggleButton key={year} active={filters.years.includes(year)} onClick={() => toggleYear(year)}>
                {year}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Data Types */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.type')}</span>
          <div className="flex gap-1">
            {DATA_TYPES.map((dt) => (
              <ToggleButton key={dt} active={filters.dataTypes.includes(dt)} onClick={() => toggleDataType(dt)}>
                {t(dtKeys[dt])}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.phase')}</span>
          <div className="flex gap-1">
            {PHASES.map((phase) => (
              <ToggleButton key={phase} active={filters.phases.includes(phase)} onClick={() => togglePhase(phase)}>
                {phase}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.category')}</span>
          <div className="flex gap-1">
            <ToggleButton active={filters.category === 'all'} onClick={() => setCategory('all')}>
              {t('sources.all')}
            </ToggleButton>
            <ToggleButton active={filters.category === 'scientific'} onClick={() => setCategory('scientific')}>
              {t('sources.scientific')}
            </ToggleButton>
            <ToggleButton active={filters.category === 'social-media'} onClick={() => setCategory('social-media')}>
              {t('sources.socialMedia')}
            </ToggleButton>
          </div>
        </div>

        {/* Has Link */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.link')}</span>
          <div className="flex gap-1">
            {(['all', 'yes', 'no'] as const).map((v) => (
              <ToggleButton key={v} active={filters.hasLink === v} onClick={() => setHasLink(v)}>
                {v === 'all' ? t('sources.any') : v === 'yes' ? t('sources.hasLink') : t('sources.noLink')}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Reset */}
        {!isDefault && (
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
              {/* Track background */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border rounded-full" />
              {/* Active range highlight */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 bg-accent/40 rounded-full"
                style={{
                  left: `${GLOBAL_MAX_DAYS > GLOBAL_MIN_DAYS ? ((dateToDays(filters.dateRange[0]) - GLOBAL_MIN_DAYS) / (GLOBAL_MAX_DAYS - GLOBAL_MIN_DAYS)) * 100 : 0}%`,
                  right: `${GLOBAL_MAX_DAYS > GLOBAL_MIN_DAYS ? 100 - ((dateToDays(filters.dateRange[1]) - GLOBAL_MIN_DAYS) / (GLOBAL_MAX_DAYS - GLOBAL_MIN_DAYS)) * 100 : 0}%`,
                }}
              />
              {/* Min slider */}
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
              {/* Max slider */}
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

      {/* Source list */}
      {sources.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          {t('sources.noMatch')}
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source, index) => {
            const isExpanded = expandedSources.has(source.name);
            return (
              <div
                key={source.name}
                className="bg-surface rounded-xl border border-border overflow-hidden transition-colors hover:border-muted"
              >
                {/* Source header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-mono text-muted tabular-nums mt-0.5 shrink-0 w-8 text-right">
                      [{index + 1}]
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-accent hover:underline flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {source.name}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <h3 className="text-sm font-medium text-foreground">{source.name}</h3>
                        )}
                        {source.category && (
                          <span className={`px-2 py-0.5 text-xs rounded-md whitespace-nowrap ${categoryBadge[source.category].className}`}>
                            {source.category === 'social-media' ? t('sources.socialMedia') : t('sources.scientific')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted leading-relaxed mb-3">
                        {source.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {source.dataTypes.map((dt) => (
                          <span key={dt} className={`px-2 py-0.5 text-xs rounded-md ${dataTypeBadgeColors[dt]}`}>
                            {dt}
                          </span>
                        ))}
                        {source.phases.map((phase) => (
                          <span key={phase} className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted">
                            {phase}
                          </span>
                        ))}
                        <span className="text-xs text-muted">
                          {source.years.sort().join(', ')}
                        </span>
                        {source.earliestDate && (
                          <span className="text-xs text-muted tabular-nums">
                            {source.earliestDate === source.latestDate
                              ? source.earliestDate
                              : `${source.earliestDate} – ${source.latestDate}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(source.name)}
                      className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                    >
                      <span className="text-lg font-bold tabular-nums text-accent">{source.factCount}</span>
                      <p className="text-xs text-muted">{source.factCount === 1 ? t('common.fact') : t('common.facts')}</p>
                      <ChevronDown
                        className={`w-4 h-4 text-muted group-hover:text-foreground transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded facts */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {source.facts
                      .sort((a, b) => b.year - a.year || b.impactPct - a.impactPct)
                      .map((fact) => (
                        <div
                          key={fact.id}
                          className="px-5 py-3 border-b border-border/50 last:border-b-0 flex items-start gap-4"
                        >
                          <span className="text-lg font-bold tabular-nums text-accent shrink-0 w-14 text-right">
                            {fact.impactPct}%
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-relaxed">
                              {fact.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className={`px-2 py-0.5 text-xs rounded-md ${dataTypeBadgeColors[fact.dataType]}`}>
                                {fact.dataType}
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted">
                                {fact.phase}
                              </span>
                              <span className="text-xs text-muted">{fact.year}</span>
                              {fact.publishDate && (
                                <span className="text-xs text-muted tabular-nums">{fact.publishDate}</span>
                              )}
                              {fact.sampleSize && (
                                <span className="text-xs text-muted">n={fact.sampleSize}</span>
                              )}
                              <CredibilityDots level={fact.credibility} />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SuggestSourcePanel
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        onSubmitted={() => setSuggestionCount(getSourceSuggestions().length)}
      />
    </div>
  );
}
