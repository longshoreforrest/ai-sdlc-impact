'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, X, Mic, ChevronDown, ChevronUp, Check, Ban, Clock, MapPin, Crosshair, Trash2, PanelRightClose } from 'lucide-react';
import { addFeatureSuggestion, getFeatureSuggestions, updateFeatureSuggestionStatus, FeatureSuggestion, FeatureStatus } from '@/lib/suggestions';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { useImprovement, ALL_PAGE_LABELS, type Pin } from '@/contexts/ImprovementContext';

type Priority = FeatureSuggestion['priority'];

const PRIORITIES: { value: Priority; labelKey: TranslationKey }[] = [
  { value: 'nice-to-have', labelKey: 'common.niceToHave' },
  { value: 'important', labelKey: 'common.important' },
  { value: 'critical', labelKey: 'common.critical' },
];

// ── Speech-to-text ──
function SpeechButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { t } = useTranslation();
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const toggle = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = createRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) onTranscript(last[0].transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognition.start();
    setRecording(true);
  }, [recording, onTranscript]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={recording ? t('suggestFeature.stopRecording') : t('suggestFeature.speechToText')}
      className={`p-2 rounded-lg border transition-colors shrink-0 ${
        recording
          ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
          : 'bg-surface border-border text-muted hover:text-foreground hover:border-muted'
      }`}
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}

function createRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

// ── Status config ──
const STATUS_CONFIG: Record<FeatureStatus, { labelKey: TranslationKey; className: string }> = {
  pending: { labelKey: 'common.pending', className: 'bg-zinc-500/10 text-zinc-400' },
  accepted: { labelKey: 'common.accepted', className: 'bg-emerald-500/10 text-emerald-400' },
  rejected: { labelKey: 'common.rejected', className: 'bg-red-500/10 text-red-400' },
  postponed: { labelKey: 'common.postponed', className: 'bg-amber-500/10 text-amber-400' },
};

const STATUS_ACTIONS: { status: FeatureStatus; icon: React.ElementType; titleKey: TranslationKey }[] = [
  { status: 'accepted', icon: Check, titleKey: 'common.accept' },
  { status: 'postponed', icon: Clock, titleKey: 'common.postpone' },
  { status: 'rejected', icon: Ban, titleKey: 'common.reject' },
];

// ── Suggestion card (compact) ──
function SuggestionCard({
  suggestion: s,
  onStatusChange,
}: {
  suggestion: FeatureSuggestion;
  onStatusChange: (status: FeatureStatus) => void;
}) {
  const { t } = useTranslation();
  const status = s.status || 'pending';
  const isImplemented = status === 'accepted' && !!s.implementedAt;

  return (
    <div className={`rounded-lg overflow-hidden ${isImplemented ? 'border-2 border-emerald-500/30' : 'border border-border'}`}>
      {isImplemented && (
        <div className="bg-emerald-500/10 px-2 py-1 flex items-center gap-1 border-b border-emerald-500/20">
          <Check className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-medium text-emerald-500">{t('common.implemented')}</span>
        </div>
      )}
      <div className="p-2.5 bg-zinc-50">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_CONFIG[status].className}`}>
            {t(STATUS_CONFIG[status].labelKey)}
          </span>
        </div>
        {s.navigationPath && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-accent/60" />
            <span className="text-[9px] text-accent/80 font-medium">{s.navigationPath}</span>
          </div>
        )}
        <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{s.description}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-muted">
            {new Date(s.createdAt).toLocaleDateString('en-GB')}
            {s.submitterName && <> · {s.submitterName}</>}
          </span>
          <div className="flex gap-0.5">
            {STATUS_ACTIONS.map(({ status: actionStatus, icon: Icon, titleKey }) => (
              <button
                key={actionStatus}
                type="button"
                onClick={() => onStatusChange(actionStatus === status ? 'pending' : actionStatus)}
                title={actionStatus === status ? t('common.resetToPending') : t(titleKey)}
                className={`p-0.5 rounded transition-colors ${
                  actionStatus === status
                    ? STATUS_CONFIG[actionStatus].className
                    : 'text-muted hover:text-foreground hover:bg-zinc-200'
                }`}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pin badge ──
function PinBadge({ pin, onRemove }: { pin: Pin; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 group">
      <Crosshair className="w-3 h-3 text-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-amber-800 truncate">{pin.label}</div>
        {pin.value && <div className="text-[9px] text-amber-600 truncate">{pin.value}</div>}
        <div className="text-[8px] text-amber-500">{pin.path}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded text-amber-400 hover:text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Main component ──
export default function SuggestFeatureButton() {
  const { t } = useTranslation();
  const improvement = useImprovement();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('nice-to-have');
  const [submitterName, setSubmitterName] = useState('');
  const [success, setSuccess] = useState(false);
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [showPagePicker, setShowPagePicker] = useState(false);

  useEffect(() => {
    setSuggestions(getFeatureSuggestions());
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') improvement.close();
    };
    if (improvement.isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [improvement.isOpen, improvement]);

  // Global click-to-pin handler via data attributes
  useEffect(() => {
    if (!improvement.isPinMode) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const pinnable = target.closest('[data-pin-label]') as HTMLElement | null;
      if (!pinnable) return;

      const label = pinnable.getAttribute('data-pin-label') || '';
      const value = pinnable.getAttribute('data-pin-value') || undefined;
      if (label) {
        e.preventDefault();
        e.stopPropagation();
        improvement.addPin(label, value);
      }
    };

    // Use capture phase so we intercept before normal click handlers
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [improvement.isPinMode, improvement]);

  const canSubmit = title.trim() && description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Build description with pins
    let fullDescription = description.trim();
    if (improvement.pins.length > 0) {
      const pinText = improvement.pins
        .map((p) => `[${p.label}${p.value ? ': ' + p.value : ''} @ ${p.path}]`)
        .join(', ');
      fullDescription += '\n\nPinned references: ' + pinText;
    }

    await addFeatureSuggestion({
      title: title.trim(),
      description: fullDescription,
      priority,
      ...(submitterName.trim() && { submitterName: submitterName.trim() }),
      ...(improvement.navigationPath.trim() && { navigationPath: improvement.navigationPath.trim() }),
    });

    setTitle('');
    setDescription('');
    setPriority('nice-to-have');
    setSubmitterName('');
    improvement.clearPins();
    setSuggestions(getFeatureSuggestions());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleTranscript = useCallback((text: string) => {
    setDescription((prev) => (prev ? prev + ' ' + text : text));
  }, []);

  const pinCount = improvement.pins.length;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={improvement.toggle}
        className={`fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all ${
          improvement.isOpen
            ? 'bg-accent/80 text-white hover:bg-accent/70 ring-2 ring-accent/30'
            : 'bg-accent text-white hover:bg-accent/90'
        }`}
      >
        {improvement.isOpen ? <PanelRightClose className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
        {improvement.isOpen ? 'Close' : t('suggestFeature.button')}
        {pinCount > 0 && (
          <span className="bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {pinCount}
          </span>
        )}
      </button>

      {/* Pin mode indicator banner */}
      {improvement.isOpen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500/90 text-amber-950 text-xs font-medium text-center py-1.5 pointer-events-none md:left-64">
          <Crosshair className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
          Pin mode active — click any highlighted data point to reference it in your suggestion
        </div>
      )}

      {/* Side panel (slides in from right) */}
      <div
        {...(improvement.isOpen ? { 'data-improvement-open': '' } : {})}
        className={`fixed top-0 right-0 h-screen w-80 bg-surface border-l border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          improvement.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">{t('suggestFeature.title')}</span>
          </div>
          <button
            onClick={improvement.close}
            className="p-1 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Context: Relates to */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                {t('suggestFeature.navigationPath')}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={improvement.navigationPath}
                  onChange={(e) => improvement.setNavigationPath(e.target.value)}
                  placeholder={t('suggestFeature.navigationPathPlaceholder')}
                  className="flex-1 bg-zinc-50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPagePicker(!showPagePicker)}
                  className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
                  title="Browse pages"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPagePicker ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showPagePicker && (
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {Object.entries(ALL_PAGE_LABELS).map(([, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { improvement.setNavigationPath(label); setShowPagePicker(false); }}
                      className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                        improvement.navigationPath === label
                          ? 'bg-accent-dim text-accent border-accent/30 font-medium'
                          : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-muted mt-1">{t('suggestFeature.navigationPathHint')}</p>
            </div>

            {/* Pinned references */}
            {improvement.pins.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-600" />
                    Pinned data points
                    <span className="text-[10px] text-amber-600 font-normal">({improvement.pins.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={improvement.clearPins}
                    className="text-[10px] text-muted hover:text-red-500 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="space-y-1.5">
                  {improvement.pins.map((pin) => (
                    <PinBadge key={pin.id} pin={pin} onRemove={() => improvement.removePin(pin.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {t('suggestFeature.featureTitle')} <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('suggestFeature.titlePlaceholder')}
                className="w-full bg-zinc-50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>

            {/* Description + speech */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {t('suggestFeature.description')} <span className="text-accent">*</span>
              </label>
              <div className="flex gap-1.5">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('suggestFeature.descPlaceholder')}
                  rows={3}
                  className="flex-1 bg-zinc-50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
                  required
                />
                <SpeechButton onTranscript={handleTranscript} />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">{t('suggestFeature.priority')}</label>
              <div className="flex gap-1.5">
                {PRIORITIES.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(value)}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-colors border ${
                      priority === value
                        ? 'bg-accent-dim text-accent border-accent/30'
                        : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {t('suggestFeature.submitterName')}
              </label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder={t('suggestFeature.submitterNamePlaceholder')}
                className="w-full bg-zinc-50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                canSubmit
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-zinc-100 text-muted cursor-not-allowed'
              }`}
            >
              {t('suggestFeature.submit')}
              {suggestions.length > 0 && (
                <span className="ml-2 text-xs opacity-75">{t('suggestFeature.submitted', { count: suggestions.length })}</span>
              )}
            </button>

            {/* Success toast */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg px-3 py-2 text-center fade-in">
                {t('suggestFeature.success')}
              </div>
            )}

            {/* Previous suggestions */}
            {suggestions.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowList(!showList)}
                  className="flex items-center gap-1.5 text-[11px] text-muted hover:text-foreground transition-colors"
                >
                  {showList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {t('suggestFeature.previousCount', { count: suggestions.length })}
                </button>
                {showList && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                    {suggestions.map((s) => (
                      <SuggestionCard
                        key={s.id}
                        suggestion={s}
                        onStatusChange={(status) => {
                          updateFeatureSuggestionStatus(s.id, status);
                          setSuggestions(getFeatureSuggestions());
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
