import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'table' | 'hybrid';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
}

// Storage key for view mode persistence
const VIEW_MODE_STORAGE_KEY = 'calculator-view-mode';

export function ViewModeProvider({ children }: ViewModeProviderProps) {
  // Initialize from localStorage or default to 'table'
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      console.log('ViewMode initialized from localStorage:', stored);
      return (stored === 'table' || stored === 'hybrid') ? stored : 'table';
    }
    return 'table';
  });
  
  // Persist view mode to localStorage whenever it changes
  const setViewMode = (mode: ViewMode) => {
    console.log('ViewMode changing from', viewMode, 'to', mode);
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
      console.log('ViewMode saved to localStorage:', mode);
    }
  };
  
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}