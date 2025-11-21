
// =======================================================================
//  SCHEMA: UserProfile
// =======================================================================
// Definerar den fullständiga, server-sidan validerade användarprofilen
// som lagras i Firestore. Denna typ används i DAL och API-endpoints.

export interface UserProfile {
    uid: string;                 // Firebase Authentication User ID
    email: string;               // E-postadress, verifierad från Google
    name: string;                // Fullständigt namn från Google
    avatarUrl: string;           // URL till profilbild från Google
    
    // Applikations-specifika fält
    role: 'admin' | 'user';      // Användarroll
    createdAt: Date;             // Tidsstämpel för när profilen skapades
    lastLoginAt: Date;           // Tidsstämpel för senaste inloggning
  }
