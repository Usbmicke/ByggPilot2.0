import React from 'react';
import DashboardInboxView from './DashboardInboxView';

interface DashboardViewProps {
    projects: any[];
    invoices: any[];
    stats: any;
}

// Huvudvyn för dashboarden. 
// Den har förenklats för att primärt visa den nya "Proaktiva Förslag"-inkorgen.
const DashboardView = ({ projects, invoices, stats }: DashboardViewProps) => {

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">God morgon</h1>
                <p className="text-gray-400">Här är en översikt av vad som är på gång.</p>
            </div>

            {/* Behåll de övergripande statistikkorten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400">Aktiva Projekt</h3>
                    <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400">Obetalda Fakturor</h3>
                    <p className="text-3xl font-bold text-white">{stats.unpaidInvoices}</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400">Väntande Förslag</h3>
                    <p className="text-3xl font-bold text-cyan-400">{stats.pendingActions}</p>
                </div>
            </div>

            {/* Den nya proaktiva inkorgen blir nu huvudfokus */}
            <DashboardInboxView />

        </div>
    );
};

export default DashboardView;
