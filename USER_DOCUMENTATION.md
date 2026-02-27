# SDLC AI-Impact Analyzer — User Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started — Welcome Page](#2-getting-started--welcome-page)
3. [SDLC Analytics Dashboard](#3-sdlc-analytics-dashboard)
4. [Data Source Analytics](#4-data-source-analytics)
5. [ROI Calculator](#5-roi-calculator)
6. [Business Case Report](#6-business-case-report)
7. [Data Sources](#7-data-sources)
8. [Scenario Configuration](#8-scenario-configuration)
9. [Suggesting Sources & Features](#9-suggesting-sources--features)
10. [From Users (Moderation)](#10-from-users-moderation)
11. [Filtering & Search](#11-filtering--search)
12. [Data & Methodology](#12-data--methodology)
13. [Language Support](#13-language-support)
14. [Glossary](#14-glossary)
15. [FAQ](#15-faq)

---

## 1. Overview

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

## 2. Getting Started — Welcome Page

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

## 3. SDLC Analytics Dashboard

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

## 4. Data Source Analytics

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

## 5. ROI Calculator

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

Click the **"Report"** button at the top of the calculator page to generate a printable Business Case Report. The report opens in a new page optimised for printing and PDF export. See [Section 6](#6-business-case-report) for details.

---

## 6. Business Case Report

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

## 7. Data Sources

The Data Sources page (`/sources`) is the comprehensive evidence library. Every data point used in the dashboards and calculator can be traced back to its original source here.

### Features

- **Full-text search** — Search across source names, descriptions, and individual facts
- **Multi-filter** — Filter by year, data type, SDLC phase, link availability, source category (Scientific / Social Media), and date range
- **Expandable source cards** — Click any source to expand and see all associated data points with impact percentages, phases, and descriptions
- **Source links** — Direct links to original publications when available
- **Dashboard integration** — When navigating from the dashboard (by clicking a phase card or chart element), the Sources page opens with pre-applied filters
- **Excel export** — Export the current filtered view to an Excel file
- **Suggest a Source** — Submit new sources you've found (see [Section 9](#9-suggesting-sources--features))

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

## 8. Scenario Configuration

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

## 9. Suggesting Sources & Features

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

## 10. From Users (Moderation)

The **From Users** page (`/from-users`) shows all feature requests and data source suggestions submitted by users.

### Features

- **Feature Requests** — View all submitted feature suggestions with title, description, priority, and status (Pending, Accepted, Rejected, Postponed, Implemented)
- **Source Suggestions** — Review suggested data sources with URL, description, SDLC phase, data type, and impact percentage
- **Status Filtering** — Filter by "Pending Review" or "All" to focus on items that need attention
- **Status management** — Accept, reject, postpone, or mark items as implemented

---

## 11. Filtering & Search

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

## 12. Data & Methodology

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

## 13. Language Support

The application supports **English** and **Finnish** (Suomi).

- Switch languages using the **EN / FI** buttons at the bottom of the sidebar
- Your preference is saved in your browser and persists across sessions
- All application text — labels, descriptions, help content, report text, and tooltips — is fully translated in both languages

---

## 14. Glossary

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

## 15. FAQ

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
