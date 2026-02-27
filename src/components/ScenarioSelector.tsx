'use client';

import { useRouter } from 'next/navigation';
import { ScenarioType } from '@/lib/types';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import { computeMETRMultiplier } from '@/lib/calculations';
import type { TranslationKey } from '@/lib/i18n/translations';

interface ScenarioSelectorProps {
  onActivate: (scenario: ScenarioType) => void;
  onDeactivate: () => void;
}

function formatYearLabel(years: number[]): string {
  const sorted = [...years].sort();
  if (sorted.length === 0) return '';
  if (sorted.length === 4) return 'All';
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const isConsecutive = sorted.every((y, i) => i === 0 || y === sorted[i - 1] + 1);
  if (isConsecutive && sorted.length > 1) {
    return `${String(first).slice(2)}\u2013${String(last).slice(2)}`;
  }
  return sorted.map((y) => String(y).slice(2)).join(',');
}

const SCENARIO_STYLES: Record<ScenarioType, {
  labelKey: TranslationKey;
  color: string;
  activeBg: string;
  activeBorder: string;
}> = {
  pessimistic: {
    labelKey: 'roi.pessimistic',
    color: '#ef4444',
    activeBg: 'bg-red-500/15',
    activeBorder: 'border-red-500/50',
  },
  realistic: {
    labelKey: 'roi.realistic',
    color: '#f59e0b',
    activeBg: 'bg-amber-500/15',
    activeBorder: 'border-amber-500/50',
  },
  optimistic: {
    labelKey: 'roi.optimistic',
    color: '#10b981',
    activeBg: 'bg-emerald-500/15',
    activeBorder: 'border-emerald-500/50',
  },
};

export default function ScenarioSelector({ onActivate, onDeactivate }: ScenarioSelectorProps) {
  const { configs, activeScenario } = useScenario();
  const { t } = useTranslation();
  const router = useRouter();

  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  function handleClick(key: ScenarioType) {
    if (activeScenario === key) {
      onDeactivate();
    } else {
      onActivate(key);
    }
  }

  const metrMultiplier = computeMETRMultiplier(configs.metrConfig);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted font-medium uppercase tracking-wider">
        {t('scenario.scenarios')}
      </span>
      <div className="flex gap-1.5">
        {scenarioKeys.map((key) => {
          const style = SCENARIO_STYLES[key];
          const isActive = activeScenario === key;
          const yearLabel = formatYearLabel(configs[key].years);
          const metrSuffix = key === 'optimistic' && configs.metrConfig.enabled
            ? ` +${metrMultiplier.toFixed(0)}x`
            : '';

          return (
            <button
              key={key}
              onClick={() => handleClick(key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                isActive
                  ? `${style.activeBg} ${style.activeBorder}`
                  : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
              }`}
              style={isActive ? { color: style.color } : undefined}
            >
              {t(style.labelKey)} {yearLabel}{metrSuffix}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => router.push('/analytics#scenarios')}
        className="px-3 py-1.5 text-xs rounded-md border border-accent/30 bg-accent-dim text-accent hover:bg-accent/20 transition-colors font-medium"
      >
        {t('scenario.configure')}
      </button>
    </div>
  );
}
