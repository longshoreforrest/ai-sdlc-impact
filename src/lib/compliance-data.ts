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
  { id: 'cursor', name: 'Cursor', sub: 'AI-native code editor', category: 'ide' },
  { id: 'windsurf', name: 'Windsurf', sub: 'AI IDE (ex-Codeium)', category: 'ide' },
  { id: 'ms-copilot', name: 'MS Copilot', sub: 'M365 AI', category: 'enterprise' },
  { id: 'antigravity', name: 'Google Antigravity', sub: 'Agent-first AI IDE', category: 'agentic' },
  { id: 'claude-cowork', name: 'Claude Cowork', sub: 'Desktop app', category: 'general' },
];

export const COMPLIANCE_DIMENSIONS: ComplianceDimension[] = [
  {
    id: 'S1', name: 'Security Certifications', desc: 'SOC 2, ISO 27001, GDPR, FedRAMP',
    scores: {
      'claude-code': 4, 'codex-app': 4, 'copilot-pro': 4, 'cursor': 3,
      'windsurf': 4, 'ms-copilot': 4, 'antigravity': 3, 'claude-cowork': 4,
    },
  },
  {
    id: 'S2', name: 'Enterprise Infrastructure', desc: 'SSO/SAML, RBAC, audit logging, admin console',
    scores: {
      'claude-code': 4, 'codex-app': 3, 'copilot-pro': 4, 'cursor': 2,
      'windsurf': 3, 'ms-copilot': 4, 'antigravity': 2, 'claude-cowork': 3,
    },
  },
  {
    id: 'S3', name: 'Deployment & Isolation', desc: 'VPC/on-prem, tenant isolation, network security',
    scores: {
      'claude-code': 4, 'codex-app': 3, 'copilot-pro': 4, 'cursor': 2,
      'windsurf': 3, 'ms-copilot': 4, 'antigravity': 2, 'claude-cowork': 3,
    },
  },
];

// Colors for compliance tools in charts
export const COMPLIANCE_TOOL_COLORS: Record<string, string> = {
  'claude-code': '#3a6fa0',
  'codex-app': '#059669',
  'copilot-pro': '#7c3aed',
  'cursor': '#16a34a',
  'windsurf': '#0ea5e9',
  'ms-copilot': '#0078d4',
  'antigravity': '#4285f4',
  'claude-cowork': '#d97706',
};

// Colors for compliance dimensions in charts
export const COMPLIANCE_DIM_COLORS: Record<string, string> = {
  'S1': '#3a6fa0',
  'S2': '#9b59b6',
  'S3': '#c47d20',
};

// ── Pricing & Privacy data for radar chart ──

export interface PricingTool {
  id: string;
  name: string;
}

export const PRICING_TOOLS: PricingTool[] = [
  { id: 'claude-code', name: 'Claude Code' },
  { id: 'copilot-enterprise', name: 'GitHub Copilot' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'antigravity', name: 'Google Antigravity' },
  { id: 'codex', name: 'OpenAI Codex' },
];

export const PRICING_DIMENSIONS: ComplianceDimension[] = [
  {
    id: 'P1', name: 'Published Pricing', desc: 'Public list prices for team/individual plans',
    scores: {
      'claude-code': 4, 'copilot-enterprise': 3, 'cursor': 3, 'antigravity': 3, 'codex': 3,
    },
  },
  {
    id: 'P2', name: 'Enterprise Pricing Model', desc: 'How enterprise pricing is structured',
    scores: {
      'claude-code': 2, 'copilot-enterprise': 3, 'cursor': 2, 'antigravity': 2, 'codex': 3,
    },
  },
  {
    id: 'P3', name: 'Rate Limits', desc: 'Usage caps and throttling for enterprise',
    scores: {
      'claude-code': 3, 'copilot-enterprise': 3, 'cursor': 2, 'antigravity': 2, 'codex': 3,
    },
  },
  {
    id: 'P4', name: 'Training Opt-out', desc: 'Whether customer data is used for model training',
    scores: {
      'claude-code': 4, 'copilot-enterprise': 4, 'cursor': 4, 'antigravity': 3, 'codex': 4,
    },
  },
  {
    id: 'P5', name: 'Data Retention Controls', desc: 'Admin control over data retention',
    scores: {
      'claude-code': 4, 'copilot-enterprise': 3, 'cursor': 3, 'antigravity': 2, 'codex': 3,
    },
  },
];

export const PRICING_TOOL_COLORS: Record<string, string> = {
  'claude-code': '#3a6fa0',
  'copilot-enterprise': '#7c3aed',
  'cursor': '#16a34a',
  'antigravity': '#4285f4',
  'codex': '#059669',
};

export const PRICING_DIM_COLORS: Record<string, string> = {
  'P1': '#2563eb',
  'P2': '#7c3aed',
  'P3': '#dc2626',
  'P4': '#059669',
  'P5': '#d97706',
};
