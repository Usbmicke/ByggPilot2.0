import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getCustomers } from '@/lib/data-access';
import logger from '@/lib/logger';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Användaren är inte autentiserad.' }, { status: 401 });
  }

  try {
    const customers = await getCustomers(session.user.id);
    return NextResponse.json({ customers });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internt serverfel';
    logger.error({
        message: 'Fel vid hämtning av kunder (API)',
        userId: session.user.id,
        error: errorMessage
    });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
