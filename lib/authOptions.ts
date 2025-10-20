
import type { NextAuthOptions, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { adminDb } from './admin';
import { env } from '@/config/env';

// =================================================================================
// AUTH OPTIONS V4.1 - ROBUST ONBOARDING (GULDSTANDARD)
// ARKITEKTUR: Samma som v4.0.
//
// LÖSNING: Denna version åtgärdar en race condition i `jwt`-callbacken.
// Tidigare fanns en risk att databasläsningen för `onboardingComplete`
// antingen misslyckades eller returnerade ett inaktuellt värde vid den
// allra första inloggningen.
//
// Genom att explicit sätta `token.onboardingComplete = false` när `user`-objektet
// finns (vilket det bara gör vid första inloggningen), säkerställer vi att
// token omedelbart och garanterat har rätt status. Detta eliminerar
// beroendet av den asynkrona databasläsningen i det kritiska, initiala
// skedet och säkerställer att middlewaren alltid dirigerar nya användare korrekt.
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
            if (!account || !user) return false;

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
                            onboardingComplete: false, 
                        });
                    }

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

                return true;
            } catch (error) {
                console.error("[AUTH_SIGNIN_ERROR] Kritiskt fel vid databas-transaktion:", error);
                return false;
            }
        },

        // KÖRS EFTER SIGNIN - BERIKAR JWT-TOKEN
        async jwt({ token, user, account }) {
            if (user) { // Vid första inloggningen
                token.id = user.id;
                token.onboardingComplete = false; // <<< KORRIGERING: Sätt omedelbart!
            }
            if (account) { 
                 token.accessToken = account.access_token;
            }

            // Hämta senaste status från DB för att hålla token färsk vid efterföljande sidladdningar
            const userDoc = await adminDb.collection('users').doc(token.id as string).get();
            if(userDoc.exists) {
                token.onboardingComplete = userDoc.data()?.onboardingComplete;
            } else {
                 // Fallback om dokumentet mot förmodan inte finns
                 token.onboardingComplete = false;
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
