'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { CalculatorInputs, Phase, TransformationCosts } from '@/lib/types';
import { facts, PHASE_WEIGHTS } from '@/lib/mock-data';
import { calculateConfiguredScenarios } from '@/lib/calculations';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import InputForm from '@/components/calculator/InputForm';
import ROIReport from '@/components/calculator/ROIReport';
import ExportButton from '@/components/ExportButton';

const AVAILABLE_YEARS = [...new Set(facts.map((f) => f.year))].sort();

const FACT_COUNTS_BY_YEAR: Record<number, number> = {};
for (const f of facts) {
  FACT_COUNTS_BY_YEAR[f.year] = (FACT_COUNTS_BY_YEAR[f.year] || 0) + 1;
}

function computeDefaultTransformationCosts(itBudget: number): TransformationCosts {
  return {
    consulting: Math.round(itBudget * 0.15),
    training: Math.round(itBudget * 0.05),
    internal: Math.round(itBudget * 0.10),
  };
}

export default function CalculatorPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { configs: scenarioConfigs } = useScenario();

  const defaultItBudget = 100000000;

  const [inputs, setInputs] = useState<CalculatorInputs>({
    teamSize: 25,
    avgSalary: 55000,
    hoursPerYear: 1600,
    itBudget: defaultItBudget,
    includedPhases: ['Strategy', 'Design', 'Spec', 'Dev', 'QA', 'DevOps'],
    phaseWeights: PHASE_WEIGHTS as Record<Phase, number>,
    scenarioConfigs,
    transformationCosts: computeDefaultTransformationCosts(defaultItBudget),
  });

  // Sync scenario configs from context when they change
  useEffect(() => {
    setInputs((prev) => ({ ...prev, scenarioConfigs }));
  }, [scenarioConfigs]);

  // Wrap onChange to auto-recalculate transformation costs when IT budget changes
  const handleInputsChange = useCallback((next: CalculatorInputs) => {
    if (next.itBudget !== inputs.itBudget) {
      next = { ...next, transformationCosts: computeDefaultTransformationCosts(next.itBudget) };
    }
    setInputs(next);
  }, [inputs.itBudget]);

  const contentRef = useRef<HTMLDivElement>(null);

  const { scenarios, factMapping } = useMemo(
    () => calculateConfiguredScenarios(inputs, facts),
    [inputs]
  );

  const totalFactCount = facts.length;
  const totalBudget = inputs.teamSize * inputs.avgSalary + inputs.itBudget;

  const pdfSources = useMemo(() => ({
    pessimistic: factMapping.pessimistic.flatMap((g) =>
      g.facts.map((f) => ({
        source: f.source,
        sourceUrl: f.sourceUrl || '',
        impactPct: f.impactPct,
        phase: g.phase,
        year: f.year,
      }))
    ),
    realistic: factMapping.realistic.flatMap((g) =>
      g.facts.map((f) => ({
        source: f.source,
        sourceUrl: f.sourceUrl || '',
        impactPct: f.impactPct,
        phase: g.phase,
        year: f.year,
      }))
    ),
    optimistic: factMapping.optimistic.flatMap((g) =>
      g.facts.map((f) => ({
        source: f.source,
        sourceUrl: f.sourceUrl || '',
        impactPct: f.impactPct,
        phase: g.phase,
        year: f.year,
      }))
    ),
  }), [factMapping]);

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('calculator.title')}</h1>
          <p className="text-sm text-muted mt-1">
            {t('calculator.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sessionStorage.setItem('report-inputs', JSON.stringify(inputs));
              router.push('/report');
            }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            {t('sidebar.report')}
          </button>
          <ExportButton targetRef={contentRef} title={t('calculator.title')} pdfSources={pdfSources} />
        </div>
      </div>

      {/* Two-column layout */}
      <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs (1/3) */}
        <div className="lg:col-span-1">
          <InputForm
            inputs={inputs}
            onChange={handleInputsChange}
            availableYears={AVAILABLE_YEARS}
            factCountsByYear={FACT_COUNTS_BY_YEAR}
          />
        </div>

        {/* Results (2/3) */}
        <div className="lg:col-span-2">
          <ROIReport
            scenarios={scenarios}
            totalBudget={totalBudget}
            teamSize={inputs.teamSize}
            factMapping={factMapping}
            totalFactCount={totalFactCount}
          />
        </div>
      </div>
    </div>
  );
}
