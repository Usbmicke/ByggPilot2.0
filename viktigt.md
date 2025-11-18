# ByggPilot Arkitektur: Kärnprinciper & Flöden (v4.0)

Detta dokument beskriver den grundläggande arkitekturen för ByggPilot-applikationen. Det fokuserar på säkerhet, kostnadseffektivitet och stabilitet.

## 1. Kärnprinciper

### A. Säkerhet och Kostnadskontroll Först

Den absolut viktigaste principen är att skydda vår data och undvika oväntade kostnader. Detta uppnås genom att **låsa databasen helt** från direkt åtkomst från webbläsaren.

- **Firestore-regler:** Våra `firestore.rules` är inställda på `allow read, write: if false;`. Detta betyder att **ingen** kan läsa från eller skriva till databasen direkt från en klient (t.ex. en webbläsare). Detta förhindrar både attacker och buggar från att orsaka skenande kostnader.
- **Databastyp:** Vi använder **Firestore**, en NoSQL-databas från Firebase. Den har en mycket generös permanent gratisnivå (tiotusentals operationer per dag). Vår arkitektur är designad för att hålla sig väl inom dessa gränser. Det är **inte** en dyr SQL-databas.

### B. Strikt Separation: Frontend vs. Backend

Applikationen är uppdelad i två tydliga delar:

1.  **Frontend (Klienten):** Allt som körs i användarens webbläsare (React-komponenter i `/src`). Frontend är "dumt" och har ingen direkt tillgång till databasen. Dess enda uppgift relaterad till autentisering är att bekräfta användarens identitet med Firebase Authentication.
2.  **Backend (Servern):** All logik som körs på vår server (API Routes i `/src/app/api` och Server Actions). **Endast backend får prata med databasen.** Den använder `firebase-admin` SDK, vilket ger den fullständig och säker kontroll.

---

## 2. Det Centrala Autentiseringsflödet

Detta är processen för hur en användare loggar in och får en säker session. Den är helautomatisk.

1.  **Inloggning på Klienten:**
    - Användaren klickar på "Logga in med Google".
    - Firebase Client SDK (i webbläsaren) hanterar hela inloggningsprocessen med Google.
    - När inloggningen är klar, returnerar Firebase ett **ID Token**. Detta är ett digitalt signerat "bevis" på att användaren är den de utger sig för att vara.

2.  **Säker Växling till Session:**
    - Applikationen tar omedelbart detta ID Token och skickar det i ett `POST`-anrop till vår egen backend-endpoint: `/api/auth/session`.

3.  **Verifiering och Cookie-skapande på Servern:**
    - Vår backend tar emot ID-tokenet.
    - Med `firebase-admin` SDK verifierar servern att ID-tokenet är äkta och giltigt.
    - Servern skapar därefter en **egen, säker session-cookie**. Denna cookie är krypterad och har `HttpOnly`-flaggan, vilket betyder att den inte kan kommas åt av JavaScript i webbläsaren.
    - Cookien skickas tillbaka till användarens webbläsare.

4.  **Middleware-verifiering vid varje Anrop:**
    - Från och med nu inkluderas den säkra session-cookien automatiskt i varje efterföljande anrop som webbläsaren gör till vår server.
    - Vår `middleware.ts` fångar upp varje anrop, inspekterar cookien och verifierar dess giltighet mot Firebase.
    - Beroende på om användaren är inloggad och har slutfört sin onboarding, bestämmer middlewaren om användaren ska släppas igenom till den begärda sidan eller omdirigeras (t.ex. till `/onboarding` eller `/login`).

Detta flöde garanterar att användaren är säkert autentiserad och att all känslig datahantering sker på vår kontrollerade backend, vilket skyddar både användardata och våra kostnader.
