
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { adminDb } from './admin';

// =================================================================================
// AUTH OPTIONS V7.0 (FÖRENKLAD)
// ARKITEKTUR: Tagit bort beroendet av `adminAuth` från `lib/admin.ts`.
// Detta minskar risken för problem om `admin.ts` inte är korrekt konfigurerad.
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
                    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/tasks", "https://www.googleapis.com/auth/gmail.send"].join(" ")
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
