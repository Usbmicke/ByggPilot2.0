
'use client';

import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

// Definierar typen för ett enskilt förslag
export interface ActionSuggestion {
  label: string; // Texten på knappen, t.ex. "Skapa nytt projekt?"
  action: () => void; // Funktionen som körs när man klickar
}

interface SuggestedActionsProps {
  suggestions: ActionSuggestion[];
}

// Denna komponent renderar en lista med klickbara förslag från AI:n.
const SuggestedActions: React.FC<SuggestedActionsProps> = ({ suggestions }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-2 pt-1">
        <div className="flex items-center gap-2 mb-2">
            <LightBulbIcon className="h-5 w-5 text-yellow-500" />
            <h4 className="text-sm font-semibold text-text-secondary">Förslag:</h4>
        </div>
        <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
            <button
            key={index}
            onClick={suggestion.action}
            className="px-3 py-1.5 text-sm bg-background-tertiary border border-border-primary rounded-full hover:bg-border-primary hover:border-border-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
            {suggestion.label}
            </button>
        ))}
        </div>
    </div>
  );
};

export default SuggestedActions;

