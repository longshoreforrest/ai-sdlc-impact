'use client';

import { Fact } from '@/lib/types';
import { buildSources, SourceEntry } from '@/lib/sources';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface SourceAppendixProps {
  facts: Fact[];
}

const DATA_TYPE_LABELS: Record<string, TranslationKey> = {
  empirical: 'common.empirical',
  survey: 'common.survey',
  vendor: 'common.vendor',
  anecdotal: 'common.anecdotal',
};

const CATEGORY_LABELS: Record<string, string> = {
  'social-media': 'Social Media',
  scientific: 'Scientific',
};

export default function SourceAppendix({ facts }: SourceAppendixProps) {
  const { t } = useTranslation();
  const sources = buildSources(facts);

  return (
    <section id="source-appendix">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
        5. {t('report.sourceAppendix')}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {t('report.sourceAppendixIntro')}
      </p>

      <div className="space-y-3">
        {sources.map((src) => (
          <div key={src.name} className="border border-zinc-200 rounded-lg p-3 break-inside-avoid">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{src.name}</p>
                {src.url && (
                  <p className="text-xs text-blue-600 truncate mt-0.5">{src.url}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {src.category && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {CATEGORY_LABELS[src.category] || src.category}
                  </span>
                )}
                <span className="text-xs text-zinc-500 tabular-nums">{src.factCount} {t('common.facts')}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-1">{src.description}</p>

            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <span>{src.dataTypes.map((dt) => t(DATA_TYPE_LABELS[dt])).join(', ')}</span>
              <span>&middot;</span>
              <span>{src.phases.join(', ')}</span>
              <span>&middot;</span>
              <span>{src.earliestDate} &mdash; {src.latestDate}</span>
            </div>

            {/* Facts with impact */}
            {src.facts.length > 0 && (
              <div className="mt-2 pl-3 border-l-2 border-zinc-100">
                {src.facts.map((fact) => (
                  <div key={fact.id} className="text-xs text-zinc-600 py-0.5">
                    <span className="font-medium tabular-nums" style={{ color: fact.impactPct >= 30 ? '#059669' : fact.impactPct >= 15 ? '#d97706' : '#71717a' }}>
                      {fact.impactPct}%
                    </span>
                    <span className="text-zinc-400 mx-1">&middot;</span>
                    <span>{fact.phase}</span>
                    <span className="text-zinc-400 mx-1">&middot;</span>
                    <span className="text-zinc-500">{fact.description.substring(0, 100)}{fact.description.length > 100 ? '...' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
