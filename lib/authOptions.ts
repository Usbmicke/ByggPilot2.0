
import type { NextAuthOptions, Account, User as NextAuthUser } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { logger } from '@/lib/logger';
import { findOrCreateUser, getUserById } from '@/lib/data-access/user';
import { saveOrUpdateAccount } from '@/lib/data-access/account';
import { User } from '@/models/user';

// =================================================================================
// AUTH OPTIONS V9.0 - PLATINUM STANDARD (DIREKT ENV-ÅTKOMST)
// REVIDERING: All referens till den mellanliggande, sköra `env`-filen är borttagen.
// Konfigurationen läser nu miljövariabler direkt från `process.env`, vilket är
// Next.js inbyggda, robusta och standardiserade metod. Detta garanterar stabilitet.
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
                    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar"
                }
            }
        })
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async signIn({ user, account }) {
            if (!account || !user) return false;

            try {
                const userProfile = await findOrCreateUser(user);
                await saveOrUpdateAccount({ ...account, userId: user.id });

                (user as any).profile = userProfile;

                return true;
            } catch (error) {
                logger.error({ error, user, account }, "[AUTH_SIGNIN_ERROR] Kritiskt fel vid DAL-anrop.");
                return false;
            }
        },

        async jwt({ token, user, account, trigger, session }) {
            if (user && (user as any).profile) {
                const profile = (user as any).profile as User;
                token.id = profile.id;
                token.onboardingComplete = profile.onboardingComplete;
                token.accessToken = account?.access_token;
            }

            if (trigger === "update" && session?.onboardingComplete) {
                 token.onboardingComplete = session.onboardingComplete;
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.onboardingComplete = token.onboardingComplete as boolean;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string;

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET!,
    pages: {
        signIn: '/',
        error: '/',
    },
};
