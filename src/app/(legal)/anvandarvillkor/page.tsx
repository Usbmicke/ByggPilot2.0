
'use client';
import React from 'react';

// Denna komponent är medvetet enkel. Fokus ligger på tydlighet och läsbarhet.
export default function AnvandarvillkorPage() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto bg-gray-800/50 border border-gray-700 rounded-lg p-8 md:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Användarvillkor för ByggPilot</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6">
            <p className="lead">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

            <p>Välkommen till ByggPilot! Genom att använda vår tjänst godkänner du dessa villkor. Läs dem noggrant.</p>
            
            <h2 className="text-2xl font-semibold text-white">1. Tjänstens Syfte och Din Roll</h2>
            <p>
              ByggPilot är ett digitalt verktyg designat för att vara en **proaktiv assistent**, inte en ersättare för professionellt omdöme. Tjänstens syfte är att förenkla, automatisera och ge underlag för beslut inom ditt byggföretag.
            </p>
            <p className="border-l-4 border-yellow-500 pl-4 bg-yellow-400/10 py-2">
              <strong>Viktigt:</strong> Du som hantverkare och företagare bär alltid det slutgiltiga ansvaret för alla beslut, dokument, offerter och åtgärder som vidtas. ByggPilot och dess AI-funktioner är ett stöd, men kan generera felaktig eller ofullständig information.
            </p>

            <h2 className="text-2xl font-semibold text-white">2. Krav på Användaren</h2>
            <p>
              Du förbinder dig att:
            </p>
            <ul>
              <li><strong>Alltid granska och verifiera</strong> all information, alla kalkyler och alla dokument som genereras av ByggPilot innan de skickas till kund, leverantör eller myndighet.</li>
              <li>Använda tjänsten i enlighet med svensk lag och god affärssed.</li>
              <li>Säkerställa att den information du själv matar in i systemet är korrekt.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white">3. Ansvarsfriskrivning</h2>
            <p>
              ByggPilot AB tillhandahåller tjänsten "i befintligt skick". Vi ger inga garantier för att tjänsten är fri från fel eller avbrott. 
            </p>
            <p>
              Vi friskriver oss helt från allt ekonomiskt och juridiskt ansvar för direkta eller indirekta skador som kan uppstå till följd av användning av tjänsten. Detta inkluderar, men är inte begränsat till, felaktiga offerter, missade deadlines, förlorad data eller felaktigt ifyllda juridiska dokument (t.ex. KMA-protokoll).
            </p>

            <h2 className="text-2xl font-semibold text-white">4. Ändringar i Villkoren</h2>
            <p>
              Vi kan komma att uppdatera dessa villkor i framtiden. Vid större förändringar kommer vi att meddela dig via tjänsten. Fortsatt användning efter en uppdatering innebär att du godkänner de nya villkoren.
            </p>

            <p className="mt-8">
              Har du frågor om villkoren? Kontakta oss på <a href="mailto:byggpilot@gmail.com" className="text-blue-400 hover:underline">support@byggpilot.se</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
