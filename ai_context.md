'''
# AI Context for ByggPilot 2.0 Development

This document outlines the development plan and key architectural decisions for the ByggPilot 2.0 application. As the AI assistant, my primary role is to execute tasks based on this plan, adhering strictly to the specified quality and security standards.

## Development Plan & Status

The project is divided into distinct phases. We will tackle them sequentially unless a change in priority is explicitly communicated.

**Grundläggande Setup & Kärnfunktionalitet**

*   **[AVKLARAD] Fas 1: Projektinitialisering & Teknisk Stack:** Next.js (App Router), TypeScript, Tailwind CSS, NextAuth.js, Firebase (Authentication, Firestore, Storage).
*   **[AVKLARAD] Fas 2: Firebase-koppling:** Grundläggande konfiguration för Firebase Admin SDK är på plats.
*   **[AVKLARAD] Fas 3: Databasmodellering (Firestore):** Definierade datastrukturer för `users`, `projects`, och `customers`.
*   **[AVKLARAD] Fas 4: Grundläggande Inloggning & Användarprofiler:** Implementering av Google OAuth 2.0. Blockerare åtgärdad.
*   **[AVKLARAD] Fas 5: Skapa Nytt Projekt (Kärnflöde):** API-route och service-logik för att skapa projekt i Firestore och Drive är komplett.
*   **[AVKLARAD] Fas 6: Detaljerad Projektvy:** API och sida för att visa ett enskilt projekt är skapade.
*   **[PÅGÅENDE] Fas 7: Dashboard & Projektlista:** En översiktssida som listar användarens alla projekt.
*   **[PÅGÅENDE - INTERN] Demoläge:** Ett komplett demoläge har byggts för att demonstrera applikationens UI och värde.

**Efterföljande Faser (Enligt tidigare plan):**

*   **Fas 8: Proaktiv Väder- och Varningsassistent (SMHI)**
*   **Fas 9: Dynamisk Regelverkskontroll (Lantmäteriet & Boverket)**
*   **Fas 10: Geologisk Riskbedömning (SGU)**
*   **Fas 11: System för Kontinuerligt Lärande**
*   **Fas 12: Förbättrad Användbarhet i Fält (Röststyrning & PWA)**
*   **Fas 13: Slutgiltig Kvalitetssäkring**

## Stående Order & Kvalitetskrav

*   **Noggrannhet Först:** Läs och förstå filer *innan* du skriver till dem. Oavsiktlig överskrivning av filer (`.env.local`, etc.) är oacceptabelt. Dubbelkolla alltid sökvägar och innehåll.
*   **Inga Syntaxfel:** Validera all kod du skriver. Att introducera syntaxfel är ett allvarligt misstag som bryter utvecklingsflödet.
*   **Inga API-loopar:** Använd inte verktyg i repetitiva loopar. Tänk igenom planen och agera metodiskt, steg-för-steg.
*   **Säkerhet:** Alla API-routes måste verifiera användarens session. Inga känsliga nycklar (`.env.local`, `serviceAccountKey.json`) får någonsin exponeras eller checkas in.
*   **Testning:** All ny backend-logik (API Routes) ska, när grundfunktionaliteten är på plats, åtföljas av tester med Vitest.
*   **Effektivitet:** Använd `fields`-parametern vid anrop till externa API:er (som Google Drive) för att minimera datamängd. Undvik onödiga databasläsningar.

'''