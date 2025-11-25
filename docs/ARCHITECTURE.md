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
├── .github/                    # CI/CD workflows (Automated testing, linting, deployment)
├── .vscode/                    # Shared editor settings for consistent formatting
├── docs/                       # "Deal Room" documentation (Architecture, API, Onboarding)
├── infra/                      # Infrastructure as Code (Terraform/Scripts for GCP setup)
├── public/                     # Static assets (Images, fonts, robots.txt)
├── scripts/                    # Maintenance scripts (Database seeding, local dev setup)
├── src/                        # Application Source Code (The Core)
│   ├── app/                    # Next.js App Router (Routing & Layouts ONLY)
│   ├── entities/               # Business entities (Project, User, Invoice models/types)
│   ├── features/               # Complex, user-facing features (Quote Engine, Receipt Scanner)
│   ├── genkit/                 # The AI Brain (Flows, Prompts, Tools) - Server-side only
│   ├── lib/                    # Core Libraries & Adapters (DAL, Logger, API Clients)
│   ├── shared/                 # Reusable, non-business logic (UI components, utils)
│   └── widgets/                # Composed UI blocks (DashboardWidget, ProjectListWidget)
├── tests/                      # End-to-End tests (Playwright)
├── .env.example                # Environment variable template (No secrets!)
├── .firebaserc                 # Firebase project aliases
├── firebase.json               # Firebase configuration (Hosting, Functions, Firestore)
├── genkit.config.ts            # Genkit AI configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration (Strict mode enabled)
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
