'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { useScenario } from '@/contexts/ScenarioContext';
import { useTranslation } from '@/lib/i18n';
import { facts } from '@/lib/mock-data';
import { TOOL_PROFILES } from '@/lib/tool-profiles';
import { calculateToolBusinessCase, ToolBusinessCase } from '@/lib/tool-calculations';
import { ToolProfile } from '@/lib/types';
import ToolCard from '@/components/tools/ToolCard';
import ToolResults from '@/components/tools/ToolResults';
import ToolComparison from '@/components/tools/ToolComparison';
import ToolProfileConfigurator from '@/components/tools/ToolProfileConfigurator';
import ScenarioConfigurator from '@/components/analytics/ScenarioConfigurator';

const MAX_SELECTED = 3;
const STORAGE_KEY = 'tool-profiles';

function loadProfiles(): ToolProfile[] {
  if (typeof window === 'undefined') return [...TOOL_PROFILES];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as ToolProfile[];
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].phaseApplicability) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return [...TOOL_PROFILES];
}

export default function ToolsPage() {
  const { t } = useTranslation();
  const { configs: scenarioConfigs } = useScenario();

  const [profiles, setProfiles] = useState<ToolProfile[]>(() => [...TOOL_PROFILES]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['claude-code']);
  const [teamSize, setTeamSize] = useState(50);
  const [avgSalary, setAvgSalary] = useState(55000);
  const [hoursPerYear, setHoursPerYear] = useState(1600);
  const [showConfigurator, setShowConfigurator] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  // Persist to localStorage on change
  const handleProfilesChange = (updated: ToolProfile[]) => {
    setProfiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetProfiles = () => {
    const defaults = [...TOOL_PROFILES];
    setProfiles(defaults);
    localStorage.removeItem(STORAGE_KEY);
    // Remove selections that no longer exist
    setSelectedIds((prev) => prev.filter((id) => defaults.some((p) => p.id === id)));
  };

  const toggleTool = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_SELECTED ? [...prev, id] : prev
    );
  };

  const results: ToolBusinessCase[] = useMemo(() => {
    return selectedIds
      .map((id) => {
        const tool = profiles.find((p) => p.id === id);
        if (!tool) return null;
        return calculateToolBusinessCase(tool, teamSize, avgSalary, hoursPerYear, scenarioConfigs, facts);
      })
      .filter(Boolean) as ToolBusinessCase[];
  }, [selectedIds, profiles, teamSize, avgSalary, hoursPerYear, scenarioConfigs]);

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight">{t('tools.title')}</h1>
        </div>
        <p className="text-sm text-muted mt-1">{t('tools.subtitle')}</p>
      </div>

      {/* Scenario Configurator (collapsed) */}
      <ScenarioConfigurator open={showConfigurator} onOpenChange={setShowConfigurator} />

      {/* Tool Profile Configurator (collapsed) */}
      <ToolProfileConfigurator
        profiles={profiles}
        onChange={handleProfilesChange}
        onReset={resetProfiles}
      />

      {/* Input parameters */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold mb-3">{t('tools.parameters')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">{t('tools.teamSize')}</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">{t('tools.avgSalary')}</label>
            <input
              type="number"
              min={10000}
              max={500000}
              value={avgSalary}
              onChange={(e) => setAvgSalary(Math.max(10000, parseInt(e.target.value) || 55000))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">{t('tools.hoursPerYear')}</label>
            <input
              type="number"
              min={800}
              max={2400}
              value={hoursPerYear}
              onChange={(e) => setHoursPerYear(Math.max(800, parseInt(e.target.value) || 1600))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* Tool selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">{t('tools.selectTools')}</h2>
          <span className="text-xs text-muted">
            {selectedIds.length}/{MAX_SELECTED} {t('tools.selected')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {profiles.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              selected={selectedIds.includes(tool.id)}
              disabled={selectedIds.length >= MAX_SELECTED}
              onToggle={() => toggleTool(tool.id)}
            />
          ))}
        </div>
      </div>

      {/* Comparison table (shows when 2+ selected) */}
      {results.length >= 2 && <ToolComparison results={results} />}

      {/* Individual results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((r) => (
          <ToolResults key={r.tool.id} result={r} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-muted text-sm">
          {t('tools.noToolSelected')}
        </div>
      )}
    </div>
  );
}
