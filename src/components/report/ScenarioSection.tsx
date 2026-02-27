'use client';

import { ScenarioType, ScenarioConfig, METRConfig, PhaseFactGroup, Fact } from '@/lib/types';
import { computePhaseStats } from '@/lib/calculations';
import { generateScenarioDescription } from '@/lib/scenario-descriptions';
import { buildSources } from '@/lib/sources';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import DistributionChart from '@/components/DistributionChart';

interface ScenarioSectionProps {
  scenarioType: ScenarioType;
  config: ScenarioConfig;
  metrConfig: METRConfig;
  factGroups: PhaseFactGroup[];
  allFacts: Fact[];
  index: number;
}

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  pessimistic: '#ef4444',
  realistic: '#f59e0b',
  optimistic: '#10b981',
};

const SCENARIO_LABEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'roi.pessimistic',
  realistic: 'roi.realistic',
  optimistic: 'roi.optimistic',
};

export default function ScenarioSection({ scenarioType, config, metrConfig, factGroups, allFacts, index }: ScenarioSectionProps) {
  const { t } = useTranslation();
  const color = SCENARIO_COLORS[scenarioType];

  // Filter facts for this scenario
  const filtered = allFacts.filter(
    (f) => config.years.includes(f.year) && config.dataTypes.includes(f.dataType)
  );
  const phaseStats = computePhaseStats(filtered);
  const sources = buildSources(filtered);

  const description = generateScenarioDescription(
    scenarioType,
    config,
    metrConfig,
    filtered.length,
    t
  );

  return (
    <div className="mb-8 break-inside-avoid">
      <h3 className="text-lg font-bold mb-2" style={{ color }}>
        3.{index + 1} {t(SCENARIO_LABEL_KEYS[scenarioType])}
      </h3>

      <p className="text-sm text-zinc-600 mb-4">{description}</p>

      {/* Distribution chart */}
      {filtered.length > 0 && (
        <div style={{ minWidth: 700 }}>
          <DistributionChart phaseStats={phaseStats} />
        </div>
      )}

      {/* Phase stats table */}
      <div className="mt-4 border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('common.phase')}</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('common.facts')}</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">{t('common.sources')}</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">Mean</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">Median</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">Q1</th>
              <th className="text-right text-xs font-medium text-zinc-500 uppercase px-3 py-2">Q3</th>
            </tr>
          </thead>
          <tbody>
            {phaseStats.map((s) => (
              <tr key={s.phase} className="border-b border-zinc-100">
                <td className="px-3 py-2 font-medium text-zinc-700">{s.phase}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.count}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.sourceCount}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.mean.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.median.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.q1.toFixed(1)}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.q3.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source listing with key facts */}
      {sources.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('common.sources')} ({sources.length})
          </h4>
          <div className="space-y-1">
            {sources.slice(0, 15).map((src) => (
              <div key={src.name} className="text-xs text-zinc-600 border-b border-zinc-50 py-1">
                <span className="font-medium text-zinc-800">{src.name}</span>
                <span className="text-zinc-400 mx-1">&middot;</span>
                <span>{src.factCount} {t('common.facts')}</span>
                <span className="text-zinc-400 mx-1">&middot;</span>
                <span>{src.phases.join(', ')}</span>
              </div>
            ))}
            {sources.length > 15 && (
              <p className="text-xs text-zinc-400 italic">
                +{sources.length - 15} more sources
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
