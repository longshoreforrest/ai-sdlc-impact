'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Fact, Phase } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface TimeSeriesChartProps {
  facts: Fact[];
  activePhases: Phase[];
}

const PHASE_COLORS: Record<Phase, string> = {
  Strategy: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  DevOps: '#f97316',
};

interface YearRow {
  year: number;
  [key: string]: number | undefined | null;
}

export default function TimeSeriesChart({ facts, activePhases }: TimeSeriesChartProps) {
  const { t } = useTranslation();

  const { data, yearRange } = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const f of facts) {
      const key = `${f.year}|${f.phase}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f.impactPct);
    }

    const years = [...new Set(facts.map((f) => f.year))].sort();

    const rows: YearRow[] = years.map((year) => {
      const row: YearRow = { year };
      for (const phase of activePhases) {
        const vals = map.get(`${year}|${phase}`);
        if (vals && vals.length > 0) {
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          row[phase] = Math.round(mean * 10) / 10;
          row[`${phase}_count`] = vals.length;
          row[`${phase}_min`] = Math.min(...vals);
          row[`${phase}_max`] = Math.max(...vals);
        } else {
          row[phase] = null;
        }
      }
      return row;
    });

    return { data: rows, yearRange: years };
  }, [facts, activePhases]);

  if (yearRange.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">
          {t('timeSeries.title')}
        </h3>
        <div className="h-[320px] flex items-center justify-center text-sm text-muted">
          {t('timeSeries.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
          {t('timeSeries.title')}
        </h3>
        <div className="flex items-center gap-3">
          {activePhases.map((phase) => (
            <div key={phase} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PHASE_COLORS[phase] }}
              />
              <span className="text-xs text-muted">{phase}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
            type="number"
            domain={[yearRange[0], yearRange[yearRange.length - 1]]}
            ticks={yearRange}
            allowDecimals={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={50}
          />
          <ReferenceLine y={0} stroke="#d4d4d8" strokeWidth={1} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="bg-white border border-border rounded-lg p-3 shadow-xl text-xs min-w-[180px]">
                  <p className="font-medium text-foreground mb-2">{label}</p>
                  <div className="space-y-1.5">
                    {payload.map((entry) => {
                      if (entry.value == null) return null;
                      const phase = entry.dataKey as string;
                      const row = entry.payload as YearRow;
                      const count = row[`${phase}_count`] as number | undefined;
                      const min = row[`${phase}_min`] as number | undefined;
                      const max = row[`${phase}_max`] as number | undefined;
                      return (
                        <div key={phase} className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted">{phase}</span>
                          </div>
                          <div className="text-right tabular-nums">
                            <span className="text-foreground font-medium">
                              {Number(entry.value).toFixed(1)}%
                            </span>
                            {count != null && (
                              <span className="text-muted ml-1.5">
                                (n={count}{min != null && max != null && min !== max ? `, ${min}–${max}%` : ''})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          {activePhases.map((phase) => (
            <Line
              key={phase}
              type="monotone"
              dataKey={phase}
              stroke={PHASE_COLORS[phase]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: PHASE_COLORS[phase], strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats below chart */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        {activePhases.map((phase) => {
          const values = data
            .map((d) => d[phase])
            .filter((v): v is number => v != null);
          if (values.length === 0) return null;
          const latest = data.findLast((d) => d[phase] != null)?.[phase] as number | undefined;
          const earliest = data.find((d) => d[phase] != null)?.[phase] as number | undefined;
          const delta = latest != null && earliest != null ? latest - earliest : null;
          return (
            <div
              key={phase}
              className="p-3 rounded-lg border border-border bg-zinc-50 text-center"
            >
              <p className="text-xs text-muted font-medium uppercase tracking-wider">{phase}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: PHASE_COLORS[phase] }}>
                {latest != null ? `${latest}%` : '—'}
              </p>
              {delta != null && values.length > 1 && (
                <p className={`text-xs tabular-nums ${delta >= 0 ? 'text-impact-high' : 'text-impact-low'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)}pp
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
