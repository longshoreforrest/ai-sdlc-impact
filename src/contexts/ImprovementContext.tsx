'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ── Page labels ──
const PAGE_LABELS: Record<string, string> = {
  '/welcome': 'Welcome',
  '/analytics': 'Source and Fact Analytics',
  '/dashboard': 'SDLC Analytics',
  '/ai-tools': 'AI Tools — Comparison',
  '/tools': 'Tool Calculator',
  '/calculator': 'ROI Calculator',
  '/report': 'Business Case Report',
  '/sources': 'Sources and Facts',
  '/from-users': 'From Users',
  '/help': 'Help & Documentation',
};

export function getPageLabel(pathname: string): string {
  return PAGE_LABELS[pathname] || pathname;
}

export const ALL_PAGE_LABELS = PAGE_LABELS;

// ── Pin type ──
export interface Pin {
  id: string;
  label: string;
  value?: string;
  path: string; // page label at time of pin
  timestamp: number;
}

// ── Context type ──
interface ImprovementContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  navigationPath: string;
  setNavigationPath: (path: string) => void;
  pins: Pin[];
  addPin: (label: string, value?: string) => void;
  removePin: (id: string) => void;
  clearPins: () => void;
  isPinMode: boolean; // true when panel is open — enables click-to-pin
}

const ImprovementContext = createContext<ImprovementContextType | null>(null);

export function useImprovement() {
  const ctx = useContext(ImprovementContext);
  if (!ctx) throw new Error('useImprovement must be used within ImprovementProvider');
  return ctx;
}

export function ImprovementProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState(() => getPageLabel(pathname));
  const [pins, setPins] = useState<Pin[]>([]);
  const prevPathname = useRef(pathname);

  // Auto-update navigation path when user navigates (only if unchanged from previous auto-value)
  useEffect(() => {
    const prevLabel = getPageLabel(prevPathname.current);
    const newLabel = getPageLabel(pathname);
    prevPathname.current = pathname;

    // Only auto-update if the user hasn't manually edited the path
    setNavigationPath((current) => {
      if (current === prevLabel || current === '') {
        return newLabel;
      }
      return current;
    });
  }, [pathname]);

  const open = useCallback(() => {
    setNavigationPath(getPageLabel(pathname));
    setIsOpen(true);
  }, [pathname]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setNavigationPath(getPageLabel(pathname));
      }
      return !prev;
    });
  }, [pathname]);

  const addPin = useCallback((label: string, value?: string) => {
    setPins((prev) => {
      // Avoid duplicate pins with same label+value
      const exists = prev.some((p) => p.label === label && p.value === value);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          label,
          value,
          path: getPageLabel(pathname),
          timestamp: Date.now(),
        },
      ];
    });
  }, [pathname]);

  const removePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearPins = useCallback(() => setPins([]), []);

  return (
    <ImprovementContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        navigationPath,
        setNavigationPath,
        pins,
        addPin,
        removePin,
        clearPins,
        isPinMode: isOpen,
      }}
    >
      {children}
    </ImprovementContext.Provider>
  );
}
