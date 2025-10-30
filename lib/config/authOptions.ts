
import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { logger } from '@/lib/logger';
import { findOrCreateUser, getUser } from '@/lib/dal/users'; // VIKTIGT: Importera vår egen DAL

// TYP-UTÖKNINGAR: Definierar anpassade fält på session och JWT.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      onboardingComplete?: boolean;
      companyName?: string;
    } & Session['user'];
    accessToken?: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    onboardingComplete?: boolean;
    companyName?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
  }
}

// DEDIKERAD FUNKTION: Ansvarar för att uppdatera en utgången access-token.
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const url = new URL('https://oauth2.googleapis.com/token');
        url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
        url.searchParams.set('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
        url.searchParams.set('grant_type', 'refresh_token');
        url.searchParams.set('refresh_token', token.refreshToken!);

        const response = await fetch(url, { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'POST' 
        });

        const refreshedTokens = await response.json();
        if (!response.ok) throw refreshedTokens;

        logger.info(`[RefreshAccessToken] Token uppdaterad för användare ${token.sub}`);

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
            error: undefined,
        };
    } catch (error) {
        logger.error('[RefreshAccessTokenError]', { userId: token.sub, error });
        return { ...token, error: 'RefreshAccessTokenError' };
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
            https://www.googleapis.com/auth/calendar
            https://www.googleapis.com/auth/gmail.readonly
            https://www.googleapis.com/auth/gmail.compose
            https://www.googleapis.com/auth/gmail.send
            https://www.googleapis.com/auth/spreadsheets
            https://www.googleapis.com/auth/documents
            https://www.googleapis.com/auth/contacts.readonly
          `.trim().replace(/\s+/g, ' ')
        },
      },
    }),
  ],
  
  session: { strategy: 'jwt' },

  callbacks: {
    // === STEG 1: signIn ===
    // Denna callback körs direkt efter en lyckad autentisering med Google.
    // Här anropar vi vårt DAL för att skapa/hitta användaren i Firestore.
    async signIn({ user, account, profile }) {
      if (!profile || !account) {
        logger.error('[SignInCallback] Profile or account is missing.');
        return false; // Avbryt inloggningen
      }
      try {
        // Använd vårt DAL för att garantera att användaren finns med rätt fält.
        await findOrCreateUser(profile);
        return true; // Fortsätt inloggningen
      } catch (error) {
        logger.error('[SignInCallback] Error in findOrCreateUser:', error);
        return false; // Avbryt inloggningen vid fel
      }
    },

    // === STEG 2: jwt ===
    // Denna callback bygger JWT-token. Den körs efter signIn.
    async jwt({ token, user, account, trigger, session }) {
      // Vid första inloggning: Spara tokens och hämta data från *vår* databas.
      if (account && user) {
        logger.info(`[JWT Callback] Första inloggning för användare ${user.id}`);
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        token.refreshToken = account.refresh_token;
      }

      // Hämta alltid den senaste användardatan från vår databas för att hålla token uppdaterad.
      // Detta är kritiskt för att spegla ändringar (t.ex. onboardingComplete).
      const dbUser = await getUser(token.sub!); // token.sub är användarens ID
      if (dbUser) {
        token.onboardingComplete = dbUser.hasCompletedOnboarding;
        token.companyName = dbUser.companyName;
      }

      // VID MANUELL UPPDATERING (t.ex. i klienten via useSession)
      if (trigger === 'update' && session?.user) {
          logger.info(`[JWT Callback] Manuell uppdatering för ${token.sub}`);
          token.onboardingComplete = session.user.onboardingComplete;
          token.companyName = session.user.companyName;
      }

      // Kontrollera om token är giltig eller behöver uppdateras.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
          return token;
      }

      // Om utgången och refreshToken finns, uppdatera.
      if (token.refreshToken) {
          return refreshAccessToken(token);
      }

      return token;
    },

    // === STEG 3: session ===
    // Denna callback skapar session-objektet som klienten får tillgång till.
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.onboardingComplete = token.onboardingComplete;
      session.user.companyName = token.companyName;
      session.accessToken = token.accessToken;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  
  logger: {
    error(code, metadata) { logger.error(`[NextAuth] Error: ${code}`, metadata); },
    warn(code) { logger.warn(`[NextAuth] Warning: ${code}`); },
  },
};