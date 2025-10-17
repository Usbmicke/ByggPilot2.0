
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { listProjectsForUser } from '@/services/projectService';

// Hjälpfunktion för att generera ett slumpmässigt startnummer
const generateInitialProjectNumber = () => {
    const prefix = Math.floor(100 + Math.random() * 900); // 100-999
    const sequence = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    return `${prefix}-${sequence}`;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Hämta alla befintliga projekt för användaren
        const projects = await listProjectsForUser(userId);

        let latestNumber = 0;
        let latestPrefix = '';

        const projectNumberRegex = /(\d{3,4})-(\d{4,})/; // Matchar formatet NNN-NNNN eller NNNN-NNNN

        if (projects && projects.length > 0) {
            for (const project of projects) {
                const match = project.projectName.match(projectNumberRegex);
                if (match) {
                    const prefix = match[1];
                    const currentSequence = parseInt(match[2], 10);

                    if (currentSequence > latestNumber) {
                        latestNumber = currentSequence;
                        latestPrefix = prefix;
                    }
                }
            }
        }

        let nextProjectNumber;
        if (latestNumber > 0 && latestPrefix) {
            // Om en befintlig serie hittades, öka den med 1
            nextProjectNumber = `${latestPrefix}-${latestNumber + 1}`;
        } else {
            // Annars, generera ett helt nytt slumpmässigt startnummer
            nextProjectNumber = generateInitialProjectNumber();
        }

        return NextResponse.json({ nextProjectNumber });

    } catch (error) {
        console.error('Error fetching next project number:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
