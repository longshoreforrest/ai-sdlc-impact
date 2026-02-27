'use client';

import { CalculatorInputs, ScenarioType } from '@/lib/types';
import { computeMETRMultiplier } from '@/lib/calculations';
import { formatEur } from '@/lib/formatters';
import { PHASES } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

interface ROIConfigProps {
  inputs: CalculatorInputs;
}

const SCENARIO_LABEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'roi.pessimistic',
  realistic: 'roi.realistic',
  optimistic: 'roi.optimistic',
};

export default function ROIConfig({ inputs }: ROIConfigProps) {
  const { t } = useTranslation();
  const metrMultiplier = computeMETRMultiplier(inputs.scenarioConfigs.metrConfig);

  return (
    <section id="roi-configuration">
      <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
        4. {t('report.roiConfiguration')}
      </h2>

      <p className="text-sm text-zinc-600 leading-relaxed mb-6">
        {t('report.roiConfigIntro')}
      </p>

      <div className="grid grid-cols-2 gap-6">
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

      {/* Scenario config */}
      <div className="mt-6">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
          {t('report.scenarioConfig')}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {(['pessimistic', 'realistic', 'optimistic'] as ScenarioType[]).map((key) => {
            const config = inputs.scenarioConfigs[key];
            return (
              <div key={key} className="border border-zinc-200 rounded-lg p-3">
                <p className="text-xs font-medium uppercase tracking-wider mb-2 text-zinc-700">
                  {t(SCENARIO_LABEL_KEYS[key])}
                </p>
                <p className="text-xs text-zinc-500">
                  {t('scenario.years')}: {config.years.join(', ')}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('scenario.sources')}: {config.dataTypes.map((dt) => t(`common.${dt}` as TranslationKey)).join(', ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* METR config */}
      {inputs.scenarioConfigs.metrConfig.enabled && (
        <div className="mt-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            {t('report.metrConfig')}
          </h3>
          <div className="border border-zinc-200 rounded-lg p-3 text-sm">
            <p className="text-zinc-600">
              {t('scenario.doublingPeriod')}: {inputs.scenarioConfigs.metrConfig.doublingPeriodMonths} {t('scenario.months')}
            </p>
            <p className="text-zinc-600 mt-1">
              {t('scenario.horizon')}: {inputs.scenarioConfigs.metrConfig.futureOffsetMonths} {t('scenario.months')}
            </p>
            <p className="text-zinc-600 mt-1">
              {t('scenario.adoptionElasticity')}: {(inputs.scenarioConfigs.metrConfig.adoptionElasticity ?? 0.5).toFixed(1)}
            </p>
            <p className="text-zinc-700 font-medium mt-1">
              {t('scenario.metrMultiplier')}: {metrMultiplier.toFixed(1)}x
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
