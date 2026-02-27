'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, RotateCcw, ExternalLink } from 'lucide-react';
import { DataType, ScenarioType } from '@/lib/types';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import { facts } from '@/lib/mock-data';
import { ALL_YEARS } from '@/lib/mock-data';
import { computeMETRMultiplier } from '@/lib/calculations';
import { generateScenarioDescription } from '@/lib/scenario-descriptions';
import type { TranslationKey } from '@/lib/i18n/translations';

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

const DATA_TYPE_SHORT: Record<DataType, string> = {
  empirical: 'Emp',
  survey: 'Srv',
  vendor: 'Vnd',
  anecdotal: 'Anc',
};

const SCENARIO_STYLES: Record<ScenarioType, { labelKey: TranslationKey; color: string; activeClass: string; bgClass: string }> = {
  pessimistic: { labelKey: 'roi.pessimistic', color: '#ef4444', activeClass: 'bg-red-500/15 text-red-400 border-red-500/30', bgClass: 'border-red-500/20' },
  realistic:   { labelKey: 'roi.realistic',   color: '#f59e0b', activeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30', bgClass: 'border-amber-500/20' },
  optimistic:  { labelKey: 'roi.optimistic',  color: '#10b981', activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', bgClass: 'border-emerald-500/20' },
};

export default function ScenarioConfigurator() {
  const { configs, setConfigs, resetToDefaults } = useScenario();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  function toggleYear(scenario: ScenarioType, year: number) {
    const current = configs[scenario].years;
    const updated = current.includes(year)
      ? current.filter((y) => y !== year)
      : [...current, year].sort();
    if (updated.length === 0) return;
    setConfigs({ ...configs, [scenario]: { ...configs[scenario], years: updated } });
  }

  function toggleDataType(scenario: ScenarioType, dt: DataType) {
    const current = configs[scenario].dataTypes;
    const updated = current.includes(dt)
      ? current.filter((d) => d !== dt)
      : [...current, dt];
    if (updated.length === 0) return;
    setConfigs({ ...configs, [scenario]: { ...configs[scenario], dataTypes: updated } });
  }

  function getScenarioCounts(scenario: ScenarioType): { factCount: number; sourceCount: number } {
    const config = configs[scenario];
    const matched = facts.filter(
      (f) => config.years.includes(f.year) && config.dataTypes.includes(f.dataType)
    );
    const uniqueSources = new Set(matched.map((f) => f.source));
    return { factCount: matched.length, sourceCount: uniqueSources.size };
  }

  function getSourcesUrl(scenario: ScenarioType): string {
    const config = configs[scenario];
    const params = new URLSearchParams();
    params.set('years', config.years.join(','));
    params.set('dataTypes', config.dataTypes.join(','));
    return `/sources?${params.toString()}`;
  }

  const metrMultiplier = useMemo(
    () => computeMETRMultiplier(configs.metrConfig),
    [configs.metrConfig]
  );

  return (
    <div id="scenarios" className="bg-surface border border-border rounded-xl">
      {/* Header / toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h2 className="text-sm font-semibold text-foreground">{t('scenario.title')}</h2>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-5">
          {/* Three-column layout */}
          <div className="grid grid-cols-3 gap-5">
            {scenarioKeys.map((key) => {
              const style = SCENARIO_STYLES[key];
              const { factCount, sourceCount } = getScenarioCounts(key);

              return (
                <div key={key} className={`border rounded-lg p-4 space-y-3 ${style.bgClass}`}>
                  {/* Scenario label */}
                  <h3 className="text-sm font-semibold" style={{ color: style.color }}>
                    {t(style.labelKey)}
                  </h3>

                  {/* Year toggles */}
                  <div>
                    <p className="text-xs text-muted mb-1.5">{t('scenario.years')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {ALL_YEARS.map((year) => {
                        const isActive = configs[key].years.includes(year);
                        return (
                          <button
                            key={year}
                            onClick={() => toggleYear(key, year)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              isActive
                                ? style.activeClass
                                : 'bg-zinc-50 text-muted border-border hover:text-foreground opacity-50'
                            }`}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* DataType toggles */}
                  <div>
                    <p className="text-xs text-muted mb-1.5">{t('scenario.sources')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {ALL_DATA_TYPES.map((dt) => {
                        const isActive = configs[key].dataTypes.includes(dt);
                        return (
                          <button
                            key={dt}
                            onClick={() => toggleDataType(key, dt)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              isActive
                                ? style.activeClass
                                : 'bg-zinc-50 text-muted border-border hover:text-foreground opacity-50'
                            }`}
                          >
                            {DATA_TYPE_SHORT[dt]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matching facts & sources count */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted tabular-nums">
                      {t('scenario.matchingFacts', { count: factCount })} · {t('scenario.matchingSources', { count: sourceCount })}
                    </p>
                    <Link
                      href={getSourcesUrl(key)}
                      className="flex items-center gap-1 text-xs font-medium hover:underline transition-colors"
                      style={{ color: style.color }}
                    >
                      {t('scenario.viewSources')}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* METR section — optimistic only */}
                  {key === 'optimistic' && (
                    <div className="border border-emerald-500/20 rounded-lg p-3 space-y-2 bg-emerald-500/5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-emerald-400">{t('scenario.metrMultiplier')}</p>
                        <Link
                          href="/sources?search=METR+%E2%80%94+AI+Task-Completion+Time+Horizons"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                        >
                          METR Research
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={configs.metrConfig.enabled}
                          onChange={(e) =>
                            setConfigs({
                              ...configs,
                              metrConfig: { ...configs.metrConfig, enabled: e.target.checked },
                            })
                          }
                          className="rounded border-border accent-emerald-500"
                        />
                        {t('scenario.metrEnabled')}
                      </label>
                      {configs.metrConfig.enabled && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted w-24">{t('scenario.doublingPeriod')}:</span>
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={configs.metrConfig.doublingPeriodMonths}
                              onChange={(e) =>
                                setConfigs({
                                  ...configs,
                                  metrConfig: {
                                    ...configs.metrConfig,
                                    doublingPeriodMonths: Math.max(1, parseInt(e.target.value) || 1),
                                  },
                                })
                              }
                              className="w-16 px-2 py-1 text-xs rounded border border-border bg-surface text-foreground"
                            />
                            <span className="text-xs text-muted">{t('scenario.months')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted w-24">{t('scenario.horizon')}:</span>
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={configs.metrConfig.futureOffsetMonths}
                              onChange={(e) =>
                                setConfigs({
                                  ...configs,
                                  metrConfig: {
                                    ...configs.metrConfig,
                                    futureOffsetMonths: Math.max(1, parseInt(e.target.value) || 1),
                                  },
                                })
                              }
                              className="w-16 px-2 py-1 text-xs rounded border border-border bg-surface text-foreground"
                            />
                            <span className="text-xs text-muted">{t('scenario.months')}</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted">{t('scenario.adoptionElasticity')}:</span>
                              <span className="text-xs font-medium text-emerald-400 tabular-nums">{(configs.metrConfig.adoptionElasticity ?? 0.5).toFixed(1)}</span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={300}
                              step={10}
                              value={Math.round((configs.metrConfig.adoptionElasticity ?? 0.5) * 100)}
                              onChange={(e) =>
                                setConfigs({
                                  ...configs,
                                  metrConfig: {
                                    ...configs.metrConfig,
                                    adoptionElasticity: Number(e.target.value) / 100,
                                  },
                                })
                              }
                              className="w-full accent-emerald-500 h-1"
                            />
                            <div className="flex justify-between mt-0.5">
                              <span className="text-[10px] text-muted">0.1</span>
                              <span className="text-[10px] text-muted">3.0</span>
                            </div>
                            <p className="text-[10px] text-muted mt-0.5">{t('scenario.adoptionElasticityDesc')}</p>
                          </div>
                          <p className="text-xs font-medium text-emerald-400">
                            &rarr; {t('scenario.multiplierResult', {
                              multiplier: metrMultiplier.toFixed(1),
                              percent: Math.round((metrMultiplier - 1) * 100),
                            })}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Auto-generated description */}
                  <p className="text-xs text-muted leading-relaxed italic">
                    {generateScenarioDescription(key, configs[key], configs.metrConfig, factCount, t)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reset button */}
          <div className="flex justify-start">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('scenario.resetDefaults')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
