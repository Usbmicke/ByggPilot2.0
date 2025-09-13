'use client';

import { useEvents } from '@/app/hooks/useApi';
import { FiZap } from 'react-icons/fi'; // Importera endast den ikon som faktiskt används

// En mappning för att dynamiskt kunna rendera ikoner
const iconMap: { [key: string]: React.ElementType } = {
    FiZap: FiZap,
    // Lägg till andra ikoner här vid behov
};

export default function ImportantEvents() {
    const { events, isLoading, isError } = useEvents();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="font-bold text-xl mb-4">Viktiga Händelser</h2>
            <div className="space-y-4">
                {isLoading && <p className="text-gray-500">Laddar händelser...</p>}
                {isError && <p className="text-red-500">Kunde inte ladda viktiga händelser.</p>}
                
                {!isLoading && !isError && events && events.map(event => {
                    const Icon = iconMap[event.iconName as keyof typeof iconMap] || FiZap; // Fallback-ikon
                    return (
                        <div key={event.id} className={`flex items-start p-4 rounded-lg ${event.color === 'yellow' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <div className={`mr-4 mt-1 p-2 rounded-full ${event.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h3 className={`font-semibold text-gray-800`}>{event.title}</h3>
                                <p className={`text-sm text-gray-600`}>{event.description}</p>
                            </div>
                        </div>
                    )
                })}

                {!isLoading && !isError && (!events || events.filter(e => e.id !== 1).length === 0) && (
                     <div className="p-4 text-center text-gray-500 border-t mt-4">
                        Inga nya viktiga händelser just nu. Allt är lugnt!
                    </div>
                )}
            </div>
        </div>
    );
}
