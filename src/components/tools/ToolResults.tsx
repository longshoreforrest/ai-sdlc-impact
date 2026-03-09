'use client';

import { ToolBusinessCase, Verdict } from '@/lib/tool-calculations';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { PHASE_COLORS } from '@/lib/constants';
import { Phase } from '@/lib/types';

const VERDICT_STYLES: Record<Verdict, { bg: string; text: string; label: TranslationKey }> = {
  'strong-buy': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'tools.verdictStrongBuy' },
  'recommended': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'tools.verdictRecommended' },
  'marginal': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'tools.verdictMarginal' },
  'not-recommended': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'tools.verdictNotRecommended' },
};

function formatEur(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

interface ToolResultsProps {
  result: ToolBusinessCase;
}

export default function ToolResults({ result }: ToolResultsProps) {
  const { t } = useTranslation();
  const { tool, scenarios, verdict } = result;
  const realistic = scenarios.realistic;
  const verdictStyle = VERDICT_STYLES[verdict];

  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-5">
      {/* Header with verdict */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{tool.name}</h3>
          <p className="text-xs text-muted">{tool.vendor}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${verdictStyle.bg} ${verdictStyle.text}`}>
          {t(verdictStyle.label)}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label={t('tools.annualCost')} value={formatEur(realistic.annualToolCost)} />
        <MetricCard label={t('tools.annualSavings')} value={formatEur(realistic.totalCostSavings)} highlight />
        <MetricCard label={t('tools.paybackMonths')} value={realistic.paybackMonths >= 999 ? '> 12' : `${realistic.paybackMonths}`} />
        <MetricCard label={t('tools.roiMultiple')} value={`${realistic.roiMultiple}x`} />
      </div>

      {/* Scenario comparison */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{t('tools.scenarioComparison')}</h4>
        <div className="grid grid-cols-3 gap-2">
          {(['pessimistic', 'realistic', 'optimistic'] as const).map((key) => {
            const s = scenarios[key];
            const colors = key === 'pessimistic' ? 'border-red-500/30' : key === 'realistic' ? 'border-amber-500/30' : 'border-emerald-500/30';
            return (
              <div key={key} className={`p-3 rounded-lg border ${colors} bg-surface`}>
                <p className="text-xs text-muted capitalize mb-1">{t(`roi.${key}` as TranslationKey)}</p>
                <p className="text-sm font-semibold">{formatEur(s.netSavings)}</p>
                <p className="text-xs text-muted">{s.totalHoursSaved.toLocaleString()} h</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase breakdown */}
      <div>
        <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-2">{t('tools.phaseBreakdown')}</h4>
        <div className="space-y-1.5">
          {realistic.phases.map((p) => {
            const maxImpact = Math.max(...realistic.phases.map((pp) => pp.toolImpactPct), 1);
            const barWidth = Math.max((p.toolImpactPct / maxImpact) * 100, 0);
            return (
              <div key={p.phase} className="flex items-center gap-2 text-xs">
                <span className="w-24 text-muted truncate">{p.phase}</span>
                <div className="flex-1 h-4 bg-border/50 rounded overflow-hidden relative">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: PHASE_COLORS[p.phase as Phase],
                      opacity: 0.7,
                    }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium">
                    {p.toolImpactPct > 0 ? `${p.toolImpactPct}%` : '—'}
                  </span>
                </div>
                <span className="w-16 text-right text-muted">{formatEur(p.costSavings)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applicability weights */}
      <div className="text-xs text-muted">
        <span className="font-medium">{t('tools.applicabilityNote')}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-background border border-border">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
    </div>
  );
}
