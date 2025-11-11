
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
// import { signOut } from 'next-auth/react' // BORTTAGET
import { CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { User } from '@/app/types/index'

interface SidebarUserProfileProps {
  user: Partial<User> // Gör det möjligt att skicka in en ofullständig användare (platshållare)
}

// ===================================================================================================
// SIDEBARUSERPROFILE RECONSTRUCTION V2.0 - FIREBASE AUTH
// ===================================================================================================
// Logiken för `signOut` är borttagen. Utloggningslänken kommer inte längre att fungera
// tills den kopplas till en Firebase signOut-funktion.
// ===================================================================================================

const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ user }) => {

  const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Implementera Firebase signOut()
    console.log("TODO: Implement Firebase Sign Out from User Profile");
    // signOut({ callbackUrl: '/' }); // BORTTAGET
  };

  return (
    <div className="flex items-center space-x-3">
      <Image
        src={user.image || 'https://via.placeholder.com/40'}
        alt="User avatar"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-white">{user.name || 'Användare'}</p>
        <p className="text-xs text-gray-400 truncate">{user.email || 'email@example.com'}</p>
        <div className="flex items-center mt-1 space-x-2">
          <Link href="/dashboard/settings" className="text-gray-400 hover:text-white">
            <CogIcon className="h-5 w-5" />
          </Link>
          <a href="#" onClick={handleSignOut} className="text-gray-400 hover:text-white">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default SidebarUserProfile
