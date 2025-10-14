
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // KORRIGERAD IMPORT

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
