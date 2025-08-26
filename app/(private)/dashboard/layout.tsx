'use client';

import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-dark text-brand-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-medium p-6 hidden md:flex flex-col flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8 text-white">ByggPilot</h1>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <a href="#" className="flex items-center p-2 rounded-lg bg-brand-light text-white font-semibold shadow-md">
                Översikt
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center p-2 rounded-lg hover:bg-brand-light transition-colors duration-200">
                Projekt
              </a>
            </li>
            <li className="mb-4">
              <a href="#" className="flex items-center p-2 rounded-lg hover:bg-brand-light transition-colors duration-200">
                Inställningar
              </a>
            </li>
          </ul>
        </nav>
        <div>
            <a href="#" className="flex items-center p-2 rounded-lg hover:bg-brand-light transition-colors duration-200">
                Logga ut
            </a>
        </div>
      </aside>

      {/* Huvudinnehåll */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-brand-medium p-4 flex justify-end items-center border-b border-brand-light flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Michael Fogelström</span>
            <img
              src="https://placehold.co/40x40/778DA9/E0E1DD?text=MF"
              alt="Profilbild"
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-accent"
            />
          </div>
        </header>

        {/* Sidans innehåll med scroll */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
        
        {/* Chattrutan - Nu inkluderad här */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-brand-dark/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Fråga ByggPilot..."
                        className="w-full bg-brand-medium border border-brand-light rounded-lg p-4 pl-6 pr-12 text-brand-text placeholder-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-accent hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
