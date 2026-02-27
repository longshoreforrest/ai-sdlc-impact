# SDLC AI-Impact Analyzer — Documentation

> **Quantifying AI's impact on the Software Development Lifecycle**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Application Structure](#3-application-structure)
4. [Welcome Page](#4-welcome-page)
5. [SDLC Analytics Dashboard](#5-sdlc-analytics-dashboard)
   - [Temporal Toggle](#51-temporal-toggle)
   - [Filter Bar](#52-filter-bar)
   - [SDLC Phase Ribbon](#53-sdlc-phase-ribbon)
   - [Distribution Chart](#54-distribution-chart)
   - [Sparkline Grid](#55-sparkline-grid)
   - [Time Series Chart](#56-time-series-chart)
   - [Evidence Wall](#57-evidence-wall)
   - [Fact Detail Panel](#58-fact-detail-panel)
6. [Data Source Analytics](#6-data-source-analytics)
   - [Hero Metrics](#61-hero-metrics)
   - [Impact Trends Over Time](#62-impact-trends-over-time)
   - [Distribution Charts](#63-distribution-charts)
   - [Heatmaps](#64-heatmaps)
   - [Credibility by Phase](#65-credibility-by-phase)
   - [Top Sources Table](#66-top-sources-table)
7. [ROI Calculator](#7-roi-calculator)
   - [Input Parameters](#71-input-parameters)
   - [Scenario Results](#72-scenario-results)
   - [Phase Breakdown Chart](#73-phase-breakdown-chart)
   - [Comparison Table](#74-comparison-table)
8. [Data Sources](#8-data-sources)
   - [Search](#81-search)
   - [Filters](#82-filters)
   - [Source Cards](#83-source-cards)
   - [Suggest a Data Source](#84-suggest-a-data-source)
9. [Suggest a Feature](#9-suggest-a-feature)
   - [Speech-to-Text](#91-speech-to-text)
   - [Viewing Previous Suggestions](#92-viewing-previous-suggestions)
10. [Data & Methodology](#10-data--methodology)
    - [Data Types](#101-data-types)
    - [Credibility Scoring](#102-credibility-scoring)
    - [SDLC Phases](#103-sdlc-phases)
    - [Phase Weights](#104-phase-weights)
    - [Statistical Methods](#105-statistical-methods)
11. [Firebase Integration](#11-firebase-integration)
12. [Keyboard Shortcuts & Interactions](#12-keyboard-shortcuts--interactions)
13. [Browser Compatibility](#13-browser-compatibility)
14. [FAQ](#14-faq)

---

## 1. Introduction

The **SDLC AI-Impact Analyzer** is a data-driven web application that aggregates **210+ real-world data points** from **190+ unique sources** to quantify how AI tools are transforming each phase of the software development lifecycle.

Sources include peer-reviewed academic papers (arXiv, IEEE, ACM), industry research (McKinsey, Gartner), company studies (Google Research, Microsoft Research), developer surveys, vendor reports, and practitioner accounts spanning **2023–2026**.

The application enables users to:

- **Explore** AI productivity impacts across six SDLC phases with interactive dashboards
- **Analyze** data quality, trends, and distributions with statistical charts
- **Calculate** return on investment for AI tool adoption tailored to their organization
- **Trace** every data point back to its original source
- **Contribute** new data sources and feature ideas

---

## 2. Getting Started

### Running the Application

```bash
npm install
npm run dev
```

The application runs at `http://localhost:3000`.

### Navigation

The left sidebar provides access to all pages:

| Page | Path | Description |
|------|------|-------------|
| **Welcome** | `/welcome` | Introduction, media links, and app overview |
| **Data Source Analytics** | `/analytics` | Statistical deep-dive into data sources |
| **SDLC Analytics** | `/` | Main interactive dashboard |
| **ROI Calculator** | `/calculator` | Business case estimation tool |
| **Data Sources** | `/sources` | Searchable source library |
| **Help & Documentation** | `/help` | In-app embedded help |

A **"Suggest Feature"** floating button is visible on every page in the bottom-right corner.

---

## 3. Application Structure

The application is built with:

- **Next.js 16** (App Router) — React framework with file-based routing
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first styling
- **Recharts** — Interactive data visualization
- **Lucide React** — Icon library
- **Firebase/Firestore** — Optional cloud database for suggestions

### Color System

| Token | Usage |
|-------|-------|
| `accent` (#2563eb) | Primary action color (blue) |
| `accent-dim` (#dbeafe) | Light accent backgrounds |
| `impact-high` (#059669) | High impact values (green) |
| `impact-mid` (#d97706) | Medium impact values (amber) |
| `impact-low` (#dc2626) | Low impact values (red) |
| `surface` | Card/panel backgrounds |
| `muted` | Secondary text |
| `foreground` | Primary text |

---

## 4. Welcome Page

**Path:** `/welcome`

The Welcome page serves as the landing page for the application.

### Sections

1. **Hero** — Application title, icon, and a summary explaining the purpose and scope of the analyzer (210+ data points, 190+ sources, 6 SDLC phases, 2023–2026).

2. **Learn More** — Three media cards linking to external resources:
   - **Video Walkthrough** — YouTube video explaining the application
   - **Podcast Episode** — Audio discussion of AI impact on software development
   - **Presentation Slides** — Slide deck covering key findings and methodology

   > Note: These currently use placeholder URLs. Replace the `TODO` values in `src/app/welcome/page.tsx` with your actual URLs.

3. **Explore the App** — Four navigation cards linking to the main application sections, each with a description of what you'll find there.

4. **Key Stats** — Four metric cards showing total data points, unique sources, number of SDLC phases, and year coverage.

---

## 5. SDLC Analytics Dashboard

**Path:** `/` (home page)

The main dashboard provides an at-a-glance view of AI productivity impacts across all six SDLC phases. All components on this page react to the same shared filter state.

### 5.1 Temporal Toggle

Located in the top-right corner of the header. Provides three exclusive era selections:

| Option | Filter |
|--------|--------|
| **All Eras** | No temporal filtering (default) |
| **Early AI (≤2024)** | Only data from 2023–2024 |
| **Agentic (2025+)** | Only data from 2025–2026 |

This is useful for comparing how AI productivity gains have evolved as tools moved from code completion to agentic workflows.

### 5.2 Filter Bar

A horizontal bar with toggle buttons organized into three groups:

- **Year** — Toggle individual years on/off: 2023, 2024, 2025, 2026
- **Type** — Toggle data types: Empirical, Survey, Vendor, Anecdotal
- **Phase** — Toggle SDLC phases: Strategy, Design, Spec, Dev, QA, DevOps
- **Reset** — Circular arrow button restores all filters to defaults

**Behavior:** Filters are cumulative — only data points matching ALL active criteria are shown. Active toggles have a blue accent highlight. Deselecting all options in a group effectively hides all data.

### 5.3 SDLC Phase Ribbon

A row of six color-coded cards, one per SDLC phase. Each card shows:

- **Phase name** — Uppercase label
- **Mean impact** — Large percentage number
- **Fact count** — Number of data points
- **Impact bar** — Visual progress bar proportional to mean impact

**Color coding:**
- Green (≥50%) — High impact
- Amber (30–49%) — Medium impact
- Red (<30%) — Low impact

**Interaction:** Click any phase card to navigate to the Data Sources page pre-filtered for that phase.

### 5.4 Distribution Chart

A **box-and-whisker plot** (left side of the charts row) showing the statistical spread of impact data per phase:

- **Whisker lines** — Extend from minimum to maximum values
- **Box** — Represents the interquartile range (Q1 to Q3)
- **Median line** — Bold horizontal line within the box
- **Tooltip** — Hover to see exact values: Max, Q3, Median, Q1, Min, and data point count

**Interaction:** Click any phase's box plot to drill down into sources.

### 5.5 Sparkline Grid

A 2×3 grid of small cards (right side of the charts row) showing **year-over-year trend** for each phase:

- **Phase name** and **latest year average** as large text
- **Miniature line chart** showing the trend across all years in the filtered data
- Color-coded by latest average (green ≥50%, amber ≥30%, red <30%)

**Interaction:** Click any sparkline card to drill down into sources.

### 5.6 Time Series Chart

A full-width **interactive line chart** showing AI impact trends by year for each selected phase.

**Features:**
- One colored line per active SDLC phase
- X-axis: year, Y-axis: average impact percentage
- **Tooltip on hover** showing for each phase: mean impact, data point count (n=), and min–max range for that year
- **Summary stat cards** below the chart showing the latest value per phase and the change (delta) from earliest to latest year in percentage points

**Interaction with filters:**
- Toggle phases in the Filter Bar — only active phases appear as lines
- Toggle years — the X-axis adjusts to show only selected years
- Toggle data types — the averages recalculate using only the selected data types
- Temporal toggle — restricts to Early AI or Agentic era data

**Example workflows:**
- Select only "Dev" phase + "Empirical" data type → see how rigorous studies of AI impact on development have evolved year-over-year
- Select all phases + "Agentic (2025+)" era → compare how different phases are impacted in the latest AI era
- Select "QA" and "DevOps" → compare testing vs. operations impact trends side-by-side

### 5.7 Evidence Wall

A scrollable grid of individual data point cards, sorted by year (newest first) then by impact (highest first).

Each card shows:
- **Data type badge** — Color-coded (Empirical=green, Survey=blue, Vendor=purple, Anecdotal=orange)
- **Phase badge** — Gray label
- **Credibility dots** — 1–3 filled dots indicating credibility rating
- **Description** — Two-line excerpt of the data point
- **Source and year** — Bottom-left metadata
- **Impact percentage** — Large blue number at bottom-right

**Interaction:** Click any card to open the Fact Detail Panel.

### 5.8 Fact Detail Panel

A **slide-over panel** that opens from the right side of the screen (384px wide) when you click an evidence card.

**Content:**
- **Impact percentage** — Large centered number
- **Metadata grid** — Phase, Year, Data Type, Credibility
- **Description** — Full text of the data point
- **Source** — Source name and sample size (if available)
- **Open Original Source** — Link to the original publication (if URL is available)
- **View all [Phase] sources** — Drill-down link to the Data Sources page

**Close:** Click the X button, click the backdrop, or press the **Escape** key.

---

## 6. Data Source Analytics

**Path:** `/analytics`

A deep-dive analytics page providing statistical analysis of the underlying data sources. This page has its own independent filter controls (phase and data type toggles).

### 6.1 Hero Metrics

Four summary cards at the top:

| Metric | Description |
|--------|-------------|
| **Total Facts** | Total number of data points in the dataset |
| **Unique Sources** | Number of distinct publication/report sources |
| **Year Span** | Range of years covered (e.g., 2023–2026) |
| **Avg Credibility** | Mean credibility score across all data (out of 3) |

### 6.2 Impact Trends Over Time

A **multi-line chart** showing average impact percentage per year for each selected phase. Includes:

- Phase toggle buttons above the chart to show/hide individual phases
- Data type toggle buttons to filter which evidence types feed into the averages
- **Trend summary table** below the chart showing the average impact value per phase per year

**Interaction:** Click the chart or table elements to drill down into the Data Sources page.

### 6.3 Distribution Charts

A three-column row of bar charts:

1. **Facts by Year** — Bar chart showing how many data points exist per year
2. **Facts by Data Type** — Bar chart broken down by Empirical, Survey, Vendor, Anecdotal
3. **Facts by SDLC Phase** — Bar chart showing count per phase

All bars are clickable to drill down into matching sources.

### 6.4 Heatmaps

Two cross-tabulation heatmaps:

1. **Year × Phase** — Shows the count of data points for each combination of year and SDLC phase. Color intensity proportional to count.
2. **Year × Data Type** — Shows the count per year and data type combination.

**Interaction:** Click any heatmap cell to navigate to the Data Sources page filtered by that year and phase (or data type).

### 6.5 Credibility by Phase

A **stacked bar chart** showing the distribution of credibility ratings (Low/Medium/High) for each SDLC phase. Helps identify where the strongest evidence exists versus areas relying on lower-quality data.

### 6.6 Top Sources Table

A ranked table of the **10 most-cited sources** showing:

| Column | Description |
|--------|-------------|
| **#** | Rank |
| **Source** | Publication/report name |
| **Facts** | Number of data points from this source |
| **Avg Impact** | Mean impact percentage across all data points |
| **Phases** | Badge list of SDLC phases covered |
| **Types** | Badge list of data types |

**Interaction:** Click any row to drill down into that source in the Data Sources page.

---

## 7. ROI Calculator

**Path:** `/calculator`

The Business Case Calculator estimates the return on investment from adopting AI-powered development tools. It produces three scenarios (pessimistic, realistic, optimistic) based on statistical quartiles from the dataset.

### 7.1 Input Parameters

Located in the left column (1/3 width):

| Input | Description | Default |
|-------|-------------|---------|
| **IT Budget** | Annual IT/tooling budget (EUR/year) | €500,000 |
| **Team Size** | Number of developers (slider, 1–500) | 25 |
| **Average Annual Salary** | Per developer salary (EUR) | €55,000 |
| **Working Hours/Year** | Productive hours per developer per year | 1,600 |
| **Bottleneck Phases** | Select which SDLC phases are bottlenecks — these get a 15% weight multiplier | Dev, QA |

A **Total Budget** callout shows the combined personnel + IT budget.

### 7.2 Scenario Results

Three scenario cards in the right column (2/3 width):

| Scenario | Based on | Color |
|----------|----------|-------|
| **Pessimistic** | Q1 (25th percentile) impact values | Red |
| **Realistic** | Median (50th percentile) impact values | Amber |
| **Optimistic** | Q3 (75th percentile) impact values | Green |

Each card shows:
- **Hours Saved** — Total developer hours saved per year
- **Cost Savings** — Monetary value of saved hours
- **AI Tooling Cost** — Estimated annual cost (€20/seat/month)
- **Net ROI** — Cost savings minus tooling cost
- **ROI Ratio** — Savings divided by tooling cost (e.g., "8.5×")

### 7.3 Phase Breakdown Chart

A **grouped bar chart** comparing cost savings (in thousands of EUR) by SDLC phase across all three scenarios. Each phase has three bars (pessimistic, realistic, optimistic) for easy comparison.

### 7.4 Comparison Table

A detailed table showing per-phase breakdown:

| Column | Description |
|--------|-------------|
| **Phase** | SDLC phase name |
| **Weight** | Phase weight in the model (e.g., Dev = 40%) |
| **Bottleneck** | Whether this phase is marked as a bottleneck (star icon) |
| **Pessimistic** | Hours saved and cost savings at Q1 |
| **Realistic** | Hours saved and cost savings at median |
| **Optimistic** | Hours saved and cost savings at Q3 |

A note at the bottom explains that the three scenarios use Q1, median, and Q3 from the filtered dataset, and that bottleneck phases receive a 15% uplift.

---

## 8. Data Sources

**Path:** `/sources`

The comprehensive evidence library where every data point used in the dashboards and calculator can be traced to its original source.

### 8.1 Search

A full-text search bar at the top searches across:
- Source names
- Source descriptions
- Individual fact descriptions

Type to filter in real time. Clear with the X button.

### 8.2 Filters

A filter bar with five filter groups:

| Group | Options |
|-------|---------|
| **Year** | 2023, 2024, 2025, 2026 |
| **Type** | Empirical, Survey, Vendor, Anecdotal |
| **Phase** | Strategy, Design, Spec, Dev, QA, DevOps |
| **Category** | All, Scientific, Social Media |
| **Link** | All, Has Link, No Link |

A **Reset** button clears all filters. When navigating from the dashboard with pre-applied filters, a "Filtered from Dashboard" badge appears.

### 8.3 Source Cards

Each source is displayed as an expandable card showing:

**Collapsed view:**
- Source name
- Category badge (Scientific Reference / Social Media) if applicable
- Data type badges (color-coded)
- External link icon (if URL available)
- Fact count
- Description excerpt

**Expanded view (click to expand):**
- Full description
- All associated data points listed with:
  - Impact percentage (color-coded)
  - Description
  - Phase badge
  - Year
  - Sample size (if available)
  - Credibility dots

### 8.4 Suggest a Data Source

A prominent **"+ Suggest a Source"** button in the page header opens a slide-over panel from the right.

**Form fields:**

| Field | Type | Required |
|-------|------|----------|
| **URL** | URL input | Yes |
| **Source Name** | Text | Yes |
| **Description** | Textarea | Yes |
| **SDLC Phase** | Toggle buttons (pick one) | Yes |
| **Data Type** | Toggle buttons (pick one) | Yes |
| **Impact %** | Number (-100 to 500) | No |
| **Year** | Number (default: 2026) | No |
| **Sample Size** | Text (e.g., "500 developers") | No |

**After submitting:**
- A green success toast appears
- The form resets
- The badge count on the button updates

**Persistence:**
- Always saved to `localStorage` for instant feedback
- If Firebase is configured, also persisted to Firestore for all users to see

**Close:** Click X, click the backdrop, or press **Escape**.

---

## 9. Suggest a Feature

A floating **"Suggest Feature"** button (with a lightbulb icon) is fixed to the **bottom-right corner** of every page. Clicking it opens a centered modal dialog.

**Form fields:**

| Field | Type | Required |
|-------|------|----------|
| **Feature Title** | Text | Yes |
| **Description** | Textarea | Yes |
| **Priority** | Toggle: Nice-to-have / Important / Critical | No (default: Nice-to-have) |

### 9.1 Speech-to-Text

Next to the description textarea, a **microphone button** enables speech-to-text input using the Web Speech API.

**How it works:**
1. Click the microphone icon — it turns **red with a pulse animation** indicating recording
2. Speak your description
3. When you stop speaking, the transcribed text is **appended** to the description field
4. Click the mic again to stop recording early

**Requirements:** Works in Chrome and Edge. The mic button is automatically hidden in browsers that don't support the SpeechRecognition API.

### 9.2 Viewing Previous Suggestions

Below the submit button, a collapsible section shows previously submitted feature suggestions. Click **"N previous suggestions"** to expand the list. Each suggestion shows:

- Feature title
- Priority badge (color-coded: Critical=red, Important=amber, Nice-to-have=gray)
- Description excerpt (2-line truncation)

---

## 10. Data & Methodology

### 10.1 Data Types

Every data point is classified into one of four evidence categories:

| Type | Description | Badge Color |
|------|-------------|-------------|
| **Empirical** | Controlled experiments, A/B tests, RCTs — highest rigor | Green |
| **Survey** | Developer surveys, industry polls, questionnaires | Blue |
| **Vendor** | Reports from tool vendors (GitHub, Google, etc.) | Purple |
| **Anecdotal** | Blog posts, social media reports, individual case studies | Orange |

### 10.2 Credibility Scoring

Each data point has a credibility rating:

| Rating | Label | Criteria |
|--------|-------|----------|
| **1** | Low | Informal reports, self-reported single cases, no methodology described |
| **2** | Medium | Surveys with reasonable sample sizes, vendor reports with disclosed methodology |
| **3** | High | Peer-reviewed studies, large-scale RCTs, rigorous controlled experiments |

### 10.3 SDLC Phases

The application tracks AI impact across six phases:

| Phase | Description |
|-------|-------------|
| **Strategy** | Product strategy, roadmap planning, market analysis |
| **Design** | UX/UI design, system architecture, design documentation |
| **Spec** | Requirements gathering, specification writing, user stories |
| **Dev** | Code writing, implementation, code review |
| **QA** | Testing, quality assurance, bug detection |
| **DevOps** | CI/CD, deployment, infrastructure, monitoring |

### 10.4 Phase Weights

The ROI calculator uses the following weights to distribute effort across phases:

| Phase | Weight | Rationale |
|-------|--------|-----------|
| Strategy | 8% | Smallest portion of total development effort |
| Design | 12% | Design and architecture work |
| Spec | 10% | Requirements and specifications |
| **Dev** | **40%** | Largest share — core implementation work |
| QA | 20% | Testing and quality assurance |
| DevOps | 10% | Deployment and operations |

Phases marked as **bottlenecks** in the calculator receive a **15% uplift** (multiplied by 1.15) to account for disproportionate impact on delivery timelines.

### 10.5 Statistical Methods

**Box-and-whisker statistics** are computed per phase:
- **Minimum** — Lowest impact value
- **Q1 (25th percentile)** — First quartile
- **Median (50th percentile)** — Middle value
- **Q3 (75th percentile)** — Third quartile
- **Maximum** — Highest impact value
- **Mean** — Arithmetic average

The ROI calculator maps these to scenarios:
- **Pessimistic** → Q1 values
- **Realistic** → Median values
- **Optimistic** → Q3 values

Time series analytics compute **year-by-year means** — for each combination of year and phase, the average impact percentage is calculated from all matching data points.

---

## 11. Firebase Integration

The application supports **optional Firebase/Firestore integration** for persisting source and feature suggestions to a shared online database.

### How It Works

- **Without Firebase configured:** Suggestions are saved to `localStorage` only (per-browser, not shared)
- **With Firebase configured:** Suggestions are written to both `localStorage` (for instant UI feedback) and Firestore (for persistence and sharing across users). Reads fall back to `localStorage` if Firestore is unavailable.

### Setup Instructions

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project" and follow the wizard

2. **Enable Cloud Firestore:**
   - In the Firebase Console, go to **Build → Firestore Database**
   - Click **Create database**
   - Select **Start in test mode** (for development)
   - Choose a region close to your users

3. **Register a Web app:**
   - Go to **Project Settings → General → Your apps**
   - Click **Add app → Web** (</> icon)
   - Register the app and copy the configuration values

4. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in the values from step 3:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

5. **Set Firestore security rules** (for production):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /source-suggestions/{document} {
         allow read, create: if true;
       }
       match /feature-suggestions/{document} {
         allow read, create: if true;
       }
     }
   }
   ```

6. **Restart the dev server** — Suggestions will now persist to Firestore.

### Firestore Collections

| Collection | Document Fields |
|------------|----------------|
| `source-suggestions` | url, name, description, phase, dataType, impactPct?, year, sampleSize?, createdAt |
| `feature-suggestions` | title, description, priority, createdAt |

---

## 12. Keyboard Shortcuts & Interactions

| Action | Shortcut |
|--------|----------|
| Close Fact Detail Panel | `Escape` |
| Close Suggest Source Panel | `Escape` |
| Close Suggest Feature Modal | `Escape` |
| Close any panel/modal | Click backdrop |
| Drill down to sources | Click phase ribbon card, box plot, sparkline, or chart element |
| Expand/collapse source card | Click the card |
| Expand/collapse help sections | Click the section header |

---

## 13. Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core application | Yes | Yes | Yes | Yes |
| Charts & visualizations | Yes | Yes | Yes | Yes |
| Speech-to-text | Yes | No | No | Yes |
| localStorage persistence | Yes | Yes | Yes | Yes |
| Firebase integration | Yes | Yes | Yes | Yes |

The Speech-to-Text feature uses the Web Speech API which is only available in Chromium-based browsers. In unsupported browsers, the microphone button is automatically hidden (progressive enhancement).

---

## 14. FAQ

### Where does the data come from?

All data points are manually curated from publicly available sources: academic papers (arXiv, IEEE, ACM), industry reports (McKinsey, Gartner, Forrester), company research (Google, Microsoft, GitHub), developer surveys, and practitioner accounts.

### How often is the data updated?

The dataset is periodically updated as new research becomes available. The current dataset covers 2023 through 2026.

### Can I contribute data?

Yes. Use the **"+ Suggest a Source"** button on the Data Sources page to submit new evidence. When Firebase is configured, submissions are shared across all users.

### What do negative impact percentages mean?

Negative values indicate that AI tools were found to **decrease** productivity in certain contexts — for example, when AI-generated code increases review burden, when senior developers on complex tasks are slowed by AI suggestions, or when AI introduces subtle bugs that take longer to debug.

### Is the ROI calculator accurate?

The calculator provides **estimates** based on aggregated research data. The three-scenario approach (pessimistic/realistic/optimistic) gives a range rather than a single point estimate. Actual results depend on team composition, tools used, task complexity, and adoption maturity.

### Why does Dev have a 40% weight?

Phase weights reflect the typical distribution of effort in a software development lifecycle. Development (code writing, implementation, code review) typically consumes the largest share of total effort. These weights can be adjusted in the source code at `src/lib/mock-data.ts`.

### What's the difference between "Early AI" and "Agentic" eras?

- **Early AI (≤2024):** The era of code completion tools (GitHub Copilot, ChatGPT) — AI assists with individual tasks
- **Agentic AI (2025+):** The era of autonomous AI agents that can handle multi-step workflows, plan implementations, and work across the full SDLC

### How is the "Suggest Feature" speech-to-text implemented?

It uses the browser's built-in [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) (`SpeechRecognition` / `webkitSpeechRecognition`). No audio is sent to external servers by the application — the browser handles transcription locally or via its own services.

### Can I use this for my organization's business case?

Yes. The ROI Calculator is designed for building business cases. Adjust the input parameters (team size, salary, budget, bottleneck phases) to match your organization. The default salary levels are calibrated for the Finnish market but can be changed to any value.

---

*Generated for SDLC AI-Impact Analyzer — last updated February 2026*
