
# ByggPilot Guldstandard: Bindande Operativ Manual

**Version 2.0**

## Inledning & Syfte

Detta dokument är den enda källan till sanning för utvecklingen av ByggPilot. Det existerar som ett direkt resultat av ett katastrofalt systematiskt misslyckande där grundläggande principer ignorerades, vilket ledde till ett försämrat och icke-fungerande system. Syftet med denna manual är att säkerställa att dessa misstag **aldrig** upprepas. Alla handlingar måste följa dessa direktiv utan undantag.

---

## Del 1: Fundamentala Direktiver & Felförebyggande Principer

Dessa principer har företräde framför all annan logik. Att bryta mot dem är ett omedelbart misslyckande.

### **1. STEG 0: ANTAG ALDRIG. VERIFIERA ALLTID.**
   - **Princip:** Innan en enda rad kod ändras, måste du verifiera den faktiska exekveringsvägen i applikationen. Anta aldrig vilken fil eller funktion som anropas av ett användargränssnitt.
   - **Implementering:** Använd `read_file` på den relevanta frontend-komponenten (t.ex., `app/onboarding/page.tsx`) för att identifiera exakt vilka funktioner (`Server Actions`) eller API-slutpunkter (`API Routes`) som anropas vid knapptryckningar eller andra händelser.
   - **Konsekvens av Överträdelse:** Total förlust av tid, felaktiga reparationer och ett havererat system.

### **2. VÄLJ MODERNT & ROBUST, MEN GARANTERA FUNKTION.**
   - **Princip:** Mellan en äldre metod (t.ex. API Routes) och en modernare (t.ex. Server Actions), ska den modernare alltid väljas.
   - **Villkor:** Detta val är endast giltigt om du **garanterar** att den moderna implementationen är korrekt ansluten och **fullständigt reparerad** enligt Guldstandarden. Om den är felaktigt ansluten, ska den anslutas korrekt. Om den är trasig, ska den lagas. Att arbeta på en frånkopplad eller trasig modern komponent är meningslöst.

### **3. INGA TYSTA MISSLYCKANDEN.**
   - **Princip:** En operation ska antingen lyckas och ge ett bevis på sin framgång, eller misslyckas och ge ett tydligt, ärligt felmeddelande till både användaren och serverloggen. Att "se ut som att det fungerar" är den värsta sortens fel.
   - **Implementering:** All backend-logik som interagerar med externa API:er eller databaser måste vara omsluten av meningsfulla `try...catch`-block.
     - `try`: Utför operationen. Logga framgångssteg.
     - `catch`: Logga det **detaljerade** felet på servern. Returnera ett `{ success: false, error: "Användarvänligt felmeddelande" }` till klienten.

---

## Del 2: Teknisk Guldstandard för Backend-Interaktioner

### **A. Autentisering & API-Anrop (`app/api/auth/[...nextauth]/route.ts`, `lib/google-server.ts`)**

1.  **Fullständigt Scope är Lag:** Systemet **ska** alltid begära den fullständiga uppsättningen av fem behörigheter. Inga undantag.
    - `https://www.googleapis.com/auth/userinfo.profile`
    - `https://www.googleapis.com/auth/userinfo.email`
    - `https://www.googleapis.com/auth/drive`
    - `https://www.googleapis.com/auth/calendar`
    - `https://www.googleapis.com/auth/tasks`

2.  **`refreshToken` är Heligt:**
    - **Lagring:** Vid första inloggning (`jwt` callback), ska `refreshToken`, `accessToken` och dess `expires_at` omedelbart och **direkt** sparas på `users`-dokumentet i Firestore. Detta är den enda tillåtna metoden. Den separata `accounts`-samlingen ska ignoreras för detta syfte.
    - **Hämtning:** Alla funktioner som behöver göra autentiserade Google-anrop **ska** använda hjälpfunktionen `lib/google-server.ts`. Denna funktion är den enda som är auktoriserad att läsa `refreshToken` från `users`-dokumentet och skapa en autentiserad klient.

3.  **Synkroniserad Auth-Användare:**
    - **Princip:** Användarlistan i Firebase Authentication får inte innehålla "-".
    - **Implementering:** `signIn`-callbacken **ska** användas för att omedelbart uppdatera den nyskapade Firebase Auth-användaren med korrekt e-post från Google-profilen.

### **B. Backend-Logik (Server Actions, API Routes)**

1.  **Validera All Input:** All data från klienten ska valideras med Zod innan den används.
2.  **Villkorlig Databasuppdatering:** Kritiska flaggor (som `onboardingComplete`) får **endast** uppdateras efter ett bevisat, lyckat slutförande av den associerade operationen (t.ex. ett API-anrop till Google Drive som returnerat `success`).
3.  **Detaljerad Server-loggning:** Komplexa operationer (som att skapa en mappstruktur) **ska** innehålla detaljerad, steg-för-steg-loggning på servern för att möjliggöra transparent felsökning. Exempel: "Försöker hämta klient...", "Klient hämtad.", "Försöker skapa rotmapp...", "Rotmapp skapad med ID...".

---

## Del 3: Guldstandardens Tillämpning per Funktion

Dessa regler är inte teoretiska. De ska tillämpas enligt följande:

### **Onboarding**
- **Status:** **KRITISKT FEL.** Måste omedelbart repareras enligt hela denna manual.
- **Flöde:** `onboarding/page.tsx` anropar `createDriveStructure` i `app/actions/onboardingActions.ts`. Denna action **ska** följa alla regler i Del 1 & 2. Den ska anropa `lib/google-server.ts` för att få en klient, använda den för att skapa mappar i Drive, och **endast** därefter uppdatera `onboardingComplete: true` i Firestore. Felhanteringen ska vara 100% transparent.

### **Projekthantering (Skapa Projekt, ÄTA, etc.)**
- **Regel:** När ett projekt eller ÄTA skapas som kräver ett dokument i Drive:
  1. Använd `lib/google-server.ts` för att få en autentiserad Drive-klient.
  2. Använd klienten för att skapa/kopiera ett dokument från en mall.
  3. Spara ID/länk till det nya dokumentet i projektets data i Firestore.
  4. Returnera ett tydligt resultat till användaren.

### **Chatt & Filhantering**
- **Regel:** När en fil laddas upp i en chatt:
  1. Använd `lib/google-server.ts` för att få en autentiserad Drive-klient.
  2. Hämta projektets unika mapp-ID från Firestore.
  3. Ladda upp filen till den specifika projektmappen.
  4. Spara en referens till filen i chatt-meddelandet i Firestore.

### **Kalender & Tasks**
- **Regel:** När en kalenderhändelse eller en task skapas:
  1. Använd `lib/google-server.ts` för att få en autentiserad `Calendar` eller `Tasks` klient.
  2. Skapa händelsen/tasken med relevant information.
  3. Spara eventuellt ID i Firestore om framtida referens behövs.
  4. Bekräfta skapandet för användaren.
