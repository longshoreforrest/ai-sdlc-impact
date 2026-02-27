'use client';

import { useCallback } from 'react';
import { Users, Euro, Clock, Wallet } from 'lucide-react';
import { CalculatorInputs, Phase, ScenarioConfigs, TransformationCosts } from '@/lib/types';
import { PHASES } from '@/lib/mock-data';
import { normalizeWeights } from '@/lib/calculations';
import { useTranslation } from '@/lib/i18n';
import ScenarioConfigPanel from './ScenarioConfigPanel';

interface InputFormProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
  availableYears: number[];
  factCountsByYear: Record<number, number>;
}

function formatNumber(n: number): string {
  return n.toLocaleString('fi-FI');
}

function formatEurShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)} K`;
  return n.toFixed(0);
}

export default function InputForm({ inputs, onChange, availableYears, factCountsByYear }: InputFormProps) {
  const { t } = useTranslation();

  const personnelBudget = inputs.teamSize * inputs.avgSalary;

  const togglePhase = useCallback((phase: Phase) => {
    const wasIncluded = inputs.includedPhases.includes(phase);
    const includedPhases = wasIncluded
      ? inputs.includedPhases.filter((p) => p !== phase)
      : [...inputs.includedPhases, phase];

    if (includedPhases.length === 0) return; // prevent empty

    // Renormalize weights so included phases sum to 1.0
    const normalized = normalizeWeights(inputs.phaseWeights, includedPhases);
    onChange({ ...inputs, includedPhases, phaseWeights: normalized as Record<Phase, number> });
  }, [inputs, onChange]);

  const handleWeightChange = useCallback((phase: Phase, newWeight: number) => {
    // Adjust this phase's weight and proportionally scale the others
    // so included phases still sum to 1.0
    const included = inputs.includedPhases.filter((p) => p !== phase);
    const othersSum = included.reduce((s, p) => s + (inputs.phaseWeights[p] || 0), 0);

    const clampedWeight = Math.max(0.01, Math.min(0.99, newWeight));
    const remaining = 1 - clampedWeight;
    const scale = othersSum > 0 ? remaining / othersSum : 0;

    const updated = { ...inputs.phaseWeights };
    updated[phase] = clampedWeight;
    for (const p of included) {
      updated[p] = (inputs.phaseWeights[p] || 0) * scale;
    }
    onChange({ ...inputs, phaseWeights: updated });
  }, [inputs, onChange]);

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-sm font-medium text-muted uppercase tracking-wider">
        {t('calculator.teamParams')}
      </h3>

      {/* IT Budget */}
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground mb-2">
          <Wallet className="w-4 h-4 text-muted" />
          {t('calculator.itBudget')}
        </label>
        <input
          type="range"
          min={100000}
          max={500000000}
          step={100000}
          value={inputs.itBudget}
          onChange={(e) => {
            const itBudget = Number(e.target.value);
            const teamSize = Math.max(1, Math.round(itBudget / inputs.avgSalary));
            onChange({ ...inputs, itBudget, teamSize });
          }}
          className="w-full accent-accent"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">100k</span>
          <span className="text-sm font-bold tabular-nums text-accent">{formatNumber(inputs.itBudget)} EUR</span>
          <span className="text-xs text-muted">500M</span>
        </div>
        <p className="text-xs text-muted mt-1">{t('calculator.itBudgetDesc')}</p>
      </div>

      {/* Team Size */}
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground mb-2">
          <Users className="w-4 h-4 text-muted" />
          {t('calculator.teamSize')}
        </label>
        {(() => {
          const maxTeam = Math.max(10, Math.round(inputs.itBudget / inputs.avgSalary));
          return (
            <>
              <input
                type="range"
                min={1}
                max={maxTeam}
                value={Math.min(inputs.teamSize, maxTeam)}
                onChange={(e) => onChange({ ...inputs, teamSize: Number(e.target.value) })}
                className="w-full accent-accent"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted">1</span>
                <span className="text-sm font-bold tabular-nums text-accent">{inputs.teamSize}</span>
                <span className="text-xs text-muted">{formatNumber(maxTeam)}</span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Average Salary */}
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground mb-2">
          <Euro className="w-4 h-4 text-muted" />
          {t('calculator.avgSalary')}
        </label>
        <input
          type="range"
          min={25000}
          max={200000}
          step={1000}
          value={inputs.avgSalary}
          onChange={(e) => {
            const avgSalary = Number(e.target.value);
            const teamSize = Math.max(1, Math.round(inputs.itBudget / avgSalary));
            onChange({ ...inputs, avgSalary, teamSize });
          }}
          className="w-full accent-accent"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">25k</span>
          <span className="text-sm font-bold tabular-nums text-accent">{formatNumber(inputs.avgSalary)} EUR</span>
          <span className="text-xs text-muted">200k</span>
        </div>
      </div>

      {/* Hours Per Year */}
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground mb-2">
          <Clock className="w-4 h-4 text-muted" />
          {t('calculator.hoursPerYear')}
        </label>
        <input
          type="range"
          min={1000}
          max={2500}
          step={50}
          value={inputs.hoursPerYear}
          onChange={(e) => onChange({ ...inputs, hoursPerYear: Number(e.target.value) })}
          className="w-full accent-accent"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">1 000</span>
          <span className="text-sm font-bold tabular-nums text-accent">{formatNumber(inputs.hoursPerYear)} h</span>
          <span className="text-xs text-muted">2 500</span>
        </div>
      </div>

      {/* Total Budget Callout */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
        <p className="text-xs text-muted uppercase tracking-wider mb-1">{t('calculator.totalBudget')}</p>
        <p className="text-xl font-bold tabular-nums text-accent">
          {formatNumber(personnelBudget + inputs.itBudget)} EUR
        </p>
        <p className="text-xs text-muted mt-1">
          {t('calculator.personnel')} {formatNumber(personnelBudget)} + IT {formatNumber(inputs.itBudget)}
        </p>
      </div>

      {/* Transformation Costs */}
      <div>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          {t('transformation.title')}
        </h3>

        {/* AI Tooling (read-only) */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">{t('transformation.toolingCost')}</span>
            <span className="font-bold tabular-nums text-accent">{formatEurShort(inputs.teamSize * 20 * 12)}</span>
          </div>
          <p className="text-xs text-muted">{inputs.teamSize} × 20 EUR × 12 {t('roi.perYear')}</p>
        </div>

        {/* Consulting slider */}
        <div className="mb-3">
          <label className="flex items-center justify-between text-sm text-foreground mb-1">
            <span>{t('transformation.consulting')}</span>
            <span className="font-bold tabular-nums text-accent">{formatEurShort(inputs.transformationCosts.consulting)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={Math.round(inputs.itBudget * 0.5)}
            step={1000}
            value={inputs.transformationCosts.consulting}
            onChange={(e) => onChange({ ...inputs, transformationCosts: { ...inputs.transformationCosts, consulting: Number(e.target.value) } })}
            className="w-full accent-accent"
          />
          <p className="text-xs text-muted">{t('transformation.consultingDesc')}</p>
        </div>

        {/* Training slider */}
        <div className="mb-3">
          <label className="flex items-center justify-between text-sm text-foreground mb-1">
            <span>{t('transformation.training')}</span>
            <span className="font-bold tabular-nums text-accent">{formatEurShort(inputs.transformationCosts.training)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={Math.round(inputs.itBudget * 0.5)}
            step={1000}
            value={inputs.transformationCosts.training}
            onChange={(e) => onChange({ ...inputs, transformationCosts: { ...inputs.transformationCosts, training: Number(e.target.value) } })}
            className="w-full accent-accent"
          />
          <p className="text-xs text-muted">{t('transformation.trainingDesc')}</p>
        </div>

        {/* Internal Implementation slider */}
        <div className="mb-3">
          <label className="flex items-center justify-between text-sm text-foreground mb-1">
            <span>{t('transformation.internal')}</span>
            <span className="font-bold tabular-nums text-accent">{formatEurShort(inputs.transformationCosts.internal)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={Math.round(inputs.itBudget * 0.5)}
            step={1000}
            value={inputs.transformationCosts.internal}
            onChange={(e) => onChange({ ...inputs, transformationCosts: { ...inputs.transformationCosts, internal: Number(e.target.value) } })}
            className="w-full accent-accent"
          />
          <p className="text-xs text-muted">{t('transformation.internalDesc')}</p>
        </div>

        {/* Total Investment */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{t('transformation.totalInvestment')}</p>
          <p className="text-lg font-bold tabular-nums text-red-500">
            {formatEurShort(inputs.teamSize * 20 * 12 + inputs.transformationCosts.consulting + inputs.transformationCosts.training + inputs.transformationCosts.internal)} EUR
          </p>
        </div>
      </div>

      {/* Budget Distribution by SDLC Phase */}
      <div>
        <p className="text-sm text-foreground mb-1">
          {t('calculator.budgetDistribution')}
        </p>
        <p className="text-xs text-muted mb-3">
          {t('calculator.budgetDistributionHint')}
        </p>

        <div className="space-y-2">
          {PHASES.map((phase) => {
            const isActive = inputs.includedPhases.includes(phase);
            const weight = inputs.phaseWeights[phase] || 0;
            const phaseCost = personnelBudget * weight;

            return (
              <div key={phase} className={`${!isActive ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2">
                  {/* Phase toggle button */}
                  <button
                    onClick={() => togglePhase(phase)}
                    className={`text-xs font-medium w-16 shrink-0 text-left transition-colors ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted line-through'
                    }`}
                  >
                    {phase}
                  </button>

                  {/* Slider */}
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={Math.round(weight * 100)}
                    onChange={(e) => handleWeightChange(phase, Number(e.target.value) / 100)}
                    disabled={!isActive}
                    className="flex-1 accent-accent h-1"
                  />

                  {/* Percentage */}
                  <span className={`text-xs tabular-nums w-10 text-right ${isActive ? 'text-foreground font-medium' : 'text-muted'}`}>
                    {(weight * 100).toFixed(0)}%
                  </span>

                  {/* Cost */}
                  <span className={`text-xs tabular-nums w-16 text-right ${isActive ? 'text-accent' : 'text-muted'}`}>
                    {formatEurShort(phaseCost)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Total row */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <span className="text-xs font-medium w-16 shrink-0 text-muted">{t('roi.total')}</span>
            <div className="flex-1" />
            <span className="text-xs tabular-nums w-10 text-right font-bold text-foreground">
              {Math.round(
                inputs.includedPhases.reduce((s, p) => s + (inputs.phaseWeights[p] || 0), 0) * 100
              )}%
            </span>
            <span className="text-xs tabular-nums w-16 text-right font-bold text-accent">
              {formatEurShort(
                inputs.includedPhases.reduce((s, p) => s + personnelBudget * (inputs.phaseWeights[p] || 0), 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Timeframes */}
      <ScenarioConfigPanel
        configs={inputs.scenarioConfigs}
        onChange={(scenarioConfigs: ScenarioConfigs) => onChange({ ...inputs, scenarioConfigs })}
        availableYears={availableYears}
        factCountsByYear={factCountsByYear}
      />
    </div>
  );
}
