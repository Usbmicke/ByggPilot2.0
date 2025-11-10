
import { NextAuthOptions, Session, User, getServerSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
// import { getUser } from '@/lib/data-access'; // BORTTAGEN: Kommer ersättas med Genkit
import { logger } from '@/lib/logger';

const GOOGLE_API_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/tasks'
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
    async jwt({ token, user, trigger }: { token: JWT; user?: User; trigger?: 'signIn' | 'signUp' | 'update' }) {
      // TEMPORÄR FIX: Logiken för att hämta användardata är bortkopplad.
      // All onboarding-logik kommer att byggas om i Fas 2 med Genkit.
      // Vi sätter onboardingCompleted till true som standard för att undvika att låsa ute användare.
      token.onboardingCompleted = true;

      /* GAMMAL LOGIK:
      const userId = user?.id || token.sub;
      if (!userId) return token;

      if (trigger === 'signIn' || trigger === 'signUp' || trigger === 'update') {
        try {
          // const dbUser = await getUser(userId); // BORTTAGEN
          // if (dbUser) {
          //   token.onboardingCompleted = dbUser.hasCompletedOnboarding || false;
          //   token.sub = dbUser.id; 
          // } else {
          //   token.onboardingCompleted = false;
          // }
        } catch (error) {
          logger.error(`[Auth Callback: JWT] Kunde inte hämta användardata för ${userId}`, { error });
          token.onboardingCompleted = false; // Failsafe
        }
      }*/
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // @ts-ignore
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const getAuth = () => getServerSession(authOptions);
