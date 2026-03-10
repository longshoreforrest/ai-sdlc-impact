import XLSX from 'xlsx-js-style';
import PptxGenJS from 'pptxgenjs';
import {
  COMPLIANCE_TOOLS,
  COMPLIANCE_DIMENSIONS,
  COMPLIANCE_TOOL_COLORS,
  COMPLIANCE_DIM_COLORS,
} from './compliance-data';
import type { ToolProfile, Phase } from './types';

// ── Shared data ──
const SCORE_LABELS: Record<number, string> = { 4: 'Best fit', 3: 'Good', 2: 'Partial', 1: 'Weak' };
const SCORE_HEX: Record<number, string> = { 4: '059669', 3: '16a34a', 2: 'd97706', 1: 'dc2626' };
const PHASES: Phase[] = ['Discovery', 'Design', 'Spec', 'Dev', 'QA', 'Release & Ops'];

// Bullet data from ComplianceCostsTable — kept in sync
const COMPLIANCE_BULLETS: Record<string, Record<string, string[]>> = {
  S1: {
    'claude-code': ['SOC 2 Type II certified', 'GDPR compliant with DPA available', 'CSA STAR Level 1 listed'],
    'codex-app': ['SOC 2 Type II, ISO 27001, ISO 27017/27018/27701 certified', 'GDPR compliant — DPA available', 'Annual third-party penetration testing'],
    'copilot-pro': ['SOC 2 Type II via GitHub / Microsoft', 'ISO 27001 and ISO 27018 certified', 'FedRAMP authorised via Azure backbone'],
    'cursor': ['SOC 2 Type II certified', 'GDPR & CCPA compliant; AES-256 at rest, TLS 1.2+ in transit', 'Annual third-party penetration testing'],
    'windsurf': ['SOC 2 Type II + ISO 27001 certified', 'FedRAMP High authorized; HIPAA BAA available', 'GDPR compliant; annual third-party pen testing'],
    'ms-copilot': ['SOC 2 Type II, ISO 27001, ISO 27018 via Microsoft', 'FedRAMP High, HIPAA, GxP compliant', 'Broadest certification portfolio across all tools'],
    'antigravity': ['Inherits Google Cloud SOC 2 Type II, ISO 27001 infrastructure', 'Enterprise tier: AES-256 at rest, TLS 1.3 in transit', 'FedRAMP Moderate via GCP backbone; GDPR compliant'],
    'claude-cowork': ['Inherits Anthropic SOC 2 Type II', 'GDPR compliant with DPA', 'Enterprise security controls built in'],
  },
  S2: {
    'claude-code': ['SSO/SAML via Anthropic Enterprise plan', 'RBAC with granular permission controls', 'Comprehensive audit logging and admin console'],
    'codex-app': ['SSO/SAML via OpenAI Enterprise', 'Team management and usage dashboards', 'RBAC and admin controls improving'],
    'copilot-pro': ['Full SSO/SAML via GitHub Enterprise + Azure AD', 'Granular RBAC and policy enforcement', 'Audit log API and compliance dashboard'],
    'cursor': ['SAML/OIDC SSO with Okta, Entra ID, Google Workspace', 'SCIM 2.0 provisioning; admin dashboard with enforced privacy', 'Limited audit logging — no granular AI interaction logs yet'],
    'windsurf': ['SAML SSO + SCIM provisioning (Okta, Entra ID, Google)', 'Admin console with seat management and usage analytics', 'Full audit logs of AI interactions; RBAC on Enterprise tier'],
    'ms-copilot': ['Full SSO/SAML via Azure AD / Entra ID', 'Granular RBAC, Conditional Access, Intune policies', 'Unified audit logging in Microsoft Purview'],
    'antigravity': ['Team plan includes SAML SSO', 'Role-based access in Mission Control view', 'No granular audit logging yet'],
    'claude-cowork': ['Teams-integrated access management', 'Usage analytics and admin controls', 'SSO via Anthropic enterprise plan'],
  },
  S3: {
    'claude-code': ['CLI runs locally — code never leaves machine unless sent to API', 'API traffic encrypted end-to-end', 'Enterprise VPC and private endpoints available'],
    'codex-app': ['Cloud sandboxed environment per task', 'Enterprise: dedicated compute instances', 'No on-prem or VPC option yet'],
    'copilot-pro': ['Runs via Azure backbone with enterprise network controls', 'GitHub Enterprise Server supports on-prem deployment', 'IP allow-listing and private networking via Azure'],
    'cursor': ['Cloud-only (AWS) — no VPC, on-prem, or air-gapped option', 'Privacy Mode: zero data retention, code not stored or trained on', 'Firecracker-based process isolation for cloud agents'],
    'windsurf': ['Self-hosted / on-prem fully air-gapped deployment', 'Hybrid mode: code stays in customer tenant, inference in cloud', 'VPC deployment; IP never leaves customer infrastructure'],
    'ms-copilot': ['Runs within Microsoft 365 tenant boundary', 'Azure Private Link and Conditional Access', 'Data never leaves tenant compliance boundary'],
    'antigravity': ['Code processed on Google Cloud infrastructure', 'Enterprise tier: dedicated compute instances per account', 'Servers may shift regions under load'],
    'claude-cowork': ['Cloud-hosted via Anthropic infrastructure', 'Enterprise DPA governs data boundaries', 'No on-prem option; API endpoints encrypted'],
  },
};

// ════════════════════════════════════════════════════════════════
// EXCEL EXPORT — Styled
// ════════════════════════════════════════════════════════════════

// Style constants
const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Segoe UI' },
  fill: { fgColor: { rgb: '1C2B3A' } },
  alignment: { horizontal: 'center' as const, vertical: 'center' as const, wrapText: true },
  border: {
    top: { style: 'thin' as const, color: { rgb: 'DDD4C6' } },
    bottom: { style: 'thin' as const, color: { rgb: 'DDD4C6' } },
    left: { style: 'thin' as const, color: { rgb: 'DDD4C6' } },
    right: { style: 'thin' as const, color: { rgb: 'DDD4C6' } },
  },
};

const DIM_LABEL_STYLE = {
  font: { bold: true, sz: 11, name: 'Segoe UI', color: { rgb: '1C2B3A' } },
  fill: { fgColor: { rgb: 'F4F1EA' } },
  alignment: { vertical: 'center' as const, wrapText: true },
  border: {
    top: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
    bottom: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
    left: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
    right: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
  },
};

const THIN_BORDER = {
  top: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
  bottom: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
  left: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
  right: { style: 'thin' as const, color: { rgb: 'E4E4E7' } },
};

function scoreStyle(score: number) {
  const hex = SCORE_HEX[score] ?? '71717a';
  const bgMap: Record<number, string> = { 4: 'E6F4F1', 3: 'F0FDF4', 2: 'FDF3E3', 1: 'FEF2F2' };
  return {
    font: { bold: true, sz: 11, name: 'Segoe UI', color: { rgb: hex.toUpperCase() } },
    fill: { fgColor: { rgb: bgMap[score] ?? 'FFFFFF' } },
    alignment: { horizontal: 'center' as const, vertical: 'center' as const, wrapText: true },
    border: THIN_BORDER,
  };
}

function pctStyle(pct: number) {
  const hex = pct >= 80 ? '059669' : pct >= 50 ? 'D97706' : 'DC2626';
  const bg = pct >= 80 ? 'E6F4F1' : pct >= 50 ? 'FDF3E3' : 'FEF2F2';
  return {
    font: { bold: true, sz: 11, name: 'Segoe UI', color: { rgb: hex } },
    fill: { fgColor: { rgb: bg } },
    alignment: { horizontal: 'center' as const, vertical: 'center' as const },
    border: THIN_BORDER,
  };
}

const BODY_STYLE = {
  font: { sz: 10, name: 'Segoe UI', color: { rgb: '4E6070' } },
  alignment: { vertical: 'center' as const, wrapText: true },
  border: THIN_BORDER,
};

const BODY_BOLD_STYLE = {
  font: { bold: true, sz: 11, name: 'Segoe UI', color: { rgb: '1C2B3A' } },
  alignment: { vertical: 'center' as const },
  border: THIN_BORDER,
};

const VENDOR_STYLE = {
  font: { sz: 10, name: 'Segoe UI', color: { rgb: '71717A' } },
  alignment: { vertical: 'center' as const },
  border: THIN_BORDER,
};

const COST_STYLE = {
  font: { sz: 11, name: 'Segoe UI', color: { rgb: '1C2B3A' } },
  alignment: { horizontal: 'center' as const, vertical: 'center' as const },
  border: THIN_BORDER,
};

export function exportAiToolsExcel(profiles: ToolProfile[]) {
  const wb = XLSX.utils.book_new();
  const toolCount = COMPLIANCE_TOOLS.length;

  // ── Sheet 1: Compliance Scores (styled matrix) ──
  const ws1 = XLSX.utils.aoa_to_sheet([]);
  // Title row
  XLSX.utils.sheet_add_aoa(ws1, [['AI Tools — Compliance & Costs']], { origin: 'A1' });
  ws1['A1'].s = { font: { bold: true, sz: 16, name: 'Segoe UI', color: { rgb: '1C2B3A' } } };
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: toolCount } }];

  // Subtitle
  XLSX.utils.sheet_add_aoa(ws1, [['Enterprise readiness assessment across AI development and productivity tools']], { origin: 'A2' });
  ws1['A2'].s = { font: { sz: 10, name: 'Segoe UI', color: { rgb: '71717A' }, italic: true } };

  // Header row (row 3)
  const hdrRow = ['Dimension', ...COMPLIANCE_TOOLS.map((t) => t.name)];
  XLSX.utils.sheet_add_aoa(ws1, [hdrRow], { origin: 'A4' });
  for (let c = 0; c <= toolCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: 3, c });
    if (ws1[addr]) ws1[addr].s = HEADER_STYLE;
  }

  // Data rows
  COMPLIANCE_DIMENSIONS.forEach((dim, di) => {
    const r = 4 + di;
    // Dimension label
    const dimAddr = XLSX.utils.encode_cell({ r, c: 0 });
    XLSX.utils.sheet_add_aoa(ws1, [[`${dim.id}  ${dim.name}`]], { origin: dimAddr });
    ws1[dimAddr].s = DIM_LABEL_STYLE;

    // Score cells
    COMPLIANCE_TOOLS.forEach((tool, ti) => {
      const score = dim.scores[tool.id] ?? 0;
      const dots = '●'.repeat(score) + '○'.repeat(4 - score);
      const bullets = COMPLIANCE_BULLETS[dim.id]?.[tool.id] ?? [];
      const cellVal = `${dots}  ${SCORE_LABELS[score]}\n${bullets.map((b) => `· ${b}`).join('\n')}`;
      const addr = XLSX.utils.encode_cell({ r, c: ti + 1 });
      XLSX.utils.sheet_add_aoa(ws1, [[cellVal]], { origin: addr });
      ws1[addr].s = scoreStyle(score);
    });
  });

  // Column widths & row heights
  ws1['!cols'] = [{ wch: 28 }, ...COMPLIANCE_TOOLS.map(() => ({ wch: 30 }))];
  ws1['!rows'] = [{ hpt: 28 }, { hpt: 18 }, {}, { hpt: 24 }, ...COMPLIANCE_DIMENSIONS.map(() => ({ hpt: 72 }))];

  XLSX.utils.book_append_sheet(wb, ws1, 'Compliance Scores');

  // ── Sheet 2: Compliance Details (flat table, styled) ──
  const ws2 = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws2, [['Compliance Details — Full Breakdown']], { origin: 'A1' });
  ws2['A1'].s = { font: { bold: true, sz: 14, name: 'Segoe UI', color: { rgb: '1C2B3A' } } };
  ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

  const detHdr = ['Dimension', 'Tool', 'Score', 'Label', 'Details'];
  XLSX.utils.sheet_add_aoa(ws2, [detHdr], { origin: 'A3' });
  for (let c = 0; c < 5; c++) {
    const addr = XLSX.utils.encode_cell({ r: 2, c });
    if (ws2[addr]) ws2[addr].s = HEADER_STYLE;
  }

  let detRow = 3;
  for (const dim of COMPLIANCE_DIMENSIONS) {
    for (const tool of COMPLIANCE_TOOLS) {
      const score = dim.scores[tool.id] ?? 0;
      const bullets = COMPLIANCE_BULLETS[dim.id]?.[tool.id] ?? [];
      const row = [`${dim.id}  ${dim.name}`, tool.name, score, SCORE_LABELS[score] ?? '—', bullets.join('\n')];
      XLSX.utils.sheet_add_aoa(ws2, [row], { origin: XLSX.utils.encode_cell({ r: detRow, c: 0 }) });
      // Style each cell
      ws2[XLSX.utils.encode_cell({ r: detRow, c: 0 })].s = DIM_LABEL_STYLE;
      ws2[XLSX.utils.encode_cell({ r: detRow, c: 1 })].s = BODY_BOLD_STYLE;
      ws2[XLSX.utils.encode_cell({ r: detRow, c: 2 })].s = scoreStyle(score);
      ws2[XLSX.utils.encode_cell({ r: detRow, c: 3 })].s = scoreStyle(score);
      ws2[XLSX.utils.encode_cell({ r: detRow, c: 4 })].s = BODY_STYLE;
      detRow++;
    }
  }

  ws2['!cols'] = [{ wch: 28 }, { wch: 24 }, { wch: 8 }, { wch: 12 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Compliance Details');

  // ── Sheet 3: SDLC Phase Applicability (styled) ──
  const ws3 = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws3, [['SDLC Phase Applicability — Tool Profiles']], { origin: 'A1' });
  ws3['A1'].s = { font: { bold: true, sz: 14, name: 'Segoe UI', color: { rgb: '1C2B3A' } } };
  ws3['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 + PHASES.length } }];

  const sdlcHdr = ['Tool', 'Vendor', '€/seat/mo', ...PHASES];
  XLSX.utils.sheet_add_aoa(ws3, [sdlcHdr], { origin: 'A3' });
  for (let c = 0; c < sdlcHdr.length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 2, c });
    if (ws3[addr]) ws3[addr].s = HEADER_STYLE;
  }

  profiles.forEach((p, pi) => {
    const r = 3 + pi;
    // Tool name
    const nameAddr = XLSX.utils.encode_cell({ r, c: 0 });
    XLSX.utils.sheet_add_aoa(ws3, [[p.name]], { origin: nameAddr });
    ws3[nameAddr].s = BODY_BOLD_STYLE;
    // Vendor
    const vendorAddr = XLSX.utils.encode_cell({ r, c: 1 });
    XLSX.utils.sheet_add_aoa(ws3, [[p.vendor]], { origin: vendorAddr });
    ws3[vendorAddr].s = VENDOR_STYLE;
    // Cost
    const costAddr = XLSX.utils.encode_cell({ r, c: 2 });
    XLSX.utils.sheet_add_aoa(ws3, [[`€${p.costPerSeatMonthly}`]], { origin: costAddr });
    ws3[costAddr].s = COST_STYLE;
    // Phase percentages
    PHASES.forEach((phase, phi) => {
      const pct = Math.round(p.phaseApplicability[phase] * 100);
      const addr = XLSX.utils.encode_cell({ r, c: 3 + phi });
      XLSX.utils.sheet_add_aoa(ws3, [[`${pct}%`]], { origin: addr });
      ws3[addr].s = pctStyle(pct);
    });
  });

  ws3['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 12 }, ...PHASES.map(() => ({ wch: 14 }))];
  ws3['!rows'] = [{ hpt: 24 }, {}, { hpt: 22 }, ...profiles.map(() => ({ hpt: 22 }))];

  XLSX.utils.book_append_sheet(wb, ws3, 'SDLC Applicability');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ai-tools-comparison-${date}.xlsx`);
}

// ════════════════════════════════════════════════════════════════
// POWERPOINT EXPORT
// ════════════════════════════════════════════════════════════════
export function exportAiToolsPptx(profiles: ToolProfile[]) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'SDLC AI-Impact Analyzer';
  pptx.title = 'AI Tools — Comparison';

  // ── Slide 1: Title ──
  const slide1 = pptx.addSlide();
  slide1.background = { color: '1C2B3A' };
  slide1.addText('AI Tools — Comparison', {
    x: 0.8, y: 1.8, w: 11.5, h: 1,
    fontSize: 32, fontFace: 'Segoe UI', color: 'FFFFFF', bold: true,
  });
  slide1.addText('Radar comparison and compliance assessment across AI development and productivity tools', {
    x: 0.8, y: 2.9, w: 11.5, h: 0.6,
    fontSize: 14, fontFace: 'Segoe UI', color: '7A8A99',
  });
  slide1.addText(`Generated ${new Date().toLocaleDateString('en-GB')}`, {
    x: 0.8, y: 4.0, w: 11.5, h: 0.4,
    fontSize: 10, fontFace: 'Segoe UI', color: '4E6070',
  });
  // Accent line
  slide1.addShape('rect' as PptxGenJS.ShapeType, {
    x: 0.8, y: 1.55, w: 4, h: 0.06,
    fill: { color: '2B7F6E' },
  });

  // ── Slide 2: Compliance Scores Table ──
  const slide2 = pptx.addSlide();
  slide2.addText('Compliance & Costs — Enterprise Readiness', {
    x: 0.5, y: 0.2, w: 12, h: 0.5,
    fontSize: 20, fontFace: 'Segoe UI', bold: true, color: '1C2B3A',
  });

  const tableRows: PptxGenJS.TableRow[] = [];
  // Header row
  const headerCells: PptxGenJS.TableCell[] = [
    { text: 'Dimension', options: { bold: true, fontSize: 9, fill: { color: '1C2B3A' }, color: 'FFFFFF', fontFace: 'Segoe UI' } },
    ...COMPLIANCE_TOOLS.map((t) => ({
      text: t.name,
      options: { bold: true, fontSize: 8, fill: { color: '263647' }, color: 'FFFFFF', align: 'center' as const, fontFace: 'Segoe UI' },
    })),
  ];
  tableRows.push(headerCells);

  // Data rows
  for (const dim of COMPLIANCE_DIMENSIONS) {
    const cells: PptxGenJS.TableCell[] = [
      {
        text: `${dim.id} ${dim.name}`,
        options: { fontSize: 8, bold: true, fill: { color: 'F4F1EA' }, fontFace: 'Segoe UI' },
      },
      ...COMPLIANCE_TOOLS.map((tool) => {
        const score = dim.scores[tool.id] ?? 0;
        const bullets = COMPLIANCE_BULLETS[dim.id]?.[tool.id] ?? [];
        const hex = SCORE_HEX[score] ?? '71717a';
        return {
          text: [
            { text: `${'●'.repeat(score)}${'○'.repeat(4 - score)} ${SCORE_LABELS[score]}\n`, options: { fontSize: 9, bold: true, color: hex } },
            ...bullets.map((b) => ({ text: `· ${b}\n`, options: { fontSize: 7, color: '4E6070' } })),
          ],
          options: { valign: 'top' as const, fill: { color: score === 4 ? 'E6F4F1' : 'FFFFFF' }, fontFace: 'Segoe UI' },
        };
      }),
    ];
    tableRows.push(cells);
  }

  slide2.addTable(tableRows, {
    x: 0.3, y: 0.8, w: 12.6,
    border: { type: 'solid', pt: 0.5, color: 'DDD4C6' },
    colW: [1.8, ...COMPLIANCE_TOOLS.map(() => 1.54)],
    rowH: [0.35, ...COMPLIANCE_DIMENSIONS.map(() => 1.2)],
    autoPage: false,
    fontSize: 8,
  });

  slide2.addText('Scores reflect publicly available certifications, documentation, and pricing pages as of 2025.', {
    x: 0.5, y: 6.7, w: 12, h: 0.3,
    fontSize: 8, fontFace: 'Segoe UI', color: '7A8A99', italic: true,
  });

  // ── Slide 3: SDLC Phase Applicability Table ──
  const slide3 = pptx.addSlide();
  slide3.addText('SDLC Phase Applicability — Tool Profiles', {
    x: 0.5, y: 0.2, w: 12, h: 0.5,
    fontSize: 20, fontFace: 'Segoe UI', bold: true, color: '1C2B3A',
  });

  const sdlcTableRows: PptxGenJS.TableRow[] = [];
  // Header
  sdlcTableRows.push([
    { text: 'Tool', options: { bold: true, fontSize: 9, fill: { color: '1C2B3A' }, color: 'FFFFFF', fontFace: 'Segoe UI' } },
    { text: 'Vendor', options: { bold: true, fontSize: 9, fill: { color: '1C2B3A' }, color: 'FFFFFF', fontFace: 'Segoe UI' } },
    { text: '€/seat/mo', options: { bold: true, fontSize: 9, fill: { color: '1C2B3A' }, color: 'FFFFFF', align: 'center' as const, fontFace: 'Segoe UI' } },
    ...PHASES.map((p) => ({
      text: p,
      options: { bold: true, fontSize: 8, fill: { color: '263647' }, color: 'FFFFFF', align: 'center' as const, fontFace: 'Segoe UI' },
    })),
  ]);

  for (const p of profiles) {
    sdlcTableRows.push([
      { text: p.name, options: { fontSize: 9, bold: true, fontFace: 'Segoe UI' } },
      { text: p.vendor, options: { fontSize: 8, color: '4E6070', fontFace: 'Segoe UI' } },
      { text: `€${p.costPerSeatMonthly}`, options: { fontSize: 9, align: 'center' as const, fontFace: 'Segoe UI' } },
      ...PHASES.map((phase) => {
        const pct = Math.round(p.phaseApplicability[phase] * 100);
        const hex = pct >= 80 ? '059669' : pct >= 50 ? 'd97706' : 'dc2626';
        return {
          text: `${pct}%`,
          options: { fontSize: 9, bold: true, color: hex, align: 'center' as const, fill: { color: pct >= 80 ? 'E6F4F1' : pct >= 50 ? 'FDF3E3' : 'FEF2F2' }, fontFace: 'Segoe UI' },
        };
      }),
    ]);
  }

  slide3.addTable(sdlcTableRows, {
    x: 0.3, y: 0.8, w: 12.6,
    border: { type: 'solid', pt: 0.5, color: 'DDD4C6' },
    colW: [2.0, 1.4, 1.0, ...PHASES.map(() => 1.37)],
    autoPage: true,
    autoPageRepeatHeader: true,
    fontSize: 9,
  });

  const date = new Date().toISOString().slice(0, 10);
  pptx.writeFile({ fileName: `ai-tools-comparison-${date}.pptx` });
}

// ════════════════════════════════════════════════════════════════
// HTML EXPORT
// ════════════════════════════════════════════════════════════════
export function exportAiToolsHtml(profiles: ToolProfile[]) {
  const date = new Date().toLocaleDateString('en-GB');

  // Score dot HTML
  const dots = (score: number, hex: string) =>
    `<span style="color:${hex};font-weight:700;font-size:14px;">${'●'.repeat(score)}${'○'.repeat(4 - score)}</span>`;

  const scoreColor = (score: number) =>
    score === 4 ? '#059669' : score === 3 ? '#16a34a' : score === 2 ? '#d97706' : '#dc2626';

  const pctColor = (pct: number) =>
    pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626';

  const pctBg = (pct: number) =>
    pct >= 80 ? '#e6f4f1' : pct >= 50 ? '#fdf3e3' : '#fef2f2';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AI Tools \u2014 Comparison</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f8f9fa;color:#18181b;padding:32px}
.container{max-width:1400px;margin:0 auto}
h1{font-size:24px;font-weight:800;color:#1C2B3A;margin-bottom:4px}
.subtitle{font-size:13px;color:#71717a;margin-bottom:24px}
.section{background:#fff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.section-hdr{padding:16px 20px;border-bottom:1px solid #e4e4e7;display:flex;align-items:center;gap:8px}
.section-hdr h2{font-size:15px;font-weight:700;color:#1C2B3A}
.section-hdr .icon{font-size:18px}
table{width:100%;border-collapse:collapse;font-size:12px}
thead th{background:#1C2B3A;color:#fff;font-weight:600;padding:10px 8px;text-align:center;font-size:11px}
thead th:first-child{text-align:left}
tbody td{padding:8px;border-bottom:1px solid #f0f0f0;vertical-align:top}
tbody tr:nth-child(odd) td{background:#fafafa}
.dim-id{font-family:monospace;font-size:10px;color:#2563eb;font-weight:700}
.dim-name{font-weight:700;color:#1C2B3A;font-size:12px}
.dim-desc{font-size:10px;color:#71717a}
.score-cell{text-align:center}
.score-label{font-size:10px;font-weight:600;display:block;margin-top:2px}
.bullets{list-style:none;padding:0;margin:4px 0 0}
.bullets li{font-size:10px;color:#4E6070;padding:1px 0;padding-left:12px;position:relative}
.bullets li::before{content:'\u00b7';position:absolute;left:3px;font-weight:700;color:#2563eb}
.pct-cell{text-align:center;font-weight:700;font-size:13px;border-radius:4px;padding:6px 4px}
.footer{text-align:center;font-size:10px;color:#71717a;padding:16px;border-top:1px solid #e4e4e7}
@media print{body{padding:12px}table{font-size:10px}}
</style>
</head>
<body>
<div class="container">
<h1>\uD83D\uDD27 AI Tools \u2014 Comparison</h1>
<p class="subtitle">Generated ${date} \u2022 Radar comparison and compliance assessment across AI development and productivity tools</p>

<!-- Compliance & Costs -->
<div class="section">
<div class="section-hdr"><span class="icon">\uD83D\uDEE1\uFE0F</span><h2>Compliance & Costs \u2014 Enterprise Readiness Assessment</h2></div>
<div style="overflow-x:auto">
<table>
<thead><tr>
<th style="min-width:160px">Dimension</th>
${COMPLIANCE_TOOLS.map((t) => `<th style="min-width:140px">${t.name}</th>`).join('\n')}
</tr></thead>
<tbody>
${COMPLIANCE_DIMENSIONS.map((dim) => `<tr>
<td><div class="dim-id">${dim.id}</div><div class="dim-name">${dim.name}</div><div class="dim-desc">${dim.desc}</div></td>
${COMPLIANCE_TOOLS.map((tool) => {
  const score = dim.scores[tool.id] ?? 0;
  const hex = scoreColor(score);
  const bullets = COMPLIANCE_BULLETS[dim.id]?.[tool.id] ?? [];
  const bg = score === 4 ? '#e6f4f1' : '#fff';
  return `<td class="score-cell" style="background:${bg}">
  ${dots(score, hex)}
  <span class="score-label" style="color:${hex}">${SCORE_LABELS[score]}</span>
  <ul class="bullets">${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
</td>`;
}).join('\n')}
</tr>`).join('\n')}
</tbody>
</table>
</div>
</div>

<!-- SDLC Phase Applicability -->
<div class="section">
<div class="section-hdr"><span class="icon">\uD83D\uDCC8</span><h2>SDLC Phase Applicability \u2014 Tool Profiles</h2></div>
<div style="overflow-x:auto">
<table>
<thead><tr>
<th style="text-align:left">Tool</th>
<th style="text-align:left">Vendor</th>
<th>\u20ac/seat/mo</th>
${PHASES.map((p) => `<th>${p}</th>`).join('')}
</tr></thead>
<tbody>
${profiles.map((p) => `<tr>
<td style="font-weight:700">${p.name}</td>
<td style="color:#71717a">${p.vendor}</td>
<td style="text-align:center">\u20ac${p.costPerSeatMonthly}</td>
${PHASES.map((phase) => {
  const pct = Math.round(p.phaseApplicability[phase] * 100);
  return `<td class="pct-cell" style="color:${pctColor(pct)};background:${pctBg(pct)}">${pct}%</td>`;
}).join('')}
</tr>`).join('\n')}
</tbody>
</table>
</div>
</div>

<div class="footer">
<p>\uD83D\uDD27 AI Tools Comparison \u2022 Generated ${date} \u2022 Scores reflect publicly available certifications, documentation, and pricing pages as of 2025</p>
</div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-tools-comparison-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
