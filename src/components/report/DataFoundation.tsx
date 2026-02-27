'use client';

import { Fact } from '@/lib/types';
import { PHASES } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface DataFoundationProps {
  facts: Fact[];
}

const DATA_TYPE_KEYS: Record<string, TranslationKey> = {
  empirical: 'common.empirical',
  survey: 'common.survey',
  vendor: 'common.vendor',
  anecdotal: 'common.anecdotal',
};

const CRED_KEYS: Record<number, TranslationKey> = {
  1: 'credibility.low',
  2: 'credibility.medium',
  3: 'credibility.high',
};

export default function DataFoundation({ facts }: DataFoundationProps) {
  const { t } = useTranslation();

  const uniqueSources = new Set(facts.map((f) => f.source)).size;
  const years = [...new Set(facts.map((f) => f.year))].sort();
  const yearSpan = years.length > 1 ? `${years[0]}\u2013${years[years.length - 1]}` : String(years[0] || '');

  // Credibility breakdown
  const credCounts = { 1: 0, 2: 0, 3: 0 };
  for (const f of facts) credCounts[f.credibility]++;

  // By data type
  const typeCounts: Record<string, number> = {};
  for (const f of facts) typeCounts[f.dataType] = (typeCounts[f.dataType] || 0) + 1;

  // By phase
  const phaseCounts: Record<string, number> = {};
  for (const f of facts) phaseCounts[f.phase] = (phaseCounts[f.phase] || 0) + 1;

  return (
    <section id="data-foundation">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
        2. {t('report.dataFoundation')}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {t('report.dataFoundationIntro')}
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-zinc-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{facts.length}</p>
          <p className="text-xs text-zinc-500 mt-1">{t('report.totalFacts')}</p>
        </div>
        <div className="border border-zinc-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{uniqueSources}</p>
          <p className="text-xs text-zinc-500 mt-1">{t('report.uniqueSources')}</p>
        </div>
        <div className="border border-zinc-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-zinc-900">{yearSpan}</p>
          <p className="text-xs text-zinc-500 mt-1">{t('report.yearSpan')}</p>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-3 gap-4">
        {/* Credibility */}
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.credibilityBreakdown')}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {([1, 2, 3] as const).map((level) => (
                <tr key={level} className="border-b border-zinc-100">
                  <td className="py-1.5 text-zinc-700">{t(CRED_KEYS[level])}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{credCounts[level]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By data type */}
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.factsByDataType')}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(DATA_TYPE_KEYS).map(([dt, key]) => (
                <tr key={dt} className="border-b border-zinc-100">
                  <td className="py-1.5 text-zinc-700">{t(key)}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{typeCounts[dt] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By phase */}
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.factsByPhase')}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {PHASES.map((phase) => (
                <tr key={phase} className="border-b border-zinc-100">
                  <td className="py-1.5 text-zinc-700">{phase}</td>
                  <td className="py-1.5 text-right tabular-nums font-medium">{phaseCounts[phase] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
