import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NavigationDesign = 'current' | 'tabs-in-header' | 'pill-buttons' | 'sidebar' | 'dropdown';

interface NavigationDesignContextType {
  design: NavigationDesign;
  setDesign: (design: NavigationDesign) => void;
}

const NavigationDesignContext = createContext<NavigationDesignContextType | undefined>(undefined);

export function NavigationDesignProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<NavigationDesign>('current');

  return (
    <NavigationDesignContext.Provider value={{ design, setDesign }}>
      {children}
    </NavigationDesignContext.Provider>
  );
}

export function useNavigationDesign() {
  const context = useContext(NavigationDesignContext);
  if (context === undefined) {
    throw new Error('useNavigationDesign must be used within a NavigationDesignProvider');
  }
  return context;
}