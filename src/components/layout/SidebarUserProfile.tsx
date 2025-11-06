'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { User } from '@/app/types/index';

const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

interface SidebarUserProfileProps {
  user: User;
  isSidebarOpen: boolean;
}

const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ user, isSidebarOpen }) => {
  // Visar endast en centrerad avatar när sidofältet är hopfällt
  if (!isSidebarOpen) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-border-primary">
          {user.image ? (
            <Image src={user.image} alt="Profilbild" width={40} height={40} className="rounded-full" />
          ) : (
            getInitials(user.name)
          )}
        </div>
      </div>
    );
  }

  // Visar den fullständiga profilen när sidofältet är öppet
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-2">
        <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-border-primary flex-shrink-0">
          {user.image ? (
            <Image src={user.image} alt="Profilbild" width={40} height={40} className="rounded-full" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-text-primary truncate">{user.name || 'Användare'}</p>
          <p className="text-xs text-text-secondary truncate">{user.email || 'Ingen email'}</p>
        </div>
      </div>
      <div className="mt-2 space-y-1 border-t border-border-color pt-2">
        <Link 
            href="/settings" 
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary rounded-md hover:bg-background-tertiary hover:text-text-primary">
            <CogIcon className="h-5 w-5" />
            <span>Inställningar</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-text-secondary rounded-md hover:bg-background-tertiary hover:text-text-primary"
          title="Logga ut"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logga ut</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarUserProfile;
