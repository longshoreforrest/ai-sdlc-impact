'use client';

import { Phase, PhaseStats } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface SDLCRibbonProps {
  phaseStats: PhaseStats[];
  onPhaseClick?: (phase: Phase) => void;
}

function getImpactColor(mean: number): { bg: string; text: string; glow: string } {
  if (mean >= 50) return { bg: 'bg-impact-high/20', text: 'text-impact-high', glow: 'card-glow-green' };
  if (mean >= 30) return { bg: 'bg-impact-mid/20', text: 'text-impact-mid', glow: 'card-glow-amber' };
  return { bg: 'bg-impact-low/20', text: 'text-impact-low', glow: 'card-glow-red' };
}

export default function SDLCRibbon({ phaseStats, onPhaseClick }: SDLCRibbonProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
      {phaseStats.map((stats) => {
        const colors = getImpactColor(stats.mean);
        return (
          <button
            key={stats.phase}
            onClick={() => onPhaseClick?.(stats.phase)}
            className={`relative rounded-xl p-4 border border-border ${colors.bg} ${colors.glow} transition-all ${onPhaseClick ? 'cursor-pointer hover:ring-2 hover:ring-accent/40' : ''}`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted font-medium uppercase tracking-wider">
                {stats.phase}
              </span>
              <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>
                {stats.count > 0 ? `${Math.round(stats.mean)}%` : '—'}
              </span>
              <span className="text-xs text-muted">
                {stats.count} {stats.count === 1 ? t('common.fact') : t('common.facts')} · {stats.sourceCount} {stats.sourceCount === 1 ? t('common.source') : t('common.sources')}
              </span>
            </div>
            {/* Impact bar */}
            <div className="mt-3 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.mean >= 50 ? 'bg-impact-high' : stats.mean >= 30 ? 'bg-impact-mid' : 'bg-impact-low'
                }`}
                style={{ width: `${Math.min(stats.mean, 100)}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
