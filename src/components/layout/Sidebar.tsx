
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Settings, LogOut, Plus
} from 'lucide-react';
import { useAuth } from '@/app/_providers/ClientProviders';
import { navItems } from '@/app/_constants/navigation';

// =======================================================================
//  SIDOMENY (VERSION 2.0 - HIERARKISK DESIGN)
//  Designad med en tydlig visuell hierarki mellan arbetsverktyg,
//  primära handlingar och användarinställningar.
// =======================================================================

// --- 1. Komponent för en enskild navigeringslänk ---

const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const pathname = usePathname();
    const isActive = pathname === item.href;
    return (
        <Link href={item.href} className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-neutral-700/50 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}>
            <item.icon className="h-5 w-5" />
            <span className="font-medium text-sm">{item.label}</span>
        </Link>
    );
};

// --- 2. Komponent för användarprofilsektionen ---
const UserProfile = ({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) => {
    const handleSignOut = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    return (
        <div className="px-4 py-4">
            <div className="flex items-center gap-3">
                <Image
                    src={user.photoURL || 'https://via.placeholder.com/40'}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="rounded-full"
                />
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-white truncate">{user.displayName || 'Användare'}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                </div>
            </div>
            <div className="space-y-1 text-sm mt-4">
                <Link href="/dashboard/settings" className="flex items-center gap-3.5 py-2 px-2.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white">
                    <Settings size={16} /> Inställningar
                </Link>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3.5 py-2 px-2.5 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-red-400">
                    <LogOut size={16} /> Logga ut
                </button>
            </div>
        </div>
    );
};

// --- 3. Huvudkomponenten för Sidomenyn ---
export default function Sidebar() {
    const { user } = useAuth();

    if (!user) return null; // Rendera inte om användardata saknas

    return (
        <aside className="w-[250px] flex-shrink-0 bg-[#1C1C1E] border-r border-neutral-800/50 flex flex-col h-full">
            
            {/* Logo Sektion */}
            <div className="h-20 flex items-center px-6 border-b border-neutral-800/50">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={30} height={30} className="rounded-md" />
                    <span className="text-xl font-semibold text-white">ByggPilot</span>
                </Link>
            </div>

            {/* Primära verktyg och handlingar */}
            <div className="flex-1 flex flex-col py-5 px-4 overflow-y-auto">
                <nav className="space-y-1.5 flex-1">
                    {navItems.map(item => <NavLink key={item.label} item={item} />)}
                </nav>

                <button className="w-full mt-4 bg-white/5 border border-white/10 text-neutral-100 font-medium flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <Plus size={18} />
                    Skapa Nytt
                </button>
            </div>

            {/* Avdelare och Användarprofil Sektion */}
            <div className="flex-shrink-0 border-t border-neutral-800/50">
                <UserProfile user={user} />
            </div>

        </aside>
    );
}
