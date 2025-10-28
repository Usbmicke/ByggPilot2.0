
'use server';

import { createProjectFolderStructure } from '@/app/actions/driveActions';

export async function saveCompanyName(companyName: string) {
  // Denna funktion är för närvarande en platshållare.
  // I en verklig applikation skulle du här uppdatera användardata i databasen.
  console.log(`Företagsnamn sparat: ${companyName}`);
  return { success: true };
}

export async function createDriveStructure() {
    console.log("Attempting to create drive structure...");
    try {
        const result = await createProjectFolderStructure();
        console.log("Drive structure creation result:", result);
        if (!result.success) {
            throw new Error(result.error || 'Okänt fel vid skapande av mappstruktur');
        }
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error in createDriveStructure action:", error);
        return { success: false, error: error.message };
    }
}
