
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { CogIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { User } from '@/types';
import Popover from '@/components/shared/Popover';

const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const wipPopoverContent = (
  <div className="text-sm text-text-secondary">
    Denna funktion är under utveckling.
  </div>
);

interface UserMenuProps {
  user: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isClient, setIsClient] = useState(false);

  // Denna effekt körs bara på klienten, efter den initiala renderingen.
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  // Rendera ingenting på servern för att undvika hydration-fel.
  // Komponenten dyker upp på klienten när isClient blir true.
  if (!isClient) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm border-2 border-border-primary cursor-pointer overflow-hidden">
        {user.image ? (
          <Image 
            src={user.image} 
            alt="Profilbild" 
            width={40} 
            height={40} 
            className="rounded-full" 
          />
        ) : (
          getInitials(user.name)
        )}
      </div>
      
      <div className="absolute right-0 w-56 bg-background-secondary border border-border-primary rounded-md shadow-lg z-50 hidden group-hover:block transition-all duration-300 origin-top-right animate-in fade-in-0 zoom-in-95 pt-2">
        <div className="px-4 py-3 border-b border-border-primary">
          <p className="text-sm font-semibold text-text-primary truncate">{user.name || "Användare"}</p>
          <p className="text-xs text-text-secondary truncate">{user.email}</p>
        </div>
        <div className="py-1.5">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
            <CogIcon className="h-5 w-5" />
            Inställningar
          </Link>
          <Popover content={wipPopoverContent} trigger={
            <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
              <UserCircleIcon className="h-5 w-5" />
              Min Profil
            </button>
          } />
        </div>
        <div className="py-1.5 border-t border-border-primary">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-status-danger hover:bg-status-danger/20"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logga ut
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
