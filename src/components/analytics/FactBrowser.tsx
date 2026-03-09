'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import type { Fact, DataType, Phase, BenefitType } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

type XDimension = 'publishDate' | 'year' | 'phase' | 'benefitType' | 'credibility';
type ColorDimension = 'dataType' | 'phase' | 'scope' | 'benefitType' | 'credibility' | 'year';

const PHASE_ORDER: Phase[] = ['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'];
const PHASE_INDEX: Record<string, number> = Object.fromEntries(PHASE_ORDER.map((p, i) => [p, i]));

const BENEFIT_TYPE_ORDER: BenefitType[] = ['efficiency', 'cost', 'adoption', 'other'];
const BENEFIT_TYPE_INDEX: Record<string, number> = Object.fromEntries(BENEFIT_TYPE_ORDER.map((b, i) => [b, i]));

const COLOR_PALETTES: Record<ColorDimension, Record<string, string>> = {
  dataType: {
    empirical: '#10b981',
    survey: '#3b82f6',
    vendor: '#8b5cf6',
    anecdotal: '#f97316',
    info: '#a1a1aa',
  },
  phase: {
    Discovery: '#f59e0b',
    Design: '#8b5cf6',
    Spec: '#06b6d4',
    Dev: '#3b82f6',
    QA: '#10b981',
    'Release & Ops': '#f97316',
  },
  scope: {
    sdlc: '#3b82f6',
    business: '#f59e0b',
  },
  benefitType: {
    efficiency: '#6366f1',
    cost: '#10b981',
    adoption: '#f59e0b',
    other: '#a1a1aa',
  },
  credibility: {
    '1': '#ef4444',
    '2': '#f59e0b',
    '3': '#10b981',
  },
  year: {
    '2023': '#ef4444',
    '2024': '#f59e0b',
    '2025': '#3b82f6',
    '2026': '#10b981',
  },
};

function getColorKey(fact: Fact, dim: ColorDimension): string {
  switch (dim) {
    case 'dataType': return fact.dataType;
    case 'phase': return fact.phase;
    case 'scope': return fact.scope ?? 'sdlc';
    case 'benefitType': return fact.benefitType ?? 'efficiency';
    case 'credibility': return String(fact.credibility);
    case 'year': return String(fact.year);
  }
}

function getXValue(fact: Fact, dim: XDimension): number {
  switch (dim) {
    case 'publishDate':
      return fact.publishDate ? new Date(fact.publishDate + 'T00:00:00Z').getTime() : new Date(`${fact.year}-06-15T00:00:00Z`).getTime();
    case 'year':
      return fact.year;
    case 'phase':
      return PHASE_INDEX[fact.phase] ?? 0;
    case 'benefitType':
      return BENEFIT_TYPE_INDEX[fact.benefitType ?? 'efficiency'] ?? 0;
    case 'credibility':
      return fact.credibility;
  }
}

// Deterministic jitter based on fact id to spread overlapping points
function jitter(factId: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < factId.length; i++) {
    hash = ((hash << 5) - hash + factId.charCodeAt(i)) | 0;
  }
  return ((hash % 1000) / 1000) * range - range / 2;
}

interface FactBrowserProps {
  facts: Fact[];
}

export default function FactBrowser({ facts }: FactBrowserProps) {
  const { t } = useTranslation();
  const [xDim, setXDim] = useState<XDimension>('publishDate');
  const [colorDim, setColorDim] = useState<ColorDimension>('dataType');
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);

  const xOptions: { value: XDimension; label: string }[] = [
    { value: 'publishDate', label: t('analytics.fb.xDate') },
    { value: 'year', label: t('common.year') },
    { value: 'phase', label: t('common.phase') },
    { value: 'benefitType', label: t('sources.benefitType') },
    { value: 'credibility', label: t('analytics.fb.credibility') },
  ];

  const colorOptions: { value: ColorDimension; label: string }[] = [
    { value: 'dataType', label: t('common.type') },
    { value: 'phase', label: t('common.phase') },
    { value: 'scope', label: t('sources.scope') },
    { value: 'benefitType', label: t('sources.benefitType') },
    { value: 'credibility', label: t('analytics.fb.credibility') },
    { value: 'year', label: t('common.year') },
  ];

  const colorLabelKeys: Record<ColorDimension, Record<string, TranslationKey | null>> = {
    dataType: {
      empirical: 'common.empirical',
      survey: 'common.survey',
      vendor: 'common.vendor',
      anecdotal: 'common.anecdotal',
      info: 'common.info',
    },
    phase: Object.fromEntries(PHASE_ORDER.map((p) => [p, null])),
    scope: { sdlc: null, business: null },
    benefitType: {
      efficiency: 'sources.benefitType_efficiency',
      cost: 'sources.benefitType_cost',
      adoption: 'sources.benefitType_adoption',
      other: 'sources.benefitType_other',
    },
    credibility: { '1': null, '2': null, '3': null },
    year: { '2023': null, '2024': null, '2025': null, '2026': null },
  };

  // Group facts by color key
  const groups = useMemo(() => {
    const map = new Map<string, { key: string; color: string; data: { x: number; y: number; fact: Fact }[] }>();
    const palette = COLOR_PALETTES[colorDim];

    // Jitter ranges for categorical X-axes
    const jitterRange = xDim === 'phase' ? 0.35 : xDim === 'benefitType' ? 0.35 : xDim === 'year' ? 0.3 : xDim === 'credibility' ? 0.25 : 0;

    for (const fact of facts) {
      const key = getColorKey(fact, colorDim);
      if (!map.has(key)) {
        map.set(key, { key, color: palette[key] || '#a1a1aa', data: [] });
      }
      const baseX = getXValue(fact, xDim);
      const x = jitterRange > 0 ? baseX + jitter(fact.id, jitterRange) : baseX;
      // Small Y jitter to separate overlapping points
      const y = fact.impactPct + jitter(fact.id + '_y', 1.5);
      map.get(key)!.data.push({ x, y, fact });
    }

    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [facts, xDim, colorDim]);

  const xTickFormatter = useCallback(
    (value: number) => {
      switch (xDim) {
        case 'publishDate':
          return new Date(value).toLocaleDateString('en', { month: 'short', year: '2-digit' });
        case 'year':
          return String(Math.round(value));
        case 'phase':
          return PHASE_ORDER[Math.round(value)] ?? '';
        case 'benefitType': {
          const labels = ['Efficiency', 'Cost', 'Adoption', 'Other'];
          return labels[Math.round(value)] ?? '';
        }
        case 'credibility':
          return ['', 'Low', 'Med', 'High'][Math.round(value)] ?? '';
      }
    },
    [xDim]
  );

  const xDomain = useMemo((): [number, number] | ['auto', 'auto'] => {
    switch (xDim) {
      case 'phase':
        return [-0.5, PHASE_ORDER.length - 0.5];
      case 'benefitType':
        return [-0.5, BENEFIT_TYPE_ORDER.length - 0.5];
      case 'credibility':
        return [0.5, 3.5];
      case 'year': {
        const years = facts.map((f) => f.year);
        const min = Math.min(...years);
        const max = Math.max(...years);
        return [min - 0.5, max + 0.5];
      }
      default:
        return ['auto', 'auto'];
    }
  }, [xDim, facts]);

  const xTicks = useMemo(() => {
    switch (xDim) {
      case 'phase':
        return PHASE_ORDER.map((_, i) => i);
      case 'benefitType':
        return BENEFIT_TYPE_ORDER.map((_, i) => i);
      case 'credibility':
        return [1, 2, 3];
      case 'year':
        return [...new Set(facts.map((f) => f.year))].sort();
      default:
        return undefined;
    }
  }, [xDim, facts]);

  function getLegendLabel(key: string): string {
    const labelKey = colorLabelKeys[colorDim][key];
    if (labelKey) return t(labelKey);
    // For phase, scope, credibility — use the key directly or capitalize
    if (colorDim === 'credibility') return ['', 'Low', 'Medium', 'High'][Number(key)] ?? key;
    if (colorDim === 'scope') return key === 'sdlc' ? 'SDLC' : 'Business';
    return key;
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t('analytics.fb.title')}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {/* X-axis selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase tracking-wider">{t('analytics.fb.xAxis')}</span>
            <div className="flex gap-1">
              {xOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setXDim(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    xDim === opt.value
                      ? 'bg-accent-dim text-accent border-accent/30'
                      : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase tracking-wider">{t('analytics.fb.colorBy')}</span>
            <div className="flex gap-1">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColorDim(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    colorDim === opt.value
                      ? 'bg-accent-dim text-accent border-accent/30'
                      : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            type="number"
            dataKey="x"
            domain={xDomain}
            ticks={xTicks}
            tickFormatter={xTickFormatter}
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
            tickFormatter={(v: number) => `${Math.round(v)}%`}
            label={{ value: t('analytics.fb.yLabel'), angle: -90, position: 'insideLeft', style: { fill: '#a1a1aa', fontSize: 11 }, offset: 10 }}
          />
          <ReferenceLine y={0} stroke="#71717a" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as { fact: Fact } | undefined;
              if (!item?.fact) return null;
              const f = item.fact;
              return (
                <div className="max-w-xs rounded-lg border text-xs" style={{ backgroundColor: '#18181b', border: '1px solid #27272a', padding: '10px 14px' }}>
                  <p className="font-medium text-white mb-1 leading-snug">{f.source}</p>
                  <p className="text-zinc-400 leading-relaxed mb-2 line-clamp-3">{f.description}</p>
                  {f.quote && (
                    <p className="text-zinc-500 italic mb-2 line-clamp-2 border-l-2 border-zinc-600 pl-2">&ldquo;{f.quote}&rdquo;</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-zinc-400">
                    <span className="text-accent font-bold">{f.impactPct}%</span>
                    <span>{f.phase}</span>
                    <span>{f.dataType}</span>
                    <span>{f.year}{f.publishDate && ` (${f.publishDate})`}</span>
                    {f.sampleSize && <span>n={f.sampleSize}</span>}
                    <span>Cred: {f.credibility}/3</span>
                  </div>
                </div>
              );
            }}
          />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: '#a1a1aa', paddingTop: '8px' }}
            formatter={(value: string) => value}
          />
          {groups.map((group) => (
            <Scatter
              key={group.key}
              name={getLegendLabel(group.key)}
              data={group.data}
              fill={group.color}
              fillOpacity={0.7}
              strokeOpacity={0}
              cursor="pointer"
              onClick={(point: { fact: Fact }) => {
                if (point?.fact) setSelectedFact(point.fact);
              }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted mt-2 italic">{t('analytics.fb.hint')}</p>

      {/* Selected fact detail card */}
      {selectedFact && (
        <div className="mt-4 p-4 bg-background rounded-lg border border-border relative">
          <button
            onClick={() => setSelectedFact(null)}
            className="absolute top-3 right-3 text-muted hover:text-foreground text-xs"
          >
            &times;
          </button>
          <div className="flex items-start gap-3">
            <span className="text-2xl font-bold tabular-nums text-accent shrink-0">
              {selectedFact.impactPct}%
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {selectedFact.sourceUrl ? (
                  <a
                    href={selectedFact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
                  >
                    {selectedFact.source}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm font-medium text-foreground">{selectedFact.source}</span>
                )}
                <span className="text-xs text-muted">{selectedFact.year}{selectedFact.publishDate && ` (${selectedFact.publishDate})`}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-2">{selectedFact.description}</p>
              {selectedFact.quote && (
                <blockquote className="pl-3 border-l-2 border-accent/40 text-xs text-muted italic leading-relaxed mb-2">
                  &ldquo;{selectedFact.quote}&rdquo;
                </blockquote>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-muted">{selectedFact.phase}</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-muted">{selectedFact.dataType}</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-muted">
                  {selectedFact.scope === 'business' ? 'Business' : 'SDLC'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-muted">
                  {t(`sources.benefitType_${selectedFact.benefitType ?? 'efficiency'}` as TranslationKey)}
                </span>
                {selectedFact.sampleSize && (
                  <span className="text-muted">n={selectedFact.sampleSize}</span>
                )}
                <span className="text-muted">
                  Credibility: {selectedFact.credibility}/3
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
