'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, X, Mic, ChevronDown, ChevronUp, Check, Ban, Clock } from 'lucide-react';
import { addFeatureSuggestion, getFeatureSuggestions, updateFeatureSuggestionStatus, FeatureSuggestion, FeatureStatus } from '@/lib/suggestions';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

type Priority = FeatureSuggestion['priority'];

const PRIORITIES: { value: Priority; labelKey: TranslationKey }[] = [
  { value: 'nice-to-have', labelKey: 'common.niceToHave' },
  { value: 'important', labelKey: 'common.important' },
  { value: 'critical', labelKey: 'common.critical' },
];

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
      if (last.isFinal) {
        onTranscript(last[0].transcript);
      }
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
      className={`p-2 rounded-lg border transition-colors ${
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
    <div className={`rounded-lg overflow-hidden ${
      isImplemented
        ? 'border-2 border-emerald-500/30'
        : 'border border-border'
    }`}>
      {isImplemented && (
        <div className="bg-emerald-500/10 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-500/20">
          <Check className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-medium text-emerald-500">{t('common.implemented')}</span>
          <span className="text-[10px] text-emerald-400/70 ml-auto">
            {new Date(s.implementedAt!).toLocaleDateString('en-GB')}
          </span>
        </div>
      )}
      <div className="p-3 bg-zinc-50">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CONFIG[status].className}`}>
              {t(STATUS_CONFIG[status].labelKey)}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              s.priority === 'critical'
                ? 'bg-red-500/10 text-red-400'
                : s.priority === 'important'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-zinc-500/10 text-muted'
            }`}>
              {t(PRIORITIES.find(p => p.value === s.priority)?.labelKey ?? 'common.niceToHave')}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted mt-1 line-clamp-2">{s.description}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="text-[10px] text-muted">
            <p>
              {t('fromUsers.suggested')} {new Date(s.createdAt).toLocaleDateString('en-GB')}
              {s.submitterName && <> · {t('suggestFeature.submittedBy', { name: s.submitterName })}</>}
            </p>
          </div>
        <div className="flex gap-1">
          {STATUS_ACTIONS.map(({ status: actionStatus, icon: Icon, titleKey }) => (
            <button
              key={actionStatus}
              type="button"
              onClick={() => onStatusChange(actionStatus === status ? 'pending' : actionStatus)}
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
      </div>
      </div>
    </div>
  );
}

export default function SuggestFeatureButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('nice-to-have');
  const [submitterName, setSubmitterName] = useState('');
  const [success, setSuccess] = useState(false);
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);

  useEffect(() => {
    setSuggestions(getFeatureSuggestions());
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    },
    []
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const canSubmit = title.trim() && description.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await addFeatureSuggestion({
      title: title.trim(),
      description: description.trim(),
      priority,
      ...(submitterName.trim() && { submitterName: submitterName.trim() }),
    });

    setTitle('');
    setDescription('');
    setPriority('nice-to-have');
    setSubmitterName('');
    setSuggestions(getFeatureSuggestions());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleTranscript = useCallback((text: string) => {
    setDescription((prev) => (prev ? prev + ' ' + text : text));
  }, []);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-sm font-medium shadow-lg hover:bg-accent/90 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        {t('suggestFeature.button')}
      </button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
            <div
              className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium">{t('suggestFeature.title')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-sm text-foreground mb-2 block">
                      {t('suggestFeature.featureTitle')} <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('suggestFeature.titlePlaceholder')}
                      className="w-full bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  {/* Description + speech-to-text */}
                  <div>
                    <label className="text-sm text-foreground mb-2 block">
                      {t('suggestFeature.description')} <span className="text-accent">*</span>
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('suggestFeature.descPlaceholder')}
                        rows={4}
                        className="flex-1 bg-zinc-50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
                        required
                      />
                      <SpeechButton onTranscript={handleTranscript} />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm text-foreground mb-2 block">{t('suggestFeature.priority')}</label>
                    <div className="flex gap-1.5">
                      {PRIORITIES.map(({ value, labelKey }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPriority(value)}
                          className={`px-3 py-1.5 text-xs rounded-md transition-colors border ${
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

                  {/* Submitter name (optional) */}
                  <div>
                    <label className="text-sm text-foreground mb-2 block">
                      {t('suggestFeature.submitterName')}
                    </label>
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      placeholder={t('suggestFeature.submitterNamePlaceholder')}
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
                    {t('suggestFeature.submit')}
                    {suggestions.length > 0 && (
                      <span className="ml-2 text-xs opacity-75">{t('suggestFeature.submitted', { count: suggestions.length })}</span>
                    )}
                  </button>

                  {/* Success toast */}
                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3 text-center fade-in">
                      {t('suggestFeature.success')}
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
                        {t('suggestFeature.previousCount', { count: suggestions.length })}
                      </button>

                      {showList && (
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
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
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
