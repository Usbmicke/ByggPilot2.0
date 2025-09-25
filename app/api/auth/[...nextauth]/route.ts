
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { admin, firestoreAdmin } from '@/app/lib/firebase-admin';

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
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/gmail.modify',
          ].join(' '),
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) {
        return '/auth/error?error=EmailRequired';
      }

      try {
        const usersRef = firestoreAdmin.collection('users');
        const querySnapshot = await usersRef.where('email', '==', profile.email).get();

        if (querySnapshot.empty) {
          console.log(`[Auth Success] Ny användare: ${profile.email}. Skapar dokument med isNewUser-flagga.`);
          await usersRef.add({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // === DEN VIKTIGA TILLAGDA RADEN ===
            isNewUser: true, 
          });
        }
        return true;
      } catch (error) {
        console.error("[Auth Critical Failure] Databasfel vid signIn: ", error);
        return '/auth/error?error=DatabaseError';
      }
    },

    async jwt({ token, profile }) {
      if (!profile?.email) {
        return token;
      }
      const usersRef = firestoreAdmin.collection('users');
      const querySnapshot = await usersRef.where('email', '==', profile.email).get();

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        token.sub = userDoc.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
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
