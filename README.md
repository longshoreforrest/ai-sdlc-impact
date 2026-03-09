# SDLC AI-Impact Analyzer

An interactive, data-driven application that quantifies how AI tools are transforming each phase of the software development lifecycle. It aggregates 210+ real-world data points from academic research, industry surveys, vendor reports, and practitioner anecdotes spanning 2023–2026.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 with `@theme` design tokens
- **Charts**: Recharts (bar, radar, box-and-whisker, sparklines)
- **Export**: `xlsx` (Excel), `pptxgenjs` (PowerPoint), HTML Blob
- **i18n**: Custom translation system (English / Finnish)
- **State**: React Context (scenarios), localStorage (tool profiles)
- **Icons**: Lucide React

## Application Pages

### Welcome (`/welcome`)
Entry point with SDLC phase flowchart, introduction, and quick links to all sections.

### Source and Fact Analytics (`/analytics`)
Statistical analysis of the underlying evidence base: data type distributions, credibility breakdowns, yearly trends, cross-tabulation heatmaps, and the Scenario Configurator for customizing pessimistic/realistic/optimistic projections.

### SDLC Analytics Dashboard (`/dashboard`)
At-a-glance view of AI productivity impacts across all six SDLC phases (Discovery, Design, Spec, Dev, QA, Release & Ops). Includes temporal toggle (Early AI vs. Agentic AI era), filter bar, phase ribbon, distribution chart, sparkline grid, evidence wall, and scenario selector.

### AI Tools Comparison (`/ai-tools`)
Enterprise comparison of AI development and productivity tools, organized into three tabs:

- **Tool Profiles** — Card grid showing all AI tools with vendor, pricing, description, and SDLC phase applicability bars. Click to edit via modal dialog. Add custom tools or reset to defaults.
- **Radar Chart** — Interactive radar chart with two data modes (Compliance C1–C4 and SDLC Phase Applicability) and two orientations (dimensions-as-axes / tools-as-axes). Filter chips to toggle tools, dimensions, and phases.
- **Compliance & Costs** — Detailed enterprise readiness assessment table scoring tools on Security & Compliance (C1), Data Privacy (C2), Enterprise Readiness (C3), and Cost & Licensing (C4). Includes reference links to vendor documentation.

Export to Excel (3-sheet workbook), PowerPoint (3-slide deck), or standalone HTML.

**Current tool roster**: Claude Code, GitHub Copilot, Cursor, Google Antigravity, ChatGPT Pro, OpenAI Codex, Windsurf, MS Copilot, Claude Cowork, SAP Joule, Generic AI Tool.

### Tool Business Case Calculator (`/tools`)
Estimates ROI for specific AI tools by combining SDLC phase evidence with actual licensing costs and phase applicability weights. Select up to 3 tools for side-by-side comparison with per-tool business cases: annual cost, savings, net savings, hours saved, payback period, and ROI multiple.

### ROI Calculator (`/calculator`)
General-purpose ROI calculator for AI adoption. Configure team size, salary, hours, IT budget, bottleneck phases, and transformation costs. Produces three-scenario projections (pessimistic/realistic/optimistic) based on statistical quartiles.

### Business Case Report (`/report`)
Printable, executive-ready document generated from the ROI Calculator. Sections: Executive Summary, Data Foundation, Scenario Definitions, ROI Configuration, Source Appendix, Methodology & Limitations, Glossary.

### Sources and Facts (`/sources`)
Comprehensive evidence library with full-text search, multi-filter (year, data type, phase, category, scope, benefit), expandable source cards, and direct links to original publications.

### From Users (`/from-users`)
Review interface for user-submitted feature requests and data source suggestions with status management (Pending, Accepted, Rejected, Postponed, Implemented).

### Help & Documentation (`/help`)
In-app documentation covering all pages, features, filters, data methodology, and FAQ. Fully translated in English and Finnish.

## Key Architecture Decisions

- **Tool profiles** are defined in `src/lib/tool-profiles.ts` and persisted via localStorage. Changes on the AI Tools page propagate to the Tool Calculator.
- **Compliance data** is centralized in `src/lib/compliance-data.ts` and shared between the radar chart, compliance table, and export functions.
- **Scenario configuration** uses React Context (`src/contexts/ScenarioContext.tsx`) and affects the ROI Calculator, Report, and Dashboard.
- **Translations** are typed with `TranslationKey` for compile-time safety (`src/lib/i18n/translations.ts`).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── ai-tools/           # AI Tools Comparison (tabs: profiles, radar, compliance)
│   ├── analytics/           # Source and Fact Analytics
│   ├── calculator/          # ROI Calculator
│   ├── dashboard/           # SDLC Analytics Dashboard
│   ├── from-users/          # User submissions review
│   ├── help/                # Help & Documentation
│   ├── report/              # Business Case Report
│   ├── sources/             # Sources and Facts
│   ├── tools/               # Tool Business Case Calculator
│   └── welcome/             # Welcome page
├── components/
│   ├── analytics/           # ScenarioConfigurator, charts
│   ├── tools/               # ToolProfileConfigurator, ToolRadarChart,
│   │                          ComplianceCostsTable, ToolCard, ToolResults,
│   │                          ToolComparison
│   └── Sidebar.tsx          # Navigation sidebar
├── contexts/                # ScenarioContext, LanguageProvider
└── lib/
    ├── compliance-data.ts   # Shared compliance scores (C1–C4)
    ├── export-ai-tools.ts   # Excel, PowerPoint, HTML export
    ├── i18n/                # Translation system (EN/FI)
    ├── mock-data.ts         # Evidence database (210+ facts)
    ├── tool-calculations.ts # Business case calculation engine
    ├── tool-profiles.ts     # AI tool definitions
    └── types.ts             # TypeScript type definitions
```

## Build & Deploy

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

The app can be deployed to any Node.js hosting or exported as static HTML via `next export`.
