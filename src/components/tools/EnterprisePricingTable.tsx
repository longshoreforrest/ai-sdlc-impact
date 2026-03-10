'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, DollarSign, ExternalLink, ShieldCheck, Info, RotateCw } from 'lucide-react';

// ── Tool definitions ──
interface PricingTool {
  id: string;
  name: string;
  sub: string;
  color: string;
  headerBg: string;
  border: string;
}

const TOOLS: PricingTool[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    sub: 'Anthropic',
    color: 'text-indigo-700',
    headerBg: 'bg-indigo-50/50',
    border: 'border-indigo-200',
  },
  {
    id: 'copilot-enterprise',
    name: 'GitHub Copilot',
    sub: 'GitHub / Microsoft',
    color: 'text-purple-700',
    headerBg: 'bg-purple-50/50',
    border: 'border-purple-200',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    sub: 'Anysphere',
    color: 'text-green-700',
    headerBg: 'bg-green-50/50',
    border: 'border-green-200',
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    sub: 'Google',
    color: 'text-blue-700',
    headerBg: 'bg-blue-50/50',
    border: 'border-blue-200',
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    sub: 'OpenAI',
    color: 'text-emerald-700',
    headerBg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
  },
];

// ── Rating type (maps to 1–4 score like Compliance table) ──
type Rating = 'strong' | 'good' | 'partial' | 'unclear';

const RATING_SCORE: Record<Rating, 1 | 2 | 3 | 4> = {
  strong: 4,
  good: 3,
  partial: 2,
  unclear: 1,
};

const SCORE_META: Record<1 | 2 | 3 | 4, { label: string; color: string; bg: string }> = {
  4: { label: 'Best fit', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  3: { label: 'Good', color: 'text-green-600', bg: 'bg-green-500' },
  2: { label: 'Partial', color: 'text-amber-600', bg: 'bg-amber-500' },
  1: { label: 'Weak', color: 'text-red-500', bg: 'bg-red-400' },
};

// ── Row definitions ──
interface PricingRow {
  id: string;
  name: string;
  icon: string;
  desc: string;
  tools: Record<string, { rating: Rating; bullets: string[]; highlight?: string }>;
}

const ROWS: PricingRow[] = [
  {
    id: 'price',
    name: 'Published Pricing',
    icon: '$',
    desc: 'Public list prices for team/individual plans',
    tools: {
      'claude-code': {
        rating: 'strong',
        bullets: [
          'Team plan: \u20AC16.83 standard seat',
          'Team plan: \u20AC84.18 premium seat',
          'Enterprise: contact sales',
        ],
      },
      'copilot-enterprise': {
        rating: 'good',
        bullets: [
          'Enterprise: ~$39/user/month',
          'On top of GitHub Enterprise subscription',
          'Volume discounts via sales',
        ],
      },
      'cursor': {
        rating: 'good',
        bullets: [
          'Team plan: $40/user/month',
          'Enterprise: custom pricing (contact sales)',
          'Builds on Team tier with SCIM & priority support',
        ],
      },
      'antigravity': {
        rating: 'good',
        bullets: [
          'Free individual tier; Pro ~$25/mo; Enterprise ~$45/user/mo',
          'Enterprise tier includes private model deployment',
          'Higher limits via Google AI Ultra / Workspace subscriptions',
        ],
      },
      'codex': {
        rating: 'good',
        bullets: [
          'Included in ChatGPT Plus ($20/mo), Pro ($200/mo)',
          'Business plan: $30/user/month (billed annually)',
          'Enterprise & Edu: custom pricing via sales',
        ],
      },
    },
  },
  {
    id: 'enterprise-pricing',
    name: 'Enterprise Pricing Model',
    icon: '#',
    desc: 'How enterprise pricing is structured and published',
    tools: {
      'claude-code': {
        rating: 'partial',
        bullets: [
          'Claude for Work / Enterprise are custom-priced',
          'Public pages emphasise "contact sales" for enterprise',
          'Only Free/Pro/Max prices listed publicly',
        ],
      },
      'copilot-enterprise': {
        rating: 'good',
        bullets: [
          '~$39 USD/user/month publicly listed',
          'Requires GitHub Enterprise base subscription',
          'Enterprise pricing typically via sales for volume',
        ],
      },
      'cursor': {
        rating: 'partial',
        bullets: [
          'Team tier ~$40/user/month is public',
          'Enterprise tier requires contacting sales',
          'Adds SCIM, priority support, account management',
        ],
      },
      'antigravity': {
        rating: 'partial',
        bullets: [
          'Enterprise tier ~$45/user/month published',
          'Includes SSO, data residency, admin controls',
          'Integration with Google Cloud IAM; volume pricing via sales',
        ],
      },
      'codex': {
        rating: 'good',
        bullets: [
          'Business $30/user/month publicly listed',
          'Enterprise adds SCIM, EKM, audit logs, data residency',
          'Custom enterprise pricing with volume discounts via sales',
        ],
      },
    },
  },
  {
    id: 'rate-limits',
    name: 'Rate Limits (Enterprise)',
    icon: '%',
    desc: 'Usage caps and throttling for enterprise customers',
    tools: {
      'claude-code': {
        rating: 'good',
        bullets: [
          'Max plan: "20x more usage than Pro"',
          'Max: "at least 900 messages every 5 hours"',
          'Enterprise/API: contractual quotas, not fixed public caps',
        ],
      },
      'copilot-enterprise': {
        rating: 'good',
        bullets: [
          'Bundled "included usage" per seat',
          'Premium request billing for advanced features (e.g. code review)',
          'Enterprise admins control overage billing',
        ],
      },
      'cursor': {
        rating: 'partial',
        bullets: [
          'Admins can configure usage limits',
          'Specific token/request ceilings not published',
          'Per-user limits enforceable via admin settings',
        ],
      },
      'antigravity': {
        rating: 'partial',
        bullets: [
          'Quota based on "work done" (complexity), not request count',
          'Pro/Ultra: priority access, 5-hour refresh cycle',
          'Enterprise: higher limits via Workspace AI Ultra for Business',
        ],
      },
      'codex': {
        rating: 'good',
        bullets: [
          'Published per-model limits (e.g. 45\u2013225 local msgs / 5 hrs)',
          'Pro tier: 6\u201310x higher limits; credit-based extension',
          'Business/Enterprise: workspace credits for additional usage',
        ],
      },
    },
  },
  {
    id: 'training-opt-out',
    name: 'Opt-out / Training Use',
    icon: '!',
    desc: 'Whether customer data is used for model training',
    tools: {
      'claude-code': {
        rating: 'strong',
        bullets: [
          'Customer data NOT used for training unless explicit opt-in',
          'Claude for Work, Enterprise, API excluded from training by default',
          'Claude Gov, Education, Bedrock/Vertex also excluded',
        ],
        highlight: 'Explicit no-training default for all commercial tiers',
      },
      'copilot-enterprise': {
        rating: 'strong',
        bullets: [
          'Business/Enterprise code NOT used for training',
          'Only individual users can optionally opt in',
          'Enterprise admins can disable all code-snippet telemetry',
        ],
        highlight: 'Clear enterprise no-training commitment',
      },
      'cursor': {
        rating: 'strong',
        bullets: [
          'Privacy Mode guarantees no code stored in plaintext',
          'Code never used for training when Privacy Mode enabled',
          'Enterprise admins can mandate Privacy Mode org-wide',
        ],
        highlight: 'Privacy Mode enforces no-training org-wide',
      },
      'antigravity': {
        rating: 'good',
        bullets: [
          'Enterprise terms: data not used for model training',
          'Settings toggle to opt out of "product improvement" telemetry',
          'Free tier has ambiguous "improvement" language \u2014 enterprise is clearer',
        ],
      },
      'codex': {
        rating: 'strong',
        bullets: [
          'Business, Enterprise, Edu, API data NOT used for training',
          'Explicit commitment across ChatGPT Enterprise & API platform',
          'Zero Data Retention endpoints available for sensitive workloads',
        ],
        highlight: 'No training on business data by default',
      },
    },
  },
  {
    id: 'data-retention',
    name: 'Data Retention Controls',
    icon: '*',
    desc: 'How long data is stored and admin control over retention',
    tools: {
      'claude-code': {
        rating: 'strong',
        bullets: [
          'Configurable retention windows for enterprise',
          'Zero-Data-Retention mode in API/enterprise contexts',
          'Default commercial retention ~30 days, shortening available',
        ],
        highlight: 'Zero-retention mode available',
      },
      'copilot-enterprise': {
        rating: 'good',
        bullets: [
          'Telemetry (acceptance/rejection) retained up to 24 months',
          'Enterprises can disable code-snippet collection',
          'Actual code snippet retention can be turned off in settings',
        ],
      },
      'cursor': {
        rating: 'good',
        bullets: [
          'Privacy Mode: zero data retention of code by model providers',
          'Some account-level information still retained',
          'Enterprise customers can enforce privacy mode by default',
        ],
      },
      'antigravity': {
        rating: 'partial',
        bullets: [
          'Enterprise projects follow Google Cloud data-retention policies',
          'No Antigravity-specific retention controls published yet',
          'Code processed in real-time, not stored permanently per policy',
        ],
      },
      'codex': {
        rating: 'good',
        bullets: [
          'Zero Data Retention mode available on API/enterprise endpoints',
          'Inputs/outputs not logged when ZDR is enabled',
          'Enterprise: configurable retention via Compliance API & DPA',
        ],
      },
    },
  },
];

// ── Score dots component (matches Compliance & Costs table) ──
function ScoreDots({ rating }: { rating: Rating }) {
  const score = RATING_SCORE[rating];
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

// ── Comparison matrix helper ──
function getComparisonSummary(tools: PricingTool[]): { toolId: string; strongCount: number }[] {
  return tools.map((tool) => ({
    toolId: tool.id,
    strongCount: ROWS.reduce((count, row) => {
      const rating = row.tools[tool.id]?.rating;
      return count + (rating === 'strong' ? 2 : rating === 'good' ? 1 : 0);
    }, 0),
  })).sort((a, b) => b.strongCount - a.strongCount);
}

// ── Main component ──
export default function EnterprisePricingTable() {
  const [open, setOpen] = useState(true);
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
  const summary = getComparisonSummary(visibleTools);
  const maxScore = Math.max(...summary.map((s) => s.strongCount));

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-border hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold">Pricing &amp; Data Privacy &mdash; Commercial Terms &amp; Data Handling</h3>
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
          <table className="w-full text-xs" style={{ minWidth: Math.max(400, visibleTools.length * 170 + 170) }}>
            {/* Column headers */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] text-muted font-medium px-3 py-2 w-40 align-bottom">
                  <span className="text-muted text-[9px] uppercase tracking-wider font-semibold">Dimension</span>
                </th>
                {visibleTools.map((tool) => (
                  <th key={tool.id} className="px-1.5 py-2 align-bottom" style={{ minWidth: 145 }}>
                    <div className={`rounded-lg border p-2 text-center ${tool.border} ${tool.headerBg}`}>
                      <div className="text-[11px] font-bold text-foreground leading-tight">{tool.name}</div>
                      <div className="text-[9px] text-muted mt-0.5">{tool.sub}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Data rows */}
              {ROWS.map((row, idx) => (
                <tr key={row.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-surface'}>
                  {/* Row label */}
                  <td className="px-3 py-2 align-top border-r border-border/50">
                    <div className="text-[11px] font-bold text-foreground leading-tight">{row.name}</div>
                    <div className="text-[9px] text-muted leading-snug mt-0.5">{row.desc}</div>
                  </td>

                  {/* Tool cells */}
                  {visibleTools.map((tool) => {
                    const entry = row.tools[tool.id];
                    if (!entry) return <td key={tool.id} className="px-1.5 py-2" />;

                    return (
                      <td key={tool.id} className="px-1.5 py-1.5 align-top">
                        <div
                          className="p-1.5 rounded"
                          data-pin-label={`${row.name} — ${tool.name}`}
                          data-pin-value={`${SCORE_META[RATING_SCORE[entry.rating]].label} (${RATING_SCORE[entry.rating]}/4)`}
                        >
                          <ScoreDots rating={entry.rating} />
                          <ul className="mt-1 space-y-0.5">
                            {entry.bullets.map((b, i) => (
                              <li key={i} className="text-[10px] text-muted leading-snug pl-2.5 relative">
                                <span className="absolute left-0 text-accent font-bold">&middot;</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                          {entry.highlight && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-0.5 border bg-emerald-50 border-emerald-200 text-emerald-700 mt-1">
                              <ShieldCheck className="w-3 h-3" /> {entry.highlight}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Summary comparison row */}
              <tr className="border-t-2 border-border bg-zinc-50">
                <td className="px-3 py-3 align-top border-r border-border/50">
                  <div className="text-[9px] font-bold text-accent uppercase tracking-wider">SUMMARY</div>
                  <div className="text-[11px] font-bold text-foreground leading-tight mt-0.5">Enterprise Readiness Score</div>
                  <div className="text-[9px] text-muted leading-snug mt-0.5">Strong=2pts, Good=1pt per dimension</div>
                </td>
                {visibleTools.map((tool) => {
                  const toolSummary = summary.find((s) => s.toolId === tool.id);
                  const score = toolSummary?.strongCount ?? 0;
                  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
                  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-green-500' : pct >= 30 ? 'bg-amber-500' : 'bg-zinc-400';

                  return (
                    <td key={tool.id} className="px-1.5 py-3 align-top">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">{score}/{maxScore}</div>
                        <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-1 mx-auto" style={{ maxWidth: 80 }}>
                          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* Insight callout */}
          <div className="px-5 py-3 border-t border-border bg-blue-50/50">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-900 leading-relaxed">
                <span className="font-semibold">For security-sensitive enterprises:</span> Claude for Work/Enterprise, GitHub Copilot Business/Enterprise, Cursor Enterprise, and OpenAI Codex Enterprise all explicitly commit to &ldquo;no training on customer data&rdquo; and provide admin-level controls for retention or privacy modes. Google Antigravity&rsquo;s enterprise tier follows GCP data-protection terms but lacks Antigravity-specific retention controls. OpenAI Codex now offers Zero Data Retention endpoints for sensitive workloads.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-zinc-800 px-5 py-2 flex items-center justify-between">
            <p className="text-[10px] text-zinc-400">
              <span className="text-emerald-300 font-semibold">Data reflects</span> publicly available documentation, pricing pages, and enterprise policies as of early 2026. Verify current status directly with vendors.
            </p>
            <span className="text-[10px] text-zinc-600 font-mono">Pricing &amp; Privacy</span>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
