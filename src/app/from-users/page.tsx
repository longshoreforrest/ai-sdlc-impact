'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Link as LinkIcon,
  ExternalLink,
  BookOpen,
  Check,
  Clock,
  Ban,
  Filter,
} from 'lucide-react';
import {
  getFeatureSuggestions,
  getSourceSuggestions,
  updateFeatureSuggestionStatus,
  updateSourceSuggestionStatus,
  FeatureSuggestion,
  SourceSuggestion,
  SuggestionStatus,
} from '@/lib/suggestions';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const STATUS_CONFIG: Record<SuggestionStatus, { labelKey: TranslationKey; bg: string; dot: string }> = {
  pending: { labelKey: 'common.pending', bg: 'bg-zinc-500/10 text-zinc-400', dot: 'bg-zinc-400' },
  accepted: { labelKey: 'common.accepted', bg: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  rejected: { labelKey: 'common.rejected', bg: 'bg-red-500/10 text-red-400', dot: 'bg-red-400' },
  postponed: { labelKey: 'common.postponed', bg: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
};

const PRIORITY_CONFIG: Record<string, { labelKey: TranslationKey; className: string }> = {
  critical: { labelKey: 'common.critical', className: 'bg-red-500/10 text-red-400' },
  important: { labelKey: 'common.important', className: 'bg-amber-500/10 text-amber-400' },
  'nice-to-have': { labelKey: 'common.niceToHave', className: 'bg-zinc-500/10 text-muted' },
};

const STATUS_ACTIONS: { status: SuggestionStatus; icon: React.ElementType; titleKey: TranslationKey }[] = [
  { status: 'accepted', icon: Check, titleKey: 'common.accept' },
  { status: 'postponed', icon: Clock, titleKey: 'common.postpone' },
  { status: 'rejected', icon: Ban, titleKey: 'common.reject' },
];

type StatusFilter = SuggestionStatus | 'all';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: SuggestionStatus }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {t(config.labelKey)}
    </span>
  );
}

function StatusActionButtons({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: SuggestionStatus;
  onStatusChange: (status: SuggestionStatus) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1">
      {STATUS_ACTIONS.map(({ status, icon: Icon, titleKey }) => (
        <button
          key={status}
          onClick={() => onStatusChange(status === currentStatus ? 'pending' : status)}
          title={status === currentStatus ? t('common.resetToPending') : t(titleKey)}
          className={`p-1.5 rounded-md transition-colors ${
            status === currentStatus
              ? STATUS_CONFIG[status].bg
              : 'text-muted hover:text-foreground hover:bg-surface-hover'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

function FeatureCard({
  feature,
  onStatusChange,
}: {
  feature: FeatureSuggestion;
  onStatusChange: (status: SuggestionStatus) => void;
}) {
  const { t } = useTranslation();
  const status = feature.status || 'pending';
  const priority = PRIORITY_CONFIG[feature.priority];
  const isImplemented = status === 'accepted' && !!feature.implementedAt;

  return (
    <div className={`group bg-surface rounded-xl overflow-hidden transition-colors ${
      isImplemented
        ? 'border-2 border-emerald-500/30'
        : 'border border-border hover:border-muted'
    }`}>
      {/* Green implemented banner */}
      {isImplemented && (
        <div className="bg-emerald-500/10 px-5 py-2.5 flex items-center gap-2 border-b border-emerald-500/20">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-emerald-500">{t('common.implemented')}</span>
          <span className="text-xs text-emerald-400/70 ml-auto">
            {formatDate(feature.implementedAt!)}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{feature.title}</h3>
            <p className="text-sm text-muted leading-relaxed line-clamp-2">{feature.description}</p>
          </div>
          <StatusActionButtons currentStatus={status} onStatusChange={onStatusChange} />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className={`text-xs px-2.5 py-1 rounded-full ${priority.className}`}>
              {t(priority.labelKey)}
            </span>
          </div>
          <span className="text-xs text-muted">
            {t('fromUsers.suggested')} {formatDate(feature.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SourceCard({
  source,
  onStatusChange,
}: {
  source: SourceSuggestion;
  onStatusChange: (status: SuggestionStatus) => void;
}) {
  const { t } = useTranslation();
  const status = source.status || 'pending';
  const isAccepted = status === 'accepted';

  return (
    <div className={`group bg-surface rounded-xl overflow-hidden transition-colors ${
      isAccepted
        ? 'border-2 border-emerald-500/30'
        : 'border border-border hover:border-muted'
    }`}>
      {/* Green accepted banner */}
      {isAccepted && (
        <div className="bg-emerald-500/10 px-5 py-2.5 flex items-center gap-2 border-b border-emerald-500/20">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-emerald-500">{t('fromUsers.acceptedAsSource')}</span>
          {source.linkedSourceId && (
            <Link
              href={`/sources?search=${encodeURIComponent(source.linkedSourceId)}`}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline ml-auto"
            >
              <BookOpen className="w-3 h-3" />
              {source.linkedSourceId}
            </Link>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent hover:underline flex items-center gap-1.5 truncate mb-1.5"
              title={source.url}
            >
              {source.name || source.url}
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            {source.description && (
              <p className="text-sm text-muted leading-relaxed line-clamp-2">{source.description}</p>
            )}
          </div>
          <StatusActionButtons currentStatus={status} onStatusChange={onStatusChange} />
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {source.phase && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted">{source.phase}</span>
          )}
          {source.dataType && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-muted capitalize">{source.dataType}</span>
          )}
          {source.impactPct !== undefined && (
            <span className={`text-xs font-medium ${source.impactPct >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {source.impactPct >= 0 ? '+' : ''}{source.impactPct}%
            </span>
          )}
          {source.year && (
            <span className="text-xs text-muted">{source.year}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <StatusBadge status={status} />
          <span className="text-xs text-muted">{t('fromUsers.suggested')} {formatDate(source.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent || 'bg-accent/10'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-accent'}`} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: 'features' | 'sources' }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12 bg-surface border border-border rounded-xl">
      {type === 'features' ? (
        <Lightbulb className="w-8 h-8 text-muted mx-auto mb-3" />
      ) : (
        <LinkIcon className="w-8 h-8 text-muted mx-auto mb-3" />
      )}
      <p className="text-sm text-muted">
        {type === 'features' ? t('fromUsers.noFeatures') : t('fromUsers.noSources')}
      </p>
    </div>
  );
}

export default function FromUsersPage() {
  const { t } = useTranslation();
  const [features, setFeatures] = useState<FeatureSuggestion[]>([]);
  const [sources, setSources] = useState<SourceSuggestion[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    setFeatures(getFeatureSuggestions());
    setSources(getSourceSuggestions());
  }, []);

  const filteredFeatures = useMemo(
    () => statusFilter === 'all' ? features : features.filter((f) => (f.status || 'pending') === statusFilter),
    [features, statusFilter]
  );

  const filteredSources = useMemo(
    () => statusFilter === 'all' ? sources : sources.filter((s) => (s.status || 'pending') === statusFilter),
    [sources, statusFilter]
  );

  const statusCounts = useMemo(() => {
    const all = [
      ...features.map((f) => f.status || 'pending'),
      ...sources.map((s) => s.status || 'pending'),
    ];
    return {
      total: all.length,
      pending: all.filter((s) => s === 'pending').length,
      accepted: all.filter((s) => s === 'accepted').length,
      rejected: all.filter((s) => s === 'rejected').length,
      postponed: all.filter((s) => s === 'postponed').length,
    };
  }, [features, sources]);

  function handleFeatureStatusChange(id: string, status: SuggestionStatus) {
    updateFeatureSuggestionStatus(id, status);
    setFeatures(getFeatureSuggestions());
  }

  function handleSourceStatusChange(id: string, status: SuggestionStatus) {
    updateSourceSuggestionStatus(id, status);
    setSources(getSourceSuggestions());
  }

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: `${t('fromUsers.all')} (${statusCounts.total})` },
    { value: 'pending', label: `${t('common.pending')} (${statusCounts.pending})` },
    { value: 'accepted', label: `${t('common.accepted')} (${statusCounts.accepted})` },
    { value: 'postponed', label: `${t('common.postponed')} (${statusCounts.postponed})` },
    { value: 'rejected', label: `${t('common.rejected')} (${statusCounts.rejected})` },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('fromUsers.title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('fromUsers.subtitle')}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('fromUsers.featureRequests')} value={features.length} icon={Lightbulb} />
        <StatCard label={t('fromUsers.sourceSuggestions')} value={sources.length} icon={LinkIcon} />
        <StatCard label={t('common.accepted')} value={statusCounts.accepted} icon={Check} accent="bg-emerald-500" />
        <StatCard label={t('fromUsers.pendingReview')} value={statusCounts.pending} icon={Clock} accent="bg-zinc-500" />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted" />
        <div className="flex gap-1.5">
          {filterButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                statusFilter === value
                  ? 'bg-accent-dim text-accent border-accent/30 font-medium'
                  : 'bg-surface text-muted border-border hover:text-foreground hover:border-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Requests Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('fromUsers.featureRequests')}</h2>
            <p className="text-xs text-muted">{t('fromUsers.requestCount', { count: filteredFeatures.length })}</p>
          </div>
        </div>

        {filteredFeatures.length === 0 ? (
          <EmptyState type="features" />
        ) : (
          <div className="space-y-3">
            {filteredFeatures.map((f) => (
              <FeatureCard
                key={f.id}
                feature={f}
                onStatusChange={(status) => handleFeatureStatusChange(f.id, status)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Source Suggestions Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('fromUsers.dataSrcSuggestions')}</h2>
            <p className="text-xs text-muted">{t('fromUsers.suggestionCount', { count: filteredSources.length })}</p>
          </div>
        </div>

        {filteredSources.length === 0 ? (
          <EmptyState type="sources" />
        ) : (
          <div className="space-y-3">
            {filteredSources.map((s) => (
              <SourceCard
                key={s.id}
                source={s}
                onStatusChange={(status) => handleSourceStatusChange(s.id, status)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
