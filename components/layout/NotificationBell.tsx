
'use client';

import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import Popover from '@/components/shared/Popover';

// Popover-innehåll för funktioner under utveckling
const wipPopoverContent = (
  <div className="text-sm text-text-secondary p-2">
    Notifikationer är under utveckling.
  </div>
);

const NotificationBell: React.FC = () => {
  return (
    <Popover content={wipPopoverContent} trigger={
      <button className="p-2 rounded-full hover:bg-border-primary transition-colors text-text-secondary hover:text-text-primary relative group">
        <BellIcon className="h-6 w-6" />
        {/* Denna visuella indikator kan i framtiden styras av data */}
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red"></span>
        </span>
      </button>
    } />
  );
};

export default NotificationBell;
