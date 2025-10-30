
'use client';

import React, { useState, useEffect } from 'react';

// Enkel funktion för att sätta en cookie. `path=/` gör den giltig över hela siten.
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

// Enkel funktion för att läsa en cookie.
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Läs cookien när komponenten laddas. Visa bara bannern om cookien INTE finns.
    const consent = getCookie('byggpilot_cookie_consent');
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Sätt en cookie som är giltig i ett år.
    setCookie('byggpilot_cookie_consent', 'true', 365);
    // Dölj bannern omedelbart.
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          Vi använder cookies för att säkerställa att du får den bästa upplevelsen på ByggPilot. Genom att fortsätta använda sidan godkänner du vår användning av cookies.{' '}
          <a href="/integritetspolicy#cookies" className="font-semibold text-gray-200 hover:underline">Läs mer här</a>.
        </p>
        <button 
          onClick={handleAccept}
          className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-md hover:bg-gray-600 transition-colors duration-300 flex-shrink-0"
        >
          Jag förstår
        </button>
      </div>
    </div>
  );
}
