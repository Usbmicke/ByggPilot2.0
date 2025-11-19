
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// =======================================================================
//  STATISTIKKORT (VERSION 4.0 - DYNAMISKA INSIKTER)
//  Designad för att ge en "Wow-faktor" med visuella jämförelsedata.
// =======================================================================

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  comparison?: {
    value: string; // t.ex. "15%"
    direction: 'up' | 'down'; // Bestämmer pil och färg
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, comparison, className }) => {
  const isUp = comparison?.direction === 'up';

  return (
    <div className={twMerge(
      `bg-[#1C1C1E] border border-neutral-800/50 p-5 rounded-lg transition-all duration-200 ease-in-out`,
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-neutral-400">{title}</p>
        <div className="text-neutral-500">{icon}</div>
      </div>
      
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {comparison && (
          <div className={`flex items-center text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
            <span>{comparison.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
