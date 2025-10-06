ByggPilot: Konstitution & Masterplan för AI-Agent (v4.0)
Detta dokument är din Konstitution och din Karta. Det är den enda, absoluta och slutgiltiga källan till sanning för ByggPilot-projektet. Det ersätter alla tidigare versioner. All utveckling, utan undantag, utgår härifrån och följer reglerna nedan.

Sektion 1: AI-Agentens Konstitution (Icke-förhandlingsbara Arbetsregler)
Dessa lagar är absoluta och får aldrig brytas. De är utformade för att säkerställa projektets stabilitet, förhindra dubbelarbete och eliminera de krascher som tidigare plågat projektet.

Artikel 1: Noll-Tolerans mot Antaganden.

Verifiera Alltid Före Handling: Innan du skapar, modifierar eller raderar en fil, måste du alltid först använda list_files eller read_file för att verifiera filsystemets nuvarande tillstånd. Agera aldrig på antaganden.

Analysera Alltid Kontext: Innan du skriver kod, läs alla relevanta filer för att bygga en komplett mental karta av arkitekturen. Du måste förstå en fils syfte, dess beroenden och dess relation till andra delar av kodbasen.

Artikel 2: Planera Före Handling.

Presentera Planen Först: Efter din analys måste du presentera en tydlig, steg-för-steg-plan för mig. Planen ska inkludera exakt vilka filer som påverkas och varför.

Invänta Exekveringstillstånd: Du får absolut inte påbörja någon kodning förrän jag har godkänt din plan med "Kör" eller "Godkänd". Inga fler gissningar eller chansningar.

Artikel 3: Kirurgisk Precision.

En Sak i Taget: Fokusera på att lösa en enda, väldefinierad uppgift eller bugg i taget. Blanda inte ihop flera olika problem.

Minimala Ändringar: Gör endast de absolut nödvändiga ändringarna för att lösa den aktuella uppgiften. Ändra aldrig i globala konfigurationsfiler (som tsconfig.json) om det inte är den uttalade huvuduppgiften.

Artikel 4: Omedelbar Verifiering.

Kompilera efter Varje Ändring: Efter varje enskild fil du har modifierat, kör npm run dev i terminalen för att omedelbart verifiera att inga nya kompileringsfel har uppstått.

Rapportera Resultat: Meddela mig resultatet: "Filen X är korrigerad. Kompileringen lyckades utan nya fel." eller "VARNING: Korrigeringen av fil X skapade ett nytt fel: [felmeddelande]". Ingen massändring av filer är tillåten.

Artikel 5: Terminalen är Lag.

Om ett TypeError, ModuleNotFound eller annat serverfel uppstår, är informationen i terminalen den absoluta sanningen. Ignorera aldrig ett felmeddelande. Analysera stackspårningen noggrant för att identifiera den exakta filen, raden och orsaken till felet.

Artikel 6: Eliminera Redundans.

Om du upptäcker dubblerad logik eller komponenter, skapa inte en ny. Flagga detta och föreslå en plan för att konsolidera koden till en enda sanningskälla.

Sektion 2: Projektets Kärna (Vision & Filosofi)
Vision: ByggPilot är inte ett verktyg; det är en proaktiv digital kollega för hantverkare i Sverige. Målet är att eliminera "pappersmonstret" och ge hantverkaren full kontroll.

Kärnvärde: Byggd av en hantverkare, för hantverkare. Empati och förståelse för användarens vardag är allt.

Kärnprincip: Proaktivitet är Standard.

Fel: "Ska vi göra en riskanalys?"

Rätt: "Jag har skapat ett utkast för riskanalysen baserat på projektinformationen. Jag hittade 3 punkter vi bör titta på för att säkra kvaliteten och undvika merkostnader."

Sektion 3: Teknisk Arkitektur (Projektets Ritning)
Detta är kartan över projektet. Följ den strikt för att undvika kaos. (OBS! VI BYGGER FORTFARANDE OM BYGGPILOT SÅ FILERNA KAN ÄNDRAS, VÄNLIGEN UPPDATERA HÄR INNE NÄR VI GÖR ÄNDRINGAR)

3.1. Teknikstack:

Framework: Next.js (App Router)

Styling: Tailwind CSS

Backend: Next.js API Routes & Google Cloud Functions (Serverless)

Databas & Autentisering: Firebase (Firestore & Firebase Authentication)

Hosting: Netlify

Säkerhet: Google Cloud Secret Manager

3.2. Filstruktur (Enda Källan till Sanning):

/app/api/: All backend-logik och API-endpoints.

/app/components/: Alla återanvändbara React-komponenter.

/app/contexts/: Globala providers för state management.

/app/lib/: Kärnbibliotek och konfigurationer (Firebase-anslutningar, etc.).

/app/services/: Funktioner för att interagera med externa tjänster.

/app/types/: Centraliserade TypeScript-typer.

/ai_context.md: Detta dokument.

3.3. Kritiska Filer & "Enda Källan till Sanning":

Autentisering: All logik för autentisering finns exklusivt i app/api/auth/[...nextauth]/route.ts. Rör aldrig denna fil utan en specifik order.

Sökvägar: Alla sökvägs-alias (@/) definieras exklusivt i tsconfig.json.

3.4. Kända Systematiska Fel & Fallgropar (LÄS DETTA NOGA):

Import-buggen (@/app/): Det mest återkommande felet i detta projekt är felaktiga importer. tsconfig.json definierar @/ som en genväg till mappen app/. Därför är en import som import... from '@/app/lib/...' ALLTID FEL. Den korrekta syntaxen är import... from '@/lib/...'. Var extremt noggrann med detta.

Hantering av Hemligheter: API-nycklar och andra hemligheter får ALDRIG hårdkodas. Använd .env.local endast för lokal utveckling. I produktion hanteras alla hemligheter via Google Cloud Secret Manager. Skapa aldrig en ny .env-fil utan att fråga.

Sektion 4: Guldstandard-Visionen (Målbeskrivningen)
Detta är den produkt vi bygger. All kod du skriver ska bidra till att förverkliga denna vision.

4.1. Dashboarden (The Action Center):

Kommandocentral: Sökrutan ska vara en kommandocentral (Cmd/Ctrl+K) för både sök och snabba handlingar ("Nytt projekt", "Starta tid").

Proaktiva Aviseringar: Aviseringsklockan ska visa intelligenta notiser (vädervarningar, kundinsikter, slutförda uppgifter).

Dynamiska KPI-kort: Korten för projekt och intäkter ska visa en jämförelsesiffra mot föregående period (t.ex. ▲ 15% vs. förra kvartalet).

Snabb-logg Widget: En widget på dashboarden för att direkt kunna starta/stoppa tidtagning och checka in/ut från personalliggaren för ett valt projekt.

4.2. Chatten (The Co-Pilot):

Beteende: Chatthistoriken ska vara persistent. Den intelligenta hälsningsfrasen visas bara en gång per session. All felhantering ska vara robust och användarvänlig.

Visuell Design: Meddelanden ska ha mer "luft". Checklistor och dokumentlänkar ska renderas som egna, snyggt inramade komponenter inuti chattflödet, med funktioner som en kopiera-ikon.

4.3. Intelligenta Flöden (Den Flytande +-knappen):

"Skapa nytt" knapp till höger om sökfältet öppnar en modal med fyra val: Nytt Projekt, Skapa Offert, Ny Kund, Skapa ÄTA.

"Nytt Projekt"-flöde: Ska aktivera Projekt-Co-Piloten som automatiskt analyserar projektet, skapar en dynamisk checklista och genererar ett utkast till Arbetsmiljöplan (AMP) om det krävs enligt AFS 2023:3.

"Skapa Offert"-flöde: Ska initiera den konversationella offertmotorn och, efter slutförd offert, proaktivt erbjuda att skapa ett juridiskt avtalsförslag baserat på Hantverkarformuläret 17.

"Skapa ÄTA"-flöde: Ska generera ett formellt underlag och kritiskt avslutas med att proaktivt föreslå att skicka det till kunden för godkännande för att undvika tvister.