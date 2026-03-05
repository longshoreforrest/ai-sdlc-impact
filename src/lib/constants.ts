import type { Phase, DataType, ScenarioType } from './types';
import type { TranslationKey } from './i18n/translations';

// ── Phase colors (shared across charts, flowchart, analytics) ──

export const PHASE_COLORS: Record<Phase, string> = {
  Discovery: '#f59e0b',
  Design: '#8b5cf6',
  Spec: '#06b6d4',
  Dev: '#3b82f6',
  QA: '#10b981',
  'Release & Ops': '#f97316',
};

// ── Scenario constants ──

export const SCENARIO_KEYS: ScenarioType[] = ['pessimistic', 'realistic', 'optimistic'];

export const SCENARIO_COLORS: Record<ScenarioType, string> = {
  pessimistic: '#ef4444',
  realistic: '#f59e0b',
  optimistic: '#10b981',
};

export const SCENARIO_LABEL_KEYS: Record<ScenarioType, TranslationKey> = {
  pessimistic: 'roi.pessimistic',
  realistic: 'roi.realistic',
  optimistic: 'roi.optimistic',
};

// ── Data type constants ──

export const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal', 'info'];

/** Data types that represent productivity evidence (used in scenario calculations) */
export const PRODUCTIVE_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

export const DATA_TYPE_COLORS: Record<DataType, string> = {
  empirical: '#10b981',
  survey: '#3b82f6',
  vendor: '#8b5cf6',
  anecdotal: '#f97316',
  info: '#a1a1aa',
};

export const DATA_TYPE_BADGE_COLORS: Record<DataType, string> = {
  empirical: 'bg-emerald-500/20 text-emerald-400',
  survey: 'bg-blue-500/20 text-blue-400',
  vendor: 'bg-purple-500/20 text-purple-400',
  anecdotal: 'bg-orange-500/20 text-orange-400',
  info: 'bg-zinc-500/20 text-zinc-400',
};

// ── Source category constants ──

export type SourceCategoryFilter = 'social-media' | 'scientific' | 'sap' | 'salesforce' | 'other';

export const ALL_SOURCE_CATEGORIES: SourceCategoryFilter[] = ['scientific', 'social-media', 'sap', 'salesforce', 'other'];

/** Default source categories for scenarios (SAP and Salesforce excluded) */
export const DEFAULT_SOURCE_CATEGORIES: SourceCategoryFilter[] = ['scientific', 'social-media', 'other'];

// ── Tooling cost ──

export const TOOLING_COST_PER_SEAT_MONTHLY = 20; // EUR per developer per month

// ── Era boundary ──

export const ERA_BOUNDARY_YEAR = 2024; // <= boundary is "early", > boundary is "agentic"
