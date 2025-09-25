
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { admin, firestoreAdmin } from '@/app/lib/firebase-admin';

// Denna version är helt självförsörjande och robust. 
// Inga externa userActions behövs för själva autentiseringen.

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
    // signIn körs vid inloggning. Perfekt för att skapa användare.
    async signIn({ profile }) {
      if (!profile?.email) {
        console.error("[Auth Error] Ingen e-post från Google profilen.");
        return '/auth/error?error=EmailRequired';
      }

      try {
        const usersRef = firestoreAdmin.collection('users');
        const querySnapshot = await usersRef.where('email', '==', profile.email).get();

        if (querySnapshot.empty) {
          console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument.`);
          // ROBUST HANTERING: Använder e-post som fallback för namn.
          await usersRef.add({
            name: profile.name ?? profile.email, 
            email: profile.email,
            image: profile.picture ?? null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isNewUser: true, 
          });
        }
        return true;
      } catch (error) {
        console.error("[Auth Critical] Databasfel vid signIn: ", error);
        return '/auth/error?error=DatabaseError';
      }
    },

    // session körs varje gång en session efterfrågas. Perfekt för att synka data.
    async session({ session, token }) {
        if (session.user && token.sub) {
            session.user.id = token.sub;
            
            try {
                const userDoc = await firestoreAdmin.collection('users').doc(token.sub).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // Bifoga isNewUser-flaggan till sessionen.
                    session.user.isNewUser = userData?.isNewUser ?? false;
                } else {
                    // Detta är en säkerhetslina om dokumentet raderats manuellt.
                    console.warn(`[Auth Warning] Användardokument ${token.sub} saknas. Tvingar isNewUser=true.`);
                    session.user.isNewUser = true;
                }
            } catch (error) {
                console.error("[Auth Critical] Fel vid hämtning av användardata i session: ", error);
                // Om databasen är nere, anta att det inte är en ny användare för att undvika oönskad omdirigering.
                session.user.isNewUser = false; 
            }
        }
        return session;
    },

    // jwt anropas för att koda sessionens token.
    async jwt({ token, profile }) {
        if (profile?.email) {
            // Hitta användaren i databasen för att få Firestore-dokumentets ID.
            const usersRef = firestoreAdmin.collection('users');
            const querySnapshot = await usersRef.where('email', '==', profile.email).limit(1).get();
            
            if (!querySnapshot.empty) {
                // Spara Firestore-IDt i token, INTE Google-IDt.
                token.sub = querySnapshot.docs[0].id;
            }
        }
        return token;
    },
  },

  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

