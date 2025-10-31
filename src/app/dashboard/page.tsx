
import React from 'react';
import { BriefcaseIcon, FolderOpenIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import ProjectCard from '../components/dashboard/ProjectCard'; 
import StatCard from '../components/dashboard/StatCard';
import { getDashboardStats, getActiveProjects } from '@/lib/dal/projects';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/config/authOptions"

// Importerar en ny komponent för "Zero State" som vi kommer skapa sen.
// import ZeroState from '../components/dashboard/ZeroState';

// --- Huvudsida för Dashboard (Server Component) ---
// Denna komponent är nu helt datadriven och renderas på servern.

export default async function DashboardPage() {
  // TODO: Använd riktig autentisering för att få userId. Just nu används en platshållare.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || 'placeholder-user-id'; // Fallback för säkerhet
  const userName = session?.user?.name || "Användare";

  // Parallell datahämtning för maximal prestanda
  const [stats, projects] = await Promise.all([
    getDashboardStats(userId),
    getActiveProjects(userId)
  ]);

  // Hantering för "Zero State" - om inga projekt finns.
  if (projects.length === 0) {
    // return <ZeroState userName={userName} />;
    // Tillfällig fallback tills ZeroState-komponenten är byggd
    return (
        <div className="text-center p-12 bg-gray-800/50 rounded-xl animate-fadeIn">
            <h1 className="text-4xl font-bold tracking-tight text-white">Välkommen, {userName}!</h1>
            <p className="mt-4 text-lg text-gray-300">Det ser lite tomt ut här.</p>
            <p className="mt-2 text-gray-400">Allt börjar med ett projekt. Skapa ditt första för att samla allt på ett ställe.</p>
            {/* Här kommer vi lägga in "+ Skapa Nytt Projekt"-knappen sen */}
        </div>
    );
  }

  return (
    // Enkel fade-in animation för en mjukare laddningsupplevelse
    <div className="space-y-8 animate-fadeIn">
      
      {/* ---- Övre sektionen: Välkomsttitel och Stat-kort ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
        
        <div className="lg:col-span-1 xl:col-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">Välkommen tillbaka,</h1>
          <h2 className="text-4xl font-bold tracking-tight text-cyan-400">{userName}!</h2>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <StatCard 
            icon={<BriefcaseIcon className="w-7 h-7 text-gray-300" />}
            title="Totalt antal projekt"
            value={stats.totalProjects.toString()}
            className="col-span-1"
          />
          <StatCard 
            icon={<FolderOpenIcon className="w-7 h-7 text-gray-300" />}
            title="Pågående projekt"
            value={stats.ongoingProjects.toString()}
            className="col-span-1"
          />
          <StatCard 
            icon={<BanknotesIcon className="w-7 h-7 text-gray-300" />}
            title="Totala intäkter"
            value={stats.totalRevenue}
            className="col-span-2"
          />
        </div>
      </div>

      {/* ---- Undre sektionen: Pågående Projekt ---- */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-5">Pågående Projekt</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
