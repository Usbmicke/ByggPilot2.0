
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebaseAuth } from '@genkit-ai/firebase/auth';
import { updateUserCompany } from '../dal/user.repo';
import { googleDriveService } from '../services/googleDrive.service';

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    // Uppdaterat schema för att ta emot all nödvändig information
    inputSchema: z.object({
      companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken.").max(100),
      logoUrl: z.string().url("Ogiltig URL för logotyp.").optional(),
      userAccessToken: z.string().min(1, "Åtkomsttoken för Google Drive saknas."),
    }),
    outputSchema: z.object({ 
      success: z.boolean(),
      message: z.string(),
      driveFolderId: z.string().optional(),
    }),
    // Säkra flödet så att endast autentiserade användare kan köra det
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error('Autentisering krävs för att slutföra onboardingen.');
      }
    }),
  },
  async (input, { auth }) => {
    const uid = auth.uid;
    const { companyName, logoUrl, userAccessToken } = input;

    try {
      // Steg 1: Spara företagsuppgifter i Firestore via DAL
      console.log(`Uppdaterar användarprofil för ${uid} med företagsnamn: ${companyName}`);
      await updateUserCompany(uid, { companyName, logoUrl });
      console.log(`Användarprofil uppdaterad.`);

      // Steg 2: Skapa mappstruktur i Google Drive via Service Layer
      console.log(`Skapar mappstruktur i Google Drive för ${companyName}`);
      const folderId = await googleDriveService.createCompanyFolderStructure(companyName, userAccessToken);
      console.log(`Mappstruktur skapad med ID: ${folderId}`);
      
      // Steg 3: Spara referensen till rotmappen i användarens profil (valfritt men rekommenderat)
      await updateUserCompany(uid, { driveRootFolderId: folderId });

      return {
        success: true,
        message: 'Onboarding slutförd! Företagsuppgifter sparade och mappstruktur skapad.',
        driveFolderId: folderId,
      };

    } catch (error) {
      console.error("Fel under onboarding-processen:", error);
      // Kasta ett mer informativt fel som kan fångas på klientsidan
      throw new Error(`Onboardingen misslyckades: ${error.message}`);
    }
  }
);
