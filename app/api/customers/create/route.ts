
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createCustomer } from '@/services/customerService';
import { Customer } from '@/app/types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, isCompany } = body;

    // **FÖRBÄTTRAD INDATA-VALIDERING**
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return new NextResponse(JSON.stringify({ message: 'Kundnamn är obligatoriskt.' }), { status: 400 });
    }

    const hasEmail = email && typeof email === 'string' && email.trim() !== '';
    const hasPhone = phone && typeof phone === 'string' && phone.trim() !== '';

    if (!hasEmail && !hasPhone) {
      return new NextResponse(JSON.stringify({ message: 'Antingen e-post eller telefonnummer är obligatoriskt.' }), { status: 400 });
    }

    // (Valfritt men rekommenderat: E-post validering)
    if (hasEmail && !/\S+@\S+\.\S+/.test(email)) {
        return new NextResponse(JSON.stringify({ message: 'Ogiltigt e-postformat.' }), { status: 400 });
    }

    const customerData: Omit<Customer, 'id' | 'createdAt'> = {
      name: name.trim(), // Trimma namnet för att ta bort onödiga mellanslag
      email: hasEmail ? email.trim() : '',
      phone: hasPhone ? phone.trim() : '',
      isCompany: isCompany || false,
      userId: session.user.id, 
    };

    const newCustomer = await createCustomer(customerData);

    return NextResponse.json(newCustomer, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/customers/create: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ message: `Internal Server Error: ${errorMessage}` }), { status: 500 });
  }
}
