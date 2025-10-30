
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

/**
 * AuthOptions v10 - Slutgiltig Korrigering
 * Denna version återinför den kritiska, saknade logiken i JWT-callbacken.
 * Felet var att `if (trigger === 'update')` saknades, vilket gjorde att
 * servern ignorerade klientens begäran om att uppdatera sessionen. Med denna
 * logik på plats kommer `updateSession()` att fungera som avsett, och 
 * kapplöpningstillståndet (race condition) elimineras fullständigt.
 */
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
          scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive'
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Vid initial inloggning, hämta onboarding-status från databasen via adapterns `user`-objekt.
      if (user) { 
        // @ts-ignore
        token.onboardingComplete = user.hasCompletedOnboarding ?? false;
      }

      // **KORRIGERING: När `update()` anropas från klienten, uppdatera token.**
      if (trigger === 'update' && session?.onboardingComplete !== undefined) {
        logger.info('[JWT Callback] Manuell session-uppdatering mottagen. Sätter onboardingComplete till: ' + session.onboardingComplete);
        token.onboardingComplete = session.onboardingComplete;
      }

      return token;
    },

    async session({ session, token }) {
      // Gör `onboardingComplete` och `userId` tillgängliga i session-objektet på klientsidan.
      session.user.id = token.sub as string;
      (session.user as any).onboardingComplete = token.onboardingComplete as boolean;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
};

export const getAuth = () => getServerSession(authOptions);
