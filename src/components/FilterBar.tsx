'use client';

import { useState, useRef, useEffect } from 'react';
import { RotateCcw, HelpCircle, X } from 'lucide-react';
import { Phase, DataType, BenefitType, SourceCategoryKey, FilterState } from '@/lib/types';
import { PHASES, ALL_YEARS } from '@/lib/mock-data';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal', 'info'];
const ALL_CATEGORIES: SourceCategoryKey[] = ['scientific', 'social-media', 'sap', 'salesforce', 'other'];
const ALL_BENEFIT_TYPES: BenefitType[] = ['efficiency', 'cost', 'adoption', 'other'];

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
  'ai-tool': 'sources.aiTool' as TranslationKey,
  other: 'scenario.categoryOther',
};

const benefitTypeLabelKeys: Record<BenefitType, TranslationKey> = {
  efficiency: 'sources.benefitType_efficiency',
  cost: 'sources.benefitType_cost',
  adoption: 'sources.benefitType_adoption',
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

function FilterHelpPopup({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('keydown', handleKey); document.removeEventListener('mousedown', handleClick); };
  }, [onClose]);

  const items: TranslationKey[] = [
    'help.filters.f_year', 'help.filters.f_datatype', 'help.filters.f_phase',
    'help.filters.f_category', 'help.filters.f_scope', 'help.filters.f_benefit',
    'help.filters.f_era', 'help.filters.f_reset',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 fade-in">
      <div ref={ref} className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] overflow-y-auto slide-in">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">{t('help.toc.filters')}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 text-sm leading-relaxed space-y-3">
          <p dangerouslySetInnerHTML={{ __html: t('help.filters.p1') }} />
          <ul className="list-disc list-inside space-y-2 text-muted">
            {items.map((key) => (
              <li key={key} dangerouslySetInnerHTML={{ __html: t(key) }} />
            ))}
          </ul>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.filters.p2') }} />
        </div>
      </div>
    </div>
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
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-6 p-4 bg-surface rounded-xl border border-border relative">
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

      {/* Help */}
      <button
        onClick={() => setShowHelp(true)}
        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-dim transition-colors"
        title={t('help.toc.filters')}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {showHelp && <FilterHelpPopup onClose={() => setShowHelp(false)} />}
    </div>
  );
}
