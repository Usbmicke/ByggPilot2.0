# BYGGPILOT AI MASTER INSTRUCTIONS (v2025.12 - Genkit Gold Standard)

## 1. Primärt Direktiv: Följ Arkitekturen

Min främsta uppgift är att strikt följa och upprätthålla den arkitektur som definieras i `docs/ARCHITECTURE.md`. Mitt mål är att skriva ren, säker och underhållbar kod som är enkel att förstå för både människor och andra AI-modeller.

## 2. Arkitekturens Kardinalregler (Ej förhandlingsbara)

1.  **All Logik via Genkit Flows:** **ALL** affärslogik, databasinteraktion och AI-anrop **SKALL** implementeras som ett Genkit-flöde (`defineFlow`) i `src/genkit/flows/`.

2.  **Inga Manuella API-Rutter:** Jag får **ALDRIG** skapa manuella API-filer i `src/app/api/`. Den enda tillåtna filen där är den automatiska gatewayen `src/app/api/[[...genkit]]/route.ts`. All kommunikation mellan klient och server sker genom direkta anrop till Genkit-flöden med `runFlow()` från klienten.

3.  **Strikt Databasåtkomst (DAL):** All interaktion med Firestore (läsa, skriva) **MÅSTE** gå via funktioner som exporteras från `src/genkit/dal/`. Detta är den enda platsen där `firebase-admin` får förekomma. Jag får aldrig försöka komma åt databasen från en klientkomponent.

4.  **Säkerhet Först - Alltid:** Varje Genkit-flöde som hanterar användardata eller utför skyddade handlingar **MÅSTE** ha en `authPolicy: firebaseAuth(...)` definierad. Jag förlitar mig på Genkits inbyggda token-validering och anser all data i `auth`-kontexten som verifierad.

## 3. Min Roll: Arkitektens Väktare

Min roll är proaktiv. Jag ska inte bara skriva kod på begäran, utan också agera som en väktare av arkitekturen.

- **Granska & Refaktorera:** Om jag stöter på kod som bryter mot ovanstående regler (t.ex. en manuell API-rutt, databaslogik utanför DAL, osäkra flöden) är det min plikt att identifiera detta och omedelbart påbörja en refaktorering för att anpassa koden till den korrekta arkitekturen.
- **Förenkla:** Jag strävar alltid efter att implementera lösningar på det enklaste och mest direkta sättet som arkitekturen tillåter, vilket nästan alltid innebär att skapa ett Genkit-flöde och anropa det från klienten.

# ByggPilot Arkitektur (v2025.12 - Genkit Gold Standard)

## 1. Kärnstack
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS.
- **Backend & AI:** Firebase Genkit.
- **Modell:** Google Gemini (f.n. 1.5 Flash).
- **Databas:** Firestore (endast åtkomlig från server-sidan via Genkit).
- **Autentisering:** Firebase Authentication.

## 2. Arkitekturens Huvudprinciper

Målet är maximal enkelhet och säkerhet. Vi uppnår detta genom att låta varje del av teknologistacken göra det den är bäst på, utan onödig "limkod".

1.  **Next.js för Gränssnitt:** `src/app` hanterar **enbart** routing och presentation. All affärslogik, databasåtkomst och AI-hantering sker via anrop till Genkit.
2.  **Genkit för All Logik (Hjärnan):** `src/genkit` är applikationens hjärna. **ALL** affärslogik, databashantering och AI-processer definieras här som `flows`.
3.  **En Enda, Säker API Gateway:** Vi använder **endast** Genkits inbyggda, automatiska API-rutt: `src/app/api/[[...genkit]]/route.ts`. Denna fil agerar som en intelligent och säker portvakt för alla våra `flows`. **Manuella API-rutter i `src/app/api` är strikt förbjudna.**

## 3. Det "Heliga Flödet" - Hur ett anrop fungerar

Detta är det enda mönstret vi använder för att kommunicera mellan klient och server. Det är säkert, enkelt och effektivt.

1.  **Klienten anropar ett flöde:** I en React-komponent (`.tsx`) anropas ett Genkit-flöde direkt.
    ```typescript
    // Exempel från en klientkomponent
    import { runFlow } from '@genkit-ai/flow/client';
    import { onboardingFlow } from '@/genkit/flows/onboarding'; // Direkt import!

    const result = await runFlow(onboardingFlow, {
      companyName: 'Testbolaget AB',
      logoUrl: 'https://...'
    });
    ```
2.  **Automatisk & Säker Transport:** `runFlow`-biblioteket gör två saker automatiskt:
    a. Hämtar en färsk, kortlivad Firebase ID-token.
    b. Skickar ett `POST`-anrop till `/api/onboardingFlow` med anropsdata och ID-token i `Authorization`-headern.

3.  **Genkits Gateway tar emot:** `src/app/api/[[...genkit]]/route.ts` tar emot anropet och dirigerar det till rätt flöde baserat på namnet (`onboardingFlow`).

4.  **Säkerhetsvalidering på Servern:** Innan någon kod körs, exekveras flödets `authPolicy`.
    ```typescript
    // Utdrag från src/genkit/flows/onboarding.ts
    export const onboardingFlow = defineFlow({
      name: 'onboardingFlow',
      inputSchema: z.object({...}),
      // 👇 DENNA KOD KÖRS FÖRST!
      authPolicy: firebaseAuth(async (user) => {
        // Genkit har redan validerat Firebase-token. Anropet avvisas
        // om token är ogiltig. `user`-objektet är garanterat giltigt.
      }),
    }, async (payload, { auth }) => {
      // Din logik körs först EFTER att säkerheten är verifierad.
      const uid = auth.uid; // Säker åtkomst till användarens UID.
      // ... databaslogik här ...
    });
    ```

5.  **Logik & Databasåtkomst:** Först efter en lyckad validering körs flödets huvudlogik. Här anropas databasfunktioner från `src/genkit/dal`.

## 4. Strikt Regel: Databasåtkomst (DAL)

- **`src/genkit/dal` är den enda portvakten till databasen.**
- Detta är den **enda** platsen i hela kodbasen där `firebase-admin` importeras och används.
- Alla databasinteraktioner (läsa, skriva, uppdatera) **måste** ske via en funktion som exporteras från en fil i denna mapp (t.ex. `user.repo.ts`).
- Klient-appen (`src/app`, `src/features`, etc.) har **aldrig** direktkontakt med databasen.

Genom att följa dessa regler säkerställer vi att vår applikation är säker, skalbar och enkel att underhålla för både människor och AI-assistenter.
