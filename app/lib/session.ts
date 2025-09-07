
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';

// 1. Session-lösenordet hämtas från miljövariablerna.
//    Detta är en kritisk hemlighet som används för att kryptera cookien.
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set in .env.local");
}

// 2. Definiera strukturen för vår session-data.
//    Här specificerar vi vilken information vi vill spara i sessionen.
export interface SessionData extends IronSessionData {
    userId?: string;
    isLoggedIn?: boolean;
}

// 3. Konfigurera cookie-inställningar.
export const sessionOptions = {
    password: process.env.SESSION_SECRET,
    cookieName: 'byggpilot-session', // Unikt namn för vår cookie
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production', // Kräv HTTPS i produktion
        httpOnly: true, // Gör cookien oåtkomlig för JavaScript i webbläsaren
    },
};

/**
 * En hjälpfunktion för att hämta den aktuella sessionen på serversidan (i Route Handlers, etc.).
 * Denna funktion kapslar in logiken för att hämta och dekryptera cookien.
 * 
 * Exempelanvändning i en API-route:
 *   const session = await getSession();
 *   session.userId = '123';
 *   await session.save();
 */
export async function getSession(): Promise<IronSession<SessionData>> {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    return session;
}
