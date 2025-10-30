
import NextAuth from "next-auth";
import { authOptions } from "@/lib/config/authOptions";

/**
 * GULDSTANDARD-ARKITEKTUR (KORRIGERAD):
 * Exponerar NextAuth-konfigurationen som API-slutpunkter för App Router.
 * Detta är den korrekta metoden för NextAuth.js v4.
 * Denna fil hanterar alla autentiserings-relaterade anrop som /api/auth/session, /api/auth/signin, etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
