
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { adminAuth } from "@/app/lib/firebase-admin"; // BORTTAGEN - Används inte längre

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/gmail.modify"
          ].join(" ")
        },
      },
    }),
  ],
  
  // DET FELAKTIGA CALLBACKS-BLOCKET ÄR NU HELT BORTTAGET
  // NextAuth kommer nu att använda sitt standardbeteende för att hantera användare.

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
