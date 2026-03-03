'use client';

import { CalculatorInputs } from '@/lib/types';
import { formatEur } from '@/lib/formatters';
import { PHASES } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';

interface ROIConfigProps {
  inputs: CalculatorInputs;
}

export default function ROIConfig({ inputs }: ROIConfigProps) {
  const { t } = useTranslation();

  return (
    <section id="roi-configuration">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
        4. {t('report.roiConfiguration')}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {t('report.roiConfigIntro')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input parameters */}
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.inputParameters')}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-zinc-100">
                <td className="py-1.5 text-zinc-600">{t('calculator.teamSize')}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">{inputs.teamSize}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1.5 text-zinc-600">{t('calculator.avgSalary')}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">{formatEur(inputs.avgSalary)}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1.5 text-zinc-600">{t('calculator.hoursPerYear')}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">{inputs.hoursPerYear}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1.5 text-zinc-600">{t('calculator.itBudget')}</td>
                <td className="py-1.5 text-right font-bold tabular-nums">{formatEur(inputs.itBudget)}</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1.5 text-zinc-600">{t('calculator.timeframe')}</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {inputs.timeframeYears || 1} {(inputs.timeframeYears || 1) === 1 ? t('calculator.year') : t('calculator.years')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Phase weights & inhouse ratios */}
        <div>
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.phaseWeights')} & {t('report.inhouseRatios')}
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left text-xs font-medium text-zinc-500 py-1.5">{t('common.phase')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 py-1.5">{t('roi.weightColumn')}</th>
                <th className="text-right text-xs font-medium text-zinc-500 py-1.5">{t('report.inhouseRatios')}</th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((phase) => {
                const included = inputs.includedPhases.includes(phase);
                const inhouseRatio = inputs.inhouseRatios?.[phase] ?? 1;
                return (
                  <tr key={phase} className="border-b border-zinc-100">
                    <td className={`py-1.5 ${included ? 'text-zinc-700' : 'text-zinc-400 line-through'}`}>
                      {phase}
                    </td>
                    <td className="py-1.5 text-right tabular-nums font-medium">
                      {(inputs.phaseWeights[phase] * 100).toFixed(0)}%
                    </td>
                    <td className="py-1.5 text-right tabular-nums font-medium">
                      {Math.round(inhouseRatio * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {t('report.inhouseNote')}
          </p>
        </div>
      </div>

      {/* Transformation Costs */}
      <div className="mt-6">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
          {t('transformation.title')}
        </h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="py-1.5 text-zinc-600">
                {t('transformation.toolingCost')}
                {(inputs.timeframeYears || 1) > 1 && ` (${inputs.timeframeYears} ${t('calculator.years')})`}
              </td>
              <td className="py-1.5 text-right font-medium tabular-nums">{formatEur(inputs.teamSize * 20 * 12 * (inputs.timeframeYears || 1))}</td>
            </tr>
            <tr className="border-b border-zinc-100">
              <td className="py-1.5 text-zinc-600">{t('transformation.consulting')}</td>
              <td className="py-1.5 text-right font-medium tabular-nums">{formatEur(inputs.transformationCosts.consulting)}</td>
            </tr>
            <tr className="border-b border-zinc-100">
              <td className="py-1.5 text-zinc-600">{t('transformation.training')}</td>
              <td className="py-1.5 text-right font-medium tabular-nums">{formatEur(inputs.transformationCosts.training)}</td>
            </tr>
            <tr className="border-b border-zinc-100">
              <td className="py-1.5 text-zinc-600">{t('transformation.internal')}</td>
              <td className="py-1.5 text-right font-medium tabular-nums">{formatEur(inputs.transformationCosts.internal)}</td>
            </tr>
            <tr className="border-t-2 border-zinc-200">
              <td className="py-1.5 text-zinc-900 font-bold">
                {t('transformation.totalInvestment')}
                {(inputs.timeframeYears || 1) > 1 && ` (${inputs.timeframeYears} ${t('calculator.years')})`}
              </td>
              <td className="py-1.5 text-right font-bold tabular-nums">
                {formatEur(inputs.teamSize * 20 * 12 * (inputs.timeframeYears || 1) + inputs.transformationCosts.consulting + inputs.transformationCosts.training + inputs.transformationCosts.internal)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {t('report.transformationNote')}
        </p>
      </div>

    </section>
  );
}
