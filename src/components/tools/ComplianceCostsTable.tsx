'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, ExternalLink } from 'lucide-react';

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
  { id: 'ide-group', name: 'VS Code / Cursor / Windsurf', sub: 'AI-assisted IDE', category: 'ide' },
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
  'ide-group': [
    { category: 'Pricing', label: 'Cursor Pricing', url: 'https://www.cursor.com/pricing' },
    { category: 'Pricing', label: 'Windsurf Pricing', url: 'https://windsurf.com/pricing' },
    { category: 'Security', label: 'Cursor Security', url: 'https://www.cursor.com/security' },
    { category: 'Privacy', label: 'Cursor Privacy Mode', url: 'https://docs.cursor.com/account/privacy' },
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
    id: 'C1',
    name: 'Security & Compliance',
    desc: 'SOC 2, ISO 27001, GDPR, certifications',
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
      'ide-group': {
        score: 3,
        bullets: ['Cursor: SOC 2 Type II certified', 'Windsurf: SOC 2 Type II + FedRAMP High certified', 'VS Code relies on upstream model provider compliance'],
      },
      'ms-copilot': {
        score: 4, best: true,
        bullets: ['SOC 2 Type II, ISO 27001, ISO 27018 via Microsoft', 'FedRAMP High, HIPAA, GxP compliant', 'Broadest certification portfolio across all tools'],
      },
      'antigravity': {
        score: 1,
        bullets: ['No published certifications yet (public preview)', 'No SOC 2, ISO 27001, or FedRAMP', 'Documented security vulnerabilities persist across sessions'],
        chip: { type: 'barrier', text: 'No compliance certifications — sandbox use only' },
      },
      'claude-cowork': {
        score: 4, best: true,
        bullets: ['Inherits Anthropic SOC 2 Type II', 'GDPR compliant with DPA', 'Enterprise security controls built in'],
      },
    },
  },
  {
    id: 'C2',
    name: 'Data Privacy',
    desc: 'Training opt-out, data retention, data residency',
    tools: {
      'claude-code': {
        score: 4, best: true,
        bullets: ['Zero-retention API by default \u2014 no training on inputs', 'Data stays in-session, not stored server-side', 'EU data residency available'],
      },
      'codex-app': {
        score: 3,
        bullets: ['Business data not used for training (API policy)', '30-day data retention on API tier', 'No EU data residency option yet'],
      },
      'copilot-pro': {
        score: 4, best: true,
        bullets: ['Enterprise: code excluded from training', 'Prompts and suggestions not retained', 'Data residency via Azure region selection'],
      },
      'ide-group': {
        score: 2,
        bullets: ['Privacy policies vary per IDE vendor', 'Some send context to third-party models', 'Opt-out mechanisms inconsistent'],
        chip: { type: 'barrier', text: 'Check each vendor\'s data handling policy individually' },
      },
      'ms-copilot': {
        score: 4, best: true,
        bullets: ['Enterprise data not used for model training', 'Data residency via Azure region \u2014 EU Data Boundary', 'Microsoft Graph respects existing permissions and DLP policies'],
      },
      'antigravity': {
        score: 2,
        bullets: ['Data retention policies not yet published', 'Unclear training opt-out guarantees', 'No EU data residency option'],
        chip: { type: 'barrier', text: 'Data handling policies still evolving' },
      },
      'claude-cowork': {
        score: 4, best: true,
        bullets: ['No training on business data', 'Conversation data not retained beyond session', 'Enterprise DPA covers all usage'],
      },
    },
  },
  {
    id: 'C3',
    name: 'Enterprise Readiness',
    desc: 'SSO/SAML, audit logging, RBAC, VPC/on-prem',
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
      'ide-group': {
        score: 1,
        bullets: ['No centralised enterprise admin console', 'No SSO/SAML or RBAC across IDE AI features', 'Individual developer licensing only'],
        chip: { type: 'barrier', text: 'No enterprise governance layer' },
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
    id: 'C4',
    name: 'Cost & Licensing',
    desc: 'Pricing transparency, seat vs usage, enterprise agreements',
    tools: {
      'claude-code': {
        score: 4, best: true,
        bullets: ['Per-seat plans (\u20AC20\u2013200/mo) or API pay-per-token pricing', 'Max plan removes rate limits \u2014 sustained agentic SDLC workloads', 'Enterprise agreements via Anthropic sales'],
        chip: { type: 'value', text: 'Best value for deep agentic coding at scale' },
      },
      'codex-app': {
        score: 2,
        bullets: ['Included in ChatGPT Plus ($20/mo) or Pro ($200/mo)', 'Message-based limits \u2014 heavy agent use hits caps quickly', 'Team plan $25\u201330/seat/mo; Enterprise via sales'],
        chip: { type: 'barrier', text: 'Message caps constrain sustained agentic workloads' },
      },
      'copilot-pro': {
        score: 3,
        bullets: ['Clear per-seat pricing ($19\u201339/user/month)', 'Enterprise plan with volume discounts', 'Token-credit model limits heavy agentic coding sessions'],
        chip: { type: 'barrier', text: 'Credit caps constrain sustained agentic SDLC workloads' },
      },
      'ide-group': {
        score: 3,
        bullets: ['Per-seat subscription models ($10\u201340/mo)', 'Pricing transparent and published', 'No enterprise volume agreements'],
      },
      'ms-copilot': {
        score: 3,
        bullets: ['M365 Copilot $30/user/month add-on to existing M365 licence', 'Predictable per-seat pricing, enterprise volume discounts', 'Requires M365 E3/E5 base licence \u2014 total cost is higher'],
      },
      'antigravity': {
        score: 3,
        bullets: ['Free public preview \u2014 individual use', 'Team plan ~$30\u201340/user/month via Workspace', 'Enterprise pricing expected mid-2026'],
      },
      'claude-cowork': {
        score: 3,
        bullets: ['Enterprise pricing via Anthropic sales', 'Seat-based for teams, usage-based for API', 'Volume discounts for large deployments'],
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

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-border hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Compliance & Costs &mdash; Enterprise Readiness Assessment</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 1100 }}>
            {/* Column headers */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] text-muted font-medium px-3 py-2 w-36 align-bottom">
                  <span className="text-muted text-[9px] uppercase tracking-wider font-semibold">Dimension</span>
                </th>
                {TOOLS.map((tool) => {
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
                  {TOOLS.map((tool) => {
                    const entry = dim.tools[tool.id];
                    if (!entry) return <td key={tool.id} className="px-1.5 py-2" />;

                    const catStyle = CATEGORY_STYLES[tool.category];
                    const bestHighlight = entry.best
                      ? 'bg-emerald-50/60 border border-emerald-200/60 rounded-md'
                      : '';

                    return (
                      <td key={tool.id} className="px-1.5 py-1.5 align-top">
                        <div className={`p-1.5 rounded ${bestHighlight}`}>
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
                {TOOLS.map((tool) => (
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
              <span className="text-emerald-300 font-semibold">Scores reflect</span> publicly available certifications, documentation, and pricing pages as of 2025. Verify current status via the vendor links above.
            </p>
            <span className="text-[10px] text-zinc-600 font-mono">C1&ndash;C4</span>
          </div>
        </div>
      )}
    </div>
  );
}
