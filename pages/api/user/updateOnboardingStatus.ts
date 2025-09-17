import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/client'; // Importera din firestore-instans

// Denna API-endpoint uppdaterar en användares onboardingStatus i Firestore.
// Den är avgörande för att driva "state machine"-logiken i applikationen.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId, status } = req.body;

    if (!userId || !status) {
        return res.status(400).json({ success: false, message: 'userId och status är obligatoriska fält.' });
    }

    try {
        const userDocRef = doc(db, 'users', userId);

        // Uppdatera fältet `onboardingStatus` i användarens dokument
        await updateDoc(userDocRef, {
            onboardingStatus: status
        });

        res.status(200).json({ success: true, message: `Användarstatus uppdaterad till ${status}.` });

    } catch (error) {
        console.error("Fel vid uppdatering av onboarding-status:", error);
        res.status(500).json({ success: false, message: 'Internt serverfel.' });
    }
}
