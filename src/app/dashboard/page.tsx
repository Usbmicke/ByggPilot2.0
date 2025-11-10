
import React from 'react';
import { Briefcase, FolderOpen, Landmark } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';

export default function DashboardPage() {
  // Hårdkodat användarnamn - detta kommer att hanteras av Genkit-autentisering i ett senare skede.
  const userName = "Användare";

  // Statisk platshållardata. Denna vy kommer att bli mer dynamisk när Genkit-flödena
  // för projekt- och intäktsdata är implementerade.
  const stats = {
    totalProjects: 0,
    ongoingProjects: 0,
    totalRevenue: "0 kr",
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">Välkommen tillbaka, {userName}!</h1>
        <p className="mt-2 text-lg text-text-secondary">Här är en snabb översikt över din verksamhet just nu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Briefcase className="w-7 h-7 text-primary" />}
          title="Totalt antal projekt"
          value={stats.totalProjects.toString()}
        />
        <StatCard 
          icon={<FolderOpen className="w-7 h-7 text-primary" />}
          title="Pågående projekt"
          value={stats.ongoingProjects.toString()}
        />
        <StatCard 
          icon={<Landmark className="w-7 h-7 text-primary" />} 
          title="Totala intäkter"
          value={stats.totalRevenue}
        />
      </div>

      <div className="bg-background-secondary p-8 rounded-2xl text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold text-text-primary">Dags att dyka in i detaljerna?</h3>
        <p className="text-text-secondary mt-2 mb-6 max-w-md">Gå till din projektlista för att hantera dina pågående arbeten, skapa nya eller se avslutade projekt.</p>
        <Link href="/dashboard/projects">
          <span className="inline-block bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors shadow-lg shadow-primary/10 hover:shadow-primary/20">
            Öppna Projekt
          </span>
        </Link>
      </div>

    </div>
  );
}
