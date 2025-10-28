
'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

interface UserSettings {
  name: string | null | undefined;
  email: string | null | undefined;
  companyVision: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Kunde inte ladda inställningar.');
        }
        const data: UserSettings = await response.json();
        setSettings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSignOut = async () => {
    // Omdirigera till startsidan efter utloggning
    await signOut({ callbackUrl: '/' }); 
  };

  // UI-komponent för en inställnings-sektion
  const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
      <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">{title}</h2>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><p className="text-center text-gray-400">Laddar inställningar...</p></div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><p className="text-center text-red-400">{`Fel: ${error}`}</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Inställningar</h1>
      
      <div className="space-y-8">
        {/* Profilsektion */}
        <SettingsSection title="Min Profil">
            <div>
                <label className="block text-sm font-medium text-gray-400">Namn</label>
                <p className="text-lg text-white">{settings?.name || '-'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">E-post</label>
                <p className="text-lg text-white">{settings?.email || '-'}</p>
            </div>
        </SettingsSection>

        {/* Företagsvision */}
        <SettingsSection title="Min Företagsvision">
            <p className="text-gray-400 text-sm mb-2">Definiera din vision för att hjälpa ByggPilot att ge dig bättre, anpassade förslag.</p>
            <textarea 
                rows={4}
                className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                defaultValue={settings?.companyVision || ''}
                placeholder="T.ex. 'Att vara den mest pålitliga och effektiva byggpartnern...'"
            />
            <div className="text-right">
                 <button disabled className="py-2 px-4 bg-cyan-700 text-white/50 font-semibold rounded-lg disabled:cursor-not-allowed">Spara Vision (Kommer snart)</button>
            </div>
        </SettingsSection>

        {/* Integrationer */}
        <SettingsSection title="Integrationer">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
                    <div>
                        <p className="font-bold text-white">Google</p>
                        <p className="text-sm text-gray-400">Ansluten som {settings?.email}</p>
                    </div>
                </div>
                <button disabled className="py-2 px-4 text-gray-400 font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Återanslut (Kommer snart)</button>
            </div>
        </SettingsSection>

        {/* Utloggning */}
         <div>
            <button 
                onClick={handleSignOut}
                className="w-full py-3 px-4 bg-red-800/50 text-red-300 font-semibold rounded-lg hover:bg-red-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500">
                Logga ut
            </button>
        </div>
      </div>
    </div>
  );
}
