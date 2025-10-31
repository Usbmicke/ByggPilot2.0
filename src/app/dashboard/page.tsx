import React from 'react';
import { BriefcaseIcon, FolderOpenIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import StatCard from '../components/dashboard/StatCard';
import { getDashboardStats } from '@/lib/dal/projects';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/config/authOptions"
import Link from 'next/link';

// --- Huvudsida för Dashboard: Översikt (Server Component) ---
// Denna sida visar nu enbart en sammanfattning och statistik.
// Projektlistan har flyttats till sin egen dedikerade sida.

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // Hämtar användarnamnet dynamiskt från sessionen, med en fallback.
  const userName = session?.user?.name || "Användare";

  // Hämtar endast den statistik som behövs för översikten.
  const stats = await getDashboardStats(session?.user?.id);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* ---- Välkomstsektion (KORRIGERAD) ---- */}
      <div>
        {/* Hela hälsningen är nu i ett element för konsekvent styling */}
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">Välkommen tillbaka, {userName}!</h1>
        <p className="mt-3 text-lg text-text-secondary">Här är en snabb översikt över din verksamhet.</p>
      </div>

      {/* ---- Statistik-sektion ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<BriefcaseIcon className="w-7 h-7 text-gray-300" />}
          title="Totalt antal projekt"
          value={stats.totalProjects.toString()}
        />
        <StatCard 
          icon={<FolderOpenIcon className="w-7 h-7 text-gray-300" />}
          title="Pågående projekt"
          value={stats.ongoingProjects.toString()}
        />
        <StatCard 
          icon={<BanknotesIcon className="w-7 h-7 text-gray-300" />}
          title="Totala intäkter"
          value={stats.totalRevenue}
        />
      </div>

      {/* ---- "Call to Action"-sektion ---- */}
      <div className="bg-gray-800/50 p-8 rounded-xl border border-border-color text-center">
        <h3 className="text-2xl font-bold text-white">Dags att dyka in i detaljerna?</h3>
        <p className="text-text-secondary mt-2 mb-6">Gå till din projektlista för att hantera dina pågående arbeten.</p>
        <Link href="/dashboard/projects">
          <span className="inline-block bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg hover:shadow-cyan-500/30">Öppna Projekt</span>
        </Link>
      </div>

    </div>
  );
}
