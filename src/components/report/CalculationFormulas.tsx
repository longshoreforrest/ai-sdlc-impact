'use client';

import { useTranslation } from '@/lib/i18n';
import Formula from './Formula';

interface FormulaEntry {
  label: string;
  math: string;
}

function FormulaGroup({ title, description, formulas }: { title: string; description?: string; formulas: FormulaEntry[] }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-zinc-800 mb-1">{title}</h4>
      {description && <p className="text-xs text-zinc-500 mb-2">{description}</p>}
      <div className="space-y-2">
        {formulas.map((f) => (
          <div key={f.label} className="flex items-start gap-3 text-sm">
            <span className="text-zinc-600 shrink-0 w-40">{f.label}:</span>
            <Formula math={f.math} block />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalculationFormulas() {
  const { t } = useTranslation();

  return (
    <div className="mt-8 border-t border-zinc-200 pt-6">
      <h3 className="text-base font-bold text-zinc-900 mb-4">
        {t('report.formulasTitle')}
      </h3>
      <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
        {t('report.formulasIntro')}
      </p>

      {/* Group 1: Core Efficiency Metrics */}
      <FormulaGroup
        title={t('report.formulasGroup1')}
        formulas={[
          { label: t('report.formulaHourlyRate'), math: String.raw`r = \frac{S_{\text{avg}}}{H_{\text{year}}}` },
          { label: t('report.formulaHoursSaved'), math: String.raw`H_p = N \times H_{\text{year}} \times w_p \times \eta_p \times \alpha_p \times T` },
          { label: t('report.formulaCostSavings'), math: String.raw`C_p = H_p \times r` },
          { label: t('report.formulaTotals'), math: String.raw`H_{\text{total}} = \sum_{p} H_p \,,\quad C_{\text{total}} = \sum_{p} C_p` },
        ]}
      />

      {/* Group 2: Investment & ROI */}
      <FormulaGroup
        title={t('report.formulasGroup2')}
        formulas={[
          { label: t('report.formulaToolingCost'), math: String.raw`I_{\text{tool}} = N \times 20 \times 12 \times T` },
          { label: t('report.formulaTotalInvestment'), math: String.raw`I_{\text{total}} = I_{\text{tool}} + I_{\text{consult}} + I_{\text{train}} + I_{\text{internal}}` },
          { label: t('report.formulaNetROI'), math: String.raw`\text{Net ROI} = C_{\text{total}} - I_{\text{total}}` },
          { label: t('report.formulaROIRatio'), math: String.raw`\text{ROI Ratio} = \frac{C_{\text{total}}}{I_{\text{total}}}` },
          { label: t('report.formulaPayback'), math: String.raw`P = \left\lceil \frac{I_{\text{total}}}{C_{\text{total}} \,/\, 12} \right\rceil` },
        ]}
      />

      {/* Group 3: Statistical Functions */}
      <FormulaGroup
        title={t('report.formulasGroup3')}
        formulas={[
          { label: t('report.formulaMeanImpact'), math: String.raw`\bar{\eta} = \frac{1}{n}\sum_{i=1}^{n} x_i` },
          { label: t('report.formulaQuartile'), math: String.raw`Q(q) = x_{\lfloor k \rfloor} + (k - \lfloor k \rfloor)\,(x_{\lfloor k \rfloor + 1} - x_{\lfloor k \rfloor}) \quad\text{where } k = (n{-}1) \times q` },
        ]}
      />

      {/* Group 4: METR Projection Model */}
      <FormulaGroup
        title={t('report.formulasGroup4')}
        formulas={[
          { label: t('report.formulaRawMultiplier'), math: String.raw`M_{\text{raw}} = 2^{\,t_f \,/\, t_d}` },
          { label: t('report.formulaEffMultiplier'), math: String.raw`M_{\text{eff}} = M_{\text{raw}}^{\,\epsilon}` },
          { label: t('report.formulaOptImpact'), math: String.raw`\eta_{\text{opt}} = \bar{\eta} \times M_{\text{eff}}` },
        ]}
      />

      {/* Group 5: Scenario Selection */}
      <FormulaGroup
        title={t('report.formulasGroup5')}
        description={t('report.formulasGroup5Desc')}
        formulas={[
          { label: t('report.formulaPessimistic'), math: String.raw`\eta_{\text{pessimistic}} = Q_1` },
          { label: t('report.formulaRealistic'), math: String.raw`\eta_{\text{realistic}} = \text{Median}` },
          { label: t('report.formulaOptimistic'), math: String.raw`\eta_{\text{optimistic}} = Q_3 \;\text{ or }\; \bar{\eta} \times M_{\text{eff}} \text{ (with METR)}` },
        ]}
      />

      {/* Variable Legend */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-zinc-800 mb-2">
          {t('report.formulasLegendTitle')}
        </h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-1.5 text-zinc-500 font-medium w-24">{t('report.formulasSymbol')}</th>
              <th className="text-left py-1.5 text-zinc-500 font-medium">{t('report.formulasMeaning')}</th>
              <th className="text-left py-1.5 text-zinc-500 font-medium w-28">{t('report.formulasUnit')}</th>
            </tr>
          </thead>
          <tbody className="text-zinc-600">
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="N" /></td><td className="py-1">{t('report.legendN')}</td><td className="py-1">{t('report.legendUnitPeople')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="S_{\text{avg}}" /></td><td className="py-1">{t('report.legendSavg')}</td><td className="py-1">{t('report.legendUnitEurYear')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="H_{\text{year}}" /></td><td className="py-1">{t('report.legendHyear')}</td><td className="py-1">{t('report.legendUnitHours')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="T" /></td><td className="py-1">{t('report.legendT')}</td><td className="py-1">{t('report.legendUnitYears')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="w_p" /></td><td className="py-1">{t('report.legendWp')}</td><td className="py-1">0–1</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="\eta_p" /></td><td className="py-1">{t('report.legendEtaP')}</td><td className="py-1">0–1</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="\alpha_p" /></td><td className="py-1">{t('report.legendAlphaP')}</td><td className="py-1">0–1</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="r" /></td><td className="py-1">{t('report.legendR')}</td><td className="py-1">{t('report.legendUnitEurHour')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="t_f" /></td><td className="py-1">{t('report.legendTf')}</td><td className="py-1">{t('report.legendUnitMonths')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="t_d" /></td><td className="py-1">{t('report.legendTd')}</td><td className="py-1">{t('report.legendUnitMonths')}</td></tr>
            <tr className="border-b border-zinc-50"><td className="py-1"><Formula math="\epsilon" /></td><td className="py-1">{t('report.legendEpsilon')}</td><td className="py-1">0–1</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
