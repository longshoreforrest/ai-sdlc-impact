'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { Fact, DataType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface FactDetailPanelProps {
  fact: Fact | null;
  onClose: () => void;
}

const dataTypeLabelKeys: Record<DataType, TranslationKey> = {
  empirical: 'dataType.empirical',
  survey: 'dataType.survey',
  vendor: 'dataType.vendor',
  anecdotal: 'dataType.anecdotal',
};

const credibilityLabelKeys: Record<number, TranslationKey> = {
  1: 'credibility.low',
  2: 'credibility.medium',
  3: 'credibility.high',
};

function CredibilityLabel({ level }: { level: 1 | 2 | 3 }) {
  const { t } = useTranslation();
  const colors = { 1: 'text-impact-low', 2: 'text-impact-mid', 3: 'text-impact-high' };
  return (
    <span className={colors[level]}>
      {t(credibilityLabelKeys[level])}
    </span>
  );
}

export default function FactDetailPanel({ fact, onClose }: FactDetailPanelProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (fact) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [fact, handleKeyDown]);

  if (!fact) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-surface border-l border-border z-50 slide-in overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-muted uppercase tracking-wider">{t('factDetail.title')}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Impact */}
          <div className="text-center mb-6">
            <p className="text-5xl font-bold tabular-nums text-accent">{fact.impactPct}%</p>
            <p className="text-sm text-muted mt-1">{t('factDetail.improvement')}</p>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">{t('factDetail.phase')}</p>
                <p className="text-sm font-medium">{fact.phase}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t('factDetail.year')}</p>
                <p className="text-sm font-medium">{fact.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t('factDetail.dataType')}</p>
                <p className="text-sm font-medium">{t(dataTypeLabelKeys[fact.dataType])}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{t('factDetail.credibility')}</p>
                <p className="text-sm font-medium">
                  <CredibilityLabel level={fact.credibility} />
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-muted mb-2">{t('factDetail.description')}</p>
              <p className="text-sm text-foreground leading-relaxed">{fact.description}</p>
            </div>

            {/* Source */}
            <div>
              <p className="text-xs text-muted mb-2">{t('factDetail.source')}</p>
              <p className="text-sm font-medium">{fact.source}</p>
              {fact.sampleSize && (
                <p className="text-xs text-muted mt-1">{t('factDetail.sample')} {fact.sampleSize}</p>
              )}
            </div>

            {/* Link */}
            {fact.sourceUrl && (
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-accent-dim rounded-lg text-accent text-sm hover:bg-accent/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('factDetail.openSource')}
              </a>
            )}

            {/* Drill-down link */}
            <button
              onClick={() => {
                const params = new URLSearchParams({ phases: fact.phase });
                router.push(`/sources?${params.toString()}`);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted text-sm hover:text-foreground hover:bg-surface-hover transition-colors w-full"
            >
              <ArrowRight className="w-4 h-4" />
              {t('factDetail.viewAllSources', { phase: fact.phase })}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
