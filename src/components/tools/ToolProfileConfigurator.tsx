'use client';

import { useState } from 'react';
import { RotateCcw, Plus, Trash2, X, ExternalLink, Pencil } from 'lucide-react';
import { ToolProfile, Phase } from '@/lib/types';
import { useTranslation, TranslationKey } from '@/lib/i18n';

const PHASES: Phase[] = ['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'];

const PHASE_COLORS: Record<Phase, string> = {
  Discovery: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  'Release & Ops': '#f97316',
};

function createEmptyProfile(): ToolProfile {
  return {
    id: `custom-${Date.now()}`,
    name: '',
    vendor: '',
    description: '',
    url: '',
    costPerSeatMonthly: 20,
    fixedMonthlyCost: 0,
    phaseApplicability: { Discovery: 0.3, Design: 0.3, Spec: 0.4, Dev: 0.8, QA: 0.5, 'Release & Ops': 0.3 },
  };
}

// ── Mini phase bar ──
function PhaseBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5 group/bar">
      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono text-muted w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Tool card (grid view) ──
function ToolCard({
  profile,
  onEdit,
}: {
  profile: ToolProfile;
  onEdit: () => void;
}) {
  return (
    <div
      className="bg-background rounded-lg border border-border hover:border-accent/30 transition-all group cursor-pointer"
      onClick={onEdit}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">{profile.name || 'Unnamed Tool'}</h3>
            <p className="text-[11px] text-muted truncate">{profile.vendor}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className="text-xs font-bold text-accent">&euro;{profile.costPerSeatMonthly}</span>
            <span className="text-[9px] text-muted">/mo</span>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <p className="text-[10px] text-muted leading-relaxed line-clamp-2">{profile.description}</p>
        )}

        {/* Phase bars */}
        <div className="space-y-1">
          {PHASES.map((phase) => (
            <div key={phase} className="flex items-center gap-2">
              <span className="text-[9px] text-muted w-16 truncate">{phase}</span>
              <PhaseBar value={profile.phaseApplicability[phase]} color={PHASE_COLORS[phase]} />
            </div>
          ))}
        </div>

        {/* Fixed cost indicator */}
        {profile.fixedMonthlyCost > 0 && (
          <div className="text-[10px] text-amber-600 font-medium">
            + &euro;{profile.fixedMonthlyCost.toLocaleString()}/mo fixed
          </div>
        )}
      </div>

      {/* Edit hint */}
      <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted group-hover:text-accent transition-colors">
          <Pencil className="w-3 h-3" />
          Click to edit
        </div>
        {profile.url && (
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-muted hover:text-accent flex items-center gap-0.5"
          >
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Edit panel (modal-style overlay) ──
function EditPanel({
  profile,
  onUpdate,
  onDelete,
  onClose,
  t,
}: {
  profile: ToolProfile;
  onUpdate: (updates: Partial<ToolProfile>) => void;
  onDelete?: () => void;
  onClose: () => void;
  t: (key: TranslationKey) => string;
}) {
  const updateApplicability = (phase: Phase, value: number) => {
    onUpdate({ phaseApplicability: { ...profile.phaseApplicability, [phase]: value } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-sm font-bold">{profile.name || 'New Tool'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted block mb-1">{t('tools.profileName')}</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted block mb-1">{t('tools.profileVendor')}</label>
              <input
                type="text"
                value={profile.vendor}
                onChange={(e) => onUpdate({ vendor: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted block mb-1">{t('tools.profileDescription')}</label>
            <textarea
              value={profile.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted block mb-1">{t('tools.costPerSeat')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">&euro;</span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={profile.costPerSeatMonthly}
                  onChange={(e) => onUpdate({ costPerSeatMonthly: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted block mb-1">{t('tools.fixedMonthlyCost')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">&euro;</span>
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={profile.fixedMonthlyCost}
                  onChange={(e) => onUpdate({ fixedMonthlyCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Phase applicability */}
          <div>
            <label className="text-[11px] font-medium text-muted block mb-3">{t('tools.phaseApplicability')}</label>
            <div className="space-y-3">
              {PHASES.map((phase) => {
                const val = profile.phaseApplicability[phase];
                const pct = Math.round(val * 100);
                return (
                  <div key={phase} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{phase}</span>
                      <span className="text-xs font-bold" style={{ color: PHASE_COLORS[phase] }}>{pct}%</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={pct}
                        onChange={(e) => updateApplicability(phase, parseInt(e.target.value) / 100)}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${PHASE_COLORS[phase]} 0%, ${PHASE_COLORS[phase]} ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="text-[11px] font-medium text-muted block mb-1">URL</label>
            <input
              type="text"
              value={profile.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Delete for custom tools */}
          {profile.id.startsWith('custom-') && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors pt-2 border-t border-border/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('tools.removeProfile')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──
interface ToolProfileConfiguratorProps {
  profiles: ToolProfile[];
  onChange: (profiles: ToolProfile[]) => void;
  onReset: () => void;
}

export default function ToolProfileConfigurator({ profiles, onChange, onReset }: ToolProfileConfiguratorProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateProfile = (id: string, updates: Partial<ToolProfile>) => {
    onChange(profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addProfile = () => {
    const newProfile = createEmptyProfile();
    onChange([...profiles, newProfile]);
    setEditingId(newProfile.id);
  };

  const removeProfile = (id: string) => {
    onChange(profiles.filter((p) => p.id !== id));
    setEditingId(null);
  };

  const editingProfile = editingId ? profiles.find((p) => p.id === editingId) : null;

  return (
    <div className="space-y-4">
      {/* Summary + actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {profiles.length} tools configured. Click any card to edit its profile and SDLC phase weights.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={addProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent-dim text-accent border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('tools.addProfile')}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t('common.reset')}
          </button>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {profiles.map((profile) => (
          <ToolCard
            key={profile.id}
            profile={profile}
            onEdit={() => setEditingId(profile.id)}
          />
        ))}
      </div>

      {/* Edit modal */}
      {editingProfile && (
        <EditPanel
          profile={editingProfile}
          onUpdate={(updates) => updateProfile(editingProfile.id, updates)}
          onDelete={editingProfile.id.startsWith('custom-') ? () => removeProfile(editingProfile.id) : undefined}
          onClose={() => setEditingId(null)}
          t={t}
        />
      )}
    </div>
  );
}
