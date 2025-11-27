# BYGGPILOT AI MASTER INSTRUCTIONS (v2025.12 - Genkit Gold Standard)
# BYGGPILOT AI MASTER INSTRUCTIONS (v2025.11 - Gold Standard)

## 1. KÄRNFILOSOFI
Vi bygger en **"Zero Trust"**-applikation. Next.js är endast skalet. Genkit är hjärnan.

## 2. ARKITEKTURELL LAGBOK (NON-NEGOTIABLE)
1.  **Genkit Gateway:** All kommunikation sker via `src/app/api/[[...genkit]]/route.ts`. Inga andra API-rutter.
2.  **DAL (Data Access Layer):** All Firestore-kod bor i `src/lib/dal`. Får ALDRIG importeras i frontend (förhindrar SIGKILL).
3.  **Zero Trust Auth:**
    - Inga sessions-cookies på servern.
    - Klienten skickar `Authorization: Bearer <token>` (Firebase ID Token).
    - Genkit validerar via `authPolicy: firebaseAuth(...)`.
4.  **Frontend State:**
    - Använd `useGenkit`-hooken (wrapper runt SWR).
    - Anropa ALDRIG `fetch` manuellt mot backend.
    - Använd flödes-objekt (imports), inte sträng-namn.

## 3. TEKNISK STACK
- Node.js v20+
- Next.js 16 (App Router)
- Firebase Genkit (@genkit-ai/google-genai)
- SWR
## 0. META-INSTRUKTIONER FÖR AGENTEN (LÄS DETTA FÖRST)

1.  **Kontextuell Medvetenhet:** Innan du skapar en ny fil, MÅSTE du köra `ls` eller söka för att se om filen eller en liknande fil redan existerar. **Dubbletter är absolut förbjudna.**
2.  **Ingen "Legacy"-kod:** Du får ALDRIG föreslå lösningar baserade på `pages/api`, `getServerSideProps`, eller `useEffect` för datahämtning. Vi kör Next.js 16 App Router och SWR.
3.  **Filstruktur:** Håll dig strikt till mappstrukturen. Hitta inte på egna mappar utanför `src/genkit` eller `src/app`.

---

## 1. ARKITEKTUR & SÄKERHET (NON-NEGOTIABLE)

### A. The Golden Rule: Separation of Concerns
* **Frontend (`src/app`):** Endast UI och Routing. Får ALDRIG innehålla affärslogik eller databaskod.
* **Backend (`src/genkit`):** Applikationens hjärna. Här bor all logik.
* **Bryggan:** Den ENDA tillåtna kommunikationsvägen är via Genkit-proxyn (`src/app/api/[[...genkit]]/route.ts`).

### B. Zero Trust Security
* **Inga Cookies på Servern:** Vi förlitar oss helt på Bearer Tokens.
* **DAL (Data Access Layer):**
    * Ligger i `src/genkit/dal`.
    * Detta är den **enda** platsen där `firebase-admin` får importeras.
    * Ingen frontend-komponent får någonsin importera filer från DAL (detta orsakar SIGKILL vid build).
    * DAL-funktioner anropas *endast* inifrån ett säkert Genkit-flow.

---

## 2. DET "HELIGA FLÖDET" (DATA FETCHING)

Vi använder **inte** `runFlow` direkt i komponenter. Vi använder en abstraktion för att hantera state och caching.

### Steg 1: Hooken (The Wrapper)
Alla anrop mot Genkit ska gå via vår custom hook `useGenkit` (som använder SWR under huven).

```typescript
// Mönster för en komponent
import { useGenkit } from '@/hooks/useGenkit'; // Din SWR-wrapper
import { getProjectFlow } from '@/genkit/flows/projectFlows';

export function ProjectDashboard() {
  // 1 rad kod för att hämta data, cacha och hantera state
  const { data, isLoading, error } = useGenkit(getProjectFlow, { projectId: '123' });

  if (isLoading) return <Spinner />;
  return <div>{data?.title}</div>;
}
```

### Steg 2: Genkit Flow (The Logic)
Ligger i `src/genkit/flows/`. Måste alltid inkludera `authPolicy`.

```typescript
export const getProjectFlow = defineFlow({
  name: 'getProjectFlow',
  inputSchema: z.object({ projectId: z.string() }),
  // SÄKERHETSKONTROLL HÄR:
  authPolicy: firebaseAuth((user) => {
    if (!user.email_verified) throw new Error("Verified email required");
  }),
}, async (input, { auth }) => {
  // HÄR (och endast här) anropar vi DAL
  return await db.projects.get(input.projectId);
});
```

## 3. CHECKLISTA FÖR NYA FUNKTIONER
När du ombeds implementera en ny funktion (t.ex. "Skapa Kund"), följ denna process slaviskt:

1.  **Analys:** Finns det redan en DAL-fil för detta? (t.ex. `customer.repo.ts`). Om ja, använd den.
2.  **DAL:** Skapa/Uppdatera funktion i `src/genkit/dal` för databasoperationen.
3.  **Flow:** Skapa ett Genkit-flow i `src/genkit/flows` som validerar input (Zod) och Auth, och sedan anropar DAL.
4.  **UI:** Skapa komponenten och använd `useGenkit` (för läsning) eller `runFlow` (för skrivning/mutationer) via din hook.

## 4. FÖRBJUDEN TEKNIK (ANTI-PATTERNS)
❌ **Aldrig:** `fetch('/api/min-manuella-route')`.

❌ **Aldrig:** `import { db } from '@/lib/firebase'` i en klientkomponent.

❌ **Aldrig:** `useEffect(() => { fetchData() }, [])`. Använd SWR.

❌ **Aldrig:** Manuella `try/catch` block runt API-anrop i komponenter. Låt SWR/Hooken hantera fel.

## 5. MILJÖKRAV
- **Node.js:** v20+
- **Pakethanterare:** npm
- **Genkit:** `@genkit-ai/google-genai` (Unified SDK)
