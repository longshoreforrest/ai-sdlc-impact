'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Shield, ExternalLink, RotateCw } from 'lucide-react';

// ── Score types ──
type Score = 1 | 2 | 3 | 4;
type ScoreLabel = 'Best fit' | 'Good' | 'Partial' | 'Weak';

const SCORE_META: Record<Score, { label: ScoreLabel; color: string; bg: string }> = {
  4: { label: 'Best fit', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  3: { label: 'Good', color: 'text-green-600', bg: 'bg-green-500' },
  2: { label: 'Partial', color: 'text-amber-600', bg: 'bg-amber-500' },
  1: { label: 'Weak', color: 'text-red-500', bg: 'bg-red-400' },
};

// ── Tool definitions (column order) ──
interface ComplianceTool {
  id: string;
  name: string;
  sub: string;
  category: 'agentic' | 'ide' | 'enterprise' | 'general';
}

const TOOLS: ComplianceTool[] = [
  { id: 'claude-code', name: 'Claude Code', sub: 'Agentic CLI + IDE extension', category: 'agentic' },
  { id: 'codex-app', name: 'Codex App', sub: 'Desktop multi-agent', category: 'agentic' },
  { id: 'copilot-pro', name: 'GitHub Copilot Pro', sub: 'IDE + coding agent', category: 'agentic' },
  { id: 'cursor', name: 'Cursor', sub: 'AI-native code editor', category: 'ide' },
  { id: 'windsurf', name: 'Windsurf', sub: 'AI IDE (ex-Codeium)', category: 'ide' },
  { id: 'ms-copilot', name: 'MS Copilot', sub: 'M365 AI', category: 'enterprise' },
  { id: 'antigravity', name: 'Google Antigravity', sub: 'Agent-first AI IDE', category: 'agentic' },
  { id: 'claude-cowork', name: 'Claude Cowork', sub: 'Desktop app', category: 'general' },
];

const CATEGORY_STYLES: Record<ComplianceTool['category'], { badge: string; border: string; headerBg: string }> = {
  agentic: {
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    border: 'border-indigo-200',
    headerBg: 'bg-indigo-50/50',
  },
  ide: {
    badge: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-green-200',
    headerBg: 'bg-green-50/50',
  },
  enterprise: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-blue-200',
    headerBg: 'bg-blue-50/50',
  },
  general: {
    badge: '',
    border: 'border-border',
    headerBg: '',
  },
};

// ── Dimension definitions (rows) ──
interface DimensionEntry {
  score: Score;
  bullets: string[];
  chip?: { type: 'barrier' | 'value'; text: string };
  best?: boolean;
}

interface Dimension {
  id: string;
  name: string;
  desc: string;
  tools: Record<string, DimensionEntry>;
}

// ── Reference links ──
interface RefLink {
  category: string;
  label: string;
  url: string;
}

const REF_LINKS: Record<string, RefLink[]> = {
  'claude-code': [
    { category: 'Trust', label: 'Anthropic Trust Center', url: 'https://trust.anthropic.com' },
    { category: 'Pricing', label: 'Claude API Pricing', url: 'https://www.anthropic.com/pricing' },
    { category: 'Security', label: 'Claude Security Overview', url: 'https://docs.anthropic.com/en/docs/about-claude/security' },
    { category: 'Privacy', label: 'Anthropic Privacy Policy', url: 'https://www.anthropic.com/privacy' },
  ],
  'codex-app': [
    { category: 'Trust', label: 'OpenAI Trust Portal', url: 'https://trust.openai.com' },
    { category: 'Pricing', label: 'OpenAI API Pricing', url: 'https://openai.com/api/pricing/' },
    { category: 'Security', label: 'OpenAI Security & Privacy', url: 'https://openai.com/security-and-privacy/' },
    { category: 'Privacy', label: 'OpenAI Enterprise Privacy', url: 'https://openai.com/enterprise-privacy/' },
  ],
  'copilot-pro': [
    { category: 'Trust', label: 'Copilot Trust Center', url: 'https://resources.github.com/copilot-trust-center' },
    { category: 'Pricing', label: 'GitHub Copilot Plans', url: 'https://github.com/features/copilot/plans' },
    { category: 'Security', label: 'GitHub Security', url: 'https://github.com/security' },
    { category: 'Privacy', label: 'Copilot Business Privacy', url: 'https://docs.github.com/en/site-policy/privacy-policies/github-copilot-business-privacy-statement' },
  ],
  'cursor': [
    { category: 'Security', label: 'Cursor Security', url: 'https://www.cursor.com/security' },
    { category: 'Privacy', label: 'Cursor Privacy Mode', url: 'https://docs.cursor.com/account/privacy' },
    { category: 'Pricing', label: 'Cursor Pricing', url: 'https://www.cursor.com/pricing' },
  ],
  'windsurf': [
    { category: 'Trust', label: 'Codeium Trust Center', url: 'https://codeium.com/trust' },
    { category: 'Security', label: 'Codeium Security', url: 'https://codeium.com/security' },
    { category: 'Pricing', label: 'Windsurf Pricing', url: 'https://windsurf.com/pricing' },
    { category: 'Enterprise', label: 'Windsurf Enterprise', url: 'https://windsurf.com/enterprise' },
  ],
  'ms-copilot': [
    { category: 'Trust', label: 'Microsoft Trust Center', url: 'https://www.microsoft.com/en-us/trust-center' },
    { category: 'Pricing', label: 'M365 Copilot Pricing', url: 'https://www.microsoft.com/en-us/microsoft-365/copilot#plans' },
    { category: 'Security', label: 'M365 Copilot Security', url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy' },
    { category: 'Privacy', label: 'Microsoft Privacy Statement', url: 'https://privacy.microsoft.com/en-us/privacystatement' },
  ],
  'antigravity': [
    { category: 'Product', label: 'Google Antigravity', url: 'https://antigravity.google' },
    { category: 'Pricing', label: 'Antigravity Pricing', url: 'https://antigravity.google/pricing' },
    { category: 'Docs', label: 'Getting Started', url: 'https://codelabs.developers.google.com/getting-started-google-antigravity' },
  ],
  'claude-cowork': [
    { category: 'Trust', label: 'Anthropic Trust Center', url: 'https://trust.anthropic.com' },
    { category: 'Pricing', label: 'Claude Pricing Plans', url: 'https://www.anthropic.com/pricing' },
    { category: 'Security', label: 'Claude Security Overview', url: 'https://docs.anthropic.com/en/docs/about-claude/security' },
    { category: 'Privacy', label: 'Anthropic Privacy Policy', url: 'https://www.anthropic.com/privacy' },
  ],
};

const DIMENSIONS: Dimension[] = [
  {
    id: 'S1',
    name: 'Security Certifications',
    desc: 'SOC 2, ISO 27001, GDPR, FedRAMP, penetration testing',
    tools: {
      'claude-code': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II certified', 'GDPR compliant with DPA available', 'CSA STAR Level 1 listed'],
      },
      'codex-app': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II, ISO 27001, ISO 27017/27018/27701 certified', 'GDPR compliant \u2014 DPA available', 'Annual third-party penetration testing'],
      },
      'copilot-pro': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II via GitHub / Microsoft', 'ISO 27001 and ISO 27018 certified', 'FedRAMP authorised via Azure backbone'],
      },
      'cursor': {
        score: 3,
        bullets: ['SOC 2 Type II certified (trust.cursor.com)', 'GDPR & CCPA compliant; AES-256 at rest, TLS 1.2+ in transit', 'Annual third-party penetration testing'],
      },
      'windsurf': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II + ISO 27001 certified', 'FedRAMP High authorized; HIPAA BAA available', 'GDPR compliant; annual third-party pen testing'],
      },
      'ms-copilot': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II, ISO 27001, ISO 27018 via Microsoft', 'FedRAMP High, HIPAA, GxP compliant', 'Broadest certification portfolio across all tools'],
      },
      'antigravity': {
        score: 3,
        bullets: ['Inherits Google Cloud SOC 2 Type II, ISO 27001 infrastructure', 'Enterprise tier: AES-256 at rest, TLS 1.3 in transit', 'FedRAMP Moderate via GCP backbone; GDPR compliant'],
        chip: { type: 'barrier', text: 'Product-level security vulnerabilities documented at launch — monitor fixes' },
      },
      'claude-cowork': {
        score: 4, best: true,
        bullets: ['Inherits Anthropic SOC 2 Type II', 'GDPR compliant with DPA', 'Enterprise security controls built in'],
      },
    },
  },
  {
    id: 'S2',
    name: 'Enterprise Infrastructure',
    desc: 'SSO/SAML, RBAC, audit logging, admin console',
    tools: {
      'claude-code': {
        score: 4, best: true,
        bullets: ['SSO/SAML via Anthropic Enterprise plan', 'RBAC with granular permission controls', 'Comprehensive audit logging and admin console'],
      },
      'codex-app': {
        score: 3,
        bullets: ['SSO/SAML via OpenAI Enterprise', 'Team management and usage dashboards', 'RBAC and admin controls improving'],
      },
      'copilot-pro': {
        score: 4, best: true,
        bullets: ['Full SSO/SAML via GitHub Enterprise + Azure AD', 'Granular RBAC and policy enforcement', 'Audit log API and compliance dashboard'],
      },
      'cursor': {
        score: 2,
        bullets: ['SAML/OIDC SSO with Okta, Entra ID, Google Workspace', 'SCIM 2.0 provisioning; admin dashboard with enforced privacy', 'Limited audit logging — no granular AI interaction logs yet'],
        chip: { type: 'barrier', text: 'Audit logging gap for regulated enterprises' },
      },
      'windsurf': {
        score: 3,
        bullets: ['SAML SSO + SCIM provisioning (Okta, Entra ID, Google)', 'Admin console with seat management and usage analytics', 'Full audit logs of AI interactions; RBAC on Enterprise tier'],
      },
      'ms-copilot': {
        score: 4, best: true,
        bullets: ['Full SSO/SAML via Azure AD / Entra ID', 'Granular RBAC, Conditional Access, Intune policies', 'Unified audit logging in Microsoft Purview'],
      },
      'antigravity': {
        score: 2,
        bullets: ['Team plan includes SAML SSO', 'Role-based access in Mission Control view', 'No granular audit logging yet'],
      },
      'claude-cowork': {
        score: 3,
        bullets: ['Teams-integrated access management', 'Usage analytics and admin controls', 'SSO via Anthropic enterprise plan'],
      },
    },
  },
  {
    id: 'S3',
    name: 'Deployment & Isolation',
    desc: 'VPC/on-prem options, tenant isolation, network security',
    tools: {
      'claude-code': {
        score: 4, best: true,
        bullets: ['CLI runs locally \u2014 code never leaves machine unless sent to API', 'API traffic encrypted end-to-end', 'Enterprise VPC and private endpoints available'],
      },
      'codex-app': {
        score: 3,
        bullets: ['Cloud sandboxed environment per task', 'Enterprise: dedicated compute instances', 'No on-prem or VPC option yet'],
      },
      'copilot-pro': {
        score: 4, best: true,
        bullets: ['Runs via Azure backbone with enterprise network controls', 'GitHub Enterprise Server supports on-prem deployment', 'IP allow-listing and private networking via Azure'],
      },
      'cursor': {
        score: 2,
        bullets: ['Cloud-only (AWS) — no VPC, on-prem, or air-gapped option', 'Privacy Mode: zero data retention, code not stored or trained on', 'Firecracker-based process isolation for cloud agents'],
      },
      'windsurf': {
        score: 3,
        bullets: ['Self-hosted / on-prem fully air-gapped deployment', 'Hybrid mode: code stays in customer tenant, inference in cloud', 'VPC deployment; IP never leaves customer infrastructure'],
      },
      'ms-copilot': {
        score: 4, best: true,
        bullets: ['Runs within Microsoft 365 tenant boundary', 'Azure Private Link and Conditional Access', 'Data never leaves tenant compliance boundary'],
      },
      'antigravity': {
        score: 2,
        bullets: ['Code processed on Google Cloud infrastructure', 'Enterprise tier: dedicated compute instances per account', 'Servers may shift regions under load (Iowa \u2194 Belgium)'],
        chip: { type: 'barrier', text: 'Data residency may vary under load \u2014 verify for regulated workloads' },
      },
      'claude-cowork': {
        score: 3,
        bullets: ['Cloud-hosted via Anthropic infrastructure', 'Enterprise DPA governs data boundaries', 'No on-prem option; API endpoints encrypted'],
      },
    },
  },
];

// ── Score dots component ──
function ScoreDots({ score }: { score: Score }) {
  const meta = SCORE_META[score];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-sm ${i <= score ? meta.bg : 'bg-zinc-200'}`}
          />
        ))}
      </div>
      <span className={`text-[11px] font-semibold ${meta.color}`}>{meta.label}</span>
    </div>
  );
}

// ── Chip component ──
function Chip({ type, text }: { type: 'barrier' | 'value'; text: string }) {
  const styles = type === 'barrier'
    ? 'bg-red-50 border-red-200 text-red-600'
    : 'bg-amber-50 border-amber-200 text-amber-700';
  const icon = type === 'barrier' ? '\u26A0' : '\u2191';
  return (
    <div className={`inline-flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-0.5 border ${styles} mt-1`}>
      <span>{icon}</span> {text}
    </div>
  );
}

// ── Main component ──
export default function ComplianceCostsTable() {
  const [open, setOpen] = useState(true);
  const [showRefs, setShowRefs] = useState(true);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(() => new Set(TOOLS.map((t) => t.id)));

  const toggleTool = useCallback((id: string) => {
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const visibleTools = TOOLS.filter((t) => enabledTools.has(t.id));

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-border hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Security & Compliance &mdash; Enterprise Readiness Assessment</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {open && (
        <div>
          {/* Tool filter chips */}
          <div className="px-5 py-2.5 border-b border-border/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted mr-1">Tools</span>
            {TOOLS.map((tool) => {
              const active = enabledTools.has(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
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
            {enabledTools.size < TOOLS.length && (
              <button
                onClick={() => setEnabledTools(new Set(TOOLS.map((t) => t.id)))}
                className="text-[10px] text-muted hover:text-accent ml-1"
              >
                <RotateCw className="w-3 h-3 inline" /> All
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: Math.max(400, visibleTools.length * 160 + 160) }}>
            {/* Column headers */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] text-muted font-medium px-3 py-2 w-36 align-bottom">
                  <span className="text-muted text-[9px] uppercase tracking-wider font-semibold">Dimension</span>
                </th>
                {visibleTools.map((tool) => {
                  const catStyle = CATEGORY_STYLES[tool.category];
                  return (
                    <th key={tool.id} className="px-1.5 py-2 align-bottom" style={{ minWidth: 130 }}>
                      <div className={`rounded-lg border p-2 text-center ${catStyle.border} ${catStyle.headerBg}`}>
                        <div className="text-[11px] font-bold text-foreground leading-tight">
                          {tool.name}
                        </div>
                        <div className="text-[9px] text-muted mt-0.5">{tool.sub}</div>
                        {tool.category !== 'general' && (
                          <span className={`inline-block text-[8px] font-bold uppercase tracking-wide rounded px-1.5 py-px mt-1 border ${catStyle.badge}`}>
                            {tool.category}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Dimension rows */}
            <tbody>
              {DIMENSIONS.map((dim, idx) => (
                <tr key={dim.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-surface'}>
                  {/* Dimension label */}
                  <td className="px-3 py-2 align-top border-r border-border/50">
                    <div className="text-[9px] font-bold text-accent uppercase tracking-wider">{dim.id}</div>
                    <div className="text-[11px] font-bold text-foreground leading-tight mt-0.5">{dim.name}</div>
                    <div className="text-[9px] text-muted leading-snug mt-0.5">{dim.desc}</div>
                  </td>

                  {/* Tool scores */}
                  {visibleTools.map((tool) => {
                    const entry = dim.tools[tool.id];
                    if (!entry) return <td key={tool.id} className="px-1.5 py-2" />;

                    const catStyle = CATEGORY_STYLES[tool.category];
                    const bestHighlight = entry.best
                      ? 'bg-emerald-50/60 border border-emerald-200/60 rounded-md'
                      : '';

                    return (
                      <td key={tool.id} className="px-1.5 py-1.5 align-top">
                        <div
                          className={`p-1.5 rounded ${bestHighlight}`}
                          data-pin-label={`${dim.name} — ${tool.name}`}
                          data-pin-value={`Score: ${entry.score}/4 (${SCORE_META[entry.score].label})`}
                        >
                          <ScoreDots score={entry.score} />
                          <ul className="mt-1 space-y-0.5">
                            {entry.bullets.map((b, i) => (
                              <li key={i} className="text-[10px] text-muted leading-snug pl-2.5 relative">
                                <span className="absolute left-0 text-accent font-bold">&middot;</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                          {entry.chip && <Chip type={entry.chip.type} text={entry.chip.text} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Reference links row */}
              <tr className="border-t border-border">
                <td className="px-3 py-2 align-top border-r border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-bold text-accent uppercase tracking-wider">REF</div>
                      <div className="text-[11px] font-bold text-foreground leading-tight mt-0.5">Documentation</div>
                      <div className="text-[9px] text-muted leading-snug mt-0.5">Vendor security, privacy, trust & pricing pages</div>
                    </div>
                    <button
                      onClick={() => setShowRefs(!showRefs)}
                      className="text-[9px] text-accent hover:underline font-medium ml-2 shrink-0"
                    >
                      {showRefs ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </td>
                {visibleTools.map((tool) => (
                  <td key={tool.id} className="px-1.5 py-2 align-top">
                    {showRefs && REF_LINKS[tool.id] && (
                      <div className="space-y-1">
                        {REF_LINKS[tool.id].map((link, i) => (
                          <div key={i}>
                            <div className="text-[8px] font-bold uppercase tracking-wider text-muted">{link.category}</div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-accent hover:underline inline-flex items-center gap-0.5"
                            >
                              {link.label}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="bg-zinc-800 px-5 py-2 flex items-center justify-between">
            <p className="text-[10px] text-zinc-400">
              <span className="text-emerald-300 font-semibold">Scores reflect</span> publicly available certifications, security documentation, and enterprise features as of 2025. Verify current status via the vendor links above.
            </p>
            <span className="text-[10px] text-zinc-600 font-mono">S1&ndash;S3</span>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
