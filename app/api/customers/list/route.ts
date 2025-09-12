
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { listCustomers } from '@/app/services/customerService';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const customers = await listCustomers(session.user.id);
    return NextResponse.json(customers);

  } catch (error) {
    console.error("Error in GET /api/customers/list: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
