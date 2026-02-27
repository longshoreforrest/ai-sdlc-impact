'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ScenarioConfigs, ScenarioType, DataType } from '@/lib/types';

const ALL_DATA_TYPES: DataType[] = ['empirical', 'survey', 'vendor', 'anecdotal'];

const DEFAULT_CONFIGS: ScenarioConfigs = {
  pessimistic: { years: [2023, 2024], dataTypes: [...ALL_DATA_TYPES] },
  realistic: { years: [2023, 2024, 2025, 2026], dataTypes: [...ALL_DATA_TYPES] },
  optimistic: { years: [2025, 2026], dataTypes: [...ALL_DATA_TYPES] },
  metrConfig: { enabled: true, doublingPeriodMonths: 4, futureOffsetMonths: 12 },
};

interface ScenarioContextValue {
  configs: ScenarioConfigs;
  activeScenario: ScenarioType | null;
  setConfigs: (configs: ScenarioConfigs) => void;
  setActiveScenario: (scenario: ScenarioType | null) => void;
  resetToDefaults: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

const STORAGE_KEY = 'scenario-configs';

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigsState] = useState<ScenarioConfigs>(DEFAULT_CONFIGS);
  const [activeScenario, setActiveScenarioState] = useState<ScenarioType | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ScenarioConfigs;
        // Validate structure has required fields
        if (parsed.pessimistic?.years && parsed.realistic?.years && parsed.optimistic?.years && parsed.metrConfig) {
          // Ensure dataTypes exist (migration from older format)
          if (!parsed.pessimistic.dataTypes) parsed.pessimistic.dataTypes = [...ALL_DATA_TYPES];
          if (!parsed.realistic.dataTypes) parsed.realistic.dataTypes = [...ALL_DATA_TYPES];
          if (!parsed.optimistic.dataTypes) parsed.optimistic.dataTypes = [...ALL_DATA_TYPES];
          setConfigsState(parsed);
        }
      }
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  const setConfigs = useCallback((newConfigs: ScenarioConfigs) => {
    setConfigsState(newConfigs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
  }, []);

  const setActiveScenario = useCallback((scenario: ScenarioType | null) => {
    setActiveScenarioState(scenario);
  }, []);

  const resetToDefaults = useCallback(() => {
    setConfigsState(DEFAULT_CONFIGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIGS));
  }, []);

  return (
    <ScenarioContext.Provider value={{ configs, activeScenario, setConfigs, setActiveScenario, resetToDefaults }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider');
  return ctx;
}
