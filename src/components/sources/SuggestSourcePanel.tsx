'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Link, FileText, ChevronDown, ChevronUp, Check, Ban, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { Phase, DataType } from '@/lib/types';
import {
  addSourceSuggestion,
  getSourceSuggestions,
  updateSourceSuggestionStatus,
  SourceSuggestion,
  SuggestionStatus,
} from '@/lib/suggestions';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const PHASES: Phase[] = ['Strategy', 'Design', 'Spec', 'Dev', 'QA', 'DevOps'];
const DATA_TYPES: { value: DataType; labelKey: TranslationKey }[] = [
  { value: 'empirical', labelKey: 'common.empirical' },
  { value: 'survey', labelKey: 'common.survey' },
  { value: 'vendor', labelKey: 'common.vendor' },
  { value: 'anecdotal', labelKey: 'common.anecdotal' },
];

const STATUS_CONFIG: Record<SuggestionStatus, { labelKey: TranslationKey; className: string }> = {
  pending: { labelKey: 'common.pending', className: 'bg-zinc-500/10 text-zinc-400' },
  accepted: { labelKey: 'common.accepted', className: 'bg-emerald-500/10 text-emerald-400' },
  rejected: { labelKey: 'common.rejected', className: 'bg-red-500/10 text-red-400' },
  postponed: { labelKey: 'common.postponed', className: 'bg-amber-500/10 text-amber-400' },
};

const STATUS_ACTIONS: { status: SuggestionStatus; icon: React.ElementType; titleKey: TranslationKey }[] = [
  { status: 'accepted', icon: Check, titleKey: 'common.accept' },
  { status: 'postponed', icon: Clock, titleKey: 'common.postpone' },
  { status: 'rejected', icon: Ban, titleKey: 'common.reject' },
];

function SourceSuggestionCard({
  suggestion: s,
  onStatusChange,
}: {
  suggestion: SourceSuggestion;
  onStatusChange: (status: SuggestionStatus, linkedSourceId?: string) => void;
}) {
  const { t } = useTranslation();
  const status = s.status || 'pending';
  const [linkInput, setLinkInput] = useState(s.linkedSourceId || '');
  const [showLinkInput, setShowLinkInput] = useState(false);

  function handleAccept() {
    if (status === 'accepted') {
      onStatusChange('pending');
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  }

  function confirmAccept() {
    onStatusChange('accepted', linkInput.trim() || undefined);
    setShowLinkInput(false);
  }

  return (
    <div className="p-3 bg-zinc-50 border border-border rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-accent hover:underline truncate flex items-center gap-1"
              title={s.url}
            >
              {s.name || s.url}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          {s.description && (
            <p className="text-xs text-muted mt-0.5 line-clamp-2">{s.description}</p>
          )}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${STATUS_CONFIG[status].className}`}>
          {t(STATUS_CONFIG[status].labelKey)}
        </span>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        {s.phase && (
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-200/60 text-muted">{s.phase}</span>
        )}
        {s.dataType && (
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-200/60 text-muted">{s.dataType}</span>
        )}
        {s.impactPct !== undefined && (
          <span className="text-[10px] text-muted">{s.impactPct}%</span>
        )}
        <span className="text-[10px] text-muted">
          {new Date(s.createdAt).toLocaleDateString('en-GB')}
        </span>
      </div>

      {/* Linked source */}
      {status === 'accepted' && s.linkedSourceId && (
        <a
          href={`/sources?search=${encodeURIComponent(s.linkedSourceId)}`}
          className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-400 hover:underline"
        >
          <BookOpen className="w-3 h-3" />
          {t('sources.linked')}: {s.linkedSourceId}
        </a>
      )}

      {/* Link input for accepting */}
      {showLinkInput && (
        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder={t('suggestSource.dataSourceName')}
            className="flex-1 bg-white border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={confirmAccept}
            className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
          >
            {t('common.confirm')}
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1 text-xs text-muted rounded hover:bg-zinc-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Status actions */}
      {!showLinkInput && (
        <div className="flex justify-end gap-1 mt-2">
          {STATUS_ACTIONS.map(({ status: actionStatus, icon: Icon, titleKey }) => (
            <button
              key={actionStatus}
              type="button"
              onClick={() => {
                if (actionStatus === 'accepted') {
                  handleAccept();
                } else {
                  onStatusChange(actionStatus === status ? 'pending' : actionStatus);
                }
              }}
              title={actionStatus === status ? t('common.resetToPending') : t(titleKey)}
              className={`p-1 rounded transition-colors ${
                actionStatus === status
                  ? STATUS_CONFIG[actionStatus].className
                  : 'text-muted hover:text-foreground hover:bg-zinc-200'
              }`}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SuggestSourcePanelProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function SuggestSourcePanel({ open, onClose, onSubmitted }: SuggestSourcePanelProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<Phase | null>(null);
  const [dataType, setDataType] = useState<DataType | null>(null);
  const [impactPct, setImpactPct] = useState('');
  const [year, setYear] = useState('2026');
  const [sampleSize, setSampleSize] = useState('');
  const [success, setSuccess] = useState(false);
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<SourceSuggestion[]>([]);

  useEffect(() => {
    setSuggestions(getSourceSuggestions());
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const resetForm = () => {
    setUrl('');
    setName('');
    setDescription('');
    setPhase(null);
    setDataType(null);
    setImpactPct('');
    setYear('2026');
    setSampleSize('');
  };

  const canSubmit = !!url.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await addSourceSuggestion({
      url: url.trim(),
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      phase: phase || undefined,
      dataType: dataType || undefined,
      impactPct: impactPct ? Number(impactPct) : undefined,
      year: Number(year) || 2026,
      sampleSize: sampleSize.trim() || undefined,
    });

    resetForm();
    setSuggestions(getSourceSuggestions());
    setSuccess(true);
    onSubmitted();
    setTimeout(() => setSuccess(false), 2500);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-surface border-l border-border z-50 slide-in overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-muted uppercase tracking-wider">{t('suggestSource.title')}</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* URL */}
            <div>
              <label className="flex items-center gap-2 text-sm text-foreground mb-2">
                <Link className="w-4 h-4 text-muted" />
                {t('suggestSource.url')} <span className="text-accent">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/report"
                className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>

            {/* Source Name */}
            <div>
              <label className="flex items-center gap-2 text-sm text-foreground mb-2">
                <FileText className="w-4 h-4 text-muted" />
                {t('suggestSource.sourceName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. "McKinsey — AI Report 2026"'
                className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-foreground mb-2 block">
                {t('suggestSource.description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('suggestSource.descPlaceholder')}
                rows={3}
                className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* SDLC Phase */}
            <div>
              <label className="text-sm text-foreground mb-2 block">
                {t('suggestSource.sdlcPhase')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PHASES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPhase(p)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                      phase === p
                        ? 'bg-accent-dim text-accent border-accent/30'
                        : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Type */}
            <div>
              <label className="text-sm text-foreground mb-2 block">
                {t('suggestSource.dataType')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DATA_TYPES.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDataType(value)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
                      dataType === value
                        ? 'bg-accent-dim text-accent border-accent/30'
                        : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact % + Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-foreground mb-2 block">{t('suggestSource.impactPct')}</label>
                <input
                  type="number"
                  value={impactPct}
                  onChange={(e) => setImpactPct(e.target.value)}
                  placeholder="e.g. 30"
                  min={-100}
                  max={500}
                  className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm tabular-nums text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-sm text-foreground mb-2 block">{t('suggestSource.year')}</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={2020}
                  max={2030}
                  className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm tabular-nums text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Sample Size */}
            <div>
              <label className="text-sm text-foreground mb-2 block">{t('suggestSource.sampleSize')}</label>
              <input
                type="text"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder={t('suggestSource.samplePlaceholder')}
                className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                canSubmit
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-zinc-100 text-muted cursor-not-allowed'
              }`}
            >
              {t('suggestSource.submit')}
            </button>

            {/* Success toast */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3 text-center fade-in">
                {t('suggestSource.success')}
              </div>
            )}

            {/* Previous suggestions */}
            {suggestions.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowList(!showList)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                >
                  {showList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {t('suggestSource.previousCount', { count: suggestions.length })}
                </button>

                {showList && (
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {suggestions.map((s) => (
                      <SourceSuggestionCard
                        key={s.id}
                        suggestion={s}
                        onStatusChange={(status, linkedSourceId) => {
                          updateSourceSuggestionStatus(s.id, status, linkedSourceId);
                          setSuggestions(getSourceSuggestions());
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
