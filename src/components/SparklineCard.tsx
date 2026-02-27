'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Phase, PhaseTrend } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface SparklineCardProps {
  trend: PhaseTrend;
  onPhaseClick?: (phase: Phase) => void;
}

function getColor(points: { mean: number }[]): string {
  if (points.length === 0) return '#71717a';
  const latest = points[points.length - 1].mean;
  if (latest >= 50) return '#059669';
  if (latest >= 30) return '#d97706';
  return '#dc2626';
}

export default function SparklineCard({ trend, onPhaseClick }: SparklineCardProps) {
  const { t } = useTranslation();
  const { phase, points } = trend;
  const color = getColor(points);
  const latestMean = points.length > 0 ? points[points.length - 1].mean : 0;

  return (
    <div
      onClick={() => onPhaseClick?.(phase)}
      className={`bg-surface rounded-xl border border-border p-4 flex items-center gap-4 ${onPhaseClick ? 'cursor-pointer hover:ring-2 hover:ring-accent/40' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">{phase}</p>
        <p className="text-lg font-bold tabular-nums" style={{ color }}>
          {latestMean > 0 ? `${latestMean}%` : '—'}
        </p>
        <p className="text-xs text-muted">{t('dashboard.latestAvg')}</p>
      </div>
      <div className="w-[120px] h-[40px]">
        {points.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <Line
                type="monotone"
                dataKey="mean"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted">
            —
          </div>
        )}
      </div>
    </div>
  );
}
