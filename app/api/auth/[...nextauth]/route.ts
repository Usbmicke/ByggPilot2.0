
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminAuth, adminDb } from "@/lib/admin";

// =================================================================================
// GULDSTANDARD - NEXTAUTH OPTIONS V5.0 (ROBUST TOKEN-HANTERING)
// REVIDERING: Implementerar en extremt robust mekanism som säkerställer att
// refresh_token och access_token sparas direkt på användarens dokument i
// Firestore vid första inloggning. Detta eliminerar beroendet av en opålitlig
// 'accounts'-samling.
// =================================================================================

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar",
                },
            },
        }),
    ],
    adapter: FirestoreAdapter(adminDb),
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Denna callback är kritisk. Den körs vid inloggning.
            if (account && user) {
                // === ROBUST TOKEN-SPARNING ===
                // Spara nödvändiga tokens direkt på användardokumentet för framtida bruk.
                try {
                    await adminDb.collection("users").doc(user.id).update({
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        accessTokenExpires: account.expires_at ? Date.now() + account.expires_at * 1000 : null,
                    });
                    console.log(`[Auth Callback: jwt] Sparade tokens för användare ${user.id} i Firestore.`);
                } catch (error) {
                    console.error("[Auth Callback: jwt] Fel vid sparande av tokens till Firestore:", error);
                }
                // === SLUT PÅ TOKEN-SPARNING ===

                token.accessToken = account.access_token;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async signIn({ user }) {
            // Synkronisera e-post till Firebase Auth på ett säkert sätt.
            if (user.id && user.email) {
                try {
                    const authUser = await adminAuth.getUser(user.id);
                    if (authUser.email !== user.email) {
                        await adminAuth.updateUser(user.id, {
                            email: user.email,
                        });
                    }
                } catch (error) {
                    // Ignorera fel för att inte blockera inloggning.
                }
            }
            return true;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
