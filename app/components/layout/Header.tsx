
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Importera de nya, dekonstruerade komponenterna
import GlobalSearchBar from '@/app/components/layout/GlobalSearchBar';
import NotificationBell from '@/app/components/layout/NotificationBell';
import UserMenu from '@/app/components/layout/UserMenu';
import Clock from '@/app/components/layout/Clock';
import { useModal } from '@/app/contexts/ModalContext'; // GULDSTANDARD-TILLÄGG

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * GULDSTANDARD-UPPDATERING: Header har nu en central "Skapa"-knapp (+).
 * Denna knapp är startpunkten för alla primära skapande-flöden,
 * vilket säkerställer en konsekvent och lättåtkomlig användarupplevelse.
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { data: session } = useSession();
  const { showModal } = useModal(); // GULDSTANDARD-TILLÄGG

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 bg-background-secondary border-b border-border-primary p-4 z-20">
      <div className="flex items-center justify-between">
        
        {/* Vänstra Sektionen: Hamburgermeny och Sökfält */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="md:hidden text-text-secondary hover:text-text-primary"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="hidden md:block w-full max-w-lg">
            <GlobalSearchBar />
          </div>
        </div>

        {/* Högra Sektionen: Skapa-knapp, Klocka, Notiser och Användarmeny */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* GULDSTANDARD: Central "Skapa"-knapp */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="flex items-center justify-center w-10 h-10 bg-accent-blue hover:bg-accent-blue-dark rounded-full text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                <PlusIcon className="h-6 w-6" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-700 rounded-md bg-background-tertiary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => showModal('createOffer')}
                        className={`${
                          active ? 'bg-accent-blue text-white' : 'text-text-primary'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Ny Offert
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => showModal('createCustomer')}
                        className={`${
                          active ? 'bg-accent-blue text-white' : 'text-text-primary'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Ny Kund
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => showModal('createAta')}
                        className={`${
                          active ? 'bg-accent-blue text-white' : 'text-text-primary'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Ny ÄTA
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <Clock />
          <NotificationBell />
          {session?.user && <UserMenu user={session.user} />}
        </div>

      </div>
    </header>
  );
};

export default Header;
