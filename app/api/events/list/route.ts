
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Denna endpoint är en platshållare.
    // I framtiden kan den hämta aviseringar, nya e-postmeddelanden, etc.
    return NextResponse.json({ events: [] });
}
