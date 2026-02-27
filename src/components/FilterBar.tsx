'use client';

import { RotateCcw } from 'lucide-react';
import { Phase, DataType, FilterState } from '@/lib/types';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

const dataTypeLabelKeys: Record<DataType, TranslationKey> = {
  empirical: 'common.empirical',
  survey: 'common.survey',
  vendor: 'common.vendor',
  anecdotal: 'common.anecdotal',
};

interface FilterBarProps {
  filters: FilterState;
  toggleYear: (year: number) => void;
  toggleDataType: (dt: DataType) => void;
  togglePhase: (phase: Phase) => void;
  resetFilters: () => void;
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
        active
          ? 'bg-accent-dim text-accent border-accent/30'
          : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({
  filters,
  toggleYear,
  toggleDataType,
  togglePhase,
  resetFilters,
}: FilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-surface rounded-xl border border-border">
      {/* Years */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.year')}</span>
        <div className="flex gap-1">
          {ALL_YEARS.map((year) => (
            <ToggleButton
              key={year}
              active={filters.years.includes(year)}
              onClick={() => toggleYear(year)}
            >
              {year}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Data Types */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.type')}</span>
        <div className="flex gap-1">
          {DATA_TYPES.map((dt) => (
            <ToggleButton
              key={dt}
              active={filters.dataTypes.includes(dt)}
              onClick={() => toggleDataType(dt)}
            >
              {t(dataTypeLabelKeys[dt])}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('common.phase')}</span>
        <div className="flex gap-1">
          {PHASES.map((phase) => (
            <ToggleButton
              key={phase}
              active={filters.phases.includes(phase)}
              onClick={() => togglePhase(phase)}
            >
              {phase}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        {t('common.reset')}
      </button>
    </div>
  );
}
