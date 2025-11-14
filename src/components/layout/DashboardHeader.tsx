
'use client'

import React from 'react'
import Image from 'next/image'
import { Bell, Search } from 'lucide-react'
// import { useSession } from 'next-auth/react' // BORTTAGET

// ===================================================================================================
// HEADER RECONSTRUCTION V2.0 - FIREBASE AUTH
// ===================================================================================================
// Logiken för `useSession` är borttagen. Datat nedan är nu en platshållare.
// I nästa steg kommer denna komponent att behöva lyssna på Firebase Auth-status
// för att dynamiskt hämta och visa korrekt användarinformation.
// ===================================================================================================

const Header = () => {
  // const { data: session } = useSession() // BORTTAGET

  // PLATSHÅLLARDATA
  const session = {
    user: {
      name: 'Användare',
      email: 'anvandare@example.com',
      image: 'https://via.placeholder.com/40', // En standard platshållarbild
    },
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Sök..."
            className="pl-10 pr-4 py-2 w-64 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-6 w-6 text-gray-600" />
        </button>

        {session?.user && (
          <div className="flex items-center space-x-3">
            <Image
              src={session.user.image || 'https://via.placeholder.com/40'}
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-sm">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
