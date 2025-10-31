
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { getUser } from '@/lib/data-access';
import { logger } from '@/lib/logger';

// =================================================================================
// AUTHENTICATION CORE V2.0 - JWT BERIKNING
// =================================================================================
// Denna version uppdaterar jwt-callbacken för att direkt inkludera
// `hasCompletedOnboarding`-statusen i token. Detta gör statusen tillgänglig
// för middlewaren.

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter(firestoreAdmin),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * Berikar JWT:n med användar-ID och onboarding-status.
     */
    async jwt({ token, user, trigger, session }) {
      // Fall 1: Första inloggningen (user-objektet finns)
      if (user) {
        token.sub = user.id;
        const appUser = await getUser(user.id);
        token.hasCompletedOnboarding = appUser?.hasCompletedOnboarding || false;
        return token;
      }

      // Fall 2: Sessionen uppdateras via `update()`-funktionen på klienten
      if (trigger === "update" && session?.hasCompletedOnboarding) {
        token.hasCompletedOnboarding = session.hasCompletedOnboarding;
      }

      return token;
    },

    /**
     * Exponerar datan från den berikade JWT:n till klientsessionen.
     */
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub;
        // @ts-ignore
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const getAuth = () => getServerSession(authOptions);
