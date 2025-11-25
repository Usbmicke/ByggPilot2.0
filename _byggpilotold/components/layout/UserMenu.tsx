
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/_hooks/useUser'; // <-- NY! Använd vår useUser-hook
import { ArrowRightOnRectangleIcon, CogIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/app/_components/ui/skeleton'; // <-- NY! För laddnings-state

// Hjälpfunktion för att generera initialer
const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

export default function UserMenu() {
  const router = useRouter();
  const { user, profile, isLoading } = useUser(); // <-- Hämta användare och laddningsstatus från hooken

  // KORREKT UTLOGGNINGSFUNKTION
  const handleLogout = async () => {
    try {
      // Steg 1: Anropa vår backend-endpoint för att säkert radera session-cookien
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (!response.ok) {
        // Om något gick fel på servern, logga det men försök ändå fortsätta
        console.error('Server-side logout failed', await response.json());
      }

      // Steg 2: Omdirigera till startsidan med Next.js Router för en mjuk övergång
      router.push('/');
      // Opcional: Ladda om sidan helt för att säkerställa att all state rensas
      router.refresh();

    } catch (error) {
      console.error("Fel vid utloggningsanrop: ", error);
      // Visa ett felmeddelande för användaren här om det behövs
    }
  };

  // Visa en laddnings-skeleton medan användardatan hämtas
  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  // Om användaren inte är inloggad (t.ex. vid fel eller utgången session),
  // visa ingenting eller en inloggningsknapp.
  if (!user) {
    return null; 
  }

  return (
    <div className="relative group">
      {/* Avatar / Profilbild */}
      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden border-2 border-neutral-700">
        {user.photoURL ? (
          <Image 
            src={user.photoURL} 
            alt="Profilbild" 
            width={40} 
            height={40} 
            className="rounded-full" 
          />
        ) : (
          getInitials(user.displayName)
        )}
      </div>
      
      {/* Dropdown-meny */}
      <div className="absolute right-0 mt-2 w-60 bg-[#1C1C1E] border border-neutral-700/80 rounded-lg shadow-2xl z-50 hidden group-hover:block transition-all duration-300 origin-top-right animate-in fade-in-0 zoom-in-95">
        <div className="px-4 py-3 border-b border-neutral-700/60">
          <p className="text-sm font-semibold text-neutral-100 truncate">{user.displayName || "Användare"}</p>
          <p className="text-xs text-neutral-400 truncate">{user.email}</p>
        </div>
        <div className="py-2">
          <button disabled className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-neutral-400 cursor-not-allowed">
            <CogIcon className="h-5 w-5" />
            Inställningar
          </button>
           <button disabled className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-neutral-400 cursor-not-allowed">
            <UserCircleIcon className="h-5 w-5" />
            Min Profil
          </button>
        </div>
        <div className="py-2 border-t border-neutral-700/60">
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logga ut
          </button>
        </div>
      </div>
    </div>
  );
}
