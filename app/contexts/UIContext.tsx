'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Definierar typen för kontextens värde
interface UIContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isChatOpen: boolean; // <-- TILLAGD
  toggleChat: () => void; // <-- TILLAGD
}

// Skapar kontexten
const UIContext = createContext<UIContextType | undefined>(undefined);

// Props för UIProvider-komponenten
interface UIProviderProps {
  children: ReactNode;
}

// =================================================================================
// UI CONTEXT V2.0 - MED CHATT-LOGIK
// REVIDERING: Lade till isChatOpen och toggleChat för att hantera synligheten
// av chatt-komponenten. Detta var en kritisk saknad del.
// =================================================================================
export function UIProvider({ children }: UIProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false); // <-- TILLAGD

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleChat = () => { // <-- TILLAGD
    setChatOpen(prev => !prev);
  };

  return (
    <UIContext.Provider value={{ isSidebarOpen, toggleSidebar, isChatOpen, toggleChat }}>
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
