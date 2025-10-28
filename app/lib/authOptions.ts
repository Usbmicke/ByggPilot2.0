
import { AuthOptions, Account, Profile, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// ARKITEKTURKORRIGERING: Använder relativa sökvägar för robusthet.
import { admin, firestoreAdmin } from './firebase-admin'; 
import { JWT } from 'next-auth/jwt';
import { getUserById } from './dal/user';

// ... (resten av filen är oförändrad, endast import-satserna är justerade)

async function updateAccountTokens(userId: string, account: Account) {
  try {
    const accountData: any = {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      access_token: account.access_token,
      expires_at: account.expires_at,
    };
    if (account.refresh_token) {
      accountData.refresh_token = account.refresh_token;
    }
    await firestoreAdmin.collection('users').doc(userId).collection('accounts').doc(account.provider).set(accountData, { merge: true });
  } catch (error) {
    console.error(`[Auth Critical] Kunde inte spara tokens för användare ${userId}:`, error);
  }
}

async function customSignIn({ profile, account }: { profile?: Profile; account?: Account | null }) {
    if (!profile?.email || !account) {
      console.error("[Auth Error] Profil eller konto saknas vid signIn.");
      return '/auth/error?error=SignInError';
    }

    try {
      const usersRef = firestoreAdmin.collection('users');
      const querySnapshot = await usersRef.where('email', '==', profile.email).get();

      let userId;
      if (querySnapshot.empty) {
        const newUserRef = await usersRef.add({
          name: profile.name ?? profile.email,
          email: profile.email,
          image: (profile as any).image ?? null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isNewUser: true,
          termsAccepted: false,
          onboardingComplete: false, // Se till att detta sätts för nya användare
        });
        userId = newUserRef.id;
      } else {
        userId = querySnapshot.docs[0].id;
      }

      await updateAccountTokens(userId, account);
      return true;
    } catch (error) {
      console.error("[Auth Critical] Databasfel vid signIn: ", error);
      return '/auth/error?error=DatabaseError';
    }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
        if (account && user) {
            const usersRef = firestoreAdmin.collection('users');
            const querySnapshot = await usersRef.where('email', '==', user.email).limit(1).get();
            if (!querySnapshot.empty) {
                token.sub = querySnapshot.docs[0].id;
            }
        }
        return token;
    },
    async signIn(params) {
        return customSignIn(params as { profile?: Profile; account?: Account | null });
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token.sub) {
        try {
          const userData = await getUserById(token.sub);
          if (userData) {
            session.user.id = token.sub;
            session.user.name = userData.name;
            session.user.email = userData.email;
            session.user.image = userData.image;
            session.user.isNewUser = userData.isNewUser ?? true; 
            session.user.termsAccepted = userData.termsAccepted ?? false;
            session.user.onboardingComplete = userData.onboardingComplete ?? false;
            session.user.companyName = userData.companyName ?? null;
            session.user.companyId = userData.companyId ?? null; 
          } else {
            console.warn(`[Auth Warning] Användardata för ID ${token.sub} kunde inte hittas. Sessionen kan vara ofullständig.`);
            session.user.isNewUser = true;
            session.user.termsAccepted = false;
            session.user.onboardingComplete = false;
          }
        } catch (error) {
          console.error("[Auth Critical] Fel vid hämtning av användardata för session: ", error);
          session.user = { ...session.user, id: token.sub, isNewUser: true, termsAccepted: false, onboardingComplete: false };
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
