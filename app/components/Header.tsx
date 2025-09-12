
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href}>
            <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
                {children}
            </span>
        </Link>
    );
};

export const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
                                <span className="text-xl font-bold text-white">ByggPilot</span>
                            </div>
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink href="/dashboard">Översikt</NavLink>
                                <NavLink href="/projects">Projekt</NavLink>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="text-sm text-gray-400 mr-4 hidden sm:block">
                           Inloggad som <span className="font-semibold text-gray-200">{session?.user?.name || '...'}</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                            aria-label="Logga ut"
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
