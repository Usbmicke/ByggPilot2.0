
import React from 'react';

export default function IntegritetspolicyPage() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto bg-gray-800/50 border border-gray-700 rounded-lg p-8 md:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Integritetspolicy för ByggPilot</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6">
            <p className="lead">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

            <p>Din integritet är viktig för oss på ByggPilot. Denna policy förklarar vilken data vi samlar in, varför vi gör det, och hur den skyddas.</p>
            
            <h2 className="text-2xl font-semibold text-white">1. Data vi samlar in</h2>
            <p>
              Vi samlar in information för att kunna tillhandahålla och förbättra vår tjänst. Insamlingen sker på följande sätt:
            </p>
            <ul>
              <li><strong>Grundläggande Kontoinformation:</strong> När du registrerar dig med Google hämtar vi din e-postadress och ditt namn. Detta används för att skapa och administrera ditt ByggPilot-konto och för att kunna kommunicera med dig. Vi har aldrig tillgång till ditt Google-lösenord.</li>
              <li><strong>Information du skapar i tjänsten:</strong> All data du matar in, såsom projektinformation, kundnamn, tidrapporter, offerter och checklistor, sparas i vår säkra databas. Denna data är din och behandlas som konfidentiell.</li>
              <li><strong>Användningsdata:</strong> Vi kan samla in anonymiserad data om hur du interagerar med tjänsten för att identifiera problem, förbättra användarflöden och utveckla nya funktioner.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">1.1. Åtkomst till Google-tjänster</h3>
            <p>
              För att ByggPilot ska kunna fungera som din digitala kollega och automatisera dina arbetsflöden, begär vi din tillåtelse att få åtkomst till specifika delar av ditt Google-konto. Denna åtkomst är fundamental för tjänstens kärnfunktioner. Nedan specificerar vi exakt vilken åtkomst vi begär och varför:
            </p>
            <ul className="space-y-3">
                <li><strong>Google Drive (läsa, skapa, redigera):</strong> För att automatiskt kunna skapa projektmappar, spara offerter som PDF-filer och hantera dina projektdokument.</li>
                <li><strong>Google Calendar (läsa, skapa, redigera):</strong> För att kunna boka in kundmöten, planera projektdeadlines och synkronisera din ByggPilot-planering med din befintliga kalender.</li>
                <li><strong>Gmail (läsa, skriva och skicka):</strong> För att kunna läsa inkommande kundförfrågningar, automatiskt skapa utkast till offertsvar och skicka e-post för din räkning, direkt från ByggPilot.</li>
                <li><strong>Google Tasks (läsa, skapa, redigera):</strong> För att omvandla information från e-post och dokument till konkreta "att-göra"-punkter.</li>
                <li><strong>Google Sheets & Docs (läsa, skapa, redigera):</strong> För att kunna skapa, läsa och redigera rapporter, sammanställningar och andra projektdokument.</li>
                <li><strong>Google Contacts (endast läsa):</strong> För att snabbt kunna hämta kundinformation (namn, e-post, telefon) när du skapar nya projekt, vilket minimerar manuell datainmatning.</li>
            </ul>
            <p className="border-l-4 border-yellow-500 pl-4 bg-yellow-400/10 py-3 mt-4">
              <strong>Din Kontroll:</strong> Denna åtkomst används uteslutande för att utföra de uppgifter du initierar i ByggPilot. Du kan när som helst granska och återkalla dessa behörigheter via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ditt Google-kontos säkerhetsinställningar</a>.
            </p>

            <h2 className="text-2xl font-semibold text-white">2. Hur vi använder din data</h2>
            <p>
              Din data används för att:
            </p>
            <ul>
              <li>Tillhandahålla, underhålla och förbättra ByggPilots funktioner.</li>
              <li>Kommunicera med dig gällande ditt konto, supportärenden och viktiga uppdateringar.</li>
              <li>Skapa säkerhetskopior för att skydda din information.</li>
            </ul>
            <p className="border-l-4 border-cyan-500 pl-4 bg-cyan-400/10 py-2">
              <strong>Viktigt:</strong> Vi kommer aldrig att sälja din data till tredje part. Din projekt- och kunddata är din egendom.
            </p>

            <h2 className="text-2xl font-semibold text-white">3. Datalagring och Säkerhet</h2>
            <p>
              All din data lagras på Google Cloud Platform, vilket är en branschledande och säker molninfrastruktur. Vi förlitar oss på Googles robusta säkerhetsåtgärder för att skydda din information.
            </p>

            <h2 className="text-2xl font-semibold text-white">4. Cookies</h2>
            <p>
              Vi använder cookies för att hantera din inloggningssession och för att förstå hur vår webbplats används. Vår cookie-användning är begränsad till vad som är nödvändigt för tjänstens grundläggande funktionalitet.
            </p>
            
            <h2 className="text-2xl font-semibold text-white">5. Dina Rättigheter</h2>
            <p>
              Du har rätt att begära ut, korrigera eller radera din personliga information. Kontakta oss så hjälper vi dig.
            </p>

            <p className="mt-8">
              Har du frågor om vår hantering av data? Kontakta oss på <a href="mailto:support@byggpilot.se" className="text-blue-400 hover:underline">support@byggpilot.se</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
