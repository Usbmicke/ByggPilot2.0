
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createCustomer } from '@/app/services/customerService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, isCompany } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ message: 'Name is required' }), { status: 400 });
    }

    const newCustomer = await createCustomer({
      name,
      email,
      phone,
      isCompany: isCompany || false,
      ownerId: session.user.id, // Pass the user's ID from the session
    });

    return NextResponse.json(newCustomer, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/customers/create: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
