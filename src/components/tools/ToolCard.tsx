'use client';

import { ToolProfile } from '@/lib/types';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ToolCardProps {
  tool: ToolProfile;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export default function ToolCard({ tool, selected, disabled, onToggle }: ToolCardProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className={`text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'bg-accent-dim border-accent/40 ring-1 ring-accent/20'
          : disabled
            ? 'bg-surface border-border opacity-50 cursor-not-allowed'
            : 'bg-surface border-border hover:border-muted hover:bg-surface-hover cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{tool.name}</h3>
            {selected && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">{tool.vendor}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold">&euro;{tool.costPerSeatMonthly}</p>
          <p className="text-xs text-muted">{t('tools.perSeatMonth')}</p>
        </div>
      </div>
      <p className="text-xs text-muted mt-2 line-clamp-2">{tool.description}</p>

      {/* Phase applicability mini-bar */}
      <div className="mt-3 flex gap-0.5">
        {(['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'] as const).map((phase) => {
          const val = tool.phaseApplicability[phase];
          return (
            <div key={phase} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full h-1.5 rounded-full bg-border overflow-hidden"
                title={`${phase}: ${Math.round(val * 100)}%`}
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    val >= 0.8 ? 'bg-emerald-500' : val >= 0.5 ? 'bg-amber-500' : 'bg-zinc-500'
                  }`}
                  style={{ width: `${val * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-muted truncate w-full text-center">
                {phase === 'Release & Ops' ? 'R&O' : phase.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
