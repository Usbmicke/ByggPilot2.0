
'use server';

import { prisma } from '@/lib/prisma'; // NOTE: This path will need to be corrected later.

export async function getGoogleAccount(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'google'
        },
    });
    return account;
}

export async function updateGoogleAccountTokens(providerAccountId: string, newTokens: { access_token: string | null | undefined, refresh_token: string | null | undefined, expires_at: number | null | undefined }) {
    await prisma.account.update({
        where: {
            provider_providerAccountId: {
                provider: 'google',
                providerAccountId: providerAccountId,
            },
        },
        data: {
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            expires_at: newTokens.expires_at,
        },
    });
}
