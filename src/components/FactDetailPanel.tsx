'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import { Fact, DataType } from '@/lib/types';
import { facts as allFacts } from '@/lib/mock-data';
import { buildSources } from '@/lib/sources';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface FactDetailPanelProps {
  fact: Fact | null;
  onClose: () => void;
}

const dataTypeBadgeColors: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
  info: 'bg-zinc-500/20 text-zinc-400',
};

const categoryBadge: Record<string, { label: string; className: string }> = {
  'social-media': { label: 'Social Media', className: 'bg-pink-500/20 text-pink-400' },
  scientific: { label: 'Scientific', className: 'bg-cyan-500/20 text-cyan-400' },
  sap: { label: 'SAP', className: 'bg-amber-500/20 text-amber-400' },
  salesforce: { label: 'Salesforce', className: 'bg-sky-500/20 text-sky-400' },
};

function CredibilityDots({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Low', 2: 'Medium', 3: 'High' };
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full inline-block ${
            i <= level ? 'bg-accent' : 'bg-zinc-300'
          }`}
        />
      ))}
      <span className="text-muted ml-0.5">{labels[level]}</span>
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

  // Find the source entry with ALL facts from the same source
  const source = useMemo(() => {
    if (!fact) return null;
    const sources = buildSources(allFacts);
    return sources.find((s) => s.name === fact.source) || null;
  }, [fact]);

  if (!fact || !source) return null;

  const sortedFacts = [...source.facts].sort(
    (a, b) => b.year - a.year || b.impactPct - a.impactPct
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[32rem] bg-surface border-l border-border z-50 slide-in overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-muted uppercase tracking-wider">{t('factDetail.source')}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Source header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline flex items-center gap-1.5"
                >
                  {source.name}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <h3 className="text-sm font-medium text-foreground">{source.name}</h3>
              )}
              {source.category && categoryBadge[source.category] && (
                <span className={`px-2 py-0.5 text-xs rounded-md whitespace-nowrap ${categoryBadge[source.category].className}`}>
                  {categoryBadge[source.category].label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted leading-relaxed mb-3">
              {source.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {source.dataTypes.map((dt) => (
                <span key={dt} className={`px-2 py-0.5 text-xs rounded-md ${dataTypeBadgeColors[dt]}`}>
                  {dt}
                </span>
              ))}
              {source.phases.map((phase) => (
                <span key={phase} className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted">
                  {phase}
                </span>
              ))}
              <span className="text-xs text-muted">
                {source.years.sort().join(', ')}
              </span>
              {source.earliestDate && (
                <span className="text-xs text-muted tabular-nums">
                  {source.earliestDate === source.latestDate
                    ? source.earliestDate
                    : `${source.earliestDate} – ${source.latestDate}`}
                </span>
              )}
              <span className="text-xs font-medium text-accent">
                {source.factCount} {source.factCount === 1 ? t('common.fact') : t('common.facts')}
              </span>
            </div>
          </div>

          {/* All facts from this source */}
          <div className="border-t border-border -mx-6">
            {sortedFacts.map((f) => (
              <div
                key={f.id}
                className={`px-6 py-4 border-b border-border/50 last:border-b-0 ${
                  f.id === fact.id ? 'bg-accent/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg font-bold tabular-nums text-accent shrink-0 w-14 text-right">
                    {f.impactPct}%
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {f.description}
                    </p>
                    {f.quote && (
                      <blockquote className="mt-2 pl-3 border-l-2 border-accent/40 text-xs text-muted italic leading-relaxed">
                        &ldquo;{f.quote}&rdquo;
                      </blockquote>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-md ${dataTypeBadgeColors[f.dataType]}`}>
                        {f.dataType}
                      </span>
                      <span className="text-foreground tabular-nums">
                        {f.year}
                        {f.publishDate && <span className="text-muted ml-1">({f.publishDate})</span>}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-md ${
                        f.scope === 'business' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {f.scope === 'business' ? 'Business' : 'SDLC'}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-md ${
                        (f.benefitType ?? 'efficiency') === 'efficiency' ? 'bg-indigo-500/20 text-indigo-400'
                        : f.benefitType === 'cost' ? 'bg-green-500/20 text-green-600'
                        : f.benefitType === 'adoption' ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-zinc-500/20 text-zinc-500'
                      }`}>
                        {t(`sources.benefitType_${f.benefitType ?? 'efficiency'}` as TranslationKey)}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 text-muted">
                        {f.phase}
                      </span>
                      {f.sampleSize && (
                        <span className="text-muted">n={f.sampleSize}</span>
                      )}
                      <CredibilityDots level={f.credibility} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View in Sources page link */}
          <div className="mt-4">
            <button
              onClick={() => {
                const params = new URLSearchParams({ search: fact.source });
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
