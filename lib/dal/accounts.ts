import { prisma } from '@/lib/prisma';

export async function getAccountByUserId(userId: string) {
    return await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'google'
        },
    });
}

export async function updateAccount(providerAccountId: string, data: { access_token: string, refresh_token: string, expires_at: number }) {
    return await prisma.account.update({
        where: {
            provider_providerAccountId: {
                provider: 'google',
                providerAccountId: providerAccountId,
            },
        },
        data: data,
    });
}
