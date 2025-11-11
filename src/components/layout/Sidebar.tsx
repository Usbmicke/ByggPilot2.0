
'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { signOut, useSession } from 'next-auth/react' // BORTTAGET
import { Plus, Settings, LogOut } from 'lucide-react'

import { primaryNavigation } from '@/constants/navigation'
import SidebarUserProfile from './SidebarUserProfile'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// ===================================================================================================
// SIDEBAR RECONSTRUCTION V2.0 - FIREBASE AUTH
// ===================================================================================================
// Logiken för `useSession` och `signOut` är borttagen. 
// Komponenterna SidebarUserProfile och utloggningsknappen är nu beroende av platshållardata/funktioner.
// Nästa steg: Implementera Firebase `signOut` och hämta användardata från Firebase Auth-kontext.
// ===================================================================================================

const Sidebar = () => {
  const pathname = usePathname()
  // const { data: session } = useSession() // BORTTAGET

  // PLATSHÅLLARDATA
  const session = {
    user: {
      name: 'Användare',
      email: 'anvandare@example.com',
      image: 'https://via.placeholder.com/40',
    },
  };

  const handleSignOut = () => {
    // TODO: Implementera Firebase signOut()
    console.log("TODO: Implement Firebase Sign Out");
    // Exempel: await firebaseSignOut();
  };

  const navigation = useMemo(() => primaryNavigation, [])

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      {/* Header med logotyp */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center">
              <Image src="/logo-bg.svg" alt="ByggPilot AI Logo" width={40} height={40} />
              <span className="ml-3 text-xl font-bold">ByggPilot AI</span>
          </div>
      </div>

      {/* Huvudnavigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              pathname.startsWith(item.href) ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon
              className={classNames(
                pathname.startsWith(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                'mr-3 flex-shrink-0 h-6 w-6'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Sidfot med användarprofil och inställningar */}
      <div className="px-2 py-4 border-t border-gray-700">
        {session?.user && <SidebarUserProfile user={session.user} />}
        <div className="mt-4 space-y-1">
            <button onClick={handleSignOut} className="w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300" />
                Logga ut
            </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
