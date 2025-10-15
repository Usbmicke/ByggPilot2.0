
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb } from './admin';

// =================================================================================
// AUTH OPTIONS V8.0 (MINIMALISTISKA SCOPES)
// ARKITEKTUR: I enlighet med principen om "minimala nödvändiga behörigheter" har
// scopes för Kalender, Tasks och Gmail tagits bort. Detta minskar applikationens
// attackyta och ökar användarens förtroende, då vi bara begär åtkomst till
// det som är absolut nödvändigt för den nuvarande funktionaliteten (Drive).
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
                    scope: [
                        "https://www.googleapis.com/auth/userinfo.profile", 
                        "https://www.googleapis.com/auth/userinfo.email", 
                        "https://www.googleapis.com/auth/drive"
                    ].join(" ")
                }
            }
        })
    ],
    adapter: FirestoreAdapter(adminDb),
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                
                const userDoc = await adminDb.collection('users').doc(token.sub!).get();
                const userData = userDoc.data();

                session.user.onboardingComplete = userData?.onboardingComplete || false;
                session.user.onboardingStep = userData?.onboardingStep || 0;
            }
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
