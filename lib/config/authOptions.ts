
import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { updateUser, getUser } from '@/lib/dal/users';
import { logger } from '@/lib/logger';

// Typ-utökningar för att lägga till anpassade fält
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      onboardingComplete?: boolean;
      companyName?: string;
      driveRootFolderId?: string;
      driveRootFolderUrl?: string;
    } & User;
    accessToken?: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    onboardingComplete?: boolean;
    companyName?: string;
    driveRootFolderId?: string;
    driveRootFolderUrl?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
  }
}

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
          scope: process.env.GOOGLE_SCOPES,
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(firestoreAdmin),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Fall 1: Initial inloggning
      if (account && user) {
        logger.info(`[JWT Callback] Initial token creation for user ${user.id}`);
        const dbUser = await getUser(user.id);

        token.id = user.id;
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        token.refreshToken = account.refresh_token; 

        if (dbUser) {
            token.onboardingComplete = dbUser.onboardingComplete;
            token.companyName = dbUser.companyName;
            token.driveRootFolderId = dbUser.driveRootFolderId;
            token.driveRootFolderUrl = dbUser.driveRootFolderUrl;
        }

        if (account.refresh_token) {
          await updateUser(user.id, { refreshToken: account.refresh_token });
        }
        return token;
      }

      // Fall 2: Session-uppdatering från klienten
      if (trigger === 'update' && session) {
          logger.info(`[JWT Callback] Updating token for user ${token.id}`, session);
          return { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      session.user.id = token.id;
      session.user.onboardingComplete = token.onboardingComplete;
      session.user.companyName = token.companyName;
      session.user.driveRootFolderId = token.driveRootFolderId;
      session.user.driveRootFolderUrl = token.driveRootFolderUrl;
      session.accessToken = token.accessToken;

      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      logger.error(`[NextAuth] Error: ${code}`, metadata);
    },
    warn(code) {
      logger.warn(`[NextAuth] Warning: ${code}`);
    },
  },
};
