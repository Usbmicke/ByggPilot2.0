'use client';

import { useState } from 'react';
import { generateTextAction } from './actions'; // Importera bara server actionen

export default function Home() {
  const [result, setResult] = useState('');

  const handleClick = async () => {
    const response = await generateTextAction("Berätta ett kort skämt om byggarbetare.");
    if (response.success) {
      setResult(response.text || "");
    } else {
      setResult("Fel: " + response.error);
    }
  };

  return (
    <div className="p-10">
      <button 
        onClick={handleClick}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Testa Genkit
      </button>
      <p className="mt-4 text-white">{result}</p>
    </div>
  );
}
