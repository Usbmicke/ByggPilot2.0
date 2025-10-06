
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getMessageHistory } from '@/services/chatHistoryService';

export async function GET(request: Request) {
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token.sub) {
            return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
        }
        const userId = token.sub;

        const history = await getMessageHistory(userId, 100); // Hämta de 100 senaste meddelandena

        return NextResponse.json({ history });

    } catch (error) {
        console.error('[Chat History API Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
