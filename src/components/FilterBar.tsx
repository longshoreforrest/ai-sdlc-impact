'use client';

import { RotateCcw } from 'lucide-react';
import { Phase, DataType, BenefitType, SourceCategoryKey, FilterState } from '@/lib/types';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal', 'info'];
const ALL_CATEGORIES: SourceCategoryKey[] = ['scientific', 'social-media', 'sap', 'salesforce', 'other'];
const ALL_BENEFIT_TYPES: BenefitType[] = ['efficiency', 'cost', 'other'];

const dataTypeLabelKeys: Record<DataType, TranslationKey> = {
  empirical: 'common.empirical',
  survey: 'common.survey',
  vendor: 'common.vendor',
  anecdotal: 'common.anecdotal',
  info: 'common.info',
};

const categoryLabelKeys: Record<SourceCategoryKey, TranslationKey> = {
  scientific: 'sources.scientific',
  'social-media': 'sources.socialMedia',
  sap: 'sources.sap',
  salesforce: 'sources.salesforce',
  other: 'scenario.categoryOther',
};

const benefitTypeLabelKeys: Record<BenefitType, TranslationKey> = {
  efficiency: 'sources.benefitType_efficiency',
  cost: 'sources.benefitType_cost',
  other: 'sources.benefitType_other',
};

interface FilterBarProps {
  filters: FilterState;
  toggleYear: (year: number) => void;
  toggleDataType: (dt: DataType) => void;
  togglePhase: (phase: Phase) => void;
  toggleCategory: (cat: SourceCategoryKey) => void;
  setScope: (scope: FilterState['scope']) => void;
  toggleBenefitType: (bt: BenefitType) => void;
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
  toggleCategory,
  setScope,
  toggleBenefitType,
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

      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.category')}</span>
        <div className="flex gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <ToggleButton
              key={cat}
              active={filters.categories.includes(cat)}
              onClick={() => toggleCategory(cat)}
            >
              {t(categoryLabelKeys[cat])}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Scope */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.scope')}</span>
        <div className="flex gap-1">
          {(['all', 'sdlc', 'business'] as const).map((s) => (
            <ToggleButton
              key={s}
              active={filters.scope === s}
              onClick={() => setScope(s)}
            >
              {s === 'all' ? 'All' : s === 'sdlc' ? 'SDLC' : 'Business'}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Benefit Type */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">{t('sources.benefitType')}</span>
        <div className="flex gap-1">
          {ALL_BENEFIT_TYPES.map((bt) => (
            <ToggleButton
              key={bt}
              active={filters.benefitTypes.includes(bt)}
              onClick={() => toggleBenefitType(bt)}
            >
              {t(benefitTypeLabelKeys[bt])}
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
