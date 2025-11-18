'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderKanban, Users, Settings, LogOut } from 'lucide-react'
import SidebarUserProfile from './SidebarUserProfile'
import { useAuth } from '@/providers/ClientProviders' // <-- KORRIGERAD IMPORT

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Översikt' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Projekt' },
  { href: '/dashboard/customers', icon: Users, label: 'Kunder' },
  { href: '/dashboard/settings', icon: Settings, label: 'Inställningar' },
]

const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
  const pathname = usePathname()
  const isActive = pathname === item.href
  return (
    <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-neutral-700 ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}>
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  )
}

export default function Sidebar() {
  const { user } = useAuth(); // Hämta bara användaren

  const handleSignOut = async () => {
    // Implementera utloggning direkt här
    await fetch('/api/auth/logout', { method: 'POST' });
    // Ladda om sidan för att tvinga middleware att köra och omdirigera
    window.location.href = '/'; 
  };

  if (!user) return null; // Rendera ingenting om ingen användare är inloggad

  return (
    <div className="hidden border-r bg-neutral-900/95 backdrop-blur-lg md:block text-white">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">ByggPilot</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(item => <NavLink key={item.label} item={item} />)}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-neutral-800">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-neutral-700 hover:text-red-500">
            <LogOut className="h-4 w-4" />
            Logga ut
          </button>
          <div className="mt-4">
            <SidebarUserProfile user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
