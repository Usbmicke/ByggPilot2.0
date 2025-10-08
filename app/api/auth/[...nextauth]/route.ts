
import NextAuth from 'next-auth';
import type { AuthOptions, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// KORRIGERING: Importerar 'firestoreAdmin' istället för det felaktiga 'adminDb'.
import { firestoreAdmin } from '@/lib/firebase-admin'; 
import { JWT } from 'next-auth/jwt';

// =================================================================================
// GULDSTANDARD - SLUTGILTIG, KORRIGERAD VERSION
// Använder nu 'firestoreAdmin' för att korrekt ansluta till databasen.
// =================================================================================

// Validera att alla nödvändiga miljövariabler är satta.
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXTAUTH_SECRET) {
    throw new Error("FATAL ERROR: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET environment variables must be set.");
}

// HJÄLPFUNKTION: Uppdaterar tokens i Firestore i 'users'-kollektionen.
async function updateUserTokens(userId: string, account: Account) {
  try {
    // KORRIGERING: Använder 'firestoreAdmin' för databasåtkomst.
    const userRef = firestoreAdmin.collection('users').doc(userId);
    const updateData: { [key: string]: any } = {};

    if (account.access_token) {
      updateData.googleAccessToken = account.access_token;
    }
    if (account.expires_at) {
      updateData.googleAccessTokenExpires = account.expires_at;
    }

    if (account.refresh_token) {
      updateData.googleRefreshToken = account.refresh_token;
      console.log(`[Auth Success] Mottog och sparar ny googleRefreshToken för användare ${userId}.`);
    }

    if (Object.keys(updateData).length > 0) {
        await userRef.update(updateData);
        console.log(`[Auth Success] Tokens för användare ${userId} uppdaterade.`);
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
          // KORRIGERING: Använder 'firestoreAdmin' för databasåtkomst.
          const usersRef = firestoreAdmin.collection('users');
          const userQuery = await usersRef.where('email', '==', profile.email).limit(1).get();
  
          let userId;
          if (userQuery.empty) {
            console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument.`);
            const newUserRef = await usersRef.add({
              name: profile.name ?? profile.email,
              email: profile.email,
              image: profile.picture ?? null,
              createdAt: new Date().toISOString(),
              isNewUser: true,
              termsAccepted: false,
            });
            userId = newUserRef.id;
          } else {
            userId = userQuery.docs[0].id;
          }

          await updateUserTokens(userId, account);

          return true;
        } catch (error) {
          console.error("[Auth Critical] Databasfel vid signIn: ", error);
          return '/auth/error?error=DatabaseError';
        }
    },

    // jwt anropas för att skapa/uppdatera JWT.
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: Account | null }): Promise<JWT> {
        if (account && user) {
            // KORRIGERING: Använder 'firestoreAdmin' för databasåtkomst.
            const usersRef = firestoreAdmin.collection('users');
            const querySnapshot = await usersRef.where('email', '==', user.email).limit(1).get();
            
            if (!querySnapshot.empty) {
                const userId = querySnapshot.docs[0].id;
                token.sub = userId; // Sätter JWT 'subject' till Firestore document ID
                await updateUserTokens(userId, account);
            }
        }
        return token;
    },

    // session anropas när en klientsession efterfrågas
    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.id = token.sub; // Lägger till Firestore ID i sessionen
            try {
                // KORRIGERING: Använder 'firestoreAdmin' för databasåtkomst.
                const userDoc = await firestoreAdmin.collection('users').doc(token.sub).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    session.user.isNewUser = userData?.isNewUser ?? false;
                    session.user.termsAccepted = userData?.termsAccepted ?? false;
                } else {
                    // Fallback om dokumentet av någon anledning inte hittas
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
