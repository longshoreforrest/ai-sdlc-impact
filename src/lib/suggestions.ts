import { Phase, DataType } from './types';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';

export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'postponed';

export interface SourceSuggestion {
  id: string;
  url: string;
  name?: string;
  description?: string;
  phase?: Phase;
  dataType?: DataType;
  impactPct?: number;
  year?: number;
  sampleSize?: string;
  status: SuggestionStatus;
  linkedSourceId?: string;
  createdAt: string;
}

export type FeatureStatus = SuggestionStatus;

export type AgentVerdict = 'implement' | 'defer' | 'reject' | 'needs-clarification';

export interface AgentAnalysis {
  userStory: string;
  alignmentAnalysis: string;
  verdict: AgentVerdict;
  verdictReason: string;
  analyzedAt: string;
}

export interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'nice-to-have' | 'important' | 'critical';
  submitterName?: string;
  status: FeatureStatus;
  createdAt: string;
  implementedAt?: string;
  agentAnalysis?: AgentAnalysis;
}

export interface SourceComment {
  id: string;
  sourceName: string;
  comment: string;
  authorName?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// localStorage helpers (offline fallback + instant reads)
// ---------------------------------------------------------------------------
const SOURCE_KEY = 'source-suggestions';
const FEATURE_KEY = 'feature-suggestions';
const SOURCE_COMMENTS_KEY = 'source-comments';

function readLocal<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Check whether Firebase is configured (env vars present)
// ---------------------------------------------------------------------------
function isFirebaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

// ---------------------------------------------------------------------------
// Source Suggestions
// ---------------------------------------------------------------------------
export function getSourceSuggestions(): SourceSuggestion[] {
  return readLocal<SourceSuggestion>(SOURCE_KEY);
}

export async function fetchSourceSuggestions(): Promise<SourceSuggestion[]> {
  if (!isFirebaseConfigured()) return getSourceSuggestions();
  try {
    const q = query(collection(db, 'source-suggestions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        status: data.status || 'pending',
      } as SourceSuggestion;
    });
    writeLocal(SOURCE_KEY, results);
    return results;
  } catch {
    return getSourceSuggestions();
  }
}

export async function addSourceSuggestion(
  s: Omit<SourceSuggestion, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const entry: SourceSuggestion = { ...s, id, createdAt, status: 'pending' };

  // Always write to localStorage for instant feedback
  const all = getSourceSuggestions();
  all.unshift(entry);
  writeLocal(SOURCE_KEY, all);

  // Persist to Firestore if configured
  if (isFirebaseConfigured()) {
    try {
      await addDoc(collection(db, 'source-suggestions'), {
        ...s,
        localId: id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firebase write failed, suggestion saved locally:', err);
    }
  }
}

export async function updateSourceSuggestionStatus(
  id: string,
  status: SuggestionStatus,
  linkedSourceId?: string
): Promise<void> {
  const all = getSourceSuggestions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;

  all[idx].status = status;
  if (status === 'accepted' && linkedSourceId) {
    all[idx].linkedSourceId = linkedSourceId;
  } else {
    delete all[idx].linkedSourceId;
  }

  writeLocal(SOURCE_KEY, all);

  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'source-suggestions'),
        where('localId', '==', id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = doc(db, 'source-suggestions', snapshot.docs[0].id);
        const update: Record<string, unknown> = { status };
        if (status === 'accepted' && linkedSourceId) {
          update.linkedSourceId = linkedSourceId;
        } else {
          update.linkedSourceId = null;
        }
        await updateDoc(docRef, update);
      }
    } catch (err) {
      console.warn('Firebase source status update failed, saved locally:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Implemented features registry
// When a feature request is implemented, add its title here so the status
// is reflected regardless of Firestore write permissions or localStorage state.
// ---------------------------------------------------------------------------
const IMPLEMENTED_FEATURES: Record<string, string> = {
  'ROI sliders': '2026-02-26T18:31:00.000Z',
  'Comments to data sources': '2026-02-28T12:00:00.000Z',
  'Mobile device look and feel': '2026-02-28T18:00:00.000Z',
};

// Feature requests to hide from the UI (e.g. test entries that can't be deleted from Firestore)
const HIDDEN_FEATURES = new Set([
  'Firebase connectivity test',
]);

// ---------------------------------------------------------------------------
// Agent analyses registry
// When an agent analyses a feature request, the result is stored here so it
// is displayed regardless of Firestore / localStorage state.
// ---------------------------------------------------------------------------
const AGENT_ANALYSES: Record<string, AgentAnalysis> = {
  'Comments to data sources': {
    userStory: 'As a domain expert reviewing the evidence library, I want to comment on individual data sources to flag potential inaccuracies, outdated figures, or missing context so that other users benefit from my knowledge without needing to submit a formal correction.\n\nAs a practitioner evaluating sources for a business case, I want to see community feedback on each source so I can gauge how reliable and relevant a data point is before including it in my analysis.\n\nAs a casual visitor exploring the tool, I want to leave a quick comment with an optional nickname so I can contribute feedback without creating an account or going through a formal process.',
    alignmentAnalysis: 'System alignment: HIGH. The SDLC AI-Impact Analyzer is built around curated evidence. Allowing users to comment on individual sources strengthens the evidence trust layer by enabling crowd-sourced quality signals — flagging outdated numbers, adding corroborating context, or noting methodological concerns. This directly serves the mission of helping organisations make data-driven AI adoption decisions.\n\nFit with current architecture: GOOD. The application already uses Firestore for source suggestions and feature requests with localStorage fallback. A source-comments collection follows the identical pattern (addDoc + getDocs + query + orderBy + localStorage sync). The sources page already has expandable cards where comments slot naturally below the facts list. No new dependencies or infrastructure required.\n\nRisk assessment: LOW. Comments are additive and do not alter the underlying dataset, calculations, or any other page. The feature is self-contained within the sources page and the suggestions data layer.',
    verdict: 'implement',
    verdictReason: 'Strengthens the data quality feedback loop by enabling users to flag inaccuracies, add context, and validate sources. Follows the established Firestore + localStorage pattern with moderate implementation effort. The optional name field keeps the barrier to entry low. The feature has been implemented as of 2026-02-28.',
    analyzedAt: '2026-02-28T10:00:00.000Z',
  },
  'Mobile device look and feel': {
    userStory: 'As a mobile user reviewing AI impact data during a meeting or on the go, I want the application to adapt its layout to my phone or tablet screen so that I can browse dashboards, check ROI results, and review data sources without horizontal scrolling or unusable layouts.\n\nAs a presenter sharing the tool with stakeholders on varying screen sizes, I want the sidebar navigation to collapse into a hamburger menu on smaller screens so that the content area gets the full viewport width.\n\nAs a casual visitor discovering the tool on a mobile device, I want charts, cards, and grids to stack vertically and remain readable so that I get the same informational value as desktop users without needing to pinch-zoom or scroll sideways.',
    alignmentAnalysis: 'System alignment: HIGH. The SDLC AI-Impact Analyzer aims to help organisations make data-driven AI adoption decisions. Mobile accessibility directly expands the audience to decision-makers who review data on phones during commutes, in meetings, or away from their desks. A tool that is desktop-only limits its own reach and utility.\n\nFit with current architecture: EXCELLENT. The application uses Tailwind CSS v4, which has built-in responsive utility classes (sm:, md:, lg:, xl:). The fix requires adding responsive prefixes to existing class names — no new dependencies, no architectural changes, and no data model modifications. The sidebar, layout, grids, and slide-over panels all need responsive breakpoints that Tailwind already provides.\n\nAudit findings: The current codebase has 20+ instances of fixed-column grids without responsive breakpoints, a permanently visible 256px sidebar, a hardcoded ml-64 main margin, and slide-over panels (384px) that overflow mobile viewports. None of these patterns use Tailwind responsive prefixes below the md: breakpoint.\n\nRisk assessment: LOW-MEDIUM. Changes touch the global layout (layout.tsx, Sidebar.tsx) and many page/component grids. However, all changes are purely CSS/layout — no business logic, data, calculations, or Firestore integration is affected. Desktop behaviour is preserved via responsive breakpoints (changes only activate below specific screen widths).',
    verdict: 'implement',
    verdictReason: 'Mobile responsiveness is a fundamental accessibility requirement for modern web applications. The audit identified 20+ non-responsive layout patterns across the codebase. The fix is purely CSS-based using Tailwind responsive utilities — no new dependencies needed. The sidebar gets a hamburger menu for mobile, grids stack on small screens, and side panels go full-width on phones. Desktop layout is completely unchanged. The feature has been implemented as of 2026-02-28.',
    analyzedAt: '2026-02-28T17:00:00.000Z',
  },
  'ROI sliders': {
    userStory: 'As a user exploring AI investment scenarios, I want the three core financial inputs — "Average Annual Salary (EUR)", "Working Hours / Year", and "IT Budget (EUR / year)" — to be interactive sliders instead of plain number fields, so that I can rapidly drag values and see ROI results update in real time without needing to type precise numbers.\n\nAs a consultant or executive in a meeting, I want meaningful default ranges on each slider (e.g. IT budget from 0.1M to 500M EUR) so that the controls reflect realistic organisational scales and prevent nonsensical inputs.\n\nThe core intent is to lower the interaction cost of the ROI Calculator: replacing keyboard-dependent number inputs with tactile, visual sliders that invite exploration and make "what-if" analysis feel immediate.',
    alignmentAnalysis: 'System alignment: HIGH. The SDLC AI-Impact Analyzer exists to help organisations build data-driven business cases for AI adoption. The ROI Calculator is the most business-critical page — it is where financial parameters are set and results are communicated to decision-makers. Making its inputs more interactive directly serves this mission by lowering the barrier for non-technical stakeholders (CEOs, CFOs, board members) who need quick parameter exploration.\n\nFit with current architecture: EXCELLENT. The calculator page already manages team size, salary, budget, phase weights, inhouse ratios, and transformation costs as React state. The real-time recalculation pipeline can accept slider values with no structural changes. The transformation costs section already uses range-style inputs, so sliders would be a natural extension of the existing UI pattern.\n\nRisk assessment: LOW. This is a pure UI enhancement — sliders do not alter calculation logic, the data model, report generation, or any downstream system. The change is additive, backward-compatible, and easily reversible.',
    verdict: 'implement',
    verdictReason: 'The request targets the three most impactful financial inputs on the application\'s core page. Sliders with meaningful ranges (salary: 20k–150k EUR, hours: 1000–2080, IT budget: 0.1M–500M EUR) directly improve usability for the target audience. The implementation is low-risk and fits naturally into the existing architecture. The feature has been implemented as of 2026-02-26.',
    analyzedAt: '2026-02-27T10:00:00.000Z',
  },
};

function applyImplementedOverrides(suggestions: FeatureSuggestion[]): FeatureSuggestion[] {
  return suggestions.filter((s) => !HIDDEN_FEATURES.has(s.title)).map((s) => {
    const implementedAt = IMPLEMENTED_FEATURES[s.title];
    const agentAnalysis = AGENT_ANALYSES[s.title];
    const overrides: Partial<FeatureSuggestion> = {};
    if (implementedAt) {
      overrides.status = 'accepted';
      overrides.implementedAt = implementedAt;
    }
    if (agentAnalysis) {
      overrides.agentAnalysis = agentAnalysis;
    }
    return Object.keys(overrides).length > 0 ? { ...s, ...overrides } : s;
  });
}

// ---------------------------------------------------------------------------
// Feature Suggestions
// ---------------------------------------------------------------------------
export function getFeatureSuggestions(): FeatureSuggestion[] {
  return applyImplementedOverrides(readLocal<FeatureSuggestion>(FEATURE_KEY));
}

export async function fetchFeatureSuggestions(): Promise<FeatureSuggestion[]> {
  if (!isFirebaseConfigured()) return getFeatureSuggestions();
  try {
    const q = query(collection(db, 'feature-suggestions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        status: data.status || 'pending',
      } as FeatureSuggestion;
    });
    writeLocal(FEATURE_KEY, results);
    return applyImplementedOverrides(results);
  } catch {
    return getFeatureSuggestions();
  }
}

export async function addFeatureSuggestion(
  s: Omit<FeatureSuggestion, 'id' | 'createdAt' | 'status'>
): Promise<void> {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const entry: FeatureSuggestion = { ...s, id, createdAt, status: 'pending' };

  const all = getFeatureSuggestions();
  all.unshift(entry);
  writeLocal(FEATURE_KEY, all);

  if (isFirebaseConfigured()) {
    try {
      await addDoc(collection(db, 'feature-suggestions'), {
        ...s,
        localId: id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firebase write failed, suggestion saved locally:', err);
    }
  }
}

export async function updateFeatureSuggestionStatus(
  id: string,
  status: FeatureStatus
): Promise<void> {
  const all = getFeatureSuggestions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;

  const implementedAt = status === 'accepted' ? new Date().toISOString() : undefined;

  all[idx].status = status;
  if (implementedAt) {
    all[idx].implementedAt = implementedAt;
  } else {
    delete all[idx].implementedAt;
  }

  writeLocal(FEATURE_KEY, all);

  // Persist to Firestore if configured
  if (isFirebaseConfigured()) {
    try {
      // Find the Firestore doc by the localId field written during creation
      const q = query(
        collection(db, 'feature-suggestions'),
        where('localId', '==', id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = doc(db, 'feature-suggestions', snapshot.docs[0].id);
        const update: Record<string, unknown> = { status };
        if (implementedAt) {
          update.implementedAt = implementedAt;
        } else {
          update.implementedAt = null;
        }
        await updateDoc(docRef, update);
      }
    } catch (err) {
      console.warn('Firebase status update failed, saved locally:', err);
    }
  }
}

// ---------------------------------------------------------------------------
// Source Comments
// ---------------------------------------------------------------------------
export function getSourceComments(sourceName: string): SourceComment[] {
  return readLocal<SourceComment>(SOURCE_COMMENTS_KEY).filter(
    (c) => c.sourceName === sourceName
  );
}

export async function fetchSourceComments(sourceName: string): Promise<SourceComment[]> {
  if (!isFirebaseConfigured()) return getSourceComments(sourceName);
  try {
    const q = query(
      collection(db, 'source-comments'),
      where('sourceName', '==', sourceName),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data } as SourceComment;
    });
    // Merge into localStorage (keep comments for other sources intact)
    const all = readLocal<SourceComment>(SOURCE_COMMENTS_KEY).filter(
      (c) => c.sourceName !== sourceName
    );
    writeLocal(SOURCE_COMMENTS_KEY, [...results, ...all]);
    return results;
  } catch {
    return getSourceComments(sourceName);
  }
}

export async function addSourceComment(
  sourceName: string,
  comment: string,
  authorName?: string
): Promise<SourceComment> {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const entry: SourceComment = {
    id,
    sourceName,
    comment,
    ...(authorName ? { authorName } : {}),
    createdAt,
  };

  const all = readLocal<SourceComment>(SOURCE_COMMENTS_KEY);
  all.unshift(entry);
  writeLocal(SOURCE_COMMENTS_KEY, all);

  if (isFirebaseConfigured()) {
    try {
      await addDoc(collection(db, 'source-comments'), {
        localId: id,
        sourceName,
        comment,
        ...(authorName ? { authorName } : {}),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firebase write failed, comment saved locally:', err);
    }
  }

  return entry;
}
