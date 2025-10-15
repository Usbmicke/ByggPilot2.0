
import type { NextAuthOptions, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { adminDb } from './admin';
import { env } from '@/config/env';

// =================================================================================
// AUTH OPTIONS V4.0 - GULDSTANDARD (MANUELL ADAPTER)
// ARKITEKTUR: Denna version är den definitiva lösningen. Eftersom den officiella
// @next-auth/firebase-adapter är inkompatibel med Firebase v10, replikerar vi
// dess funktion manuellt på ett robust sätt.
//
// LÖSNING: Vi använder `signIn` callbacken för att atomiskt skapa `user` och `account`
// dokument i en Firestore-transaktion. Detta garanterar dataintegritet.
// `jwt` och `session` callbacks används sedan enbart för att berika token och
// sessionen med data, vilket är deras avsedda syfte.
// Detta är den mest robusta och kontrollerade metoden när standardverktyg fallerar.
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
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive"
                }
            }
        })
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        // KÖRS VID INLOGGNING - SKAPAR DATA I DATABASEN
        async signIn({ user, account }) {
            if (!account || !user) return false; // Säkerhetskontroll

            try {
                await adminDb.runTransaction(async (transaction) => {
                    const userRef = adminDb.collection("users").doc(user.id);
                    const accountRef = adminDb.collection("accounts").doc(account.providerAccountId);

                    const userDoc = await transaction.get(userRef);

                    if (!userDoc.exists) {
                         console.log(`[Auth] Ny användare: ${user.email}. Skapar user-dokument.`);
                        transaction.set(userRef, {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            emailVerified: null,
                            onboardingComplete: false, // Sätts initialt
                        });
                    }

                    // Skapa/uppdatera alltid account-dokumentet med senaste tokens
                    console.log(`[Auth] ${user.email}. Skapar/uppdaterar account-dokument.`);
                    transaction.set(accountRef, {
                        userId: user.id,
                        type: account.type,
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                        access_token: account.access_token,
                        refresh_token: account.refresh_token,
                        expires_at: account.expires_at,
                        token_type: account.token_type,
                        scope: account.scope,
                        id_token: account.id_token,
                    });
                });

                return true; // Tillåt inloggning
            } catch (error) {
                console.error("[AUTH_SIGNIN_ERROR] Kritiskt fel vid databas-transaktion:", error);
                return false; // Stoppa inloggning vid fel
            }
        },

        // KÖRS EFTER SIGNIN - BERIKAR JWT-TOKEN
        async jwt({ token, user, account }) {
            if (user) { // Vid första inloggningen
                token.id = user.id;
            }
            if (account) { // Spara alltid senaste access token
                 token.accessToken = account.access_token;
            }

            // Hämta senaste onboarding-status från DB för att hålla token färsk
            const userDoc = await adminDb.collection('users').doc(token.id as string).get();
            if(userDoc.exists) {
                token.onboardingComplete = userDoc.data()?.onboardingComplete || false;
            }

            return token;
        },

        // KÖRS EFTER JWT - GÖR DATA TILLGÄNGLIG FÖR KLIENTEN
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
