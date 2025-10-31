
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { getUser } from '@/lib/data-access';
import { logger } from '@/lib/logger';

// =================================================================================
// AUTHENTICATION CORE V4.0 - Databas som Sanningskälla
// =================================================================================
// Denna version korrigerar det kritiska felet där JWT-token inte uppdaterades
// från databasen. Vid varje `update()`-anrop hämtas nu användaren på nytt.

const GOOGLE_API_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.file', // Skapa, läsa, uppdatera, ta bort filer i Drive
    'https://www.googleapis.com/auth/calendar',      // Kalender
    'https://www.googleapis.com/auth/gmail.readonly',  // Gmail - Läsa
    'https://www.googleapis.com/auth/gmail.compose',   // Gmail - Skriva
    'https://www.googleapis.com/auth/gmail.send',      // Gmail - Skicka
    'https://www.googleapis.com/auth/spreadsheets', // Sheets
    'https://www.googleapis.com/auth/documents',      // Docs
    'https://www.googleapis.com/auth/contacts.readonly',// Kontakter - Läsa
    'https://www.googleapis.com/auth/tasks'          // Google Tasks
].join(' ');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: GOOGLE_API_SCOPES,
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(firestoreAdmin),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // KORRIGERING: Vid första inloggning (`user` finns) ELLER vid en manuell
      // uppdatering (`trigger === "update"`), måste vi läsa från databasen.
      const userId = token.sub;
      if (!userId) return token; // Säkerhetsåtgärd

      if (user || trigger === 'update') {
        try {
          const appUser = await getUser(userId);
          if (appUser) {
            token.sub = appUser.id;
            token.hasCompletedOnboarding = appUser.hasCompletedOnboarding || false;
          }
        } catch (error) {
            logger.error(`[Auth Callback: JWT] Kunde inte hämta användardata för ${userId}:`, error);
            // Returnera den gamla token om databasen misslyckas
        }
      }
      return token;
    },

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
