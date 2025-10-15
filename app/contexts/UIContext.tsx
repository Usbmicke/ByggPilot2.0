
// Fil: app/contexts/UIContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Definierar typen för kontextens värde
interface UIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Skapar kontexten
const UIContext = createContext<UIContextType | undefined>(undefined);

// Props för UIProvider-komponenten
interface UIProviderProps {
  children: ReactNode;
}

// =================================================================================
// GULDSTANDARD - UI CONTEXT V1.0
// ARKITEKTUR: En enkel, säker och robust implementation för att hantera globala
// UI-tillstånd. Denna första version hanterar endast sidomenyns synlighet.
// Innehåller ingen komplex logik eller useEffects för att undvika de
// oändliga loopar vi såg tidigare.
// =================================================================================
export function UIProvider({ children }: UIProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <UIContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
}

// Custom hook för att enkelt använda UIContext
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI måste användas inom en UIProvider');
  }
  return context;
}
