
import type { NextAuthOptions, Account, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { findOrCreateUser, getUserById } from '@/lib/data-access/user';
import { saveOrUpdateAccount } from '@/lib/data-access/account';


// =================================================================================
// AUTH OPTIONS V7.0 - DATA ACCESS LAYER INTEGRERAD
//
// REVIDERING: All direkt databaslogik har flyttats från denna fil till den nya
// Data Access Layer (DAL) i `lib/data-access/`. Denna fil anropar nu endast
// funktioner från DAL, vilket gör koden renare, säkrare och enklare att underhålla.
// Detta uppfyller kraven i Fas 1.1 av "Platinum Standard".
// =================================================================================

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar"
                }
            }
        })
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async signIn({ user, account }) {
            if (!account || !user) return false;

            try {
                // Steg 1: Hitta eller skapa användaren via DAL
                await findOrCreateUser(user);

                // Steg 2: Spara eller uppdatera kontoinformationen (tokens) via DAL
                // Säkerställ att account-objektet har userId innan det skickas till DAL
                const accountWithUserId: Account = {
                    ...account,
                    userId: user.id,
                };
                await saveOrUpdateAccount(accountWithUserId);

                return true;
            } catch (error) {
                logger.error({ error, user, account }, "[AUTH_SIGNIN_ERROR] Kritiskt fel vid DAL-anrop under signIn.");
                return false;
            }
        },

        async jwt({ token, user, account, trigger }) {
            // Fall 1: Första inloggningen. Skapa en grund-token med temporär flagga.
            if (user && account) {
                token.id = user.id;
                token.accessToken = account.access_token;
                token.onboardingComplete = false;
                token.isInitialLogin = true; // Sätt flaggan
                return token;
            }

            // Fall 2: Omedelbart anrop efter inloggning (t.ex. från getServerSession).
            // Lita INTE på databasen än. Returnera token som den är och ta bort flaggan.
            if (token.isInitialLogin) {
                delete token.isInitialLogin;
                return token;
            }
            
            // Fall 3: Normal drift. Nu är det säkert att uppdatera från DB via DAL.
            try {
                const userProfile = await getUserById(token.id as string);
                if (userProfile) {
                    token.onboardingComplete = userProfile.onboardingComplete;
                }
            } catch (error) {
                 logger.error({ error, tokenId: token.id }, "[AUTH_JWT_ERROR] Kritiskt fel vid DAL-anrop under jwt.");
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.onboardingComplete = token.onboardingComplete as boolean;
            session.accessToken = token.accessToken as string;
            return session;
        },
    },

    secret: env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
        error: '/',
    },
};
