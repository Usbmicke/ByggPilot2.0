
import { NextAuthOptions, Awaitable, User, Session, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// =================================================================================
// GULDSTANDARD - NEXT-AUTH KONFIGURATION
// Version 7.0 - Stabil, med Firebase Sync & Google API-åtkomst
// =================================================================================

// Validera att alla nödvändiga miljövariabler är satta.
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set.");
}

export const authOptions: NextAuthOptions = {
    // Steg 1: Använd Firestore som adapter för att lagra användare, sessioner etc.
    adapter: FirestoreAdapter(adminDb),

    // Steg 2: Definiera inloggningsleverantörer. I detta fall, Google.
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    // Begär `offline` åtkomst för att få en `refreshToken`.
                    access_type: "offline",
                    prompt: "consent",
                    // Definiera de Google API-scopes som applikationen behöver.
                    scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks"
                }
            },
        }),
    ],

    // Steg 3: Definiera callbacks för att anpassa flödet.
    callbacks: {
        // Denna callback körs när en JSON Web Token (JWT) skapas eller uppdateras.
        async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }): Promise<JWT> {
            // Om detta är första inloggningen (account och user finns)
            if (account && user) {
                // Spara viktiga uppgifter från Google (accessToken, refreshToken) i JWT:n.
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
                token.uid = user.id; // Next-Auth användar-ID
            }
            
            // Om access-token har gått ut, försök att uppdatera det med refresh-token.
            if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
                console.log("[Auth] Access token expired. Refreshing...");
                try {
                    if (!token.refreshToken) throw new Error("Missing refresh token");

                    const response = await fetch("https://oauth2.googleapis.com/token", {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.GOOGLE_CLIENT_ID!,
                            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                            grant_type: "refresh_token",
                            refresh_token: token.refreshToken,
                        }),
                        method: "POST",
                    });

                    const newTokens = await response.json();

                    if (!response.ok) {
                        throw new Error(`Failed to refresh token: ${newTokens.error_description}`);
                    }

                    // Uppdatera JWT:n med de nya token-värdena.
                    token.accessToken = newTokens.access_token;
                    token.accessTokenExpires = Date.now() + newTokens.expires_in * 1000;
                    token.refreshToken = newTokens.refresh_token ?? token.refreshToken; // Behåll den gamla om ingen ny ges.
                    
                    // Uppdatera även användardokumentet i Firestore med den nya refresh-token.
                    await updateDoc(doc(adminDb, "users", token.uid), {
                        refreshToken: token.refreshToken,
                    });

                    console.log("[Auth] Access token refreshed successfully.");

                } catch (error) {
                    console.error("[Auth] Error refreshing access token:", error);
                    // Om uppdatering misslyckas, ta bort token för att tvinga ny inloggning.
                    token.error = "RefreshAccessTokenError";
                    token.accessToken = undefined;
                }
            }

            return token;
        },

        // Denna callback körs när ett session-objekt skapas.
        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            // Synkronisera Firebase Auth med NextAuth-sessionen.
            if (session.user && token.uid) {
                const firebaseToken = await adminAuth.createCustomToken(token.uid as string);
                session.firebaseToken = firebaseToken;

                // Populera session-objektet med data från JWT:n.
                session.user.id = token.uid as string;
                session.accessToken = token.accessToken as string;
                session.error = token.error as string | undefined;
            }
            return session;
        },
    },

    // Steg 4: Definiera strategin för sessionhantering.
    session: {
        strategy: "jwt",
    },
};
