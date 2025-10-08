
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTour } from '@/hooks/useTour';

const TourStep: React.FC = () => {
  const { isTourActive, currentStep, steps, nextStep, stopTour } = useTour();
  const [position, setPosition] = useState({});
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isTourActive) {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target) as HTMLElement;

      if (targetElement) {
        targetRef.current = targetElement;
        const rect = targetElement.getBoundingClientRect();
        
        // Highlight the target element
        targetElement.style.zIndex = '10001';
        targetElement.style.position = 'relative';

        // Calculate position for the popover
        const popoverPosition = {
          top: rect.bottom + 10,
          left: rect.left,
        };
        setPosition(popoverPosition);

        // Scroll to the element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (targetRef.current) {
        // Cleanup styles when tour ends
        targetRef.current.style.zIndex = '';
        targetRef.current.style.position = '';
    }

    // Cleanup on unmount
    return () => {
      if (targetRef.current) {
        targetRef.current.style.zIndex = '';
        targetRef.current.style.position = '';
      }
    };
  }, [isTourActive, currentStep, steps]);

  if (!isTourActive) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" onClick={stopTour}>
        <div 
            style={position} 
            className="absolute bg-white text-black p-4 rounded-lg shadow-lg max-w-sm animate-in fade-in-0 zoom-in-95"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the popover
        >
            <div>{step.content}</div>
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">{currentStep + 1} / {steps.length}</span>
                <button 
                    onClick={nextStep}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {currentStep === steps.length - 1 ? 'Slutför' : 'Nästa'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default TourStep;
