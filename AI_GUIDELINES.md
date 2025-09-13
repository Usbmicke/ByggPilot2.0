# AI-Riktlinjer för Projektet

Detta dokument innehåller strikta regler och en teknisk översikt för alla AI-agenter som interagerar med denna kodbas. Syftet är att säkerställa kodkvalitet, undvika regressioner och förhindra de misstag som ledde till autentiseringsfelet i juni 2024.

## 1. Autentiseringssystemet: En Enda Källa till Sanning

**ABSOLUT REGEL: All logik och konfiguration för autentisering finns och hanteras EXKLUSIVT i filen `app/api/auth/[...nextauth]/route.ts`.**

- **Dataflöde vid Inloggning:**
  1. Användaren signerar in via Google på klienten.
  2. NextAuth `jwt`-callback i `route.ts` aktiveras.
  3. Koden söker efter användarens e-post i Firestore-collectionen `users`.
  4. **Om användaren inte finns:** En ny användare skapas direkt i callbacken med `addDoc()`.
  5. **Om användaren finns:** Befintligt användar-ID hämtas från Firestore-dokumentet.
  6. Det interna Firestore-användar-ID:t sparas i JWT-token (`token.id`).
  7. `session`-callbacken tar ID:t från token och lägger till det i klientens session (`session.user.id`).

- **`firestoreService.ts`:** Denna fil (`app/services/firestoreService.ts`) exporterar **ENDAST** de grundläggande `db` (Firestore DB) och `auth` (Firebase Auth) instanserna. Den innehåller **INGA** hjälpfunktioner som `getUser` eller `createUser`. Varje försök att importera sådana funktioner kommer att krascha applikationen.

## 2. Strikta Regler för AI-Agent-Beteende

### REGEL 1: Anta ALDRIG att en funktion existerar
Du får **ALDRIG** skriva kod som anropar en importerad funktion utan att först ha verifierat att funktionen faktiskt exporteras från målfilen. Läs filen och kontrollera dess `export`-satser. Detta är den högsta prioriteten.

### REGEL 2: Terminalen och Felmeddelanden är Lag
Om ett `TypeError`, `ModuleNotFound` eller annat serverfel uppstår, är informationen i terminalen den absoluta sanningen. Ignorera **ALDRIG** ett felmeddelande. Analysera stackspårningen noggrant för att identifiera den exakta filen, raden och orsaken till felet.

### REGEL 3: Verifiera Beroenden mot `package.json`
Innan du använder eller importerar från ett bibliotek (t.ex. `openai`, `firebase-admin`), verifiera att det är korrekt specificerat som ett beroende i `package.json`. Anta inte att ett bibliotek är installerat.

### REGEL 4: Eliminera Redundans
Om du upptäcker dubblerad logik (som den tidigare konflikten mellan `lib/auth.ts` och `api/auth/[...nextauth]/route.ts`), ska du flagga detta och föreslå en plan för att konsolidera koden till en enda sanningskälla.

---
*Detta dokument skapades efter en grundlig felsökning och reparation av autentiseringsflödet. Att följa dessa regler är avgörande för projektets stabilitet.*