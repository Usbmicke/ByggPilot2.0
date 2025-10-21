
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// =================================================================================
// UI CONTEXT (v1.0 - Återskapad)
// Denna kontext hanterar globala UI-tillstånd, som synligheten för en sidomeny.
// Återskapad för att lösa ett "Module not found"-fel efter en refaktorering.
// =================================================================================

interface UIContextType {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <UIContext.Provider value={{ isMenuOpen, toggleMenu }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
