'use client';

import { Fact, DataType } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface EvidenceWallProps {
  facts: Fact[];
  onSelectFact: (fact: Fact) => void;
}

const dataTypeBadgeColors: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
};

function CredibilityDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level ? 'bg-accent' : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function EvidenceWall({ facts, onSelectFact }: EvidenceWallProps) {
  const { t } = useTranslation();
  const sorted = [...facts].sort((a, b) => b.year - a.year || b.impactPct - a.impactPct);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
          {t('evidenceWall.title')}
        </h3>
        <span className="text-xs text-muted tabular-nums">{facts.length} {t('common.facts')}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map((fact) => (
          <button
            key={fact.id}
            onClick={() => onSelectFact(fact)}
            className="text-left bg-surface rounded-xl border border-border p-4 hover:border-muted transition-all hover:bg-surface-hover group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-md ${dataTypeBadgeColors[fact.dataType]}`}>
                  {fact.dataType}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted">
                  {fact.phase}
                </span>
              </div>
              <CredibilityDots level={fact.credibility} />
            </div>
            <p className="text-sm text-foreground line-clamp-2 mb-3">
              {fact.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{fact.source} · {fact.year}</span>
              <span className="text-lg font-bold tabular-nums text-accent">
                {fact.impactPct}%
              </span>
            </div>
            {fact.sourceUrl && (
              <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
