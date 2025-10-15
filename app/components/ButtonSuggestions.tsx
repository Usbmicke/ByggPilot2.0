
'use client';

import React from 'react';

// =================================================================================
// BUTTON SUGGESTIONS V4.0 - ABSOLUT REN KOD
// REVIDERING: All tidigare korruption är borta. Detta är den slutgiltiga,
// rena och fungerande versionen.
// =================================================================================

interface ButtonSuggestionsProps {
  text: string;
  onClick: (suggestion: string) => void;
}

const ButtonSuggestions: React.FC<ButtonSuggestionsProps> = ({ text, onClick }) => {
  const regex = /\\\[(.*?)\\]/g;
  const parts = text.split(regex);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {parts.map((part, index) => {
        if (index % 2 === 1) { 
          return (
            <button
              key={index}
              onClick={() => onClick(part)}
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors duration-200"
            >
              {part}
            </button>
          );
        }
        return null;
      })}
    </div>
  );
};

export default ButtonSuggestions;
