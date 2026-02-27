'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Phase, PhaseStats } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface DistributionChartProps {
  phaseStats: PhaseStats[];
  onPhaseClick?: (phase: Phase) => void;
}

function getPhaseColor(mean: number): string {
  if (mean >= 50) return '#059669';
  if (mean >= 30) return '#d97706';
  return '#dc2626';
}

interface BoxPlotShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: PhaseStats & { selected?: boolean };
}

function BoxPlotShape({ x = 0, width = 0, payload }: BoxPlotShapeProps) {
  if (!payload || payload.count === 0) return null;

  const { min, q1, median, q3, max, mean, selected } = payload;
  const color = getPhaseColor(mean);
  const centerX = x + width / 2;
  const chartHeight = 280;
  const paddingTop = 20;
  const paddingBottom = 40;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const scale = (val: number) => paddingTop + usableHeight - (val / 100) * usableHeight;

  const yMin = scale(min);
  const yQ1 = scale(q1);
  const yMedian = scale(median);
  const yQ3 = scale(q3);
  const yMax = scale(max);
  const yMean = scale(mean);

  const boxWidth = width * 0.6;
  const boxX = centerX - boxWidth / 2;
  const whiskerWidth = width * 0.25;
  const dimOpacity = selected === false ? 0.25 : 1;

  return (
    <g opacity={dimOpacity}>
      <line x1={centerX} y1={yMin} x2={centerX} y2={yMax} stroke={color} strokeWidth={1.5} opacity={0.6} />
      <line x1={centerX - whiskerWidth / 2} y1={yMin} x2={centerX + whiskerWidth / 2} y2={yMin} stroke={color} strokeWidth={1.5} opacity={0.6} />
      <line x1={centerX - whiskerWidth / 2} y1={yMax} x2={centerX + whiskerWidth / 2} y2={yMax} stroke={color} strokeWidth={1.5} opacity={0.6} />
      <rect
        x={boxX}
        y={yQ3}
        width={boxWidth}
        height={yQ1 - yQ3}
        fill={color}
        fillOpacity={0.2}
        stroke={color}
        strokeWidth={1.5}
        rx={3}
      />
      <line x1={boxX} y1={yMedian} x2={boxX + boxWidth} y2={yMedian} stroke={color} strokeWidth={2.5} />
      {/* Mean diamond */}
      <polygon
        points={`${centerX},${yMean - 5} ${centerX + 5},${yMean} ${centerX},${yMean + 5} ${centerX - 5},${yMean}`}
        fill={color}
        stroke="white"
        strokeWidth={1}
      />
    </g>
  );
}

export default function DistributionChart({ phaseStats, onPhaseClick }: DistributionChartProps) {
  const { t } = useTranslation();
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const selectedStats = selectedPhase
    ? phaseStats.find((s) => s.phase === selectedPhase)
    : null;

  const data = phaseStats.map((s) => ({
    ...s,
    dummy: s.max,
    // true = this is the selected one, false = another is selected (dim it), undefined = none selected
    selected: selectedPhase ? s.phase === selectedPhase : undefined,
  }));

  const handleBarClick = (_data: unknown, _index: number, e: React.MouseEvent) => {
    const payload = (_data as { payload?: PhaseStats })?.payload;
    if (payload?.phase) {
      setSelectedPhase((prev) => (prev === payload.phase ? null : payload.phase));
    }
    e.stopPropagation();
  };

  const selectedColor = selectedStats ? getPhaseColor(selectedStats.mean) : '#059669';

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
          {t('distribution.title')}
        </h3>
        {!selectedPhase && (
          <span className="text-xs text-muted">{t('distribution.clickHint')}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="phase"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#d4d4d8' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const stats = payload[0].payload as PhaseStats;
              return (
                <div className="bg-white border border-border rounded-lg p-3 shadow-xl text-xs">
                  <p className="font-medium text-foreground mb-2">{stats.phase}</p>
                  <div className="space-y-1 tabular-nums">
                    <p className="text-muted">Max: <span className="text-foreground">{stats.max}%</span></p>
                    <p className="text-muted">Q3: <span className="text-foreground">{stats.q3.toFixed(1)}%</span></p>
                    <p className="text-muted">{t('distribution.mean')}: <span className="text-foreground font-medium" style={{ color: getPhaseColor(stats.mean) }}>{stats.mean.toFixed(1)}%</span></p>
                    <p className="text-muted">Median: <span className="text-foreground">{stats.median.toFixed(1)}%</span></p>
                    <p className="text-muted">Q1: <span className="text-foreground">{stats.q1.toFixed(1)}%</span></p>
                    <p className="text-muted">Min: <span className="text-foreground">{stats.min}%</span></p>
                    <p className="text-muted mt-1">n={stats.count}</p>
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="dummy"
            shape={<BoxPlotShape />}
            onClick={handleBarClick}
            cursor="pointer"
          >
            {data.map((entry) => (
              <Cell key={entry.phase} fill="transparent" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detail panel on click */}
      {selectedStats && (
        <div
          className="mt-4 p-4 rounded-lg border transition-colors"
          style={{
            borderColor: `${selectedColor}40`,
            backgroundColor: `${selectedColor}08`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {selectedStats.phase} — {t('distribution.avgProductivity')}
              </p>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: selectedColor }}
                >
                  {selectedStats.mean.toFixed(1)}%
                </span>
                <span className="text-sm text-muted">
                  {t('distribution.mean')} · {selectedStats.count} {t('distribution.dataPoints')}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted tabular-nums">
                <span>Min {selectedStats.min}%</span>
                <span>Q1 {selectedStats.q1.toFixed(1)}%</span>
                <span>Median {selectedStats.median.toFixed(1)}%</span>
                <span>Q3 {selectedStats.q3.toFixed(1)}%</span>
                <span>Max {selectedStats.max}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onPhaseClick && (
                <button
                  onClick={() => onPhaseClick(selectedStats.phase)}
                  className="px-3 py-1.5 text-xs rounded-md bg-accent-dim text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
                >
                  {t('distribution.viewSources')} →
                </button>
              )}
              <button
                onClick={() => setSelectedPhase(null)}
                className="p-1.5 text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-hover"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
