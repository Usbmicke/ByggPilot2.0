
import React from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import ChatWidget from '@/app/components/layout/ChatWidget';

/**
 * Detta är den huvudsakliga, persistenta layouten för applikationen.
 * Den innehåller Sidebar, Header och Chat-fönstret.
 * Alla sidor inom (main)-gruppen kommer att renderas som `children` här.
 */
export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full flex bg-gray-900 text-white overflow-hidden">
      {/* Statisk sidobar till vänster */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Statisk header högst upp i innehållsytan */}
        <Header />

        {/* Huvudinnehållet på sidan, detta är den del som byts ut vid navigering */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Statisk chatt-widget till höger */}
      <ChatWidget />
    </div>
  );
}
