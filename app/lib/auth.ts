
import { getServerSession as getNextAuthServerSession, NextAuthOptions, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/app/services/firestoreService';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Augment the default types to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Our internal Firestore user ID
    } & DefaultSession['user'];
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string; // We'll store our internal ID in the token
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * This callback is the core of our session strategy.
     * It's called when a JWT is created (on sign-in) or updated.
     * We use it to ensure our internal database user ID is present in the token.
     */
    async jwt({ token, user, account }) {
      // This is the crucial part. On initial sign-in, the `user` and `account` objects are available.
      if (account && user) {
        // This is a sign-in event. Let's find or create our internal user.
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          
          let internalUserId: string;

          if (querySnapshot.empty) {
            // User does not exist in Firestore, let's create them.
            const newUserRef = await addDoc(usersRef, {
              email: user.email,
              name: user.name,
              image: user.image,
              createdAt: serverTimestamp(),
            });
            internalUserId = newUserRef.id;
            console.log(`New user created in Firestore with ID: ${internalUserId}`);
          } else {
            // User already exists, get their Firestore ID.
            internalUserId = querySnapshot.docs[0].id;
            console.log(`Existing user signed in with Firestore ID: ${internalUserId}`);
          }
          
          // Add the internal ID to the token. This token will be encrypted and stored in a cookie.
          token.id = internalUserId;

        } catch (error) {
          console.error("Error in JWT callback during user lookup/creation:", error);
          // By returning the token without the ID, we can see if an error occurred.
          return token; 
        }
      }
      
      // On subsequent requests, the token is just returned. It already has the `id` from the initial sign-in.
      return token;
    },

    /**
     * The `session` callback makes the data from the JWT token available to the client-side.
     */
    async session({ session, token }) {
      // We take the ID from the token (which was set in the `jwt` callback) and add it to the session.user object.
      // Now, any server component or API route using `getServerSession` can access `session.user.id`.
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
    
    // The `signIn` callback is no longer needed for this logic.
  },

  pages: {
    signIn: '/login',
  },
};

/**
 * A server-side utility function to get the current session.
 */
export const getServerSession = () => getNextAuthServerSession(authOptions);
