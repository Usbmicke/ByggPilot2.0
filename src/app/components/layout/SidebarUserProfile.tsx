
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { User } from '@/app/types/index';

// Hjälpfunktion för att generera initialer, samlad på ett ställe.
const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

interface SidebarUserProfileProps {
  user: User;
}

/**
 * En komponent specifikt designad för att visa användarens profil
 * i sidofältets botten. Den är en slimmad version av den mer komplexa
 * UserMenu-komponenten som används i headern.
 */
const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-border-primary">
          {user.image ? (
            <Image src={user.image} alt="Profilbild" width={40} height={40} className="rounded-full" />
          ) : (
            getInitials(user.name)
          )}
        </div>
        {/* Namn och Länk till Inställningar */}
        <div>
          <p className="text-sm font-semibold text-text-primary truncate">{user.name || 'Användare'}</p>
          <Link href="/settings" className="text-xs text-text-secondary hover:underline">
            Inställningar
          </Link>
        </div>
      </div>
      {/* Utloggningsknapp */}
      <button 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="p-2 text-text-secondary hover:text-status-danger rounded-md transition-colors"
        title="Logga ut"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default SidebarUserProfile;
