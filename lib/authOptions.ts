
import type { NextAuthOptions, Account, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { findOrCreateUser, getUserById } from '@/lib/data-access/user';
import { saveOrUpdateAccount } from '@/lib/data-access/account';


// =================================================================================
// AUTH OPTIONS V7.1 - ROBUST JWT CALLBACK
//
// REVIDERING: Den tidigare `jwt`-callbacken led av ett race condition och var
// onödigt komplex med en `isInitialLogin`-flagga. Logiken har nu förenklats
// radikalt för att säkerställa en enda, pålitlig sanningskälla direkt vid
// inloggning. Detta eliminerar risken för att token får en felaktig
// `onboardingComplete`-status.
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
                // Steg 1: Hitta eller skapa användaren via DAL. Denna funktion
                // MÅSTE returnera den fullständiga användarprofilen.
                await findOrCreateUser(user);

                // Steg 2: Spara eller uppdatera kontoinformationen (tokens).
                const accountWithUserId: Account = { ...account, userId: user.id };
                await saveOrUpdateAccount(accountWithUserId);

                return true;
            } catch (error) {
                logger.error({ error, user, account }, "[AUTH_SIGNIN_ERROR] Kritiskt fel vid DAL-anrop under signIn.");
                return false;
            }
        },

        async jwt({ token, user, account, trigger }) {
            // Fall 1: Första inloggningen (user-objektet finns).
            // Hämta ALLT från databasen direkt för att skapa en komplett token.
            if (user && account) {
                try {
                    const userProfile = await getUserById(user.id);
                    if (!userProfile) {
                        throw new Error("Användarprofilen kunde inte hittas i databasen direkt efter signIn.");
                    }
                    
                    // Berika token med all nödvändig information från databasen.
                    token.id = userProfile.id;
                    token.onboardingComplete = userProfile.onboardingComplete;
                    token.accessToken = account.access_token; // Spara access token för API-anrop
                    
                    return token;

                } catch (error) {
                    logger.error({ error, user }, "[AUTH_JWT_INITIALIZATION_ERROR] Kritiskt fel vid skapande av JWT.");
                    // Returnera en minimal token för att undvika att sessionen kraschar helt.
                    return { ...token, id: user.id, error: "Failed to fetch user details" };
                }
            }

            // Fall 2: Uppdatering av sessionen (t.ex. om användaren slutför onboarding).
            // Ladda om användardata för att säkerställa att token är färsk.
            if (trigger === "update") {
                 try {
                    const userProfile = await getUserById(token.id as string);
                    if (userProfile) {
                        token.onboardingComplete = userProfile.onboardingComplete;
                    }
                } catch (error) {
                     logger.error({ error, tokenId: token.id }, "[AUTH_JWT_UPDATE_ERROR] Fel vid uppdatering av JWT via trigger.");
                }
            }

            // Fall 3: Normal drift. Token är redan komplett. Returnera den.
            return token;
        },

        async session({ session, token }) {
            // Synkronisera sessionen med informationen i den robusta token.
            session.user.id = token.id as string;
            session.user.onboardingComplete = token.onboardingComplete as boolean;
            session.accessToken = token.accessToken as string;
            
            if (token.error) {
                session.error = token.error as string;
            }

            return session;
        },
    },

    secret: env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
        error: '/',
    },
};
