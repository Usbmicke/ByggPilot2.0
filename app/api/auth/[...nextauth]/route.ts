
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminAuth, adminDb } from "@/lib/admin";

// =================================================================================
// GULDSTANDARD - NEXTAUTH OPTIONS V7.0 (DIAGNOSTISK LOGGNING)
// REVIDERING: Lägger till extremt detaljerad loggning i 'signIn'-callbacken för att
// slutgiltigt diagnostisera varför e-post-synkroniseringen till Firebase Auth misslyckas.
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
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks",
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
            if (account && user) {
                try {
                    await adminDb.collection("users").doc(user.id).update({
                        refreshToken: account.refresh_token,
                        accessToken: account.access_token,
                        accessTokenExpires: account.expires_at ? Date.now() + account.expires_at * 1000 : null,
                    });
                } catch (error) {
                    console.error("[Auth Callback: jwt] Fel vid sparande av tokens till Firestore:", error);
                }
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
        async signIn({ user, account, profile }) {
            console.log("[Auth SignIn]: Callback startad.");
            if (user.id && user.email) {
                console.log(`[Auth SignIn]: Användare ${user.id} med e-post ${user.email} identifierad.`);
                try {
                    console.log(`[Auth SignIn]: Försöker hämta authUser för UID: ${user.id}...`);
                    const authUser = await adminAuth.getUser(user.id);
                    console.log(`[Auth SignIn]: authUser hämtad. E-post i Firebase Auth: '${authUser.email}'. E-post från Google: '${user.email}'.`);

                    if (authUser.email !== user.email) {
                        console.log(`[Auth SignIn]: E-post skiljer sig. Försöker uppdatera...`);
                        await adminAuth.updateUser(user.id, {
                            email: user.email,
                            displayName: user.name, // Lägger till displayName också för fullständighet
                        });
                        console.log(`[Auth SignIn]: Firebase Auth-användare ${user.id} har uppdaterats med e-post ${user.email}.`);
                    } else {
                        console.log("[Auth SignIn]: E-post är redan synkroniserad. Ingen uppdatering behövs.");
                    }
                } catch (error: any) {
                    if (error.code === 'auth/user-not-found') {
                        console.log(`[Auth SignIn]: Användaren ${user.id} hittades inte i Firebase Auth. Försöker skapa användare...`);
                        await adminAuth.createUser({
                            uid: user.id,
                            email: user.email,
                            displayName: user.name,
                        });
                        console.log(`[Auth SignIn]: Ny Firebase Auth-användare ${user.id} skapad med e-post ${user.email}.`);
                    } else {
                        console.error("[Auth SignIn]: Ett oväntat fel inträffade vid hantering av Auth-användare:", error);
                    }
                }
            } else {
                console.log("[Auth SignIn]: Antingen user.id eller user.email saknas. Avbryter synkronisering.", { userId: user.id, email: user.email });
            }
            return true;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
