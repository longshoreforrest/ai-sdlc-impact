'use client';

import { TemporalEra } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const eras: { value: TemporalEra; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'temporal.all' },
  { value: 'early', labelKey: 'temporal.early' },
  { value: 'agentic', labelKey: 'temporal.agentic' },
];

interface TemporalToggleProps {
  era: TemporalEra;
  setEra: (era: TemporalEra) => void;
}

export default function TemporalToggle({ era, setEra }: TemporalToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex rounded-lg bg-surface border border-border p-1">
      {eras.map(({ value, labelKey }) => (
        <button
          key={value}
          onClick={() => setEra(value)}
          className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
            era === value
              ? 'bg-accent-dim text-accent shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
