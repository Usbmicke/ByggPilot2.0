
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface TourStep {
  element: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
    {
        element: '#tour-step-1-welcome',
        title: 'Välkommen till din Översikt!',
        content: 'Det här är din kommandocentral. Just nu är det tomt, så det bästa stället att börja är att skapa ditt första projekt.',
        position: 'bottom'
      },
      {
        element: '#tour-step-2-projects',
        title: 'Projektlistan',
        content: 'Här kommer alla dina projekt att listas. Du får en snabb överblick av status, ekonomi och kommande händelser för varje uppdrag.',
        position: 'right'
      },
      {
        element: '#tour-step-3-customers',
        title: 'Kundregister',
        content: 'Här samlas alla dina kundkontakter automatiskt när du skapar projekt och offerter. Du slipper ha dem på olika ställen.',
        position: 'right'
      },
      {
        element: '#tour-step-4-chat',
        title: 'Alltid till din tjänst',
        content: 'Och här är jag! Fråga mig om vad som helst – skapa en offert, sammanfatta ett projekt, eller kolla en kunds historik. Jag finns här för att hjälpa dig.',
        position: 'top'
      },
];

export default function GuidedTour() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchParams.get('tour') === 'true') {
      setIsActive(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      const targetElement = document.querySelector(step.element) as HTMLElement;

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        const updatePosition = () => {
            const targetRect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltipRef.current?.getBoundingClientRect();
            const offset = 15; // Mellanrum mellan spotlight och tooltip

            setSpotlightStyle({
                width: targetRect.width + 20,
                height: targetRect.height + 20,
                top: targetRect.top - 10,
                left: targetRect.left - 10,
            });

            let newTooltipStyle: React.CSSProperties = {};
            if (tooltipRect) {
                switch (step.position) {
                    case 'bottom':
                        newTooltipStyle = { top: targetRect.bottom + offset, left: targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2) };
                        break;
                    case 'top':
                        newTooltipStyle = { top: targetRect.top - tooltipRect.height - offset, left: targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2) };
                        break;
                    case 'right':
                        newTooltipStyle = { top: targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2), left: targetRect.right + offset };
                        break;
                    case 'left':
                        newTooltipStyle = { top: targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2), left: targetRect.left - tooltipRect.width - offset };
                        break;
                }
            }
            setTooltipStyle(newTooltipStyle);
        }

        // Kör först för att sätta en position, sedan igen efter en fördröjning för att justera om sidan scrollat.
        updatePosition();
        setTimeout(updatePosition, 500); 

      }
    }
  }, [currentStep, isActive]);

  const handleNext = () => (currentStep < tourSteps.length - 1) ? setCurrentStep(currentStep + 1) : handleEndTour();

  const handleEndTour = () => {
    setIsActive(false);
    router.replace('/dashboard', { scroll: false });
  };

  if (!isActive || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[200]" onClick={handleEndTour}>
      <div className="fixed inset-0 bg-black/80 animate-fade-in"></div>
      <div 
        className="absolute bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] border-2 border-dashed border-cyan-400 transition-all duration-500 ease-in-out z-10"
        style={spotlightStyle}
      ></div>
      <div 
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()} // Förhindra att klick på tooltipen stänger touren
        className="absolute z-20 bg-gray-800 border border-gray-600 p-5 rounded-lg shadow-2xl max-w-sm animate-fade-in-up transition-all duration-500 ease-in-out"
        style={tooltipStyle}
      >
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-gray-300 text-base">{step.content}</p>
        <div className="flex justify-between items-center mt-5">
            <p className="text-sm text-gray-500">{currentStep + 1} / {tourSteps.length}</p>
            <div className="flex items-center gap-3">
                <button onClick={handleEndTour} className="text-sm text-gray-400 hover:text-white transition-colors">Hoppa över</button>
                <button onClick={handleNext} className="bg-cyan-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-cyan-500 transition-colors">
                {currentStep === tourSteps.length - 1 ? 'Klart! Då kör vi' : 'Nästa'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
