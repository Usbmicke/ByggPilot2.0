
'use client';

import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // **STEG 1: State för att spåra om komponenten är monterad på klienten**
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // När komponenten monteras, sätt hasMounted till true
    setHasMounted(true);

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // **STEG 2: Rendera ingenting på servern eller under första klient-rendreringen**
  if (!hasMounted) {
    // Detta förhindrar hydration mismatch. 
    // Du kan returnera en statisk placeholder här om du vill undvika "pop-in".
    return null; 
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
    });
  };

  const formatDate = (date: Date): { dayName: string; fullDate: string } => {
    const dayName = date.toLocaleDateString('sv-SE', { weekday: 'long' });
    const fullDate = date.toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
    return { 
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        fullDate 
    };
  };

  const { dayName, fullDate } = formatDate(currentTime);
  const timeString = formatTime(currentTime);

  return (
    <div className="flex items-center gap-3 text-text-primary pr-4">
      <div className="text-right hidden sm:block">
        <p className="font-semibold text-sm leading-tight">{dayName}</p>
        <p className="text-xs text-text-secondary leading-tight">{fullDate}</p>
      </div>
      <div className="font-mono bg-background-primary text-lg rounded-md px-2 py-1 border border-border-primary hidden md:block">
        {timeString}
      </div>
    </div>
  );
};

export default Clock;
