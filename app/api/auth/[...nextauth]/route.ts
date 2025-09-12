
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 
            'https://www.googleapis.com/auth/userinfo.profile ' +
            'https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/drive.file ' +
            'https://www.googleapis.com/auth/contacts.readonly'
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
