// ── Compliance & Costs scores shared between table and radar chart ──

export type ComplianceScore = 1 | 2 | 3 | 4;

export interface ComplianceTool {
  id: string;
  name: string;
  sub: string;
  category: 'agentic' | 'ide' | 'enterprise' | 'general';
}

export interface ComplianceDimension {
  id: string;
  name: string;
  desc: string;
  scores: Record<string, ComplianceScore>; // toolId -> score
}

export const COMPLIANCE_TOOLS: ComplianceTool[] = [
  { id: 'claude-code', name: 'Claude Code', sub: 'Agentic CLI + IDE extension', category: 'agentic' },
  { id: 'codex-app', name: 'Codex App', sub: 'Desktop multi-agent', category: 'agentic' },
  { id: 'copilot-pro', name: 'GitHub Copilot Pro', sub: 'IDE + coding agent', category: 'agentic' },
  { id: 'ide-group', name: 'VS Code / Cursor / Windsurf', sub: 'AI-assisted IDE', category: 'ide' },
  { id: 'ms-copilot', name: 'MS Copilot', sub: 'M365 AI', category: 'enterprise' },
  { id: 'antigravity', name: 'Google Antigravity', sub: 'Agent-first AI IDE', category: 'agentic' },
  { id: 'claude-cowork', name: 'Claude Cowork', sub: 'Desktop app', category: 'general' },
];

export const COMPLIANCE_DIMENSIONS: ComplianceDimension[] = [
  {
    id: 'C1', name: 'Security & Compliance', desc: 'SOC 2, ISO 27001, GDPR, certifications',
    scores: {
      'claude-code': 4, 'codex-app': 4, 'copilot-pro': 4, 'ide-group': 3,
      'ms-copilot': 4, 'antigravity': 1, 'claude-cowork': 4,
    },
  },
  {
    id: 'C2', name: 'Data Privacy', desc: 'Training opt-out, data retention, data residency',
    scores: {
      'claude-code': 4, 'codex-app': 3, 'copilot-pro': 4, 'ide-group': 2,
      'ms-copilot': 4, 'antigravity': 2, 'claude-cowork': 4,
    },
  },
  {
    id: 'C3', name: 'Enterprise Readiness', desc: 'SSO/SAML, audit logging, RBAC, VPC/on-prem',
    scores: {
      'claude-code': 4, 'codex-app': 3, 'copilot-pro': 4, 'ide-group': 1,
      'ms-copilot': 4, 'antigravity': 2, 'claude-cowork': 3,
    },
  },
  {
    id: 'C4', name: 'Cost & Licensing', desc: 'Pricing transparency, seat vs usage, enterprise agreements',
    scores: {
      'claude-code': 4, 'codex-app': 2, 'copilot-pro': 3, 'ide-group': 3,
      'ms-copilot': 3, 'antigravity': 3, 'claude-cowork': 3,
    },
  },
];

// Colors for compliance tools in charts
export const COMPLIANCE_TOOL_COLORS: Record<string, string> = {
  'claude-code': '#3a6fa0',
  'codex-app': '#059669',
  'copilot-pro': '#7c3aed',
  'ide-group': '#16a34a',
  'ms-copilot': '#0078d4',
  'antigravity': '#4285f4',
  'claude-cowork': '#d97706',
};

// Colors for compliance dimensions in charts
export const COMPLIANCE_DIM_COLORS: Record<string, string> = {
  'C1': '#3a6fa0',
  'C2': '#6a8a5a',
  'C3': '#9b59b6',
  'C4': '#c47d20',
};
