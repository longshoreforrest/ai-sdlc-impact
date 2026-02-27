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

export interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'nice-to-have' | 'important' | 'critical';
  status: FeatureStatus;
  createdAt: string;
  implementedAt?: string;
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

function applyImplementedOverrides(suggestions: FeatureSuggestion[]): FeatureSuggestion[] {
  return suggestions.map((s) => {
    const implementedAt = IMPLEMENTED_FEATURES[s.title];
    if (implementedAt) {
      return { ...s, status: 'accepted', implementedAt };
    }
    return s;
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
