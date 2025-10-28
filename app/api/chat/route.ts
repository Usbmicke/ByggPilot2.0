
import { NextRequest, NextResponse } from 'next/server';
import { createProjectFolderStructure } from '@/app/actions/driveActions';

export async function POST(req: NextRequest) {
    const { action } = await req.json();

    if (action === 'createProjectFolderStructure') {
        try {
            const result = await createProjectFolderStructure();
            if (result.success) {
                return NextResponse.json({ message: "Mappstruktur har skapats framgångsrikt i Google Drive." });
            } else {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Okänd åtgärd' }, { status: 400 });
}
