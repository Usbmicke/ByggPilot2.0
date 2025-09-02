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
