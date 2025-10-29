
import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { firestoreAdmin } from '@/lib/config/firebase-admin';
import { updateUser, getUser } from '@/lib/dal/users';
import { logger } from '@/lib/logger';

// GULDSTANDARD-FÖRBÄTTRING: En dedikerad funktion för att uppdatera access-token.
// Detta är avgörande för stabila, långlivade sessioner.
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const url = new URL('https://oauth2.googleapis.com/token');
        url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
        url.searchParams.set('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
        url.searchParams.set('grant_type', 'refresh_token');
        url.searchParams.set('refresh_token', token.refreshToken!);

        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'POST',
        });

        const refreshedTokens = await response.json();
        if (!response.ok) {
            throw refreshedTokens;
        }

        logger.info(`[RefreshAccessToken] Successfully refreshed token for user ${token.sub}`);

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            // Google kan returnera ett nytt refresh token, använd det i så fall.
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };

    } catch (error) {
        logger.error('[RefreshAccessTokenError]', { userId: token.sub, error });
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}


// Typ-utökningar för att lägga till anpassade fält
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Härdat: Använder konsekvent 'id' för klienten
      onboardingComplete?: boolean;
      companyName?: string;
      driveRootFolderId?: string;
      driveRootFolderUrl?: string;
    } & User;
    accessToken?: string;
    error?: string; // För att kunna signalera token-fel till klienten
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string; // Härdat: Använder standard JWT claim 'sub' för user ID
    onboardingComplete?: boolean;
    companyName?: string;
    driveRootFolderId?: string;
    driveRootFolderUrl?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    error?: string;
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
          // KORRIGERING: Använder template literals (`) för att hantera flera rader korrekt.
          scope: `
            https://www.googleapis.com/auth/userinfo.profile
            https://www.googleapis.com/auth/userinfo.email
            https://www.googleapis.com/auth/drive
            https://www.googleapis.com/auth/gmail.send
            https://www.googleapis.com/auth/gmail.readonly
            https://www.googleapis.com/auth/spreadsheets
            https://www.googleapis.com/auth/documents
            https://www.googleapis.com/auth/calendar
            https://www.googleapis.com/auth/tasks
          `.trim().replace(/\s+/g, ' ') // Sanerar för att garantera ett korrekt format
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
        logger.info(`[JWT Callback] Initial sign-in for user ${user.id}`);
        
        // HÄRDAT: Använd 'sub' claim, enligt standard.
        token.sub = user.id; 
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        token.refreshToken = account.refresh_token;

        // OPTIMERING: Hämta onboarding-status via DAL enbart vid inloggning.
        // Detta berikar JWT:n och undviker databasanrop i 'session'-callbacken.
        const dbUser = await getUser(user.id);
        if (dbUser) {
            token.onboardingComplete = dbUser.onboardingComplete;
            token.companyName = dbUser.companyName;
            token.driveRootFolderId = dbUser.driveRootFolderId;
            token.driveRootFolderUrl = dbUser.driveRootFolderUrl;
        }
        
        // Spara refresh token för framtida bruk
        if (account.refresh_token) {
          await updateUser(user.id, { refreshToken: account.refresh_token });
        }
        
        return token;
      }

      // Fall 2: Uppdatering från klient (för att lösa redirect-loop)
      if (trigger === 'update' && session) {
          logger.info(`[JWT Callback] Client-triggered update for user ${token.sub}`, { session });
          // Slå ihop den befintliga token med ny data från klienten
          const updatedToken = { ...token, ...session };
          // Specifikt uppdatera de fält som hanteras av onboarding
          if(session.user) {
              updatedToken.onboardingComplete = session.user.onboardingComplete;
              updatedToken.companyName = session.user.companyName;
              updatedToken.driveRootFolderId = session.user.driveRootFolderId;
              updatedToken.driveRootFolderUrl = session.user.driveRootFolderUrl;
          }
          return updatedToken;
      }

      // Fall 3: GULDSTANDARD-TILLÄGG - Automatisk token-uppdatering
      // Körs vid varje session-access. Om token är giltig, returnera direkt.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
          return token;
      }

      // Om access token har gått ut, försök uppdatera den med refresh token.
      if (token.refreshToken) {
          logger.info(`[JWT Callback] Access token expired for user ${token.sub}. Attempting refresh.`);
          return refreshAccessToken(token);
      }

      // Om allt annat fallerar, returnera den gamla token.
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      // HÄRDAT: Exponera data från den berikade och uppdaterade JWT:n till klient-sessionen.
      // Detta är performant eftersom ingen databaslogik finns här.
      session.user.id = token.sub; // Exponera sub som id till klienten
      session.user.onboardingComplete = token.onboardingComplete;
      session.user.companyName = token.companyName;
      session.user.driveRootFolderId = token.driveRootFolderId;
      session.user.driveRootFolderUrl = token.driveRootFolderUrl;
      session.accessToken = token.accessToken;
      session.error = token.error; // Propagera eventuella fel till klienten

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
