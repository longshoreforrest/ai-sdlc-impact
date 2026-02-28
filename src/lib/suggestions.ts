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

// ---------------------------------------------------------------------------
// localStorage helpers (offline fallback + instant reads)
// ---------------------------------------------------------------------------
const SOURCE_KEY = 'source-suggestions';
const FEATURE_KEY = 'feature-suggestions';

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
  'ROI sliders': {
    userStory: 'As a business decision-maker, I want to adjust ROI calculation parameters using interactive sliders so that I can quickly model different scenarios (team size, salary levels, budget allocation) without manually typing numbers, enabling faster "what-if" exploration during stakeholder meetings.\n\nAs a consultant preparing a client presentation, I want real-time visual feedback when adjusting cost parameters so that I can demonstrate the sensitivity of AI investment returns to different assumptions.\n\nThe core intent is to make the ROI Calculator more interactive and tactile — replacing static number inputs with dynamic sliders that update results in real time, lowering the barrier to experimentation.',
    alignmentAnalysis: 'System alignment: HIGH. The SDLC AI-Impact Analyzer\'s core purpose is to help organisations build data-driven business cases for AI tool adoption. Interactive sliders directly serve this mission by making the ROI Calculator more accessible to non-technical stakeholders (CEOs, CFOs, board members) who are the primary audience for business case decisions.\n\nFit with current architecture: EXCELLENT. The calculator page already has input parameters (team size, salary, budget, phase weights, inhouse ratios, transformation costs) that map naturally to slider controls. The existing React state management and real-time recalculation pipeline can accommodate slider inputs with minimal refactoring. The transformation costs section already uses slider-like range inputs for consulting/training/internal costs.\n\nRisk assessment: LOW. Sliders are a UI enhancement that doesn\'t alter the underlying calculation logic, data model, or report generation. The change is additive and backward-compatible.',
    verdict: 'implement',
    verdictReason: 'This feature directly improves the core user experience of the ROI Calculator — the application\'s most business-critical page. It aligns perfectly with the target audience (executives, consultants) who need quick parameter exploration. The technical implementation is straightforward given the existing architecture. The feature has been implemented as of 2026-02-26.',
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
