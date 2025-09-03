'use client';
import React from 'react';
import { IconMail, IconMessageSquare, IconMoreHorizontal } from '@/app/constants';

const cardBaseStyle = "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5";

const recentEvents = [
    {
        id: 1,
        icon: <IconMail className="w-5 h-5 text-cyan-400" />,
        text: 'Nytt mail från "Kalle Svensson" ang. anbud för Villa Ekhagen.',
        actionText: 'Skapa Projektförslag',
    },
    {
        id: 2,
        icon: <IconMessageSquare className="w-5 h-5 text-purple-400" />,
        text: 'Röstmemo transkriberat: "Kom ihåg att beställa mer 12mm armeringsjärn till BRF Utsikten.",
        actionText: 'Lägg till som uppgift',
    },
     {
        id: 3,
        icon: <IconMail className="w-5 h-5 text-cyan-400" />,
        text: 'Nytt mail från "Elfirman AB" med offert för elarbeten.',
        actionText: 'Spara till dokument',
    }
];

const RecentEventsWidget: React.FC = () => {
    return (
        <div className={cardBaseStyle}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-100 text-lg">Senaste Händelser</h3>
                <button className="text-gray-500 hover:text-white">
                    <IconMoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4">
                {recentEvents.map(event => (
                    <div key={event.id} className="flex flex-col gap-3 p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">{event.icon}</div>
                            <p className="text-sm text-gray-300">{event.text}</p>
                        </div>
                        <button className="w-full text-center bg-gray-700/80 text-gray-200 text-xs font-semibold py-2 rounded-md hover:bg-cyan-500 hover:text-white transition-colors">
                            {event.actionText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentEventsWidget;
