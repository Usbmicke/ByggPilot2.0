
import NextAuth from 'next-auth';
import { NextAuthOptions, Account, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb, adminAuth } from "@/lib/admin";

// =================================================================================
// GULDSTANDARD - NEXT-AUTH KONFIGURATION
// Version 8.3 - Korrigerat alla Google-scopes för full funktionalitet
// Inkluderar nu gmail.readonly för att kunna läsa e-post.
// =================================================================================


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set.");
}

export const authOptions: NextAuthOptions = {
    adapter: FirestoreAdapter(adminDb),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    access_type: "offline",
                    prompt: "consent",
                    scope: "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks"
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }): Promise<JWT> {
            if (account && user) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
                token.uid = user.id; 
            }
            
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

                    token.accessToken = newTokens.access_token;
                    token.accessTokenExpires = Date.now() + newTokens.expires_in * 1000;
                    token.refreshToken = newTokens.refresh_token ?? token.refreshToken; 
                    
                    await adminDb.collection("users").doc(token.uid as string).update({
                        refreshToken: token.refreshToken,
                    });

                    console.log("[Auth] Access token refreshed successfully.");

                } catch (error) {
                    console.error("[Auth] Error refreshing access token:", error);
                    token.error = "RefreshAccessTokenError";
                    token.accessToken = undefined;
                }
            }

            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            if (session.user && token.uid) {
                const firebaseToken = await adminAuth.createCustomToken(token.uid as string);
                session.firebaseToken = firebaseToken;

                session.user.id = token.uid as string;
                session.accessToken = token.accessToken as string;
                session.error = token.error as string | undefined;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
