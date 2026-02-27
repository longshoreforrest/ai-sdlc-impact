'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ScenarioFactMapping, ScenarioType, PhaseFactGroup } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface ScenarioSourcesProps {
  factMapping: ScenarioFactMapping;
  totalFactCount: number;
}

const SCENARIO_META: Record<ScenarioType, { labelKey: 'roi.pessimistic' | 'roi.realistic' | 'roi.optimistic'; color: string; border: string }> = {
  pessimistic: { labelKey: 'roi.pessimistic', color: '#ef4444', border: 'border-red-500/30' },
  realistic:   { labelKey: 'roi.realistic',   color: '#f59e0b', border: 'border-amber-500/30' },
  optimistic:  { labelKey: 'roi.optimistic',  color: '#10b981', border: 'border-emerald-500/30' },
};

function PhaseGroup({ group, avgLabel }: { group: PhaseFactGroup; avgLabel: string }) {
  if (group.facts.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground">
        {group.phase}
        <span className="text-muted ml-1">({avgLabel})</span>
      </p>
      <div className="space-y-0.5 pl-3">
        {group.facts.map((fact) => (
          <div key={fact.id} className="flex items-baseline gap-2 text-xs">
            {fact.sourceUrl ? (
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline truncate max-w-[280px] inline-flex items-center gap-1"
              >
                {fact.source}
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            ) : (
              <span className="text-muted truncate max-w-[280px]">{fact.source}</span>
            )}
            <span className="text-muted tabular-nums shrink-0">{fact.impactPct}%</span>
            <span className="text-muted tabular-nums shrink-0">{fact.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScenarioSources({ factMapping, totalFactCount }: ScenarioSourcesProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ScenarioType>('realistic');
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

  return (
    <div className="bg-surface rounded-xl border border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted hover:text-foreground transition-colors"
      >
        <span>{t('scenarioSources.title', { count: totalFactCount })}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {scenarioKeys.map((key) => {
              const meta = SCENARIO_META[key];
              const factCount = factMapping[key].reduce((s, g) => s + g.facts.length, 0);
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
                    activeTab === key
                      ? `${meta.border} border-b-current`
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                  style={activeTab === key ? { color: meta.color, borderBottomColor: meta.color } : undefined}
                >
                  {t(meta.labelKey)} ({factCount})
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {factMapping[activeTab].map((group) => (
              <PhaseGroup
                key={group.phase}
                group={group}
                avgLabel={t('scenarioSources.medianInfo', { count: group.facts.length, median: group.medianImpact.toFixed(0) })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
