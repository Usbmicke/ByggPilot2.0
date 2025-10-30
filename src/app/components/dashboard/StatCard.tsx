
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  className?: string;
}

// StatCard: Enkel, mörk och anpassningsbar för att visa nyckeltal.
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, className }) => {
  return (
    <div className={twMerge("bg-zinc-800/70 p-4 rounded-lg flex items-center gap-4 border border-zinc-700/80", className)}>
      
      {/* Ikonen renderas direkt, utan den extra boxen. */}
      <div className="flex-shrink-0">
        {icon}
      </div>
      
      {/* Textinnehåll med korrekt typografi från designen */}
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
