
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/auth';
import { createCustomer } from '@/app/services/customerService';
import { Customer } from '@/app/types';

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

    // Skapa ett kundobjekt som matchar den nya datamodellen
    const customerData: Omit<Customer, 'id' | 'createdAt'> = {
      name,
      email: email || '',
      phone: phone || '',
      isCompany: isCompany || false,
      userId: session.user.id, // Korrekt fältnamn
    };

    const newCustomer = await createCustomer(customerData);

    return NextResponse.json(newCustomer, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/customers/create: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
