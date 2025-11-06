
'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink: string;
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Något gick fel vid hämtning av kalenderdata.');
    }
    return res.json();
});

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return new Date(dateString).toLocaleString('sv-SE', options);
}

export default function CalendarEvents() {
    const { data: events, error, isLoading } = useSWR<CalendarEvent[]>('/api/events/list', fetcher);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-gray-400">Laddar kalenderhändelser...</p>;
        }

        if (error) {
            return <p className="text-red-400">Kunde inte ladda kalenderhändelser. Prova att logga ut och in igen.</p>;
        }

        if (!events || events.length === 0) {
            return <p className="text-gray-400">Inga kommande händelser i din kalender.</p>;
        }

        return (
            <ul className="space-y-3">
                {events.map(event => (
                    <li key={event.id} className="bg-gray-800/50 p-3 rounded-md border border-gray-700 hover:border-cyan-600 transition-colors duration-200">
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4">
                           <div className="flex-shrink-0 text-center bg-gray-700/80 px-3 py-2 rounded-md">
                               <span className="block text-xs font-bold text-cyan-400 uppercase">{new Date(event.start).toLocaleString('sv-SE', { month: 'short' })}</span>
                               <span className="block text-lg font-bold text-white">{new Date(event.start).getDate()}</span>
                           </div>
                           <div>
                                <h4 className="font-semibold text-white truncate">{event.summary}</h4>
                                <p className="text-sm text-gray-400">{formatDate(event.start)}</p>
                           </div>
                        </a>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Kommande i kalendern</h3>
                <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    Öppna Kalender &rarr;
                </a>
            </div>
            {renderContent()}
        </div>
    );
}
