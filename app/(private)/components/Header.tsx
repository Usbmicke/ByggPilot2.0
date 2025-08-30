'use client';

import { useAuth } from '@/app/providers/AuthContext';
import Image from 'next/image';
import React, { useState } from 'react';

// Import icons from react-icons/ai (assuming you have react-icons installed)
import { AiOutlineSearch, AiOutlineBell } from 'react-icons/ai';
// If you want a different Google icon, import it here and replace the SVG in the button

export default function Header() {
  const { user, login } = useAuth(); // Get user and login from your AuthContext
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for search dropdown
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // State for notification dropdown
  // You'll need state for search results and notifications data later
  // const [searchResults, setSearchResults] = useState([]);
  // const [notifications, setNotifications] = useState([]);
  // const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full h-20 flex-shrink-0 bg-gray-800/30 backdrop-blur-sm border-b border-gray-700"> {/* Adapted height and border from mall */}
      <div className="w-full max-w-screen-2xl mx-auto px-8 py-3 flex items-center justify-between"> {/* px-8 adapted from mall */}
        {user ? ( // Conditionally render greeting or logo based on user login status
          <div>
            <h1 className="text-xl font-bold text-white">God morgon, {user?.name?.split(' ')[0]}!</h1> {/* Adapted from mall */}
            <p className="text-sm text-gray-400">Här är en översikt av dina projekt idag.</p> {/* Adapted from mall */}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3"> {/* Your logo and title */}
            <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
            <span className="text-2xl font-bold text-white">ByggPilot</span>
          </div>
        )}

        <nav className="flex items-center gap-4"> {/* gap-4 adapted from mall */}
          {user ? ( // Show search and notifications only if user is logged in (adapted from mall)
            <>
              {/* Search Bar (adapted from mall) */}
              <div className="relative w-full max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineSearch className="w-5 h-5 text-gray-500" /> {/* Search Icon */}
                </span>
                <input
                  type="text"
                  placeholder="Sök efter projekt, filer eller kunder..."
                  className="w-full py-2 pl-10 pr-4 text-gray-300 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchOpen(e.target.value.length > 1); // Open search dropdown if term is long enough
                  }}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 100)} // Close search dropdown on blur (with a slight delay)
                />
                {isSearchOpen && ( // Conditionally render search dropdown
                  <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                    {/* Placeholder for search results */}
                    <div className="p-4 text-sm text-gray-500">Sökresultat här...</div>
                    {/* You'll map over searchResults here later */}
                  </div>
                )}
              </div>

              {/* Notifications (adapted from mall) */}
              <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} // Toggle notification dropdown
                    className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50"
                  >
                      <AiOutlineBell className="w-6 h-6" /> {/* Bell Icon */}
                      {/* Notification badge (add when you have unreadCount) */}
                      {/* {unreadCount > 0 && (<span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-cyan-500 ring-2 ring-gray-800 animate-pulse" />)} */}
                  </button>
                  {isNotificationsOpen && ( // Conditionally render notification dropdown
                      <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                          <div className="p-3 border-b border-gray-700">
                              <h4 className="font-semibold text-white">Notifieringar</h4>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                              {/* Placeholder for notifications */}
                              <p className="p-4 text-sm text-gray-500">Inga nya notifieringar.</p>
                              {/* You'll map over notifications here later */}
                          </div>
                      </div>
                  )}
              </div>
            </>
          ) : ( // Show Login button if user is not logged in
            <button
              onClick={login} // Use your existing login function
              className="inline-flex items-center gap-2 bg-white text-gray-800 font-normal text-sm px-4 py-2 rounded-md shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 whitespace-nowrap" // Your existing button styles
            >
              {/* Your Google Icon Component (if not using the SVG) */}
              <svg viewBox="0 0 48 48" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              <span className="hidden sm:inline">Logga in med Google</span>
              <span className="sm:hidden">Logga in</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
