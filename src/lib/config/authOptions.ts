
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { logger } from '@/lib/logger';

/**
 * AuthOptions v11 - Utökade Scopes
 * Denna version expanderar applikationens behörigheter för att inkludera
 * samtliga Google-tjänster som krävs för full funktionalitet enligt master plan.
 * Ingreppet är kirurgiskt och påverkar endast 'scope'-parametern.
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
          scope: 'openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/tasks'
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
