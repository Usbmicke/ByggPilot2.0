# Projektplan: ByggPilot Webbapp

## 1. Ditt Uppdrag & Persona

Du är en proaktiv och effektiv AI-kodningspartner integrerad i en IDE. Ditt mål är att förutse och uppfylla användarens önskemål. Arbeta metodiskt, ett litet och säkert steg i taget. Agera istället för att bara berätta. Sök bekräftelse vid större beslut eller osäkerhet.

## 2. Projektets Huvudplan

Projektet är uppdelat i två huvudfaser. Vi slutför en fas i taget.

### FAS 1: Landningssida (NUVARANDE FOKUS)

*   **Mål:** Bygga en komplett, säljande landningssida baserad på designen och innehållet från mall-mappen (`byggpilot-v2.0 MALL`).
*   **Process:**
    1.  Strukturera sidan i `app/(public)/page.tsx`.
    2.  Implementera alla sektioner (Hero, Problem, Features, etc.) med korrekt HTML/JSX och Tailwind CSS.
    3.  Extrahera färger, typsnitt och layoutlogik från mallen.
    4.  Implementera interaktiva element som "Tips för proffs"-modalen.
*   **Avslutande Steg (Fas 1):** När hela landningssidan är visuellt och funktionellt komplett och godkänd, är det sista steget att koppla "Logga in"-knapparna till Firebase Authentication.

### FAS 2: Dashboard (FRAMTIDA FOKUS)

*   **Mål:** Efter att landningssidan är klar, påbörja återbyggnaden av användarens dashboard.
*   **KRITISK REGEL:** Under inga omständigheter får befintlig Firebase-logik, API-anrop eller annan kritisk backend-funktionalitet som rör dashboarden förstöras eller ändras utan en uttrycklig och detaljerad plan. Återbyggnaden ska ske med största försiktighet för att bevara den befintliga kärnfunktionaliteten.

## 3. Nuvarande Status & Nästa Steg

*   **Projektfas:** Vi är i **Fas 1: Landningssida**.
*   **Hittills:** Huvudstrukturen för landningssidan är på plats i `app/(public)/page.tsx`. Sektionerna från Hero till Features är implementerade.
*   **Problem:** Vi upplever ett "hydration mismatch"-fel från `AnimatedBackground`-komponenten.
*   **Omedelbart Mål:**
    1.  **Fixa felet:** Åtgärda "hydration mismatch"-felet i `AnimatedBackground` genom att säkerställa att slumpmässig generering endast sker på klientsidan med `useEffect`.
    2.  **Implementera "Kunskapsbanken":** Aktivera knappen "Öppna kunskapsbanken" genom att:
        *   Definiera en `ProTipsModal`-komponent inuti `page.tsx`.
        *   Fylla den med innehållet från mallen.
        *   Använda `useState` för att styra dess synlighet.
        *   Koppla `onClick`-händelsen på knappen till att öppna modalen.

TIllägg viktigt!!
Att systematiskt ersätta den nuvarande landningssidan (app/(public)/page.tsx) med den mer avancerade designen och strukturen från mallen som finns i mappen byggpilot-v2.0 MALL.

VIKTIGT: Denna operation ska utföras med stor försiktighet. All befintlig funktionalitet, särskilt Firebase-integrationen för autentisering och framtida API-anrop, måste bevaras och fungera felfritt efter övergången.

Referensdokument:

Ai_context.md: Bekräftar att vi är i FAS 1: Landningssida.
prompt.md: Innehåller de ursprungliga instruktionerna och designspecifikationerna som byggpilot-v2.0 MALL baseras på.
Först mappar vi upp filerna från mallen mot de befintliga filerna i vårt projekt.

Mallfil (byggpilot-v2.0 MALL)	Målfil i projektet	Syfte
App.tsx	app/(public)/page.tsx	Huvudkomponent för landningssidan
components/layout/Header.tsx	app/components/Header.tsx	Sidhuvud
components/layout/Sidebar.tsx	(Ny fil, om nödvändigt)	Sidofält
components/views/*.tsx	Delar av app/(public)/page.tsx	Sektioner på landningssidan
constants.tsx	(Ny fil)	Ikoner och konstanter
types.ts	(Ny fil)	TypeScript-typer
Vi kommer att arbeta oss igenom app/(public)/page.tsx och ersätta varje sektion en i taget med motsvarande kod från byggpilot-v2.0 MALL/App.tsx. Detta minimerar risken för fel.

Header: Ersätt innehållet i app/components/Header.tsx med det från byggpilot-v2.0 MALL/components/layout/Header.tsx. Vi måste vara noga med att behålla den befintliga handleLogin-funktionen och useAuth-anropet.

Hero Section: Byt ut den nuvarande Hero-sektionen i app/(public)/page.tsx mot koden för motsvarande sektion från byggpilot-v2.0 MALL/App.tsx.

Problem/Solution Section: Identifiera och ersätt nästa sektion på samma sätt.

...och så vidare: Fortsätt denna process för varje sektion (Features, Workflow, etc.) tills hela innehållet i app/(public)/page.tsx är utbytt.

Många av de nya sektionerna kommer att förlita sig på mindre, återanvändbara komponenter och ikoner.

Skapa nya komponenter: Komponenter som ProjectCard.tsx, RecentEventsWidget.tsx, etc., från byggpilot-v2.0 MALL/components/dashboard/ kommer att behöva skapas i vår app/components/-mapp.

Skapa constants.tsx: Skapa en ny fil app/constants.tsx och kopiera över alla ikoner och andra konstanter från byggpilot-v2.0 MALL/constants.tsx. Detta centraliserar ikonerna och gör koden renare.

Skapa types.ts: Om mallen använder specifika TypeScript-typer, skapa en app/types.ts och kopiera över dem.

Detta är det mest kritiska steget.

Autentisering: När vi ersätter Header och andra delar som har inloggningsknappar, måste vi säkerställa att onClick={handleLogin} och all logik som kommer från useAuth() (/app/providers/AuthContext.tsx) förblir intakt. Den nya koden ska anpassas för att använda vår befintliga login-funktion, inte introducera en ny.

State Management: Den nuvarande page.tsx använder useState för modalen. Den nya mallen kan ha sin egen state. Vi måste integrera dessa på ett kontrollerat sätt utan konflikter.

Mallen kommer med egna stildefinitioner.

Tailwind-konfiguration: Jämför tailwind.config.ts från mallen med vår befintliga och sammanfoga eventuella unika teman, färger eller plugins.
Globala stilar: Kontrollera om app/globals.css behöver uppdateras med stilar från mallen, som de som anges i prompt.md.
Efter varje större ändring, och definitivt efter att hela sidan är utbytt, måste vi noggrant testa:

Landningssidans rendering: Ser allt korrekt ut på olika skärmstorlekar?
Inloggningsflödet: Fungerar "Logga in med Google"-knappen som förväntat?
Konsolloggar: Finns det några felmeddelanden i webbläsarens konsol?
Befintlig funktionalitet: Har vi oavsiktligt tagit bort eller förstört något som tidigare fungerade?
Genom att följa denna metodiska plan kan vi genomföra en komplex uppdatering på ett säkert och kontrollerat sätt.