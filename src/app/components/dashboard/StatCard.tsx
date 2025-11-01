import React from 'react';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  className?: string;
}

// StatCard V2 - "Clean UI" Edition
// Designad för att vara ren, modern och i linje med det nya designsystemet.
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, className }) => {
  return (
    <div className={twMerge(
      `bg-background-secondary p-6 rounded-xl 
       transition-all duration-200 ease-in-out 
       hover:-translate-y-1 hover:bg-background-tertiary`,
      className
    )}>
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-text-secondary">{title}</p>
        {/* Ikonen har redan sin färg från föräldern */}
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-4xl font-bold text-text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
