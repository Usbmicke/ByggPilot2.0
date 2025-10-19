/**
 * @file Detta är applikationens Data Access Layer (DAL).
 * ALLA interaktioner med databasen (Firestore) SKA ske genom funktioner i denna fil.
 * Ingen annan fil får direkt importera eller använda '@/lib/admin'.
 * Varje funktion här måste inkludera logik för att validera användarens session och behörighet.
 * 
 * Guldstandard: Centraliserad och säker dataåtkomst.
 */

import { adminDb } from '@/lib/admin';
import { Customer, Project, ProjectStatus } from '@/types';
import { z } from 'zod';
import { type CoreMessage } from 'ai';


// --- Zod Schemas ---

const CreateProjectSchema = z.object({
    name: z.string().min(1, "Projektnamn är obligatoriskt."),
    customerId: z.string().min(1, "Kund-ID är obligatoriskt."),
    customerName: z.string().min(1, "Kundnamn är obligatoriskt."),
    status: z.nativeEnum(ProjectStatus),
});

const CompanyProfileSchema = z.object({
  companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken."),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().url("Måste vara en giltig URL.").optional(),
});

const RecipeBookSchema = z.object({
  defaultHourlyRate: z.coerce.number().positive("Timpris måste vara ett positivt tal."),
  defaultMaterialMarkup: z.coerce.number().min(0, "Materialpåslag kan inte vara negativt."),
});


// --- Helper Functions ---

async function getUserDoc(userId: string) {
    if (!userId) {
        throw new Error('Användar-ID är obligatoriskt.');
    }
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        throw new Error(`Användardokument ${userId} hittades inte.`);
    }
    return { userDocRef, userDoc };
}

// --- Customer Functions ---

export async function getCustomers(userId: string): Promise<Customer[]> {
    if (!userId) {
        throw new Error('Användar-ID är obligatoriskt för att hämta kunder.');
    }
    try {
        const customersRef = adminDb.collection('users').doc(userId).collection('customers');
        const querySnapshot = await customersRef.get();
        if (querySnapshot.empty) return [];

        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[];
    } catch (error) {
        console.error("[DAL Error - getCustomers]", { userId, error });
        throw new Error('Ett fel uppstod vid hämtning av kunder.');
    }
}

// --- Project Functions ---

export async function getProjects(userId: string): Promise<Project[]> {
    if (!userId) {
        throw new Error('Användar-ID är obligatoriskt för att hämta projekt.');
    }
    try {
        const projectsRef = adminDb.collection('projects');
        const query = projectsRef.where('userId', '==', userId).orderBy('createdAt', 'desc');
        const querySnapshot = await query.get();
        if (querySnapshot.empty) return [];

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                customerName: data.customerName,
                status: data.status,
                lastActivity: data.createdAt.toDate().toISOString(),
            } as Project;
        });
    } catch (error) {
        console.error("[DAL Error - getProjects]", { userId, error });
        throw new Error('Ett fel uppstod vid hämtning av projekt.');
    }
}

export async function createProject(userId: string, projectData: unknown): Promise<Project> {
    if (!userId) {
        throw new Error('Användar-ID är obligatoriskt för att skapa projekt.');
    }

    const validationResult = CreateProjectSchema.safeParse(projectData);
    if (!validationResult.success) {
        console.error("[DAL Validation Error - createProject]", validationResult.error);
        throw new Error(`Ogiltig indata: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`)'''
    }

    const { name, customerId, customerName, status } = validationResult.data;

    const newProjectData = {
        userId,
        name,
        customerId,
        customerName,
        status,
        createdAt: new Date(),
    };

    try {
        const projectRef = await adminDb.collection('projects').add(newProjectData);
        
        return {
            id: projectRef.id,
            ...validationResult.data,
            lastActivity: newProjectData.createdAt.toISOString(),
        };
    } catch (error) {
        console.error("[DAL Error - createProject]", { userId, error });
        throw new Error('Ett fel uppstod vid skapandet av projektet.');
    }
}


// --- User/Onboarding Functions ---

export async function getUserStatus(userId: string): Promise<{ onboardingComplete: boolean; tourCompleted: boolean }> {
    if (!userId) throw new Error('Användar-ID är obligatoriskt för att hämta användarstatus.');
    try {
        const { userDoc } = await getUserDoc(userId);
        const userData = userDoc.data();
        return {
            onboardingComplete: userData?.onboardingComplete || false,
            tourCompleted: userData?.tourCompleted || false,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes("hittades inte")) {
             console.log(`[DAL] Användardokument ${userId} hittades inte. Returnerar standardstatus.`);
             return { onboardingComplete: false, tourCompleted: false };
        }
        console.error("[DAL Error - getUserStatus]", { userId, error });
        throw new Error('Ett fel uppstod vid hämtning av användarstatus.');
    }
}

export async function markTourAsCompleted(userId: string): Promise<{ success: boolean }> {
    if (!userId) throw new Error('Användar-ID är obligatoriskt.');
    try {
        const { userDocRef } = await getUserDoc(userId);
        await userDocRef.set({ tourCompleted: true }, { merge: true });
        console.log(`[DAL] Användare ${userId} markerades som att ha slutfört turen.`);
        return { success: true };
    } catch (error) {
        console.error("[DAL Error - markTourAsCompleted]", { userId, error });
        throw new Error('Ett fel uppstod vid markering av touren som slutförd.');
    }
}

export async function updateUserCompanyProfile(userId: string, profileData: unknown) {
    const validationResult = CompanyProfileSchema.safeParse(profileData);
    if (!validationResult.success) {
        throw new Error(`Ogiltig indata: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    }
    try {
        const { userDocRef } = await getUserDoc(userId);
        await userDocRef.update({
            companyProfile: validationResult.data,
            onboardingStep: 1,
        });
        return validationResult.data;
    } catch (error) {
        console.error("[DAL Error - updateUserCompanyProfile]", { userId, error });
        throw new Error('Ett fel uppstod vid uppdatering av företagsprofil.');
    }
}

export async function getUserCompanyName(userId: string): Promise<string> {
    try {
        const { userDoc } = await getUserDoc(userId);
        const companyName = userDoc.data()?.companyProfile?.companyName;
        if (!companyName) {
            throw new Error("Företagsnamn saknas i användardokumentet.");
        }
        return companyName;
    } catch (error) {
        console.error("[DAL Error - getUserCompanyName]", { userId, error });
        throw new Error('Kunde inte hämta företagsnamn.');
    }
}

export async function updateUserDriveRootFolder(userId: string, rootFolderId: string) {
    if (!rootFolderId) throw new Error("Root folder ID är obligatoriskt.");
    try {
        const { userDocRef } = await getUserDoc(userId);
        await userDocRef.update({
            driveRootFolderId: rootFolderId,
            onboardingStep: 2,
        });
        return { success: true };
    } catch (error) {
        console.error("[DAL Error - updateUserDriveRootFolder]", { userId, error });
        throw new Error('Kunde inte uppdatera rotmapp-ID.');
    }
}

export async function updateUserRecipeBook(userId: string, recipeBookData: unknown) {
    const validationResult = RecipeBookSchema.safeParse(recipeBookData);
    if (!validationResult.success) {
        throw new Error(`Ogiltig indata: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}`);
    }
    try {
        const { userDocRef } = await getUserDoc(userId);
        await userDocRef.update({
            recipeBook: validationResult.data,
            onboardingStep: 3,
        });
        return validationResult.data;
    } catch (error) {
        console.error("[DAL Error - updateUserRecipeBook]", { userId, error });
        throw new Error('Kunde inte uppdatera receptboken.');
    }
}

export async function markOnboardingAsComplete(userId: string) {
    try {
        const { userDocRef } = await getUserDoc(userId);
        await userDocRef.update({
            onboardingComplete: true,
            onboardingStep: 4,
        });
        return { success: true };
    } catch (error) {
        console.error("[DAL Error - markOnboardingAsComplete]", { userId, error });
        throw new Error('Kunde inte slutföra onboarding.');
    }
}

// --- Chat Functions ---

export async function getChatMessages(userId: string, chatId: string): Promise<CoreMessage[]> {
    if (!userId || !chatId) {
        throw new Error('Användar-ID och Chatt-ID är obligatoriskt.');
    }
    try {
        const messagesRef = adminDb.collection('users').doc(userId).collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'asc');
        const snapshot = await messagesRef.get();
        if (snapshot.empty) {
            return [];
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return snapshot.docs.map((doc: any) => doc.data() as CoreMessage);
    } catch (error) {
        console.error("[DAL Error - getChatMessages]", { userId, chatId, error });
        throw new Error('Ett fel uppstod vid hämtning av chattmeddelanden.');
    }
}

export async function createChat(userId: string, initialMessage: CoreMessage): Promise<string> {
    if (!userId) {
        throw new Error('Användar-ID är obligatoriskt.');
    }
    try {
        const chatRef = adminDb.collection('users').doc(userId).collection('chats').doc();
        await chatRef.collection('messages').add({
            ...initialMessage,
            createdAt: new Date(),
        });
        await chatRef.set({ createdAt: new Date() }, { merge: true });
        return chatRef.id;
    } catch (error) {
        console.error("[DAL Error - createChat]", { userId, error });
        throw new Error('Ett fel uppstod när en ny chatt skulle skapas.');
    }
}

export async function addMessageToChat(userId: string, chatId: string, message: CoreMessage): Promise<void> {
    if (!userId || !chatId) {
        throw new Error('Användar-ID och Chatt-ID är obligatoriskt.');
    }
    try {
        await adminDb.collection('users').doc(userId).collection('chats').doc(chatId).collection('messages').add({
            ...message,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("[DAL Error - addMessageToChat]", { userId, chatId, error });
        throw new Error('Ett fel uppstod när meddelandet skulle sparas.');
    }
}
