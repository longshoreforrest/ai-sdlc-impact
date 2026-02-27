'use client';

import { ScenarioConfigs, ScenarioType, DataType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { facts } from '@/lib/mock-data';
import type { TranslationKey } from '@/lib/i18n/translations';

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

const DATA_TYPE_LABEL_KEYS: Record<DataType, TranslationKey> = {
  empirical: 'common.empirical',
  survey: 'common.survey',
  vendor: 'common.vendor',
  anecdotal: 'common.anecdotal',
};

interface ScenarioConfigPanelProps {
  configs: ScenarioConfigs;
  onChange: (configs: ScenarioConfigs) => void;
  availableYears: number[];
  factCountsByYear: Record<number, number>;
}

const SCENARIO_STYLES: Record<ScenarioType, { labelKey: TranslationKey; color: string; activeClass: string }> = {
  pessimistic: { labelKey: 'roi.pessimistic', color: '#ef4444', activeClass: 'bg-red-500/15 text-red-400 border-red-500/30' },
  realistic:   { labelKey: 'roi.realistic',   color: '#f59e0b', activeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  optimistic:  { labelKey: 'roi.optimistic',  color: '#10b981', activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export default function ScenarioConfigPanel({ configs, onChange, availableYears, factCountsByYear }: ScenarioConfigPanelProps) {
  const { t } = useTranslation();
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  function toggleYear(scenario: ScenarioType, year: number) {
    const current = configs[scenario].years;
    const updated = current.includes(year)
      ? current.filter((y) => y !== year)
      : [...current, year].sort();
    if (updated.length === 0) return;
    onChange({ ...configs, [scenario]: { ...configs[scenario], years: updated } });
  }

  function toggleDataType(scenario: ScenarioType, dt: DataType) {
    const current = configs[scenario].dataTypes;
    const updated = current.includes(dt)
      ? current.filter((d) => d !== dt)
      : [...current, dt];
    if (updated.length === 0) return;
    onChange({ ...configs, [scenario]: { ...configs[scenario], dataTypes: updated } });
  }

  function getFactCount(scenario: ScenarioType): number {
    const config = configs[scenario];
    return facts.filter(
      (f) => config.years.includes(f.year) && config.dataTypes.includes(f.dataType)
    ).length;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground">
        {t('calculator.scenarioTimeframes')} <span className="text-xs text-muted">{t('calculator.scenarioTimeframesHint')}</span>
      </p>
      <div className="space-y-3">
        {scenarioKeys.map((key) => {
          const style = SCENARIO_STYLES[key];
          const count = getFactCount(key);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 shrink-0" style={{ color: style.color }}>
                  {t(style.labelKey)}
                </span>
                <div className="flex gap-1.5">
                  {availableYears.map((year) => {
                    const isActive = configs[key].years.includes(year);
                    return (
                      <button
                        key={year}
                        onClick={() => toggleYear(key, year)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
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
                <span className="text-xs text-muted tabular-nums">{count} {t('common.sources')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 shrink-0" />
                <div className="flex gap-1.5">
                  {ALL_DATA_TYPES.map((dt) => {
                    const isActive = configs[key].dataTypes.includes(dt);
                    return (
                      <button
                        key={dt}
                        onClick={() => toggleDataType(key, dt)}
                        className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
                          isActive
                            ? style.activeClass
                            : 'bg-zinc-50 text-muted border-border hover:text-foreground opacity-50'
                        }`}
                      >
                        {t(DATA_TYPE_LABEL_KEYS[dt])}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
