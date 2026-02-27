'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Fact, Phase } from '@/lib/types';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { computeTrendData } from '@/lib/calculations';
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

const PHASE_COLORS: Record<Phase, string> = {
  Strategy: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  DevOps: '#f97316',
};

const credibilityColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#10b981',
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

  // Trend data for line chart
  const trendData = computeTrendData(facts);
  const trendChartData = ALL_YEARS.map((year) => {
    const row: Record<string, number | string | undefined> = { year: String(year) };
    trendData.forEach((td) => {
      const pt = td.points.find((p) => p.year === year);
      row[td.phase] = pt?.mean;
    });
    return row;
  });

  // Credibility by phase
  const credByPhase = PHASES.map((phase) => {
    const phaseFacts = facts.filter((f) => f.phase === phase);
    return {
      phase,
      low: phaseFacts.filter((f) => f.credibility === 1).length,
      medium: phaseFacts.filter((f) => f.credibility === 2).length,
      high: phaseFacts.filter((f) => f.credibility === 3).length,
    };
  });

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

      {/* Impact Trends Over Time */}
      <div className="border border-zinc-200 rounded-lg p-4 mb-6" style={{ minWidth: 700 }}>
        <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          {t('analytics.impactTrends')}
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}%
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
            {trendData.map((td) => (
              <Line
                key={td.phase}
                type="monotone"
                dataKey={td.phase}
                name={td.phase}
                stroke={PHASE_COLORS[td.phase]}
                strokeWidth={2}
                dot={{ r: 3, fill: PHASE_COLORS[td.phase] }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Credibility by Phase */}
      <div className="border border-zinc-200 rounded-lg p-4 mb-6" style={{ minWidth: 700 }}>
        <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
          {t('analytics.credByPhase')}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={credByPhase} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
            <YAxis type="category" dataKey="phase" tick={{ fill: '#71717a', fontSize: 11 }} width={65} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-medium mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p key={entry.dataKey as string} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
            <Bar dataKey="high" stackId="cred" name={t('credibility.high')} fill={credibilityColors[3]} fillOpacity={0.8} />
            <Bar dataKey="medium" stackId="cred" name={t('credibility.medium')} fill={credibilityColors[2]} fillOpacity={0.8} />
            <Bar dataKey="low" stackId="cred" name={t('credibility.low')} fill={credibilityColors[1]} fillOpacity={0.8} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
