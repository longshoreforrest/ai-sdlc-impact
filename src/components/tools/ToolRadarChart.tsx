'use client';

import { useState, useMemo, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { RotateCw } from 'lucide-react';
import { ToolProfile, Phase } from '@/lib/types';
import {
  COMPLIANCE_TOOLS,
  COMPLIANCE_DIMENSIONS,
  COMPLIANCE_TOOL_COLORS,
  COMPLIANCE_DIM_COLORS,
  PRICING_TOOLS,
  PRICING_DIMENSIONS,
  PRICING_TOOL_COLORS,
  PRICING_DIM_COLORS,
} from '@/lib/compliance-data';

// ── Constants ──
const PHASES: Phase[] = ['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'];

const PROFILE_TOOL_COLORS: string[] = [
  '#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626',
  '#0078d4', '#16a34a', '#9b59b6', '#c47d20', '#3a6fa0', '#e11d48',
];

type ChartMode = 'compliance' | 'sdlc' | 'pricing';
type Orientation = 'dims-as-axes' | 'tools-as-axes';

// ── Custom tooltip ──
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs max-w-xs">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted">{p.name}:</span>
          <span className="font-mono font-medium" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ──
interface ToolRadarChartProps {
  profiles: ToolProfile[];
}

export default function ToolRadarChart({ profiles }: ToolRadarChartProps) {
  const [mode, setMode] = useState<ChartMode>('sdlc');
  const [orientation, setOrientation] = useState<Orientation>('tools-as-axes');
  const [highlightedSeries, setHighlightedSeries] = useState<string | null>(null);

  // ── Compliance mode state ──
  const [enabledCompTools, setEnabledCompTools] = useState<Set<string>>(
    () => new Set(COMPLIANCE_TOOLS.map((t) => t.id))
  );
  const [enabledCompDims, setEnabledCompDims] = useState<Set<string>>(
    () => new Set(COMPLIANCE_DIMENSIONS.map((d) => d.id))
  );

  // ── Pricing mode state ──
  const [enabledPricingTools, setEnabledPricingTools] = useState<Set<string>>(
    () => new Set(PRICING_TOOLS.map((t) => t.id))
  );
  const [enabledPricingDims, setEnabledPricingDims] = useState<Set<string>>(
    () => new Set(PRICING_DIMENSIONS.map((d) => d.id))
  );

  // ── SDLC mode state ──
  const [enabledSdlcTools, setEnabledSdlcTools] = useState<Set<string>>(
    () => new Set(profiles.map((p) => p.id))
  );
  const [enabledSdlcPhases, setEnabledSdlcPhases] = useState<Set<string>>(
    () => new Set(PHASES)
  );

  // Sync SDLC tools when profiles change
  useMemo(() => {
    setEnabledSdlcTools((prev) => {
      const profileIds = new Set(profiles.map((p) => p.id));
      const next = new Set<string>();
      for (const id of prev) {
        if (profileIds.has(id)) next.add(id);
      }
      // Add newly added profiles
      for (const id of profileIds) {
        if (!prev.has(id) && prev.size === 0) next.add(id);
        else if (!prev.has(id)) next.add(id);
      }
      return next.size > 0 ? next : profileIds;
    });
  }, [profiles]);

  const toggleSet = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // keep at least 1
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((setter: React.Dispatch<React.SetStateAction<Set<string>>>, allKeys: string[]) => {
    setter(new Set(allKeys));
  }, []);

  // ── Build chart data ──
  const { chartData, series, maxVal } = useMemo(() => {
    if (mode === 'compliance' || mode === 'pricing') {
      const dimensions = mode === 'compliance' ? COMPLIANCE_DIMENSIONS : PRICING_DIMENSIONS;
      const tools = mode === 'compliance' ? COMPLIANCE_TOOLS : PRICING_TOOLS;
      const enabledTools = mode === 'compliance' ? enabledCompTools : enabledPricingTools;
      const enabledDims = mode === 'compliance' ? enabledCompDims : enabledPricingDims;
      const toolColors = mode === 'compliance' ? COMPLIANCE_TOOL_COLORS : PRICING_TOOL_COLORS;
      const dimColors = mode === 'compliance' ? COMPLIANCE_DIM_COLORS : PRICING_DIM_COLORS;

      const activeDims = dimensions.filter((d) => enabledDims.has(d.id));
      const activeTools = tools.filter((t) => enabledTools.has(t.id));

      if (orientation === 'dims-as-axes') {
        const data = activeDims.map((dim) => {
          const row: Record<string, string | number> = { dimension: dim.name };
          for (const tool of activeTools) {
            row[tool.id] = dim.scores[tool.id] ?? 0;
          }
          return row;
        });
        return {
          chartData: data,
          series: activeTools.map((t) => ({ key: t.id, name: t.name, color: toolColors[t.id] })),
          maxVal: 4,
        };
      } else {
        const data = activeTools.map((tool) => {
          const row: Record<string, string | number> = { dimension: tool.name };
          for (const dim of activeDims) {
            row[dim.id] = dim.scores[tool.id] ?? 0;
          }
          return row;
        });
        return {
          chartData: data,
          series: activeDims.map((d) => ({ key: d.id, name: d.name, color: dimColors[d.id] })),
          maxVal: 4,
        };
      }
    } else {
      // SDLC mode
      const activePhases = PHASES.filter((p) => enabledSdlcPhases.has(p));
      const activeTools = profiles.filter((p) => enabledSdlcTools.has(p.id));

      if (orientation === 'dims-as-axes') {
        // Axes = phases, Series = tools
        const data = activePhases.map((phase) => {
          const row: Record<string, string | number> = { dimension: phase };
          for (const tool of activeTools) {
            row[tool.id] = Math.round(tool.phaseApplicability[phase] * 100);
          }
          return row;
        });
        return {
          chartData: data,
          series: activeTools.map((t, i) => ({
            key: t.id,
            name: t.name,
            color: PROFILE_TOOL_COLORS[i % PROFILE_TOOL_COLORS.length],
          })),
          maxVal: 100,
        };
      } else {
        // Axes = tools, Series = phases
        const data = activeTools.map((tool) => {
          const row: Record<string, string | number> = { dimension: tool.name };
          for (const phase of activePhases) {
            row[phase] = Math.round(tool.phaseApplicability[phase] * 100);
          }
          return row;
        });
        const phaseColors: Record<string, string> = {
          Discovery: '#f59e0b', Design: '#8b5cf6', Spec: '#06b6d4',
          Dev: '#3b82f6', QA: '#10b981', 'Release & Ops': '#f97316',
        };
        return {
          chartData: data,
          series: activePhases.map((p) => ({ key: p, name: p, color: phaseColors[p] })),
          maxVal: 100,
        };
      }
    }
  }, [mode, orientation, enabledCompTools, enabledCompDims, enabledPricingTools, enabledPricingDims, enabledSdlcTools, enabledSdlcPhases, profiles]);

  // ── Filter UI helpers ──
  const compToolChips = COMPLIANCE_TOOLS;
  const compDimChips = COMPLIANCE_DIMENSIONS;
  const sdlcToolChips = profiles;
  const sdlcPhaseChips = PHASES;

  const minAxes = chartData.length >= 3;

  return (
    <div className="space-y-4">
          {/* Mode + orientation toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1">Data</span>
            <button
              onClick={() => { setMode('compliance'); setHighlightedSeries(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                mode === 'compliance'
                  ? 'text-accent bg-accent-dim border-accent/30'
                  : 'text-muted bg-background border-border hover:border-muted'
              }`}
            >
              Security & Compliance
            </button>
            <button
              onClick={() => { setMode('pricing'); setHighlightedSeries(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                mode === 'pricing'
                  ? 'text-accent bg-accent-dim border-accent/30'
                  : 'text-muted bg-background border-border hover:border-muted'
              }`}
            >
              Pricing & Privacy
            </button>
            <button
              onClick={() => { setMode('sdlc'); setHighlightedSeries(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                mode === 'sdlc'
                  ? 'text-accent bg-accent-dim border-accent/30'
                  : 'text-muted bg-background border-border hover:border-muted'
              }`}
            >
              SDLC Phase Applicability
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1">Layout</span>
            <button
              onClick={() => { setOrientation('dims-as-axes'); setHighlightedSeries(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                orientation === 'dims-as-axes'
                  ? 'text-accent bg-accent-dim border-accent/30'
                  : 'text-muted bg-background border-border hover:border-muted'
              }`}
            >
              {mode === 'sdlc' ? 'Phases as axes' : 'Dimensions as axes'}
            </button>
            <button
              onClick={() => { setOrientation('tools-as-axes'); setHighlightedSeries(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                orientation === 'tools-as-axes'
                  ? 'text-accent bg-accent-dim border-accent/30'
                  : 'text-muted bg-background border-border hover:border-muted'
              }`}
            >
              Tools as axes
            </button>
          </div>

          {/* Filter chips */}
          {mode === 'pricing' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Tools</span>
                {PRICING_TOOLS.map((tool) => {
                  const active = enabledPricingTools.has(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleSet(setEnabledPricingTools, tool.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      {tool.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledPricingTools, PRICING_TOOLS.map((t) => t.id))}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Dims</span>
                {PRICING_DIMENSIONS.map((dim) => {
                  const active = enabledPricingDims.has(dim.id);
                  return (
                    <button
                      key={dim.id}
                      onClick={() => toggleSet(setEnabledPricingDims, dim.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      <span className="font-mono text-[9px] opacity-60 mr-1">{dim.id}</span>
                      {dim.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledPricingDims, PRICING_DIMENSIONS.map((d) => d.id))}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
            </div>
          ) : mode === 'compliance' ? (
            <div className="space-y-2">
              {/* Tool filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Tools</span>
                {compToolChips.map((tool) => {
                  const active = enabledCompTools.has(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleSet(setEnabledCompTools, tool.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      {tool.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledCompTools, COMPLIANCE_TOOLS.map((t) => t.id))}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
              {/* Dimension filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Dims</span>
                {compDimChips.map((dim) => {
                  const active = enabledCompDims.has(dim.id);
                  return (
                    <button
                      key={dim.id}
                      onClick={() => toggleSet(setEnabledCompDims, dim.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      <span className="font-mono text-[9px] opacity-60 mr-1">{dim.id}</span>
                      {dim.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledCompDims, COMPLIANCE_DIMENSIONS.map((d) => d.id))}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Tool filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Tools</span>
                {sdlcToolChips.map((tool) => {
                  const active = enabledSdlcTools.has(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleSet(setEnabledSdlcTools, tool.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      {tool.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledSdlcTools, profiles.map((p) => p.id))}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
              {/* Phase filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1 w-12">Phases</span>
                {sdlcPhaseChips.map((phase) => {
                  const active = enabledSdlcPhases.has(phase);
                  return (
                    <button
                      key={phase}
                      onClick={() => toggleSet(setEnabledSdlcPhases, phase)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                        active
                          ? 'border-accent/40 bg-accent-dim/50 text-accent'
                          : 'border-border border-dashed text-muted/50 hover:text-muted hover:border-muted'
                      }`}
                    >
                      {phase}
                    </button>
                  );
                })}
                <button
                  onClick={() => selectAll(setEnabledSdlcPhases, [...PHASES])}
                  className="text-[10px] text-muted hover:text-accent ml-1"
                >
                  <RotateCw className="w-3 h-3 inline" /> All
                </button>
              </div>
            </div>
          )}

          {/* Radar chart */}
          {!minAxes ? (
            <div className="text-center py-12 text-muted text-sm italic">
              Select at least 3 {orientation === 'dims-as-axes' ? (mode === 'sdlc' ? 'phases' : 'dimensions') : 'tools'} to display the radar chart.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={480}>
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#e4e4e7" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#71717a' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, maxVal]}
                    tick={{ fontSize: 9, fill: '#a1a1aa' }}
                    tickCount={maxVal === 4 ? 5 : 6}
                    axisLine={false}
                  />
                  {series.map((s) => (
                    <Radar
                      key={s.key}
                      name={s.name}
                      dataKey={s.key}
                      stroke={s.color}
                      fill={s.color}
                      fillOpacity={highlightedSeries === null ? 0.15 : highlightedSeries === s.key ? 0.25 : 0.03}
                      strokeOpacity={highlightedSeries === null ? 0.8 : highlightedSeries === s.key ? 1 : 0.15}
                      strokeWidth={highlightedSeries === s.key ? 2.5 : 1.5}
                      dot={{ r: 3, strokeWidth: 1.5, stroke: '#fff' }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  ))}
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {series.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setHighlightedSeries(highlightedSeries === s.key ? null : s.key)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-opacity cursor-pointer hover:underline ${
                      highlightedSeries !== null && highlightedSeries !== s.key ? 'opacity-30' : 'opacity-100'
                    }`}
                    style={{ color: s.color }}
                    data-pin-label={`Radar Chart — ${s.name}`}
                    data-pin-value={`Mode: ${mode === 'compliance' ? 'Security & Compliance' : mode === 'pricing' ? 'Pricing & Data Privacy' : 'SDLC Phases'}`}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    {s.name}
                  </button>
                ))}
                {highlightedSeries && (
                  <button
                    onClick={() => setHighlightedSeries(null)}
                    className="text-[10px] text-muted hover:text-foreground ml-2"
                  >
                    Clear highlight
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="text-[10px] text-muted text-center pt-2 border-t border-border/50">
            {mode === 'compliance'
              ? 'Scores 1\u20134 based on publicly available security certifications and enterprise infrastructure documentation. Click a legend item to highlight.'
              : mode === 'pricing'
              ? 'Scores 1\u20134 based on published pricing, enterprise policies, and data privacy documentation. Click a legend item to highlight.'
              : 'Phase applicability (0\u2013100%) from tool profiles. Click a legend item to highlight.'}
          </div>
    </div>
  );
}
