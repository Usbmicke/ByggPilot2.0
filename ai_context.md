
# ByggPilot Guldstandard: Bindande Operativ Manual

**Version 3.0**

## Inledning & Syfte

Detta dokument är den enda källan till sanning för utvecklingen av ByggPilot. Det existerar som ett direkt resultat av ett katastrofalt systematiskt misslyckande där grundläggande principer ignorerades, vilket ledde till ett försämrat och icke-fungerande system. Syftet med denna manual är att säkerställa att dessa misstag **aldrig** upprepas. Alla handlingar måste följa dessa direktiv utan undantag.

---

## Del 0: Total Systemintegritetskontroll (TSK) - Alltid Först

**Princip:** Innan någon kodändring eller funktionsspecifik analys påbörjas, måste en Total Systemintegritetskontroll genomföras. Detta är ett icke förhandlingsbart första steg. Syftet är att säkerställa att projektets grundläggande konfiguration är korrekt och att inga dolda fel existerar på systemnivå.

**Implementering (TSK-Checklista):**

1.  **Verifiera `tsconfig.json`:**
    -   **Krav:** Läs filen och säkerställ att `"baseUrl"` är satt till `"."`. Säkerställ att `"paths"` för `"@/*"` är korrekt konfigurerat (t.ex., `"./app/*"` eller liknande beroende på projektstruktur).
    -   **Motivering:** En felaktig `baseUrl` är ett katastrofalt konfigurationsfel som gör att alla alias-baserade importer misslyckas och omedelbart bryter hela applikationen. Detta måste verifieras först.

2.  **Verifiera `.eslintrc.json`:**
    -   **Krav:** Läs filen. Om den inte finns, skapa den. Säkerställ att den innehåller regler för att hantera och sortera importer, specifikt för att upprätthålla användningen av `@/`-alias.
    -   **Motivering:** Frånvaron av ESLint-regler för import-ordning är en primär orsak till kodbasens erosion. Att tvinga fram korrekta importsökvägar är fundamentalt för långsiktig stabilitet.

3.  **Sanera och standardisera befintlig kod:**
    -   **Krav:** Utför en sökning efter `..` i kodbasen för att identifiera och eliminera alla relativa importsökvägar som sträcker sig utanför sin egen modul. Ersätt dem med `@/`-alias.
    -   **Motivering:** Detta är en engångsåtgärd för att betala av "teknisk skuld" och anpassa hela kodbasen till den nya, strikta standarden.

**Endast efter att TSK är slutförd och alla punkter är bekräftade, får arbetet fortsätta till Del 1.**

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

### **A. Autentisering & Session (`app/api/auth/[...nextauth]/route.ts`, `next-auth.d.ts`)**

1.  **Sessionen är den Enda Källan till Sanning:** `session`-callbacken i NextAuth **ska** vara den enda källan till sanning för användarens status. Vid varje anrop ska den hämta kritisk, uppdaterad data (som `onboardingComplete`) direkt från databasen. `isNewUser` **ska** härledas dynamiskt (`!onboardingComplete`) och aldrig lagras i databasen.

2.  **Explicit Typning är Obligatorisk:** NextAuth:s `Session`- och `User`-typer **ska** utökas i en `next-auth.d.ts`-fil för att ge full typsäkerhet för anpassade fält (`onboardingComplete`, `isNewUser`, etc.) i hela applikationen.

3.  **Synkroniserad Auth-Användare:** `signIn`-callbacken **ska** användas för att omedelbart uppdatera den nyskapade Firebase Auth-användaren med korrekt e-post från Google-profilen för att förhindra "-"-felet.

### **B. Backend-Logik (Server Actions, API Routes)**

1.  **Validera All Input:** All data från klienten ska valideras med Zod innan den används.
2.  **Idempotenta Databasoperationer:** Använd `set({ ... }, { merge: true })` istället för `update()` för att markera statusförändringar (t.ex., `tourCompleted: true`). Detta är en robustare metod som förhindrar race conditions om dokumentet ännu inte existerar.
3.  **Detaljerad Server-loggning:** Komplexa operationer **ska** innehålla detaljerad, steg-för-steg-loggning på servern för att möjliggöra transparent felsökning.

---

## Del 3: Guldstandardens Tillämpning per Funktion

Dessa regler är inte teoretiska. De ska tillämpas enligt följande:

### **Onboarding**
- **Flöde:** `onboarding/page.tsx` anropar actions i `app/actions/onboardingActions.ts`. Dessa actions **ska** följa alla regler i Del 1 & 2. Kritiska flaggor som `onboardingComplete` får **endast** uppdateras efter ett bevisat, lyckat slutförande av den associerade operationen.

### **Användarstatus & Guidad Tur (`app/actions/userActions.ts`)**
- **Princip:** Funktioner som `markTourAsCompleted` måste vara maximalt robusta. De **ska** använda `set({ tourCompleted: true }, { merge: true })` för att garantera att operationen lyckas även om `user`-dokumentet av någon anledning skulle skapas med fördröjning.

