# SDLC AI-Impact Analyzer — User Documentation

## Table of Contents

1. [Business Description](#1-business-description)
   - [1.1 Business Intent](#11-business-intent)
   - [1.2 Stakeholders](#12-stakeholders)
   - [1.3 User Stories](#13-user-stories)
2. [Overview](#2-overview)
3. [Getting Started — Welcome Page](#3-getting-started--welcome-page)
4. [SDLC Analytics Dashboard](#4-sdlc-analytics-dashboard)
5. [Data Source Analytics](#5-data-source-analytics)
6. [ROI Calculator](#6-roi-calculator)
7. [Business Case Report](#7-business-case-report)
8. [Data Sources](#8-data-sources)
9. [Scenario Configuration](#9-scenario-configuration)
10. [Suggesting Sources & Features](#10-suggesting-sources--features)
11. [From Users (Moderation)](#11-from-users-moderation)
12. [Filtering & Search](#12-filtering--search)
13. [Data & Methodology](#13-data--methodology)
14. [Language Support](#14-language-support)
15. [Glossary](#15-glossary)
16. [FAQ](#16-faq)

---

## 1. Business Description

### 1.1 Business Intent

#### Why this application exists

Organisations across industries are evaluating whether to invest in AI-powered software development tools — tools such as code assistants, automated testing platforms, and agentic coding agents. This is a high-stakes decision involving significant investment in tooling, consulting, training, and organisational change. Yet most organisations lack the evidence base to make this decision with confidence.

The typical challenges decision-makers face:

- **"How much will AI tools actually improve our productivity?"** — Vendor claims range from 20% to 80% improvement, but these are marketing figures, not independent research. Decision-makers need a neutral, research-backed answer.
- **"What is the financial return on this investment?"** — Board members and CFOs require a credible business case with concrete numbers — hours saved, cost savings, ROI ratios, and payback periods — not vague promises.
- **"Which parts of our development process benefit most?"** — AI impact varies dramatically across different types of work. Strategy and design may see modest gains while coding and testing may see transformative ones. Organisations need phase-by-phase visibility.
- **"How do we account for uncertainty?"** — Early AI tools (2023–2024) showed moderate improvements. Agentic AI tools (2025–2026) show significantly larger gains. Decision-makers need projections that acknowledge this evolution rather than presenting a single number.
- **"Can we trust the underlying data?"** — Executives need to verify claims independently. Every number must trace back to its original source — a peer-reviewed paper, an industry survey, or a controlled experiment.

#### What problems the application solves

The SDLC AI-Impact Analyzer solves these problems by providing:

1. **A neutral evidence base** — 210+ data points from 190+ independent sources (academic research, industry surveys, vendor reports, and practitioner accounts) spanning 2023–2026. This is not a vendor tool promoting a particular product; it aggregates publicly available research from McKinsey, Gartner, Harvard Business School, Google Research, Microsoft Research, and many others.

2. **Three projection models for uncertainty** — Rather than presenting a single estimate, the application provides three projection models: Conservative (early-era data, lower quartile), Baseline (full dataset, median), and Forward (agentic-era data, upper quartile). This allows organisations to plan for a range of outcomes aligned with their risk appetite.

3. **A ready-to-present business case** — The application generates a professional, printable Business Case Report designed to pass executive review rounds. It includes financial projections, a full data audit trail, methodology disclosures, and a glossary — everything a CEO, CFO, or board member needs to make an informed decision.

4. **Phase-level granularity** — AI impact is broken down across six SDLC phases (Strategy, Design, Spec, Dev, QA, DevOps), so organisations can see exactly where the largest gains are and allocate investment accordingly.

5. **Full transparency and traceability** — Every claim in the application can be traced back to its original source. The Source Appendix enables independent verification, which is essential for building trust with sceptical stakeholders.

6. **Tailored financial modelling** — The ROI Calculator accepts organisation-specific parameters (team size, salary levels, budget allocation, inhouse vs outsourced ratios, transformation costs) to produce projections that reflect your actual context, not industry averages.

#### The core value proposition

The application transforms the question "Should we invest in AI development tools?" from a gut-feel debate into a data-driven, evidence-backed business decision — with full transparency, credible sources, and projections tailored to the specific organisation.

---

### 1.2 Stakeholders

The SDLC AI-Impact Analyzer serves a broad range of stakeholders, each with distinct needs and perspectives. The following stakeholder profiles describe who they are, what they need from the application, and how the application serves them.

#### Primary Decision-Makers

**CEO / Managing Director**

The chief executive needs to understand whether AI tool adoption is a strategic priority and how it affects the organisation's competitive position. They need headline financial numbers, competitive context, and an honest assessment of risks — not technical details.

- **Needs:** Clear financial summary, strategic framing, risk disclosure
- **Served by:** Executive Summary (headline ROI figures), Strategic Context callout (competitive framing), Methodology & Limitations section (balanced risk assessment)

**CFO / Finance Director**

The chief financial officer needs to evaluate the investment from a purely financial perspective. They need to understand payback periods, return multiples, what "cost savings" actually mean in budget terms, and the total investment required.

- **Needs:** Payback period, ROI ratio, detailed cost breakdown, clarity on efficiency gains vs budget reductions
- **Served by:** Payback Period metric, ROI Ratio cards, ROI Configuration section (full cost audit trail), Methodology section (explicit statement that cost savings are efficiency gains, not guaranteed headcount reductions)

**CTO / VP Engineering**

The technology leader needs to understand which phases of the development lifecycle benefit most from AI tools, validate assumptions about their team's workflow, and assess the quality of the underlying research.

- **Needs:** Phase-by-phase impact analysis, inhouse vs outsourced validation, data quality assessment
- **Served by:** Per-phase savings breakdown, Inhouse Ratio configuration, Scenario Definitions (statistical quality per phase), Distribution charts

**Board of Directors**

Board members need a concise, credible document they can review without access to the application. They need a self-contained business case that covers the opportunity, the investment, the projected returns, and the risks.

- **Needs:** Self-contained business case document, independent verifiability
- **Served by:** Printable Business Case Report (designed for board review), Source Appendix (independent verification)

#### Strategic Advisors

**Strategy Consultant / Management Consultant**

External consultants need a robust evidence base to support client recommendations. They need full data traceability, reproducible methodology, and the ability to adjust parameters to match each client's context.

- **Needs:** Evidence audit trail, reproducible analysis, configurable parameters
- **Served by:** Data Foundation section, Source Appendix, ROI Configuration audit trail, Scenario Configurator (customisable data filters)

**Investor / Venture Capital / Private Equity**

Investors evaluating technology companies need to understand how AI tooling affects development efficiency at scale. They need to see how returns scale with team size and what the long-term trajectory looks like.

- **Needs:** Scalability analysis, 10-year projection, risk-adjusted range
- **Served by:** Scalability Note (linear scaling explanation), 10-Year Cumulative ROI Projection chart, Three-scenario range (risk-adjusted outcomes)

#### Engineering & Delivery

**Software Engineer / Individual Contributor**

Developers want to understand how AI tools will affect their daily work. They want to see which types of work benefit most, what the actual research says (not just management claims), and whether the gains are real.

- **Needs:** Phase-level productivity data, access to original research, honest assessment of limitations
- **Served by:** Phase breakdown tables, Scenario Definitions (links to actual research studies), Evidence Wall (individual data points), Glossary (unfamiliar terms explained)

**Product Manager / Product Owner**

Product managers need to understand how AI tools translate into delivery capacity. They need to know how many developer-hours are freed up and how that capacity can be redirected toward feature delivery.

- **Needs:** Hours-to-FTE translation, delivery capacity implications, phase-level time savings
- **Served by:** Key Implications callout (FTE equivalents), Per-phase breakdown (where time is saved in the pipeline)

**Engineering Manager / Team Lead**

Engineering managers need to plan team capacity and justify tool investments to their leadership. They need concrete numbers for their specific team size and the ability to model different adoption scenarios.

- **Needs:** Team-specific modelling, scenario comparison, justification material for leadership
- **Served by:** ROI Calculator (configurable team parameters), Three-scenario comparison, Report generation (for upward communication)

**Designer / UX Researcher**

Designers need to understand how AI impacts design-specific work — prototyping, design system maintenance, documentation, and user research. Design-phase data tends to be less abundant than development-phase data, so understanding data quality is important.

- **Needs:** Design-phase specific impact data, understanding of what "design productivity" means in the research
- **Served by:** Design phase row in phase breakdowns, Scenario Definitions (phase-level statistics and source counts)

**QA Engineer / Test Lead**

QA professionals need to assess how AI tools affect testing activities — automated test generation, test case design, and bug detection. The QA phase often shows some of the highest AI productivity gains.

- **Needs:** QA-phase specific data, understanding of AI testing capabilities
- **Served by:** QA phase row in phase breakdowns, Evidence Wall (filterable by QA phase)

**DevOps Engineer / Platform Engineer**

DevOps professionals need to understand AI impact on infrastructure, CI/CD, and operational work. They also need to evaluate how AI tools integrate with their existing toolchain.

- **Needs:** DevOps-phase specific data, operational impact assessment
- **Served by:** DevOps phase row in phase breakdowns, Data Sources (filterable by DevOps phase)

#### Organisational Change & Support

**HR / Talent Acquisition Director**

HR leaders need to understand how AI tools affect workforce planning — not whether jobs will be eliminated, but how roles will evolve and what new skills are needed. The application explicitly frames savings as capacity reallocation, not headcount reduction.

- **Needs:** Workforce impact clarity, skills gap understanding, recruitment planning context
- **Served by:** Methodology section (explicit framing of efficiency gains vs headcount), Key Implications (FTE equivalent translation), Training cost modelling

**Learning & Development Manager**

L&D managers need to plan training programmes for AI tool adoption. They need to understand which phases require the most upskilling and how training investment relates to expected returns.

- **Needs:** Training investment modelling, phase-level adoption planning
- **Served by:** Transformation Costs section (training cost configuration), Phase-level impact data (prioritising training by phase)

**Procurement / Vendor Management**

Procurement teams need to evaluate AI tool costs against projected returns and compare different vendor options. They need concrete cost-per-developer figures and ROI projections to support vendor negotiations.

- **Needs:** Cost benchmarks, ROI per developer, vendor-neutral analysis
- **Served by:** Tooling cost modelling (€20/dev/month benchmark), ROI Calculator (adjustable costs), Data Sources (evidence from multiple vendors, not one)

**Change Management Lead / Transformation Office**

Change managers need to plan the organisational journey of AI adoption. They need to understand the investment timeline, identify pilot candidates, and communicate the business case to affected teams.

- **Needs:** Implementation planning data, pilot programme guidance, communication material
- **Served by:** Report (ready-to-share document), Methodology section (pilot programme recommendation), Phase-level data (identifying highest-impact phases for pilots)

---

### 1.3 User Stories

The following user stories describe the key workflows and goals that the application supports.

#### Business Case & Decision-Making

**US-01: Build a data-driven business case for AI tool adoption**
As a **CTO preparing a board presentation**, I want to generate a professional business case document with financial projections, an evidence audit trail, and honest risk disclosure so that I can get board approval for AI tool investment without the document being dismissed as vendor marketing.

**US-02: Evaluate ROI under different assumptions**
As a **CFO reviewing an investment proposal**, I want to see the projected returns under conservative, baseline, and forward-looking assumptions so that I can assess the financial risk range and make an informed budget allocation decision.

**US-03: Understand the payback period**
As a **finance director**, I want to know how many months it will take for accumulated savings to recover the total transformation investment so that I can assess the cash flow implications and compare this investment against other proposals.

**US-04: Model my organisation's specific context**
As a **strategy consultant working with a client**, I want to input the client's actual team size, salary levels, budget allocation, and outsourcing ratios so that the projections reflect their specific situation rather than generic industry averages.

**US-05: Assess competitive risk of not adopting**
As a **CEO**, I want to understand the strategic context of AI tool adoption — whether this is an optional optimisation or an industry-standard practice that competitors are already implementing — so that I can frame the investment decision correctly for the board.

#### Data Exploration & Analysis

**US-06: Explore AI productivity impact by SDLC phase**
As an **engineering manager**, I want to see how AI tools affect each phase of the development lifecycle (Strategy, Design, Spec, Dev, QA, DevOps) so that I can identify where my team would benefit most and prioritise adoption accordingly.

**US-07: Compare early AI era vs agentic AI era**
As a **technology strategist**, I want to compare productivity data from 2023–2024 (basic code completion era) against 2025–2026 (agentic AI era) so that I can understand the trajectory of improvement and project future gains.

**US-08: Verify claims against original sources**
As a **sceptical board member**, I want to trace any productivity claim in the report back to its original published source so that I can independently verify the evidence and satisfy my due diligence requirements.

**US-09: Assess data quality and credibility**
As a **strategy consultant**, I want to see the credibility distribution of the underlying data (empirical studies vs surveys vs vendor reports vs anecdotes) so that I can assess how much weight to place on the projections and disclose data quality to my client.

**US-10: Filter data by specific criteria**
As a **data analyst supporting the CTO**, I want to filter the evidence base by year, data type, SDLC phase, and credibility level so that I can answer specific questions like "What do controlled experiments say about AI impact on QA?"

#### Phase-Specific Insights

**US-11: Understand AI impact on coding productivity**
As a **software engineer**, I want to see what published research says about AI tool impact on coding tasks specifically so that I can set realistic expectations for my own productivity and evaluate whether the hype matches the evidence.

**US-12: Assess design-phase AI opportunities**
As a **head of design**, I want to see AI productivity data specific to the Design phase (prototyping, design systems, documentation) so that I can evaluate whether AI tools would benefit my design team and justify the investment to leadership.

**US-13: Evaluate testing automation potential**
As a **QA lead**, I want to understand how AI tools affect testing activities (test generation, test case design, bug detection) so that I can plan my team's testing strategy and decide which tools to pilot.

**US-14: Plan AI-assisted DevOps improvements**
As a **platform engineer**, I want to see DevOps-specific AI impact data (CI/CD, infrastructure, monitoring) so that I can evaluate AI tools for our operational workflows and prioritise adoption areas.

#### Financial Modelling

**US-15: Calculate savings for different team sizes**
As an **HR director planning workforce strategy**, I want to model AI tool savings for different team sizes so that I can understand how the investment scales with organisational growth and inform hiring plans.

**US-16: Configure transformation costs realistically**
As a **programme manager overseeing AI adoption**, I want to adjust consulting, training, and internal implementation costs to match our actual planned investment so that the ROI projection reflects what we will actually spend.

**US-17: See the long-term financial trajectory**
As an **investor evaluating a portfolio company**, I want to see a 10-year cumulative ROI projection showing how the investment compounds over time so that I can assess the long-term financial attractiveness of AI tool adoption.

**US-18: Understand what "cost savings" really means**
As a **CFO**, I want a clear explanation that "cost savings" represent efficiency gains (capacity freed for higher-value work) and not automatic budget reductions so that I do not set incorrect expectations with the board about headcount implications.

#### Reporting & Communication

**US-19: Generate a board-ready document**
As an **executive assistant preparing board materials**, I want to print or export the business case report as a PDF so that I can include it in the board pack without requiring board members to access the application.

**US-20: Tailor the report to different audiences**
As a **CTO presenting to both the board and the engineering team**, I want the report to include a "How to Read This Report" guide that directs each reader (CEO, CFO, engineer, designer, investor) to the most relevant sections so that every stakeholder gets the information they need.

**US-21: Share a reproducible analysis**
As a **strategy consultant delivering a report to a client**, I want the ROI Configuration section to document every input parameter and assumption so that the client can reproduce the analysis or adjust it independently.

#### Community & Contribution

**US-22: Suggest a missing data source**
As a **researcher who found a relevant study**, I want to submit a new data source through the application so that the evidence base can be expanded and future analyses benefit from more data.

**US-23: Request a new feature**
As a **regular user of the application**, I want to submit a feature request with a title, description, and priority so that the development team can consider my idea and I can track its status.

**US-24: Review and moderate user submissions**
As an **application administrator**, I want to see all submitted feature requests and source suggestions with their status (pending, accepted, rejected, postponed) so that I can review them, update their status, and maintain quality control.

#### Configuration & Customisation

**US-25: Customise scenario parameters**
As a **data analyst**, I want to configure which years and data types each scenario includes so that I can create custom scenarios that match specific hypotheses (e.g., "What if we only trust empirical studies from 2025–2026?").

**US-26: Enable METR forward projection**
As a **technology strategist**, I want to enable the METR capability multiplier for the optimistic scenario so that I can model the impact of accelerating AI capability over the next 12–24 months based on published capability benchmarks.

**US-27: Use the application in Finnish**
As a **Finnish-speaking executive**, I want to switch the entire application to Finnish so that I can navigate, analyse, and generate reports in my native language without any untranslated content.

---

## 2. Overview

The **SDLC AI-Impact Analyzer** is an interactive, data-driven web application that quantifies how AI tools are transforming each phase of the software development lifecycle (SDLC). It aggregates **210+ real-world data points** from **190+ unique sources** — academic papers, industry surveys, vendor reports, and practitioner accounts — spanning **2023 to 2026**.

### What the application does

- **Visualises** AI productivity impact across six SDLC phases with interactive charts and dashboards
- **Analyses** data quality, trends, and credibility through deep statistical breakdowns
- **Calculates** return on investment (ROI) for AI tool adoption tailored to your team's parameters
- **Generates** a professional, printable Business Case Report suitable for executive review
- **Traces** every claim back to its original source for full transparency

### The six SDLC phases

| Phase | What it covers |
|-------|---------------|
| **Strategy** | Deciding what to build and why — roadmap planning, market analysis, feature prioritisation |
| **Design** | Creating the user experience and system architecture — UI/UX mockups, data models, technical design |
| **Spec** | Writing detailed requirements — user stories, acceptance criteria, technical specifications |
| **Dev** | The actual coding — building features, integrating systems, writing software |
| **QA** | Testing that everything works — automated tests, manual checks, bug fixing |
| **DevOps** | Deploying and running software in production — CI/CD pipelines, monitoring, infrastructure |

These phases were chosen because they represent the most widely recognised stages of modern software development. Each phase has distinct activities where AI tools can measurably improve productivity, providing a clear framework for comparing AI impact across different types of work.

---

## 3. Getting Started — Welcome Page

The **Welcome** page (`/welcome`) is the entry point to the application.

### What you will find

- **Introduction** — A summary of the application's purpose, highlighting the 210+ data points aggregated from publicly available research
- **SDLC Phase Flowchart** — A visual guide showing the six phases in order, each with a plain-language description. On desktop the phases display horizontally; on mobile they stack vertically
- **Learn More** — Links to external resources:
  - Video walkthrough (YouTube)
  - Podcast episode (YouTube)
  - Presentation slides (Google Drive)
- **Explore the App** — Quick-access cards linking to each major section: Dashboard, Analytics, Calculator, and Sources
- **Key Stats** — Four cards summarising the dataset: 210+ data points, 190+ sources, 6 SDLC phases, years 2023–2026

---

## 4. SDLC Analytics Dashboard

The main dashboard (`/`) provides an at-a-glance view of AI productivity impacts across all six SDLC phases.

### Components

| Component | Description |
|-----------|-------------|
| **Temporal Toggle** | Switch between "All Data", "Early AI" (2023–2024), and "Agentic AI" (2025–2026) eras |
| **Scenario Selector** | Activate predefined scenarios (Pessimistic, Realistic, Optimistic) to filter the dashboard by different data subsets |
| **Filter Bar** | Filter by year, data type (Empirical / Survey / Vendor / Anecdotal), and SDLC phase |
| **SDLC Phase Ribbon** | Six colour-coded cards showing the mean impact percentage per phase, fact count, and source count. Click a card to navigate to the Data Sources page pre-filtered for that phase |
| **Distribution Chart** | Box-and-whisker plot visualising the spread (min, Q1, median, Q3, max) of impact data per phase. Click a bar to see detailed statistics and a link to the underlying sources |
| **Sparkline Grid** | Small trend charts showing year-over-year average impact per phase with the latest year's average highlighted |
| **Time Series Chart** | Multi-line chart tracking how impact percentages evolve over time for each phase |
| **Evidence Wall** | Scrollable grid of individual data points. Each card shows the impact percentage, phase, year, data type, and a description. Click any card to open the detail panel |
| **Fact Detail Panel** | Slide-over panel showing full details for a single data point: source, description, credibility, sample size, and a link to the original publication |

### How to use

1. Start with the default view to see overall trends across all phases
2. Use the **Temporal Toggle** (top right) to compare "Early AI" vs "Agentic AI" eras
3. Click on **phase cards** in the ribbon or **chart bars** to drill down into matching data sources
4. Activate a **scenario** to see how results change under different assumptions
5. Use the **Filter Bar** to focus on specific years, data types, or phases
6. Click any card in the **Evidence Wall** to inspect individual data points

> **Tip:** Click on any chart bar or data point to drill into the underlying sources.

---

## 5. Data Source Analytics

The analytics page (`/analytics`) provides deeper statistical analysis of the underlying data.

### Components

| Component | Description |
|-----------|-------------|
| **Scenario Configurator** | At the top of the page — configure which years and data types each scenario includes. Enable the METR multiplier for the optimistic scenario. Changes here apply across the ROI Calculator and Report |
| **Hero Metrics** | Four summary cards: Total Facts, Unique Sources, Year Span, Average Credibility |
| **Impact Trends Over Time** | Multi-line chart showing average impact percentages per phase or per data type over the years. Toggle between "by Phase" and "by Data Type" views. A summary table below shows the latest trend |
| **Facts by Year** | Bar chart showing data point volume per year |
| **Facts by Data Type** | Horizontal bar chart breaking down data points by evidence category |
| **Facts by SDLC Phase** | Horizontal bar chart showing data density per phase |
| **Cross-Tabulation Heatmaps** | Two heatmap matrices: Year × Phase and Year × Data Type. Darker cells indicate higher average impact values. Click any cell to navigate to matching sources |
| **Credibility by Phase** | Stacked bar chart showing the distribution of credibility ratings (Low, Medium, High) per phase |
| **Top 10 Sources** | Ranked table of the most-cited sources with columns for fact count, phases covered, data types, and average impact percentage |

### How to use

- Use the **Scenario Configurator** at the top to customise which data feeds into each scenario
- Click any **chart bar**, **heatmap cell**, or **table row** to drill down into the matching data sources
- The heatmaps are useful for spotting which combinations of year and phase have the most or least evidence

---

## 6. ROI Calculator

The Business Case Calculator (`/calculator`) estimates the return on investment from adopting AI-powered development tools.

### Input Parameters (left panel)

#### Team Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| **IT Budget** | Annual non-personnel IT spend (infrastructure, licences, tools) | €100,000,000 |
| **Team Size** | Number of developers on your team | 25 |
| **Average Salary** | Annual salary per developer (EUR) | €55,000 |
| **Hours per Year** | Productive working hours per developer per year | 1,600 |

The **Total Budget** is calculated as: `Team Size × Average Salary + IT Budget`.

#### Transformation Costs

These represent the investment required to adopt AI tools:

| Cost | Description | Default |
|------|-------------|---------|
| **AI Tooling** | Per-developer cost for AI coding assistants (e.g., GitHub Copilot Business, Cursor Pro). Estimated at €20/developer/month | Calculated automatically |
| **External Consulting** | Implementation partners, advisory services | 15% of IT budget |
| **Training & Upskilling** | Developer workshops, certifications | 5% of IT budget |
| **Internal Implementation** | Internal team time, process redesign, change management | 10% of IT budget |

**Total Investment** is the sum of all transformation costs.

#### Budget Distribution by SDLC Phase

Click phase names to **include or exclude** them from the calculation. Drag sliders to adjust how much of your budget is allocated to each phase. Excluded phases are not counted in the ROI projection. Default weights are based on industry-typical distribution.

### Output (right panel)

The calculator produces three scenario projections:

| Scenario | Based on | Description |
|----------|----------|-------------|
| **Pessimistic** | Q1 (25th percentile) | Conservative estimate using early AI-era data |
| **Realistic** | Median (50th percentile) | Balanced estimate using all available data |
| **Optimistic** | Q3 (75th percentile) | Forward-looking estimate using recent agentic-era data |

Each scenario card shows:

- **Hours Saved / Year** — Projected annual reduction in developer-hours
- **Cost Savings** — Hours saved translated into monetary value using your salary rates. These are efficiency gains (time freed for higher-value work), **not headcount reductions**
- **Net ROI** — Cost savings minus total AI transformation investment
- **ROI Ratio** — Multiple of each euro invested returned as savings (e.g., 3.2x = €3.20 saved per €1 invested)
- **% of Total Budget** — Cost savings as a percentage of your total budget

Below the scenario cards:
- **Savings by Phase** bar chart — Visual comparison of cost savings across phases for all three scenarios
- **Scenario Comparison Table** — Detailed per-phase breakdown showing weight, median impact percentage, and cost savings for each scenario

### Generating a Report

Click the **"Report"** button at the top of the calculator page to generate a printable Business Case Report. The report opens in a new page optimised for printing and PDF export. See [Section 7](#7-business-case-report) for details.

---

## 7. Business Case Report

The Business Case Report (`/report`) is a professional, printable document generated from your ROI Calculator configuration. It is designed to serve as a self-contained business case that can be presented to executive stakeholders — CEO, CFO, CTO, board members — without requiring access to the application.

### How to generate

1. Configure your team parameters and transformation costs in the **ROI Calculator**
2. Click the **"Report"** button in the calculator's top bar
3. The report opens in a dedicated print-optimised page
4. Use the **"Print"** button (top right) to print or save as PDF

### Report sections

#### 1. Executive Summary

The headline section presenting the projected financial outcomes:

- **Three scenario cards** (Pessimistic, Realistic, Optimistic) showing hours saved, cost savings, net ROI, and ROI ratio
- **Metric definitions** — A box explaining exactly what each metric means, including the distinction between efficiency gains and headcount reductions
- **Savings by Phase chart** — Grouped bar chart comparing cost savings across SDLC phases for all three scenarios
- **Narrative paragraph** — Auto-generated summary with key figures
- **Key Implications** — A highlighted callout translating hours saved into full-time developer equivalents (FTEs) and explaining the strategic significance

#### 2. Data Foundation

Summary of the underlying evidence base:

- Total data points, unique sources, and year span
- **Credibility breakdown** — Distribution of Low/Medium/High credibility ratings
- **Facts by Data Type** — Count of Empirical, Survey, Vendor, and Anecdotal evidence
- **Facts by Phase** — Count of evidence points per SDLC phase

This section demonstrates the research rigour behind the projections.

#### 3. Scenario Definitions

Detailed description of each scenario's construction:

- **Description** — Which years and data types are included, and how many data points support the scenario
- **Distribution chart** — Visual box-and-whisker plot of impact data for this scenario
- **Phase statistics table** — Mean, Median, Q1, and Q3 per phase with fact and source counts
- **Sources listing** — Top 15 sources with fact counts and phase coverage

#### 4. ROI Configuration

Complete audit trail for transparency and reproducibility:

- **Input Parameters** — Team size, salary, hours/year, IT budget, total budget
- **Phase Weights** — Allocation percentages per phase (excluded phases shown as struck-through)
- **Transformation Costs** — Itemised investment with a note explaining the tooling cost basis (€20/dev/month) and clarifying first-year vs recurring costs
- **Scenario Configuration** — Which years and data types each scenario uses
- **METR Configuration** — If enabled, the doubling period, horizon, and resulting multiplier

#### 5. Source Appendix

Every data source listed with:

- Source name, URL, category badge (Scientific / Social Media)
- Description and metadata (data types, phases, date range)
- Individual facts with impact percentages and descriptions

This enables independent verification of every claim in the report.

#### 6. Methodology & Limitations

Honest disclosure of the analysis's limitations:

1. Published studies may over-represent positive outcomes (publication bias)
2. Productivity gains vary by team maturity, codebase complexity, and AI tool selection
3. "Cost savings" are efficiency gains, not guaranteed budget reductions
4. The year-based scenario model is a simplification
5. Transformation costs are estimates dependent on vendor selection and organisational readiness

Includes a recommendation to validate projections with a time-limited pilot programme.

#### 7. Glossary

Plain-language definitions of key terms: SDLC, ROI, Q1/Median/Q3, METR, Agentic AI, Empirical Study, and Credibility Rating. Designed so that non-technical stakeholders can follow the report without prior knowledge.

---

## 8. Data Sources

The Data Sources page (`/sources`) is the comprehensive evidence library. Every data point used in the dashboards and calculator can be traced back to its original source here.

### Features

- **Full-text search** — Search across source names, descriptions, and individual facts
- **Multi-filter** — Filter by year, data type, SDLC phase, link availability, source category (Scientific / Social Media), and date range
- **Expandable source cards** — Click any source to expand and see all associated data points with impact percentages, phases, and descriptions
- **Source links** — Direct links to original publications when available
- **Dashboard integration** — When navigating from the dashboard (by clicking a phase card or chart element), the Sources page opens with pre-applied filters
- **Excel export** — Export the current filtered view to an Excel file
- **Suggest a Source** — Submit new sources you've found (see [Section 10](#10-suggesting-sources--features))

### Source categories

Sources are categorised and badged as:

- **Scientific Reference** — arXiv, IEEE, ACM, peer-reviewed journals
- **Social Media** — X/Twitter, LinkedIn, blog posts

### Understanding source cards

Each source card shows:

- **Source name** (linked to the original publication if available)
- **Category badge** and **fact count**
- **Description** of what the source says about AI impact
- **Data types** and **SDLC phases** covered
- **Expandable facts** — Click to see individual data points with their impact percentage, phase, and description

---

## 9. Scenario Configuration

The **Scenario Configurator** is found at the top of the Data Source Analytics page (`/analytics`). It controls how the three scenarios are built throughout the application.

### What you can configure

| Setting | Description |
|---------|-------------|
| **Years per scenario** | Select which publication years are included. Defaults: Pessimistic = 2023–2024 (early AI), Realistic = all years, Optimistic = 2025–2026 (agentic era) |
| **Data source types** | Choose which evidence types (Empirical, Survey, Vendor, Anecdotal) each scenario includes |
| **METR Multiplier** | Enable for the Optimistic scenario to model accelerating AI capability. Based on METR research, AI task-completion capability roughly doubles every ~4 months. Adjust the doubling period and forward horizon |
| **Live counters** | Matching facts and sources update in real-time as you change filters |
| **Reset to Defaults** | Returns all scenario settings to their original configuration |

### Where changes apply

Changes to the Scenario Configurator affect:

- The **Scenario Selector** on the SDLC Analytics Dashboard
- The **ROI Calculator** output
- The **Business Case Report**

### Understanding METR

METR (Model Evaluation & Threat Research) is an AI safety research organisation whose benchmarks track AI capability improvement. Their data suggests AI task-completion capability roughly doubles every 4 months (2023–2026 trend). When enabled, the METR multiplier applies a forward projection to the Optimistic scenario, modelling expected near-future capabilities.

---

## 10. Suggesting Sources & Features

### Suggest a Data Source

Found a relevant study or report that isn't in the database?

1. Go to the **Data Sources** page
2. Click the **"+ Suggest a Source"** button in the top-right
3. Fill in the form:
   - **URL** — Link to the original publication
   - **Source Name** — Name of the study, report, or article
   - **Description** — What does the source say about AI impact?
   - **SDLC Phase** — Which phase does it apply to?
   - **Data Type** — Empirical, Survey, Vendor, or Anecdotal
   - **Impact %** (optional) — The productivity improvement percentage reported
   - **Year** (optional) — Publication year
   - **Sample Size** (optional) — e.g., "500 developers"
4. Click **Submit Suggestion**

The badge count on the button updates in real-time. Suggestions can be reviewed on the **From Users** page.

### Suggest a Feature

The floating **"Suggest Feature"** button in the bottom-right corner is available on every page.

- **Feature Title** — Brief summary of your idea
- **Description** — Detailed explanation of what you'd like
- **Speech-to-Text** — Click the microphone icon to dictate your description (Chrome/Edge). The mic pulses red while recording
- **Priority** — Rate as Nice-to-have, Important, or Critical
- **History** — Expand the list below the form to see your previously submitted suggestions

---

## 11. From Users (Moderation)

The **From Users** page (`/from-users`) shows all feature requests and data source suggestions submitted by users.

### Features

- **Feature Requests** — View all submitted feature suggestions with title, description, priority, and status (Pending, Accepted, Rejected, Postponed, Implemented)
- **Source Suggestions** — Review suggested data sources with URL, description, SDLC phase, data type, and impact percentage
- **Status Filtering** — Filter by "Pending Review" or "All" to focus on items that need attention
- **Status management** — Accept, reject, postpone, or mark items as implemented

---

## 12. Filtering & Search

Filters are a core interaction pattern throughout the application.

### Filter types

| Type | How it works |
|------|-------------|
| **Toggle Buttons** | Click to enable/disable. Active filters have a blue highlight. Multiple can be active simultaneously |
| **Temporal Toggle** | Exclusive selection: All Data, Early AI (2023–2024), or Agentic AI (2025–2026) |
| **Search** | Free-text search on the Sources page — filters across source names, descriptions, and facts |
| **Reset** | Click the reset button (circular arrow icon) to restore all filters to defaults |

### Important behaviour

Filters are **cumulative** — only data points matching ALL active filter criteria are shown. Deselecting all options in a filter group effectively hides all data.

When you navigate from the dashboard to the Sources page by clicking a phase card or chart element, filters are automatically pre-applied to show the relevant subset.

---

## 13. Data & Methodology

### Dataset

The application's dataset consists of **210+ manually curated data points** from **190+ unique sources**.

### Data types

| Type | Description | Typical credibility |
|------|-------------|-------------------|
| **Empirical** | Controlled experiments, A/B tests, randomised controlled trials | Highest |
| **Survey** | Developer surveys, industry polls (e.g., Stack Overflow, GitHub) | Medium–High |
| **Vendor** | Reports from tool vendors (GitHub, Google, Anthropic, etc.) | Medium (potential bias) |
| **Anecdotal** | Blog posts, social media reports, individual case studies | Lower |

### Credibility scoring

Each data point has a credibility rating of **1 (Low)**, **2 (Medium)**, or **3 (High)** based on:

- Methodology rigour
- Sample size
- Reproducibility
- Peer-review status

### Statistical methods

Phase statistics use standard box-and-whisker measures:

- **Minimum** — Lowest observed value
- **Q1 (25th percentile)** — Used for the Pessimistic scenario
- **Median (50th percentile)** — Used for the Realistic scenario
- **Q3 (75th percentile)** — Used for the Optimistic scenario
- **Maximum** — Highest observed value
- **Mean** — Arithmetic average of all values

### How ROI is calculated

1. For each scenario, the evidence base is filtered by year range and data source type
2. The median productivity improvement is calculated per SDLC phase
3. Hours saved = `Team Size × Hours/Year × Phase Weight × Median Impact%` (summed across all included phases)
4. Cost savings = `Hours Saved × Hourly Rate` (where hourly rate = Average Salary / Hours per Year)
5. Total investment = AI Tooling + Consulting + Training + Internal Implementation
6. Net ROI = Cost Savings − Total Investment
7. ROI Ratio = Cost Savings / Total Investment

### Key sources

The dataset includes research from McKinsey, Gartner, Harvard Business School, Google Research, Microsoft Research, arXiv papers, IEEE/ACM publications, GitHub's own Copilot studies, and many more. All sources are publicly available and individually referenced in the Source Appendix.

---

## 14. Language Support

The application supports **English** and **Finnish** (Suomi).

- Switch languages using the **EN / FI** buttons at the bottom of the sidebar
- Your preference is saved in your browser and persists across sessions
- All application text — labels, descriptions, help content, report text, and tooltips — is fully translated in both languages

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **SDLC** | Software Development Lifecycle — the end-to-end process of planning, creating, testing, and deploying software. Divided into six phases in this application: Strategy, Design, Spec, Dev, QA, DevOps |
| **ROI** | Return on Investment — the ratio of net gains to total investment. Expressed as a multiplier (e.g., 3x) or percentage |
| **Q1 / Median / Q3** | Statistical quartiles dividing a dataset into four equal parts. Q1 = 25th percentile (conservative), Median = 50th percentile (midpoint), Q3 = 75th percentile (optimistic) |
| **METR** | Model Evaluation & Threat Research — an AI safety research organisation tracking the rate of AI capability improvement. Their data suggests AI capability roughly doubles every ~4 months |
| **Agentic AI** | AI systems that can autonomously plan, execute, and iterate on multi-step tasks, as opposed to single-prompt tools like basic code completion. The "agentic era" (2025+) marks a step change in AI tool capability |
| **Empirical Study** | Research based on controlled experiments, A/B tests, or RCTs. The highest-credibility evidence type |
| **Credibility Rating** | A 1–3 scale (Low / Medium / High) assigned to each data point based on methodology rigour, sample size, and peer-review status |
| **Net ROI** | Cost savings minus total AI transformation investment |
| **ROI Ratio** | The multiple of each euro invested returned as savings (e.g., 3.2x means €3.20 in efficiency gains per €1 invested) |
| **Cost Savings** | Efficiency gains — developer time freed for higher-value work. **Not** headcount reductions |
| **Transformation Costs** | The investment required to adopt AI tools: tooling licences, consulting, training, and internal implementation effort |
| **Phase Weights** | The percentage of total budget allocated to each SDLC phase, used to weight the ROI calculation |

---

## 16. FAQ

### Where does the data come from?

All data points are manually extracted from publicly available sources including academic papers (arXiv, IEEE, ACM), industry reports (McKinsey, Gartner), company research (Google, Microsoft), and developer surveys.

### How often is the data updated?

The dataset is periodically updated as new research becomes available. The current dataset covers 2023 through 2026.

### Can I contribute data?

Yes! Use the "Suggest a Source" button on the Data Sources page to submit new evidence. Suggestions are saved and visible on the From Users page.

### What do negative impact percentages mean?

Negative values indicate that AI tools were found to decrease productivity in certain contexts — for example, for senior developers on complex tasks, or when AI-generated code increases the review burden.

### Is the ROI calculator accurate?

The calculator provides **estimates** based on the underlying data. The three-scenario approach (pessimistic / realistic / optimistic) gives a range rather than a single point estimate. Actual results will vary based on team composition, tools used, and adoption maturity.

### What is the Business Case Report?

The Report is a printable document generated from the ROI Calculator. It includes an executive summary, data foundation, scenario definitions, full audit trail, source appendix, methodology & limitations, and glossary. It is designed to pass executive review rounds.

### How do the three scenarios work?

Each scenario filters the evidence base differently:

- **Pessimistic** — Uses early AI-era research (2023–2024) and takes the lower quartile (Q1)
- **Realistic** — Uses all available data and takes the median
- **Optimistic** — Uses recent agentic-era data (2025–2026) and takes the upper quartile (Q3)

You can customise these on the Analytics page under Scenario Configurator.

### Are cost savings real budget reductions?

No. "Cost savings" represent **efficiency gains** — developer time freed from routine tasks that can be redirected toward innovation, delivery acceleration, or technical debt reduction. They are not guaranteed budget cuts. Realising the financial benefit requires deliberate redeployment of the freed capacity.
