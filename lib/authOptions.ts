
import type { NextAuthOptions, User, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { adminDb } from './admin';
import { env } from '@/config/env';

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
        async jwt({ token, user, account }) {
            // Initial sign-in
            if (account && user) {
                const userRef = adminDb.collection("users").doc(user.id);
                const userDoc = await userRef.get();

                if (!userDoc.exists) {
                    await userRef.set({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        createdAt: new Date().toISOString(),
                        onboardingComplete: false,
                    });
                }
                
                // Save the access token and refresh token to the JWT
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.onboardingComplete = userDoc.exists() ? (userDoc.data()?.onboardingComplete || false) : false;
                return token;
            }

            // Subsequent requests, refresh user data
            if (token.sub) {
                const userRef = adminDb.collection("users").doc(token.sub);
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                    token.onboardingComplete = userDoc.data()?.onboardingComplete || false;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                session.user.onboardingComplete = token.onboardingComplete as boolean;
                // Expose accessToken to the session
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    secret: env.NEXTAUTH_SECRET,
};
