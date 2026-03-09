'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { ToolProfile, Phase } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

const PHASES: Phase[] = ['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'];

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

interface ToolProfileConfiguratorProps {
  profiles: ToolProfile[];
  onChange: (profiles: ToolProfile[]) => void;
  onReset: () => void;
}

export default function ToolProfileConfigurator({ profiles, onChange, onReset }: ToolProfileConfiguratorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateProfile = (id: string, updates: Partial<ToolProfile>) => {
    onChange(profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const updateApplicability = (id: string, phase: Phase, value: number) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    onChange(
      profiles.map((p) =>
        p.id === id
          ? { ...p, phaseApplicability: { ...p.phaseApplicability, [phase]: value } }
          : p
      )
    );
  };

  const addProfile = () => {
    const newProfile = createEmptyProfile();
    onChange([...profiles, newProfile]);
    setEditingId(newProfile.id);
  };

  const removeProfile = (id: string) => {
    onChange(profiles.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{t('tools.profileConfigurator')}</h2>
          <span className="text-xs text-muted">({profiles.length} {t('tools.profilesCount')})</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {/* Tool list */}
          <div className="space-y-3">
            {profiles.map((profile) => {
              const isEditing = editingId === profile.id;
              return (
                <div
                  key={profile.id}
                  className={`rounded-lg border transition-colors ${
                    isEditing ? 'border-accent/40 bg-accent-dim/30' : 'border-border bg-background'
                  }`}
                >
                  {/* Tool header row */}
                  <button
                    onClick={() => setEditingId(isEditing ? null : profile.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium truncate">{profile.name || 'Unnamed Tool'}</span>
                      <span className="text-xs text-muted">{profile.vendor}</span>
                      <span className="text-xs text-muted">&euro;{profile.costPerSeatMonthly}/seat/mo</span>
                    </div>
                    {isEditing ? <ChevronUp className="w-3.5 h-3.5 text-muted flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted flex-shrink-0" />}
                  </button>

                  {/* Expanded editor */}
                  {isEditing && (
                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-3">
                      {/* Basic info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted block mb-1">{t('tools.profileName')}</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted block mb-1">{t('tools.profileVendor')}</label>
                          <input
                            type="text"
                            value={profile.vendor}
                            onChange={(e) => updateProfile(profile.id, { vendor: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted block mb-1">{t('tools.profileDescription')}</label>
                        <input
                          type="text"
                          value={profile.description}
                          onChange={(e) => updateProfile(profile.id, { description: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      {/* Costs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted block mb-1">{t('tools.costPerSeat')}</label>
                          <input
                            type="number"
                            min={0}
                            max={10000}
                            value={profile.costPerSeatMonthly}
                            onChange={(e) => updateProfile(profile.id, { costPerSeatMonthly: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted block mb-1">{t('tools.fixedMonthlyCost')}</label>
                          <input
                            type="number"
                            min={0}
                            max={1000000}
                            value={profile.fixedMonthlyCost}
                            onChange={(e) => updateProfile(profile.id, { fixedMonthlyCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>

                      {/* Phase applicability sliders */}
                      <div>
                        <label className="text-xs text-muted block mb-2">{t('tools.phaseApplicability')}</label>
                        <div className="space-y-2">
                          {PHASES.map((phase) => {
                            const val = profile.phaseApplicability[phase];
                            return (
                              <div key={phase} className="flex items-center gap-3">
                                <span className="text-xs text-muted w-24 truncate">{phase}</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={Math.round(val * 100)}
                                  onChange={(e) => updateApplicability(profile.id, phase, parseInt(e.target.value) / 100)}
                                  className="flex-1 h-1.5 accent-accent"
                                />
                                <span className="text-xs font-mono w-10 text-right">{Math.round(val * 100)}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delete button for custom tools */}
                      {profile.id.startsWith('custom-') && (
                        <button
                          onClick={() => removeProfile(profile.id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('tools.removeProfile')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={addProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent-dim text-accent border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              {t('tools.addProfile')}
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t('common.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
