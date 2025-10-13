
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { FolderIcon, InboxIcon, SparklesIcon } from '@heroicons/react/24/outline';

// =================================================================================
// DASHBOARD PAGE V1.0 - VISUELL STRUKTUR
// REVIDERING:
// Skapar den faktiska huvudsidan för dashboarden. Denna fil renderas som
// {children} inuti den nya app/dashboard/layout.tsx.
// 1. Hämtar användarens session för att visa ett personligt välkomstmeddelande.
// 2. Bygger upp de tre primära statistikkorten (än så länge med statisk data).
// 3. Skapar de två informationsrutorna för projekt och inkorg.
// 4. Använder genomgående professionell och ren styling med Flexbox/Grid för
//    att säkerställa att allt är korrekt linjerat.
// =================================================================================

// --- Komponenter för Dashboard-kort ---

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  main?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, main = false }) => (
  <div className={`bg-component-background border border-border p-5 rounded-lg shadow-sm ${main ? 'border-yellow-500/50' : ''}`}>
    <h3 className="text-sm font-medium text-text-secondary truncate">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-text-primary">{value}</p>
    {description && <p className="text-xs text-text-tertiary mt-2">{description}</p>}
  </div>
);

const InfoCard = ({ icon, title, text, ctaText }) => (
    <div className="bg-component-background border border-border p-6 rounded-lg text-center flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 flex items-center justify-center bg-background rounded-full mb-4 border border-border">
            {icon}
        </div>
        <h4 className="text-md font-semibold text-text-primary">{title}</h4>
        <p className="text-sm text-text-secondary mt-1">{text} <span className="font-semibold text-accent">{ctaText}</span>.</p>
    </div>
);

// --- Huvudsaklig Dashboard-komponent ---

const DashboardPage = () => {
  const { data: session } = useSession();

  return (
    <div>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Välkommen tillbaka, {session?.user?.name?.split(' ')[0] || '!'}</h1>
        <p className="text-md text-text-secondary mt-1">Här är vad som händer i dina projekt idag.</p>
      </div>

      {/* Statistikkort */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <StatCard title="Totalt antal projekt" value={0} />
        <StatCard title="Pågående projekt" value={0} main={true} description="Aktivt just nu" />
        <StatCard title="Totala intäkter (Fakturerat)" value="0.00 kr" />
      </div>

      {/* Informationskort */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <InfoCard 
          icon={<FolderIcon className="h-6 w-6 text-text-secondary" />}
          title="Du har inga aktiva projekt"
          text="Skapa ett nytt projekt via"
          ctaText="Skapa Nytt"
        />
        <InfoCard 
          icon={<div className="relative"><InboxIcon className="h-6 w-6 text-text-secondary" /><SparklesIcon className="h-4 w-4 text-accent absolute -top-1 -right-1" /></div>}
          title="Inkorgen är tom!"
          text="Bra jobbat! Inga nya föreslagna åtgärder från din e-post just nu"
          ctaText=""
        />
      </div>
    </div>
  );
};

export default DashboardPage;
