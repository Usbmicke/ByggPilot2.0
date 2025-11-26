# ByggPilot Architecture Map (v2025.11 - Gold Standard)

## 1. Core Stack
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS.
- **Backend/AI:** Firebase Genkit (körs på separat port).
- **Model:** Google Gemini 3 (Pro & Flash).
- **Database:** Firestore (låst för klienten).

## 2. "Gold Standard" Directory Structure

This structure is based on Feature-Sliced Design (FSD) principles, adapted for a Next.js 16 and Genkit environment. It's designed for scalability, maintainability, and makes the codebase easy to navigate for both humans and AI agents.

```plaintext
ByggPilot-v2/
├── .firebaserc                 # Firebase projekt-alias
├── .github/                    # CI/CD-arbetsflöden (ska skapas)
├── .vscode/                    # Delade editor-inställningar
├── docs/                       # "Deal Room" dokumentation
│   ├── AI_INSTRUCTIONS.md      # Instruktioner för AI-samarbete
│   ├── ARCHITECTURE.md         # Denna arkitektoniska ritning
│   ├── WORKFLOW_GUIDE.md       # Guide för utvecklingsflöde
│   └── viktigt.md              # Tidigare viktiga anteckningar
├── infra/                      # Infrastructure as Code (ska skapas)
├── public/                     # Statiska tillgångar (Bilder, typsnitt)
│   ├── favicon.ico
│   └── images/
│       ├── byggpilotlogga1.png
│       └── micke.jpg
├── src/                        # Applikationens Källkod (Kärnan)
│   ├── app/                    # Next.js App Router (ENBART Routing & Layouter)
│   │   ├── (auth)/             # Ruttgrupp för Autentiseringsflöden
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx    # Sida för att hantera skapande av Drive-mappar etc.
│   │   │   └── layout.tsx      # Layout för auth-sidor (t.ex. centrerad, ingen sidebar)
│   │   ├── (main)/             # Ruttgrupp för Huvudapplikationen (Skyddad)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx    # Komponerar widgets som <DashboardWidget />
│   │   │   └── layout.tsx      # Huvudlayout med sidebar, header etc.
│   │   ├── (public)/           # Ruttgrupp för publika sidor
│   │   │   └── page.tsx        # Landnings- & Inloggningssida
│   │   ├── api/                # Next.js API-rutter (Bron till Hjärnan)
│   │   │   ├── [[...genkit]]/  # Genkit reflektions-API
│   │   │   │   └── route.ts
│   │   │   └── chat/           # Framtida endpoint för chatt-streaming
│   │   │       └── route.ts
│   │   ├── globals.css         # Globala CSS-stilar
│   │   └── layout.tsx          # Rot-layout (Providers: Theme, AuthContext)
│   ├── entities/               # Affärsentiteter (Modeller & grundläggande UI)
│   │   ├── project/
│   │   │   └── model/          # Typer och Zod-scheman för Projekt
│   │   └── user/
│   │       └── model/          # Typer och Zod-scheman för Användare
│   ├── features/               # Komplexa, användar-interaktiva funktioner
│   │   ├── ProjectList.tsx     # Feature för att lista projekt (används i DashboardWidget)
│   │   └── auth/
│   │       └── LoginButton.tsx # UI och logik för inloggningsknappen
│   ├── genkit/                 # AI-Hjärnan (Endast server-sida)
│   │   ├── flows/              # "Tänkande" Processer
```

## 3. "The Holy Flows" (Approved Data Flows)

### A. Chatt & AI (Streaming & Tools)
*Goal: Lightning-fast response with deep knowledge.*
1.  **User:** Types "Create project X".
2.  **Frontend (`useChat`):**
    - Fetches a fresh `idToken` from Firebase SDK.
    - Calls `/api/genkit/chatFlow` with the token in the header.
3.  **Next.js Proxy (`src/app/api/[[...genkit]]/route.ts`):** Forwards the request directly to the Genkit Server.
4.  **Genkit (`src/genkit/flows/chatFlow.ts`):**
    - Validates the token (`firebaseAuth` policy).
    - Calls **Gemini Flash** with tool definitions.
    - If a tool is needed (e.g., `createProject`):
        - Genkit calls the DAL function: `dal.projects.create(uid, data)`.
        - The DAL writes to Firestore.
5.  **Response:** The response is streamed (chunked) back through the proxy to the client.

### B. Authentication (Zero Trust)
*We don't trust cookies or sessions on the server; we verify every single call.*
1.  **Login:** `signInWithPopup(auth, provider)` on the client.
2.  **State:** The Firebase SDK handles the `refreshToken` automatically in the browser's storage.
3.  **Access:** On every API call, the `idToken` is injected into the `Authorization` header.

## 4. Key Architectural Rules

*   **`src/app` is for Routing Only:** Do not place complex logic or components inside the `app` directory. Its job is to assemble layouts and pages by using components from `features`, `widgets`, and `shared`.
*   **`src/lib/dal` is the Gatekeeper:** This is the ONLY part of the codebase allowed to import `firebase-admin`. All database operations MUST go through the Data Access Layer (DAL) defined here. This is a non-negotiable security rule.
*   **`src/genkit` is the Brain:** All AI logic, flows, and tools live here. It runs as a separate process and is communicated with via the Next.js proxy.
*   **`src/shared/ui` is the Design System:** These are "dumb", atomic components like `Button`, `Input`, `Card`. They have no business logic.
*   **Entities vs. Features:**
    *   `entities` define the "what" (e.g., the data structure of a `Project`).
    *   `features` define the "how" (e.g., the UI and logic to *create* a `Project`).
