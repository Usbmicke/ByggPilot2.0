
import { PrismaClient } from '@prisma/client';

// =================================================================================
// PRISMA KLIENT (v1.0 - Återskapad)
//
// Denna fil instansierar Prisma-klienten, som är vår primära databasanslutning.
// Den har återskapats för att lösa ett kritiskt "Module not found"-fel.
// Caching av klienten i en global variabel förhindrar att nya anslutningar
// skapas vid varje hot-reload i utvecklingsmiljön.
// =================================================================================

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient({
  // Logga databasfrågor om LOG_LEVEL är satt till 'debug'
  log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
