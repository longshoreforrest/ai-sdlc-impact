'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, ArrowRight } from 'lucide-react';
import { Phase } from '@/lib/types';
import { PHASES } from '@/lib/mock-data';
import { getDefaultPhaseMapping, isMappingCustom } from '@/lib/phase-mapping';
import { useTranslation } from '@/lib/i18n';

interface PhaseMappingConfiguratorProps {
  mapping: Record<Phase, string>;
  onChange: (mapping: Record<Phase, string>) => void;
}

const PHASE_COLORS: Record<Phase, string> = {
  Discovery: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  'Release & Ops': '#f97316',
};

// Common SDLC grouping presets
const PRESETS: { label: string; mapping: Record<Phase, string> }[] = [
  {
    label: 'Default (6 phases)',
    mapping: getDefaultPhaseMapping(),
  },
  {
    label: 'Plan / Build / Run',
    mapping: {
      Discovery: 'Plan',
      Design: 'Plan',
      Spec: 'Plan',
      Dev: 'Build',
      QA: 'Build',
      'Release & Ops': 'Run',
    } as Record<Phase, string>,
  },
  {
    label: 'Study / Develop / Operate',
    mapping: {
      Discovery: 'Study',
      Design: 'Study',
      Spec: 'Develop',
      Dev: 'Develop',
      QA: 'Develop',
      'Release & Ops': 'Operate',
    } as Record<Phase, string>,
  },
];

export default function PhaseMappingConfigurator({ mapping, onChange }: PhaseMappingConfiguratorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isCustom = isMappingCustom(mapping);

  // Compute unique groups for the preview
  const groups = useMemo(() => {
    const groupMap = new Map<string, Phase[]>();
    const order: string[] = [];
    for (const p of PHASES) {
      const target = mapping[p] || p;
      if (!groupMap.has(target)) {
        groupMap.set(target, []);
        order.push(target);
      }
      groupMap.get(target)!.push(p);
    }
    return order.map((label) => ({ label, phases: groupMap.get(label)! }));
  }, [mapping]);

  const handleChange = useCallback((phase: Phase, value: string) => {
    onChange({ ...mapping, [phase]: value || phase });
  }, [mapping, onChange]);

  const handleReset = useCallback(() => {
    onChange(getDefaultPhaseMapping());
  }, [onChange]);

  return (
    <div className="bg-surface border border-border rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t('phaseMapping.title')}</h3>
          {isCustom && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-accent-dim text-accent">
              {t('phaseMapping.customized')}
            </span>
          )}
          {!isOpen && isCustom && (
            <span className="text-xs text-muted">
              {groups.map((g) => g.label).join(' → ')}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            {t('phaseMapping.description')}
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const isActive = PHASES.every((p) => mapping[p] === preset.mapping[p]);
              return (
                <button
                  key={preset.label}
                  onClick={() => onChange(preset.mapping)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    isActive
                      ? 'bg-accent-dim text-accent border-accent/30'
                      : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Mapping rows */}
          <div className="space-y-2">
            {PHASES.map((phase) => (
              <div key={phase} className="flex items-center gap-3">
                <span
                  className="text-sm font-medium w-32 shrink-0"
                  style={{ color: PHASE_COLORS[phase] }}
                >
                  {phase}
                </span>
                <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                <input
                  type="text"
                  value={mapping[phase]}
                  onChange={(e) => handleChange(phase, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors"
                  placeholder={phase}
                />
              </div>
            ))}
          </div>

          {/* Grouped preview */}
          {isCustom && (
            <div className="border border-border rounded-lg p-3 bg-surface-hover/30">
              <p className="text-xs text-muted uppercase tracking-wider font-medium mb-2">{t('phaseMapping.preview')}</p>
              <div className="space-y-1.5">
                {groups.map((g) => (
                  <div key={g.label} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{g.label}</span>
                    <span className="text-xs text-muted">
                      = {g.phases.map((p) => (
                        <span key={p} style={{ color: PHASE_COLORS[p] }}>{p}</span>
                      )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, <span key={`sep-${i}`}> + </span>, curr], [] as React.ReactNode[])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          {isCustom && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('phaseMapping.reset')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
