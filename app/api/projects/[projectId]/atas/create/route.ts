
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { z } from 'zod';

// Zod-schema för att validera inkommande data
const createAtaSchema = z.object({
    projectId: z.string().nonempty(),
    title: z.string().optional(),
    notes: z.string().optional(),
    // Framtida fält för röstmemo-URL och bild-URL:er
    // voiceMemoUrl: z.string().url().optional(),
    // imageUrls: z.array(z.string().url()).optional(),
});

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = createAtaSchema.parse(json);

        // TODO: Verifiera att projektet (body.projectId) faktiskt tillhör den inloggade användaren (userId)
        // Detta är ett kritiskt säkerhetssteg.

        console.log('--- Nytt ÄTA-utkast mottaget ---');
        console.log('Projekt ID:', body.projectId);
        console.log('Titel:', body.title);
        console.log('Anteckningar:', body.notes);
        console.log('-----------------------------------');

        // Här skulle vi normalt interagera med en databas, t.ex. Prisma
        /*
        const newAta = await prisma.ata.create({
            data: {
                projectId: body.projectId,
                title: body.title,
                description: body.notes,
                status: 'DRAFT', // Status sätts till 'Utkast' som standard
                // ... andra fält som createdBy, etc.
            }
        });
        */

        // Simulera ett framgångsrikt svar med den nya datan
        const newAta = {
            id: `ata-${Date.now()}`,
            ...body,
            status: 'DRAFT',
        };

        return NextResponse.json(newAta, { status: 201 }); // 201 Created

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
        }
        console.error('Error creating ATA draft:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
