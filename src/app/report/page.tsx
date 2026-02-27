'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { CalculatorInputs, Phase, ScenarioType, TransformationCosts } from '@/lib/types';
import { facts, PHASE_WEIGHTS } from '@/lib/mock-data';
import { calculateConfiguredScenarios } from '@/lib/calculations';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import ExecutiveSummary from '@/components/report/ExecutiveSummary';
import DataFoundation from '@/components/report/DataFoundation';
import ScenarioSection from '@/components/report/ScenarioSection';
import ROIConfig from '@/components/report/ROIConfig';
import SourceAppendix from '@/components/report/SourceAppendix';

function buildDefaultInputs(scenarioConfigs: CalculatorInputs['scenarioConfigs']): CalculatorInputs {
  const defaultItBudget = 100000000;
  const defaultAvgSalary = 55000;
  return {
    teamSize: Math.round(defaultItBudget / defaultAvgSalary),
    avgSalary: defaultAvgSalary,
    hoursPerYear: 1600,
    itBudget: defaultItBudget,
    includedPhases: ['Strategy', 'Design', 'Spec', 'Dev', 'QA', 'DevOps'] as Phase[],
    phaseWeights: PHASE_WEIGHTS as Record<Phase, number>,
    inhouseRatios: { Strategy: 1, Design: 1, Spec: 1, Dev: 0.2, QA: 1, DevOps: 1 } as Record<Phase, number>,
    scenarioConfigs,
    transformationCosts: {
      consulting: 2_000_000,
      training: 1_000_000,
      internal: 1_000_000,
    },
    timeframeYears: 1,
  };
}

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
            consulting: 2_000_000,
            training: 1_000_000,
            internal: 1_000_000,
          };
        }
        // Ensure timeframeYears exists (backward compat)
        if (!parsed.timeframeYears) {
          parsed.timeframeYears = 1;
        }
        // Merge latest scenario configs from context
        setInputs({ ...parsed, scenarioConfigs });
      } else {
        // No stored data — use defaults (same as calculator page)
        setInputs(buildDefaultInputs(scenarioConfigs));
      }
    } catch {
      // Fallback to defaults on parse errors
      setInputs(buildDefaultInputs(scenarioConfigs));
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

  // Brief loading state while useEffect hydrates inputs
  if (!inputs || !computedData) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <Loader2 className="w-8 h-8 text-zinc-400 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-zinc-500">{t('report.generating')}</p>
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
        <nav className="border border-zinc-200 rounded-lg p-4">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
            {t('report.tableOfContents')}
          </h2>
          <ol className="text-sm space-y-1.5 text-zinc-700">
            <li><a href="#executive-summary" className="hover:text-accent">1. {t('report.executiveSummary')}</a></li>
            <li><a href="#data-foundation" className="hover:text-accent">2. {t('report.dataFoundation')}</a></li>
            <li><a href="#scenario-definitions" className="hover:text-accent">3. {t('report.scenarioDefinitions')}</a></li>
            <li><a href="#roi-configuration" className="hover:text-accent">4. {t('report.roiConfiguration')}</a></li>
            <li><a href="#methodology" className="hover:text-accent">5. {t('report.disclaimerTitle')}</a></li>
            <li><a href="#glossary" className="hover:text-accent">6. {t('report.glossaryTitle')}</a></li>
            <li><a href="#source-appendix" className="hover:text-accent">7. {t('report.sourceAppendix')}</a></li>
          </ol>
        </nav>

        {/* How to Read This Report */}
        <section className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 print:break-after-page">
          <h2 className="text-sm font-medium text-zinc-700 mb-3">
            {t('report.howToRead')}
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            {t('report.howToReadIntro')}
          </p>
          <div className="space-y-2 text-sm text-zinc-600 leading-relaxed">
            {([
              'report.howToReadCEO',
              'report.howToReadCFO',
              'report.howToReadCTO',
              'report.howToReadConsultant',
              'report.howToReadEngineer',
              'report.howToReadPM',
              'report.howToReadDesigner',
              'report.howToReadInvestor',
            ] as const).map((key) => {
              const text = t(key);
              const colonIdx = text.indexOf(':');
              const role = colonIdx > -1 ? text.substring(0, colonIdx) : '';
              const desc = colonIdx > -1 ? text.substring(colonIdx + 1).trim() : text;
              return (
                <p key={key}>
                  <span className="font-semibold text-zinc-800">{role}:</span>{' '}
                  {desc}
                </p>
              );
            })}
          </div>
        </section>

        {/* Section 1: Executive Summary */}
        <ExecutiveSummary
          scenarios={scenarios}
          totalBudget={totalBudget}
          teamSize={inputs.teamSize}
          totalFacts={facts.length}
          uniqueSources={uniqueSources}
          yearSpan={yearSpan}
          hoursPerYear={inputs.hoursPerYear}
          inputs={inputs}
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

        {/* Section 5: Methodology & Limitations */}
        <section id="methodology">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
            5. {t('report.disclaimerTitle')}
          </h2>
          <div className="text-sm text-zinc-600 leading-relaxed space-y-3">
            {t('report.disclaimerText').split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Section 6: Glossary */}
        <section id="glossary">
          <h2 className="text-xl font-bold mb-4 text-zinc-900 border-b border-zinc-200 pb-2">
            6. {t('report.glossaryTitle')}
          </h2>
          <dl className="text-sm space-y-3">
            {([
              'report.glossarySDLC',
              'report.glossaryROI',
              'report.glossaryCostSavings',
              'report.glossaryFTE',
              'report.glossaryPayback',
              'report.glossaryInhouseRatio',
              'report.glossaryTransformation',
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

        {/* Section 7: Source Appendix (last) */}
        <SourceAppendix facts={facts} />

        {/* Footer */}
        <div className="text-center text-xs text-zinc-400 pt-8 border-t border-zinc-200">
          <p>{t('report.generatedOn', { date: now })}</p>
          <p className="mt-1">SDLC AI-Impact Analyzer</p>
        </div>
      </div>
    </div>
  );
}
