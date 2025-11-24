
// GULDSTANDARD v15.0: Centraliserad Sessionshantering med Iron Session
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { UserProfile } from '@/app/_lib/schemas/user';

// Läs sessionslösenord från miljövariabler.
// Detta är KRITISKT för säkerheten.
const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword) {
  throw new Error('Fatal: SESSION_PASSWORD is not set in environment variables.');
}

// Definiera formen på vår sessionsdata.
export interface SessionData {
  user?: UserProfile;
  isLoggedIn: boolean;
}

// Konfigurera sessionen.
// - password: Det hemliga lösenordet för kryptering.
// - cookieName: Namnet på cookien som lagras i webbläsaren.
// - cookieOptions: Säkerhetsinställningar för cookien.
//   - httpOnly: Förhindrar åtkomst från JavaScript på klientsidan.
//   - secure: Kräver HTTPS (viktigt i produktion).
//   - sameSite: Skyddar mot CSRF-attacker.
export const sessionOptions = {
  password: sessionPassword,
  cookieName: '__session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
};

/**
 * Hämtar den aktuella server-side-sessionen från inkommande request-cookies.
 * Används i API-routes och React Server Components.
 * @returns {Promise<import('iron-session').IronSession<SessionData>>} Den dekrypterade sessionen.
 */
export function getVerifiedSession() {
  // 'getIronSession' hanterar dekryptering baserat på den funna cookien.
  return getIronSession<SessionData>(cookies(), sessionOptions);
}
