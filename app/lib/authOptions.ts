
import { AuthOptions, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { admin, firestoreAdmin } from '@/app/lib/firebase-admin';
import { JWT } from 'next-auth/jwt';

// HJÄLPFUNKTION: För att uppdatera tokens i Firestore
async function updateAccountTokens(userId: string, account: Account) {
  try {
    const accountData: any = {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      access_token: account.access_token,
      expires_at: account.expires_at,
    };
    // Spara refresh_token endast om den finns (Google skickar den bara första gången)
    if (account.refresh_token) {
      accountData.refresh_token = account.refresh_token;
    }

    await firestoreAdmin.collection('users').doc(userId).collection('accounts').doc(account.provider).set(accountData, { merge: true });
    console.log(`[Auth Success] Tokens för användare ${userId} uppdaterade för provider ${account.provider}.`);

  } catch (error) {
    console.error(`[Auth Critical] Kunde inte spara tokens för användare ${userId}:`, error);
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
    // JWT-callbacken körs FÖRE session-callbacken. Den är perfekt för att hantera tokens.
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: Account | null }): Promise<JWT> {
        // Första inloggningen efter autentisering
        if (account && user) {
            // Hitta användarens Firestore-ID baserat på e-post.
            const usersRef = firestoreAdmin.collection('users');
            const querySnapshot = await usersRef.where('email', '==', user.email).limit(1).get();
            
            if (!querySnapshot.empty) {
                const userId = querySnapshot.docs[0].id;
                token.sub = userId; // Sätt Firestore-ID som subject för token
                token.uid = userId; // Behåll uid för konsekvens
                await updateAccountTokens(userId, account); // Spara tokens!
            } else {
                // Detta block bör teoretiskt sett inte köras pga signIn-callbacken, men är en bra säkerhetsåtgärd.
                console.warn(`[Auth Warning] Användare ${user.email} hittades inte i JWT-callbacken trots lyckad inloggning.`);
            }
            return token;
        }

        // Vid efterföljande anrop, token finns redan och vi behöver inte göra något mer här.
        return token;
    },

    async signIn({ profile, account }) {
        if (!profile?.email || !account) {
          console.error("[Auth Error] Profil eller konto saknas vid signIn.");
          return '/auth/error?error=SignInError';
        }
  
        try {
          const usersRef = firestoreAdmin.collection('users');
          const querySnapshot = await usersRef.where('email', '==', profile.email).get();
  
          let userId;
          if (querySnapshot.empty) {
            console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument.`);
            const newUserRef = await usersRef.add({
              name: profile.name ?? profile.email,
              email: profile.email,
              image: profile.picture ?? null,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              isNewUser: true,
              termsAccepted: false, // Se till att detta är falskt från början
            });
            userId = newUserRef.id;
          } else {
            userId = querySnapshot.docs[0].id;
          }

          // Spara/uppdatera alltid tokens, oavsett om användaren är ny eller inte.
          await updateAccountTokens(userId, account);

          return true;
        } catch (error) {
          console.error("[Auth Critical] Databasfel vid signIn: ", error);
          return '/auth/error?error=DatabaseError';
        }
    },

    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.id = token.sub;
            
            try {
                const userDoc = await firestoreAdmin.collection('users').doc(token.sub).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    session.user.isNewUser = userData?.isNewUser ?? false;
                    session.user.termsAccepted = userData?.termsAccepted ?? false;
                } else {
                    console.warn(`[Auth Warning] Användardokument ${token.sub} saknas.`);
                    session.user.isNewUser = true;
                    session.user.termsAccepted = false;
                }
            } catch (error) {
                console.error("[Auth Critical] Fel vid hämtning av användardata i session: ", error);
                session.user.isNewUser = false; 
                session.user.termsAccepted = false;
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
