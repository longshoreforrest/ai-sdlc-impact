'use client';

import { Fact, ScenarioType } from '@/lib/types';
import { ScenarioConfigs } from '@/lib/types';
import { computeMETRMultiplier } from '@/lib/calculations';
import { SCENARIO_COLORS, SCENARIO_LABEL_KEYS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/translations';

interface ScenarioDefinitionCardsProps {
  scenarioConfigs: ScenarioConfigs;
  facts: Fact[];
}

const SCENARIO_MODEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'scenario.modelPessimistic',
  realistic: 'scenario.modelRealistic',
  optimistic: 'scenario.modelOptimistic',
};

const SCENARIO_BORDER_COLORS: Record<ScenarioType, string> = {
  pessimistic: 'border-red-300',
  realistic: 'border-amber-300',
  optimistic: 'border-emerald-300',
};

const SCENARIO_BG_COLORS: Record<ScenarioType, string> = {
  pessimistic: 'bg-red-50',
  realistic: 'bg-amber-50',
  optimistic: 'bg-emerald-50',
};

export default function ScenarioDefinitionCards({ scenarioConfigs, facts }: ScenarioDefinitionCardsProps) {
  const { t } = useTranslation();
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];
  const metrMultiplier = computeMETRMultiplier(scenarioConfigs.metrConfig);

  function getMatchingCounts(key: ScenarioType): { factCount: number; sourceCount: number } {
    const config = scenarioConfigs[key];
    const matched = facts.filter(
      (f) => config.years.includes(f.year) && config.dataTypes.includes(f.dataType)
    );
    const uniqueSources = new Set(matched.map((f) => f.source));
    return { factCount: matched.length, sourceCount: uniqueSources.size };
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioKeys.map((key) => {
          const config = scenarioConfigs[key];
          const { factCount, sourceCount } = getMatchingCounts(key);

          return (
            <div
              key={key}
              className={`border rounded-lg p-4 space-y-3 ${SCENARIO_BORDER_COLORS[key]} ${SCENARIO_BG_COLORS[key]}`}
            >
              {/* Scenario name + model */}
              <div>
                <h3
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: SCENARIO_COLORS[key] }}
                >
                  {t(SCENARIO_LABEL_KEYS[key])}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {t(SCENARIO_MODEL_KEYS[key])}
                </p>
              </div>

              {/* Years */}
              <div>
                <p className="text-xs text-zinc-500 mb-1">{t('scenario.years')}:</p>
                <div className="flex flex-wrap gap-1">
                  {config.years.map((year) => (
                    <span
                      key={year}
                      className="px-2 py-0.5 text-xs rounded-full bg-white border border-zinc-200 text-zinc-700 tabular-nums"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </div>

              {/* Data types */}
              <div>
                <p className="text-xs text-zinc-500 mb-1">{t('scenario.sources')}:</p>
                <div className="flex flex-wrap gap-1">
                  {config.dataTypes.map((dt) => (
                    <span
                      key={dt}
                      className="px-2 py-0.5 text-xs rounded-full bg-white border border-zinc-200 text-zinc-700"
                    >
                      {t(`common.${dt}` as TranslationKey)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Adoption factor */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {t('scenario.adoptionFactor')} (&beta;):
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: SCENARIO_COLORS[key] }}
                >
                  {(config.adoptionFactor ?? 1.0).toFixed(2)}
                </span>
              </div>

              {/* Matching facts & sources */}
              <p className="text-xs text-zinc-500 tabular-nums">
                {t('scenario.matchingFacts', { count: factCount })} &middot; {t('scenario.matchingSources', { count: sourceCount })}
              </p>
            </div>
          );
        })}
      </div>

      {/* METR projection section */}
      {scenarioConfigs.metrConfig.enabled && (
        <div className="mt-4 border border-emerald-200 bg-emerald-50 rounded-lg p-4">
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            {t('report.metrProjection')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500">{t('scenario.doublingPeriod')}</p>
              <p className="font-medium text-zinc-800 tabular-nums">
                {scenarioConfigs.metrConfig.doublingPeriodMonths} {t('scenario.months')}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('scenario.horizon')}</p>
              <p className="font-medium text-zinc-800 tabular-nums">
                {scenarioConfigs.metrConfig.futureOffsetMonths} {t('scenario.months')}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('scenario.adoptionElasticity')}</p>
              <p className="font-medium text-zinc-800 tabular-nums">
                {(scenarioConfigs.metrConfig.adoptionElasticity ?? 0.5).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('scenario.metrMultiplier')}</p>
              <p className="font-bold text-emerald-700 tabular-nums">
                {metrMultiplier.toFixed(1)}x
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
