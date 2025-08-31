'use client';

import React from 'react';

// --- SVG Ikon för bygghjälmen ---
const HelmetIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2 text-white"
  >
    <path d="M22 13.4375V12.5C22 8.36447 18.6355 5 14.5 5H9.5C5.36447 5 2 8.36447 2 12.5V13.4375C2 14.8216 2.89543 16.0312 4.125 16.5V18.5C4.125 18.7892 4.36081 19.025 4.65 19.025H6.15C6.43919 19.025 6.675 18.7892 6.675 18.5V17.425C6.675 17.1358 6.43919 16.9 6.15 16.9H4.875C4.27982 16.9 3.75 16.3702 3.75 15.775V13.4375C3.75 9.30249 7.05249 6.00001 11.1875 6.00001H12.8125C16.9475 6.00001 20.25 9.30249 20.25 13.4375V15.775C20.25 16.3702 19.7202 16.9 19.125 16.9H17.85C17.5608 16.9 17.325 17.1358 17.325 17.425V18.5C17.325 18.7892 17.5608 19.025 17.85 19.025H19.35C19.6392 19.025 19.875 18.7892 19.875 18.5V16.5C21.1046 16.0312 22 14.8216 22 13.4375ZM13.875 9.125H10.125C9.83581 9.125 9.6 9.36081 9.6 9.65V11.15C9.6 11.4392 9.83581 11.675 10.125 11.675H13.875C14.1642 11.675 14.4 11.4392 14.4 11.15V9.65C14.4 9.36081 14.1642 9.125 13.875 9.125Z" />
  </svg>
);

// --- Huvudkomponenten för landningssidan ---
export default function LandingPage() {
  return (
    <main className="bg-[#0B111D] min-h-screen w-full flex items-center justify-center p-4 font-sans text-white">
      
      <div className="bg-[#1e293b] w-full max-w-4xl rounded-lg shadow-2xl border border-gray-700">
        
        {/* Header-sektionen */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-600">
          <a href="#" className="flex items-center text-xl font-bold">
             <HelmetIcon />
             <span>ByggPilot</span>
          </a>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button className="bg-gray-700 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">
              Logga in
            </button>
            <button className="bg-white text-gray-900 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Testa Gratis
            </button>
          </div>
        </header>

        {/* Huvudinnehåll */}
        <div className="text-center p-8 sm:p-12 md:p-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
            Din digitala kollega i byggbranschen
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            ByggPilot är ett superenkelt och kraftfullt verktyg för att skapa, hantera och följa upp dina projekt. Från start till mål.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="w-full sm:w-auto bg-white text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                Testa ByggPilot Gratis
             </button>
             <button className="w-full sm:w-auto bg-transparent border border-gray-500 text-gray-200 font-semibold px-8 py-3 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors duration-300">
                Logga in
             </button>
          </div>
        </div>

      </div>
    </main>
  );
}

