
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Utöka JWT-typen för att inkludera det ID vi lägger till i jwt-callbacken.
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    // Innehåller Firestore användar-ID.
    sub: string;
  }
}

// Utöka Session-typen för att exponera all nödvändig användardata till klienten.
declare module "next-auth" {
  // `UserProfile` representerar den fullständiga datamodellen för en användare i Firestore.
  // Denna kan definieras mer detaljerat i en annan fil, t.ex. `app/types/index.ts`
  interface UserProfile {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: any; // Firestore Timestamp
    isNewUser?: boolean;
    termsAccepted?: boolean;
    onboardingComplete?: boolean;
    companyId?: string | null;
    companyName?: string | null;
  }

  // Session-objektet som blir tillgängligt via `useSession` eller `getServerSession`.
  interface Session {
    user: UserProfile & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }

  // User-objektet som returneras från `signIn` och används i callbacks.
  interface User extends DefaultUser, Partial<UserProfile> {}
}
