/**
 * Definierar den centrala typen för en användarprofil i applikationen.
 */
export interface UserProfile {
    id: string; // Användarens unika ID (UID) från Firebase Auth
    displayName: string;
    email: string;
    onboardingStatus: 'pending' | 'complete'; // Håller koll på det övergripande onboarding-flödet
    driveFolderStructureCreated: boolean; // Specifik flagga för Google Drive-mappar
    
    // Tillåter andra, ospecificerade fält som kan finnas i Firestore-dokumentet
    [key: string]: any;
}
