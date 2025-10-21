
// =================================================================================
// MODELL: USER
//
// ARKITEKTUR: Denna fil definierar TypeScript-interfacet för ett användarobjekt
// som det lagras i Firestore. Detta säkerställer typ-säkerhet i hela
// applikationen när vi hanterar användardata.
// =================================================================================

export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    onboardingComplete: boolean;
    createdAt: Date;
    // Lägg till andra fält som behövs för din applikation här
}
