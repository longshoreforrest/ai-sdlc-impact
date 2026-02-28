import { ScenarioConfig, ScenarioType, METRConfig } from './types';
import { computeMETRMultiplier } from './calculations';
import { TranslationKey } from './i18n/translations';

function formatYearRange(years: number[]): string {
  if (years.length === 0) return '';
  const sorted = [...years].sort();
  if (sorted.length === 1) return String(sorted[0]);
  // Check if consecutive
  const isConsecutive = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);
  if (isConsecutive) return `${sorted[0]}\u2013${sorted[sorted.length - 1]}`;
  return sorted.join(', ');
}

function formatDataTypes(
  dataTypes: string[],
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
): string {
  return dataTypes
    .map((dt) => t(`common.${dt}` as TranslationKey))
    .join(', ');
}

export function generateScenarioDescription(
  type: ScenarioType,
  config: ScenarioConfig,
  metrConfig: METRConfig,
  factCount: number,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
): string {
  const years = formatYearRange(config.years);
  const types = formatDataTypes(config.dataTypes, t);
  const adoptionFactor = (config.adoptionFactor ?? 1.0).toFixed(2);

  if (type === 'pessimistic') {
    return t('scenario.descPessimistic', { count: factCount, years, types, adoptionFactor });
  }

  if (type === 'realistic') {
    return t('scenario.descRealistic', { count: factCount, years, types, adoptionFactor });
  }

  // Optimistic
  if (metrConfig.enabled) {
    const multiplier = computeMETRMultiplier(metrConfig);
    return t('scenario.descOptimisticMetr', {
      count: factCount,
      years,
      multiplier: multiplier.toFixed(1),
      doubling: metrConfig.doublingPeriodMonths,
      horizon: metrConfig.futureOffsetMonths,
      adoptionFactor,
    });
  }

  return t('scenario.descOptimistic', { count: factCount, years, types, adoptionFactor });
}
