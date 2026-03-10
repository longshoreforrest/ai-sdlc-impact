'use client';

import { useState, useEffect } from 'react';
import { Layers, FileSpreadsheet, Presentation, Globe, Loader2, Settings2, Radar as RadarIcon, Shield, DollarSign } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { TOOL_PROFILES } from '@/lib/tool-profiles';
import { ToolProfile } from '@/lib/types';
import ToolRadarChart from '@/components/tools/ToolRadarChart';
import ComplianceCostsTable from '@/components/tools/ComplianceCostsTable';
import EnterprisePricingTable from '@/components/tools/EnterprisePricingTable';
import ToolProfileConfigurator from '@/components/tools/ToolProfileConfigurator';
import { exportAiToolsExcel, exportAiToolsPptx, exportAiToolsHtml } from '@/lib/export-ai-tools';

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

type Tab = 'profiles' | 'radar' | 'compliance' | 'pricing';
type ExportFormat = 'excel' | 'pptx' | 'html';

const TABS: { id: Tab; labelKey: string; icon: React.ElementType }[] = [
  { id: 'radar', labelKey: 'Radar Chart', icon: RadarIcon },
  { id: 'compliance', labelKey: 'Security & Compliance', icon: Shield },
  { id: 'pricing', labelKey: 'Pricing & Data Privacy', icon: DollarSign },
  { id: 'profiles', labelKey: 'Tool Profiles', icon: Settings2 },
];

export default function AiToolsPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<ToolProfile[]>(() => [...TOOL_PROFILES]);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('radar');

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleProfilesChange = (updated: ToolProfile[]) => {
    setProfiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetProfiles = () => {
    const defaults = [...TOOL_PROFILES];
    setProfiles(defaults);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await new Promise((r) => setTimeout(r, 100));
      if (format === 'excel') exportAiToolsExcel(profiles);
      else if (format === 'pptx') exportAiToolsPptx(profiles);
      else if (format === 'html') exportAiToolsHtml(profiles);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header + Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight">{t('aiTools.title')}</h1>
          </div>
          <p className="text-sm text-muted mt-1">{t('aiTools.subtitle')}</p>
        </div>

        {/* Export group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1">Export</span>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover hover:border-green-400 transition-all disabled:opacity-50 group"
          >
            {exporting === 'excel' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600 group-hover:text-green-500" />
            )}
            {exporting === 'excel' ? t('aiTools.exporting') : t('aiTools.exportExcel')}
          </button>
          <button
            onClick={() => handleExport('pptx')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover hover:border-orange-400 transition-all disabled:opacity-50 group"
          >
            {exporting === 'pptx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Presentation className="w-3.5 h-3.5 text-orange-500 group-hover:text-orange-400" />
            )}
            {exporting === 'pptx' ? t('aiTools.exporting') : t('aiTools.exportPptx')}
          </button>
          <button
            onClick={() => handleExport('html')}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover hover:border-blue-400 transition-all disabled:opacity-50 group"
          >
            {exporting === 'html' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-400" />
            )}
            {exporting === 'html' ? t('aiTools.exporting') : t('aiTools.exportHtml')}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              {labelKey}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'profiles' && (
        <ToolProfileConfigurator
          profiles={profiles}
          onChange={handleProfilesChange}
          onReset={resetProfiles}
        />
      )}

      {activeTab === 'radar' && (
        <ToolRadarChart profiles={profiles} />
      )}

      {activeTab === 'compliance' && (
        <ComplianceCostsTable />
      )}

      {activeTab === 'pricing' && (
        <EnterprisePricingTable />
      )}
    </div>
  );
}
