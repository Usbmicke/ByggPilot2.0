
import type { AuthOptions, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { admin, firestoreAdmin } from '@/app/lib/firebase-admin';
import { JWT } from 'next-auth/jwt';

// HJÄLPFUNKTION: Uppdaterar tokens i Firestore
async function updateUserTokens(userId: string, account: Account) {
  try {
    const userRef = firestoreAdmin.collection('users').doc(userId);
    const updateData: { [key: string]: any } = {};

    // Spara bara nya tokens om de faktiskt finns i kontot
    if (account.access_token) {
      updateData.googleAccessToken = account.access_token;
    }
    if (account.expires_at) {
      updateData.googleAccessTokenExpires = account.expires_at;
    }

    // Spara refresh_token ENDAST om den finns (Google skickar den bara första gången)
    if (account.refresh_token) {
      updateData.googleRefreshToken = account.refresh_token;
      console.log(`[Auth Success] Mottog och sparar ny googleRefreshToken för användare ${userId}.`);
    }

    // Om det finns något att uppdatera, kör uppdateringen
    if (Object.keys(updateData).length > 0) {
        await userRef.update(updateData);
        console.log(`[Auth Success] Tokens för användare ${userId} uppdaterade direkt på användardokumentet.`);
    }

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
          // prompt: 'consent', // BORTTAGEN: Detta var orsaken till den oändliga loopen
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.modify',
        },
      },
    }),
  ],

  callbacks: {
    // signIn anropas vid inloggningsförsök
    async signIn({ profile, account }) {
        if (!profile?.email || !account) {
          console.error("[Auth Error] Profil eller konto saknas vid signIn.");
          return '/auth/error?error=SignInError';
        }
  
        try {
          const usersRef = firestoreAdmin.collection('users');
          const userQuery = await usersRef.where('email', '==', profile.email).limit(1).get();
  
          let userId;
          if (userQuery.empty) {
            console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument.`);
            const newUserRef = await usersRef.add({
              name: profile.name ?? profile.email,
              email: profile.email,
              image: profile.picture ?? null,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              isNewUser: true,
              termsAccepted: false,
            });
            userId = newUserRef.id;
          } else {
            userId = userQuery.docs[0].id;
          }

          // Spara tokens vid inloggning
          await updateUserTokens(userId, account);

          return true;
        } catch (error) {
          console.error("[Auth Critical] Databasfel vid signIn: ", error);
          return '/auth/error?error=DatabaseError';
        }
    },

    // jwt anropas för att skapa/uppdatera JWT. account finns bara vid FÖRSTA inloggningen.
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: Account | null }): Promise<JWT> {
        if (account && user) {
            const usersRef = firestoreAdmin.collection('users');
            const querySnapshot = await usersRef.where('email', '==', user.email).limit(1).get();
            
            if (!querySnapshot.empty) {
                const userId = querySnapshot.docs[0].id;
                token.sub = userId;
                // Eftersom 'account' bara finns vid första inloggningen, är detta anrop säkert
                // och kommer inte att köras i en loop.
                await updateUserTokens(userId, account);
            }
        }
        return token;
    },

    // session anropas när en klientsession efterfrågas
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
                    session.user.isNewUser = true;
                    session.user.termsAccepted = false;
                }
            } catch (error) {
                console.error("[Auth Critical] Fel vid hämtning av användardata i session: ", error);
                session.user.isNewUser = true; 
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
