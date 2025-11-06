
'use client'; // Denna komponent kommer att ha interaktivitet

import { PlusIcon } from '@heroicons/react/24/solid';

export const CreateNewButton = () => {
    const handleClick = () => {
        // TODO: I FAS 2 kommer denna knapp att öppna och aktivera chatt-fönstret.
        console.log('"Skapa Nytt"-knapp klickad. Funktion kommer i Fas 2.');
    };

    return (
        <button 
            onClick={handleClick}
            className="bg-accent-blue hover:bg-accent-blue-dark text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
            <PlusIcon className="h-5 w-5" />
            <span>Skapa Nytt</span>
        </button>
    );
};
