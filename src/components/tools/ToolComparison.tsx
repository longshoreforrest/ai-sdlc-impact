'use client';

import { ToolBusinessCase, Verdict } from '@/lib/tool-calculations';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { Gauge, AlertTriangle } from 'lucide-react';

const VERDICT_COLORS: Record<Verdict, string> = {
  'strong-buy': 'text-emerald-400',
  'recommended': 'text-blue-400',
  'marginal': 'text-amber-400',
  'not-recommended': 'text-red-400',
};

const VERDICT_LABELS: Record<Verdict, TranslationKey> = {
  'strong-buy': 'tools.verdictStrongBuy',
  'recommended': 'tools.verdictRecommended',
  'marginal': 'tools.verdictMarginal',
  'not-recommended': 'tools.verdictNotRecommended',
};

function formatEur(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

interface ToolComparisonProps {
  results: ToolBusinessCase[];
}

export default function ToolComparison({ results }: ToolComparisonProps) {
  const { t } = useTranslation();

  if (results.length < 2) return null;

  const showRateLimit = results.some((r) => r.rateLimitWeighted);

  const rows: { label: string; values: (string | { text: string; className?: string; icon?: 'gauge' | 'warning' })[] }[] = [
    {
      label: t('tools.annualCost'),
      values: results.map((r) => formatEur(r.scenarios.realistic.annualToolCost)),
    },
    {
      label: t('tools.annualSavings'),
      values: results.map((r) => formatEur(r.scenarios.realistic.totalCostSavings)),
    },
    {
      label: t('tools.netSavings'),
      values: results.map((r) => {
        const net = r.scenarios.realistic.netSavings;
        return { text: formatEur(net), className: net >= 0 ? 'text-emerald-400' : 'text-red-400' };
      }),
    },
    {
      label: t('tools.hoursSaved'),
      values: results.map((r) => `${r.scenarios.realistic.totalHoursSaved.toLocaleString()} h`),
    },
    {
      label: t('tools.paybackMonths'),
      values: results.map((r) => {
        const pm = r.scenarios.realistic.paybackMonths;
        return pm >= 999 ? '> 12' : `${pm} mo`;
      }),
    },
    {
      label: t('tools.roiMultiple'),
      values: results.map((r) => `${r.scenarios.realistic.roiMultiple}x`),
    },
    {
      label: t('tools.verdict'),
      values: results.map((r) => ({
        text: t(VERDICT_LABELS[r.verdict]),
        className: VERDICT_COLORS[r.verdict],
      })),
    },
  ];

  // Insert rate limit row before verdict if weighting is enabled
  if (showRateLimit) {
    rows.splice(rows.length - 1, 0, {
      label: t('tools.rateLimitScore'),
      values: results.map((r) => {
        if (r.rateLimitStatus === 'no-data') {
          return { text: t('tools.rateLimitNoData'), className: 'text-amber-400', icon: 'warning' as const };
        }
        const score = r.tool.rateLimitScore!;
        const factor = r.rateLimitFactor!;
        const color = score >= 4 ? 'text-emerald-400' : score >= 3 ? 'text-blue-400' : 'text-amber-400';
        return { text: `${score}/4 (${Math.round(factor * 100)}%)`, className: color, icon: 'gauge' as const };
      }),
    });
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{t('tools.comparisonTitle')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted font-medium px-5 py-2 w-40"></th>
              {results.map((r) => (
                <th key={r.tool.id} className="text-left text-xs font-semibold px-4 py-2">
                  {r.tool.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/50">
                <td className="text-xs text-muted px-5 py-2">{row.label}</td>
                {row.values.map((val, i) => (
                  <td key={i} className="px-4 py-2 text-xs font-medium">
                    {typeof val === 'string' ? (
                      val
                    ) : (
                      <span className={`inline-flex items-center gap-1 ${val.className ?? ''}`}>
                        {val.icon === 'gauge' && <Gauge className="w-3 h-3" />}
                        {val.icon === 'warning' && <AlertTriangle className="w-3 h-3" />}
                        {val.text}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
