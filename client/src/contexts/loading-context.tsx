import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingOperations: Set<string>;
  startLoading: (operationId: string) => void;
  stopLoading: (operationId: string) => void;
  setGlobalLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());
  const [globalLoading, setGlobalLoading] = useState(false);

  const startLoading = useCallback((operationId: string) => {
    setLoadingOperations(prev => new Set(prev).add(operationId));
  }, []);

  const stopLoading = useCallback((operationId: string) => {
    setLoadingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  }, []);

  const isLoading = loadingOperations.size > 0 || globalLoading;

  const value: LoadingContextType = {
    isLoading,
    loadingOperations,
    startLoading,
    stopLoading,
    setGlobalLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}