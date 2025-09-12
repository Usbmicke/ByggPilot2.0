
'use client';
import React from 'react';
import { demoProjects, demoTimeEntries } from '../data';

// --- IKONER (anpassade för dashboarden) ---
const IconProject = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const IconBid = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v4a1 1 0 001 1h12a1 1 0 001-1v-4a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zm-4 6a4 4 0 118 0v3H6V8z" /></svg>;
const IconClock = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>;
const IconCloud = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>;
const IconSun = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;

// --- DYNAMISKA WIDGETS (DEMO-VERSIONER) ---

// KPI-kort (behålls för snabb överblick)
const KpiCard = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center"><div className="p-3 bg-gray-700/50 rounded-lg mr-4">{icon}</div><div><p className="text-sm text-gray-400">{title}</p><p className="text-2xl font-bold text-white">{value}</p></div></div>
);

// Väder-widget (ny, för att visa fältanpassning)
const WeatherForecast = () => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col justify-between">
        <div>
            <h3 className="font-bold text-white mb-1">Väderprognos: Stockholm</h3>
            <p className="text-sm text-gray-400">Perfekt väder för utomhusarbete!</p>
        </div>
        <div className="flex items-center gap-6 mt-4">
            <div className="text-center"><p className="font-bold text-lg">Idag</p><IconSun className="w-8 h-8 text-yellow-400 mx-auto"/><p>19°C</p></div>
            <div className="text-center"><p className="font-bold text-lg">Imorgon</p><IconCloud className="w-8 h-8 text-gray-400 mx-auto"/><p>16°C</p></div>
        </div>
    </div>
);

// Att-göra-widget (ny, för att visa proaktivitet)
const TodoWidget = () => (
    <div>
        <h2 className="text-xl font-semibold text-white mb-4">Att göra</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg"><ul className="divide-y divide-gray-700/50">
            <li className="p-4 flex items-center"><input type="checkbox" className="h-5 w-5 rounded-sm bg-gray-700 border-gray-600 focus:ring-cyan-500 mr-4" /><span className="text-white">Fakturera projekt "Villa Ljung"</span></li>
            <li className="p-4 flex items-center"><input type="checkbox" className="h-5 w-5 rounded-sm bg-gray-700 border-gray-600 focus:ring-cyan-500 mr-4" defaultChecked /><span className="text-gray-500 line-through">Skicka in kompletterande dokument för Attefallshus anmälan</span></li>
            <li className="p-4 flex items-center"><input type="checkbox" className="h-5 w-5 rounded-sm bg-gray-700 border-gray-600 focus:ring-cyan-500 mr-4" /><span className="text-white">Beställa material för "Renovering Kök"</span></li>
        </ul></div>
    </div>
);

// Händelselogg-widget (ny, för att visa aktivitet)
const RecentEventsWidget = () => (
     <div>
        <h2 className="text-xl font-semibold text-white mb-4">Senaste händelser</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg"><ul className="divide-y divide-gray-700/50">
            <li className="p-4"><p><span className="font-semibold text-cyan-400">Ny tidrapport</span> från Kalle Anka på projektet "Villa Ljung" (8h).</p><p className="text-xs text-gray-500">för 15 minuter sedan</p></li>
            <li className="p-4"><p><span className="font-semibold text-yellow-400">Ny offert</span> skapad för kunden "Anders Andersson".</p><p className="text-xs text-gray-500">för 2 timmar sedan</p></li>
            <li className="p-4"><p><span className="font-semibold text-green-400">Projektstatus</span> för "Renovering Kök" ändrad till <span className="font-semibold">Pågående</span>.</p><p className="text-xs text-gray-500">för 4 timmar sedan</p></li>
        </ul></div>
    </div>
);

// --- HUVUDVY FÖR DEMO-DASHBOARD ---
const DemoDashboardView = () => {
    const totalHours = demoTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Översikt</h1>
            
            {/* KPI-kort */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard title="Pågående Projekt" value={demoProjects.filter(p => p.status === 'Pågående').length} icon={<IconProject className="h-6 w-6 text-cyan-400"/>} />
                <KpiCard title="Obesvarade anbud" value={demoProjects.filter(p => p.status === 'Anbud').length} icon={<IconBid className="h-6 w-6 text-yellow-400"/>} />
                <KpiCard title="Rapporterade Timmar (7d)" value={totalHours.toFixed(1)} icon={<IconClock className="h-6 w-6 text-green-400"/>} />
                <WeatherForecast />
            </div>

            {/* Dynamiska widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TodoWidget />
                <RecentEventsWidget />
            </div>
        </div>
    );
}

export default DemoDashboardView;
