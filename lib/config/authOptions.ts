
import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { updateUser, getUser } from '@/lib/dal/users';
import { logger } from '@/lib/logger';

// GULDSTANDARD: En dedikerad funktion för att uppdatera access-token.
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
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
            error: undefined, // KVALITETSREVISION: Återställ eventuella tidigare fel
        };

    } catch (error) {
        logger.error('[RefreshAccessTokenError]', { userId: token.sub, error });
        // KVALITETSREVISION: Detta fel måste hanteras på klient-sidan för att tvinga utloggning.
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

// Typ-utökningar för anpassade fält
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
    sub: string;
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
          scope: `
            https://www.googleapis.com/auth/userinfo.profile
            https://www.googleapis.com/auth/userinfo.email
            https://www.googleapis.com/auth/drive
            https://www.googleapis.com/auth/tasks
            https://www.googleapis.com/auth/documents
            https://www.googleapis.com/auth/spreadsheets
            https://www.googleapis.com/auth/gmail.readonly
            https://www.googleapis.com/auth/gmail.send
            https://www.googleapis.com/auth/calendar
          `.trim().replace(/\s+/g, ' ')
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // KVALITETSREVISION: Implementerar signIn-callback för loggning och framtida säkerhetskontroller.
    async signIn({ user, account, profile, email, credentials }) {
        if (account?.provider === 'google') {
            logger.info(`[SignIn Callback] Successful Google sign-in for user: ${user.email}`);
            // Framtida logik kan implementeras här, t.ex. för att kontrollera om användaren är spärrad.
            // return false; // för att blockera inloggning.
        }
        return true; // Tillåt inloggning
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial inloggning
      if (account && user) {
        logger.info(`[JWT Callback] Initial sign-in for user ${user.id}`);
        token.sub = user.id;
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        token.refreshToken = account.refresh_token;

        const dbUser = await getUser(user.id);
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

      // Klient-triggrad uppdatering
      if (trigger === 'update' && session) {
          logger.info(`[JWT Callback] Client-triggered update for user ${token.sub}`, { session });
          const updatedToken = { ...token, ...session };
          if(session.user) {
              updatedToken.onboardingComplete = session.user.onboardingComplete;
              updatedToken.companyName = session.user.companyName;
              updatedToken.driveRootFolderId = session.user.driveRootFolderId;
              updatedToken.driveRootFolderUrl = session.user.driveRootFolderUrl;
          }
          return updatedToken;
      }

      // Automatisk token-uppdatering
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
          return token;
      }

      if (token.refreshToken) {
          logger.info(`[JWT Callback] Access token expired for user ${token.sub}. Attempting refresh.`);
          return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.onboardingComplete = token.onboardingComplete;
      session.user.companyName = token.companyName;
      session.user.driveRootFolderId = token.driveRootFolderId;
      session.user.driveRootFolderUrl = token.driveRootFolderUrl;
      session.accessToken = token.accessToken;
      session.error = token.error;

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
