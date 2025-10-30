
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/outline';

// Importera centraliserad data och kontext med korrekta sökvägar
import { primaryNavigation } from '@/app/constants/navigation';
import SidebarUserProfile from '@/app/components/layout/SidebarUserProfile';
import { useUI } from '@/app/contexts/UIContext';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUI();

  return (
    <aside className={`bg-background-secondary text-text-primary flex flex-col transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 border-b border-border-color h-16">
            <Link href="/dashboard">
                {/* Korrekt sökväg till logotypen i public-mappen */}
                {isSidebarOpen && <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={140} height={35} priority />}
            </Link>
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-background-tertiary">
                <HomeIcon className="h-6 w-6" />
            </button>
        </div>

        <nav className="flex-1 space-y-2 p-2">
            {primaryNavigation.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-primary-500 text-white' : 'hover:bg-background-tertiary'}`}>
                    <item.icon className={`h-6 w-6 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>
            ))}
        </nav>

        <div className="border-t border-border-color p-2">
            <SidebarUserProfile isSidebarOpen={isSidebarOpen} />
        </div>
    </aside>
  );
};

export default Sidebar;
