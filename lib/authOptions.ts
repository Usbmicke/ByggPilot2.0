
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firestoreAdmin, adminAuth } from "@/lib/admin";

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
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/gmail.readonly",
                },
            },
        }),
    ],
    adapter: FirestoreAdapter(firestoreAdmin),
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                token.accessToken = account.access_token;
                token.id = user.id;

                try {
                    await firestoreAdmin.collection("users").doc(user.id).update({
                        refreshToken: account.refresh_token,
                        accessToken: account.access_token,
                        accessTokenExpires: account.expires_at ? Date.now() + account.expires_at * 1000 : null,
                    });
                } catch (error) {
                    console.error("[Auth Callback: jwt] Fel vid sparande av tokens till Firestore:", error);
                }
            }

            if (token.id) {
                try {
                    const userDoc = await firestoreAdmin.collection("users").doc(token.id as string).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        token.onboardingComplete = userData?.onboardingComplete ?? false;
                        token.driveFolderId = userData?.driveRootFolderId;
                        token.tourCompleted = userData?.tourCompleted ?? false;
                    }
                } catch (error) {
                    console.error("[Auth Callback: jwt] Fel vid hämtning av färsk användardata från Firestore:", error);
                    token.onboardingComplete = false;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                session.user.driveFolderId = token.driveFolderId as string | undefined;
                session.user.tourCompleted = token.tourCompleted as boolean;
                session.user.isNewUser = !session.user.onboardingComplete;
            }
            return session;
        },

        async signIn({ user, account, profile }) {
            if (user.id && user.email) {
                try {
                    const authUser = await adminAuth.getUser(user.id);
                    if (authUser.email !== user.email) {
                        await adminAuth.updateUser(user.id, { email: user.email, displayName: user.name });
                    }
                } catch (error: any) {
                    if (error.code === 'auth/user-not-found') {
                        await adminAuth.createUser({ uid: user.id, email: user.email, displayName: user.name });
                    }
                }
            }
            return true;
        },
    },
};
