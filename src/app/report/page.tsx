'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Calculator } from 'lucide-react';
import { CalculatorInputs, ScenarioType } from '@/lib/types';
import { facts } from '@/lib/mock-data';
import { calculateConfiguredScenarios } from '@/lib/calculations';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import ExecutiveSummary from '@/components/report/ExecutiveSummary';
import DataFoundation from '@/components/report/DataFoundation';
import ScenarioSection from '@/components/report/ScenarioSection';
import ROIConfig from '@/components/report/ROIConfig';
import SourceAppendix from '@/components/report/SourceAppendix';

export default function ReportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { configs: scenarioConfigs } = useScenario();
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('report-inputs');
      if (stored) {
        const parsed = JSON.parse(stored) as CalculatorInputs;
        // Ensure transformationCosts exist (backward compat)
        if (!parsed.transformationCosts) {
          parsed.transformationCosts = {
            consulting: Math.round(parsed.itBudget * 0.15),
            training: Math.round(parsed.itBudget * 0.05),
            internal: Math.round(parsed.itBudget * 0.10),
          };
        }
        // Merge latest scenario configs from context
        setInputs({ ...parsed, scenarioConfigs });
      }
    } catch {
      // ignore parse errors
    }
  }, [scenarioConfigs]);

  const computedData = useMemo(() => {
    if (!inputs) return null;
    const { scenarios, factMapping } = calculateConfiguredScenarios(inputs, facts);
    const uniqueSources = new Set(facts.map((f) => f.source)).size;
    const years = [...new Set(facts.map((f) => f.year))].sort();
    const yearSpan = years.length > 1 ? `${years[0]}\u2013${years[years.length - 1]}` : String(years[0] || '');
    const totalBudget = inputs.teamSize * inputs.avgSalary + inputs.itBudget;
    return { scenarios, factMapping, uniqueSources, yearSpan, totalBudget };
  }, [inputs]);

  // No data fallback
  if (!inputs || !computedData) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <Calculator className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <p className="text-zinc-600 mb-4">{t('report.noData')}</p>
        <button
          onClick={() => router.push('/calculator')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('report.goToCalculator')}
        </button>
      </div>
    );
  }

  const { scenarios, factMapping, uniqueSources, yearSpan, totalBudget } = computedData;
  const scenarioKeys: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white text-zinc-900 max-w-4xl mx-auto">
      {/* Action bar (hidden on print) */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between mb-8">
        <button
          onClick={() => router.push('/calculator')}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('report.backToCalculator')}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors"
        >
          <Printer className="w-4 h-4" />
          {t('report.print')}
        </button>
      </div>

      <div className="px-6 pb-12 space-y-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">{t('report.title')}</h1>
          <p className="text-sm text-zinc-500 mt-2">{t('report.subtitle')}</p>
          <p className="text-xs text-zinc-400 mt-1">{t('report.generatedOn', { date: now })}</p>
        </div>

        {/* Table of Contents */}
        <nav className="border border-zinc-200 rounded-lg p-4 print:break-after-page">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
            {t('report.tableOfContents')}
          </h2>
          <ol className="text-sm space-y-1.5 text-zinc-700">
            <li><a href="#executive-summary" className="hover:text-accent">1. {t('report.executiveSummary')}</a></li>
            <li><a href="#data-foundation" className="hover:text-accent">2. {t('report.dataFoundation')}</a></li>
            <li><a href="#scenario-definitions" className="hover:text-accent">3. {t('report.scenarioDefinitions')}</a></li>
            <li><a href="#roi-configuration" className="hover:text-accent">4. {t('report.roiConfiguration')}</a></li>
            <li><a href="#source-appendix" className="hover:text-accent">5. {t('report.sourceAppendix')}</a></li>
            <li><a href="#methodology" className="hover:text-accent">6. {t('report.disclaimerTitle')}</a></li>
            <li><a href="#glossary" className="hover:text-accent">7. {t('report.glossaryTitle')}</a></li>
          </ol>
        </nav>

        {/* Section 1: Executive Summary */}
        <ExecutiveSummary
          scenarios={scenarios}
          totalBudget={totalBudget}
          teamSize={inputs.teamSize}
          totalFacts={facts.length}
          uniqueSources={uniqueSources}
          yearSpan={yearSpan}
          hoursPerYear={inputs.hoursPerYear}
        />

        {/* Section 2: Data Foundation */}
        <DataFoundation facts={facts} />

        {/* Section 3: Scenario Definitions */}
        <section id="scenario-definitions">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
            3. {t('report.scenarioDefinitions')}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            {t('report.scenarioDefIntro')}
          </p>
          {scenarioKeys.map((key, i) => (
            <ScenarioSection
              key={key}
              scenarioType={key}
              config={inputs.scenarioConfigs[key]}
              metrConfig={inputs.scenarioConfigs.metrConfig}
              factGroups={factMapping[key]}
              allFacts={facts}
              index={i}
            />
          ))}
        </section>

        {/* Section 4: ROI Configuration */}
        <ROIConfig inputs={inputs} />

        {/* Section 5: Source Appendix */}
        <SourceAppendix facts={facts} />

        {/* Section 6: Methodology & Limitations */}
        <section id="methodology">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
            6. {t('report.disclaimerTitle')}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {t('report.disclaimerText')}
          </p>
        </section>

        {/* Section 7: Glossary */}
        <section id="glossary">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
            7. {t('report.glossaryTitle')}
          </h2>
          <dl className="text-sm space-y-3">
            {([
              'report.glossarySDLC',
              'report.glossaryROI',
              'report.glossaryQ1Q3',
              'report.glossaryMETR',
              'report.glossaryAgentic',
              'report.glossaryEmpirical',
              'report.glossaryCredibility',
            ] as const).map((key) => {
              const text = t(key);
              const dashIdx = text.indexOf(' — ');
              const term = dashIdx > -1 ? text.substring(0, dashIdx) : text;
              const definition = dashIdx > -1 ? text.substring(dashIdx + 3) : '';
              return (
                <div key={key}>
                  <dt className="font-semibold text-zinc-800">{term}</dt>
                  {definition && <dd className="text-zinc-600 mt-0.5 leading-relaxed">{definition}</dd>}
                </div>
              );
            })}
          </dl>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-400 pt-8 border-t border-zinc-200">
          <p>{t('report.generatedOn', { date: now })}</p>
          <p className="mt-1">SDLC AI-Impact Analyzer</p>
        </div>
      </div>
    </div>
  );
}
