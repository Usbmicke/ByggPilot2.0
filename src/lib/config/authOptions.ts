import { NextAuthOptions, getServerSession, User, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

// =================================================================================
// AUTHOPTIONS V12 - Blueprint "Sektion 1.2": Härdad Autentisering
// =================================================================================
// Denna version implementerar den kritiska säkerhetsförbättringen att "berika" JWT-tokenen
// med `userId` och `companyId` direkt från Firestore vid inloggning.

// --- TYPDEFINITIONER FÖR EN BERIKAD SESSION ---

// 1. Definiera de anpassade fälten för användarobjektet
interface EnrichedUser extends User {
  id: string;
  companyId?: string;
  onboardingComplete?: boolean;
}

// 2. Utöka NextAuth:s `Session` typ
export interface EnrichedSession extends DefaultSession {
  user: EnrichedUser;
}

// --- HJÄLPFUNKTION FÖR DATABASHÄMTNING ---

/**
 * Hämtar ett användardokument direkt från Firestore för att hitta companyId.
 * @param userId - Användarens ID (från `token.sub` eller `user.id`).
 * @returns Användarens companyId eller null om det inte hittas.
 */
async function getCompanyIdFromFirestore(userId: string): Promise<string | null> {
  try {
    const userDoc = await firestoreAdmin.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      logger.warn(`[Auth] Användardokument saknas i Firestore för userId: ${userId}`);
      return null;
    }
    const companyId = userDoc.data()?.companyId;
    return companyId || null;
  } catch (error) {
    logger.error(`[Auth] Fel vid hämtning av companyId för userId: ${userId}`, { error });
    return null;
  }
}

// --- KÄRNKONFIGURATION ---

export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(firestoreAdmin),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/tasks'
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }): Promise<JWT> {
      // **Vid initial inloggning:** Hämta all kritisk information och baka in i tokenen.
      if (user && user.id) {
        const firestoreCompanyId = await getCompanyIdFromFirestore(user.id);
        token.companyId = firestoreCompanyId;
        // @ts-ignore - NextAuth typning för user-objektet från adaptern är ofullständig
        token.onboardingComplete = user.hasCompletedOnboarding ?? false;
        logger.info(`[JWT] Initial login for user ${user.id}. CompanyID: ${firestoreCompanyId}, Onboarding: ${token.onboardingComplete}`);
      }

      // **Vid manuell uppdatering från klienten (t.ex. efter onboarding):**
      if (trigger === 'update') {
        logger.info('[JWT] Session update triggered', { session });
        if (session?.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete;
        }
        if (session?.companyId !== undefined) {
            token.companyId = session.companyId;
        }
      }

      return token;
    },

    async session({ session, token }): Promise<EnrichedSession> {
      // **Gör den berikade informationen tillgänglig på servern och klienten:**
      const enrichedSession = session as EnrichedSession;
      enrichedSession.user.id = token.sub as string;
      enrichedSession.user.companyId = token.companyId as string | undefined;
      enrichedSession.user.onboardingComplete = token.onboardingComplete as boolean;
      return enrichedSession;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
};

export const getAuth = () => getServerSession(authOptions);
