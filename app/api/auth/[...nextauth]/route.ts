
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter"; // Korrekt paketnamn
import { firestoreAdmin } from "@/app/lib/firebase-admin";
import type { NextAuthOptions } from 'next-auth';

// Exportera authOptions så att den kan användas i andra server-filer
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter(firestoreAdmin),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id; 
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
