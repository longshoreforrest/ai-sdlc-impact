'use client';

import { Fragment } from 'react';
import { PHASES } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n/translations';
import type { Phase } from '@/lib/types';

const PHASE_COLORS: Record<Phase, string> = {
  Strategy: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  DevOps: '#f97316',
};

const PHASE_KEYS: Record<Phase, TranslationKey> = {
  Strategy: 'sdlcFlow.strategy',
  Design: 'sdlcFlow.design',
  Spec: 'sdlcFlow.spec',
  Dev: 'sdlcFlow.dev',
  QA: 'sdlcFlow.qa',
  DevOps: 'sdlcFlow.devops',
};

function PhaseCard({ phase, description }: { phase: Phase; description: string }) {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 flex-1 min-w-0"
      style={{ borderLeftWidth: 4, borderLeftColor: PHASE_COLORS[phase] }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: PHASE_COLORS[phase] }}>
        {phase}
      </p>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function Arrow({ direction = '→' }: { direction?: string }) {
  return (
    <span className="flex items-center justify-center text-muted text-lg select-none shrink-0" aria-hidden="true">
      {direction}
    </span>
  );
}

export default function SDLCFlowchart() {
  const { t } = useTranslation();

  const phaseData = PHASES.map((phase) => ({
    phase,
    description: t(PHASE_KEYS[phase]),
  }));

  return (
    <div className="space-y-6">
      {/* Desktop (lg+): single horizontal row */}
      <div className="hidden lg:flex items-stretch gap-2">
        {phaseData.map(({ phase, description }, i) => (
          <Fragment key={phase}>
            <PhaseCard phase={phase} description={description} />
            {i < phaseData.length - 1 && <Arrow />}
          </Fragment>
        ))}
      </div>

      {/* Tablet (md to lg): two rows of three */}
      <div className="hidden md:block lg:hidden space-y-2">
        <div className="flex items-stretch gap-2">
          {phaseData.slice(0, 3).map(({ phase, description }, i) => (
            <Fragment key={phase}>
              <PhaseCard phase={phase} description={description} />
              {i < 2 && <Arrow />}
            </Fragment>
          ))}
        </div>
        <Arrow direction="↓" />
        <div className="flex items-stretch gap-2">
          {phaseData.slice(3).map(({ phase, description }, i) => (
            <Fragment key={phase}>
              <PhaseCard phase={phase} description={description} />
              {i < 2 && <Arrow />}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-2 md:hidden">
        {phaseData.map(({ phase, description }, i) => (
          <Fragment key={phase}>
            <PhaseCard phase={phase} description={description} />
            {i < phaseData.length - 1 && <Arrow direction="↓" />}
          </Fragment>
        ))}
      </div>

      {/* "Why these phases?" callout */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">{t('sdlcFlow.whyTitle')}</h3>
        <p className="text-xs text-muted leading-relaxed">{t('sdlcFlow.whyText')}</p>
      </div>
    </div>
  );
}
