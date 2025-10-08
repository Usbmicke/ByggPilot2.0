
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TourStep {
  target: string; // CSS-väljare för elementet som ska highlightas
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  isTourActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = (tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTour();
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    setCurrentStep(0);
    setSteps([]);
  };

  const value = {
    isTourActive,
    currentStep,
    steps,
    startTour,
    nextStep,
    stopTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {/* Här kommer vi senare att rendera själva tour-komponenten */}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
