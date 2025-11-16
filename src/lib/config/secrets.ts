
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Skapa en enda instans av klienten för att återanvända den.
const client = new SecretManagerServiceClient();

// En cache (ett minne) för att lagra hemligheter som redan har hämtats.
// Detta förhindrar onödiga API-anrop och gör appen snabbare.
const secretCache: Map<string, string> = new Map();

/**
 * Hämtar en hemlighet säkert från Google Secret Manager.
 * Använder en cache för att undvika att hämta samma hemlighet flera gånger.
 * @param secretName Namnet på hemligheten som ska hämtas.
 * @returns Värdet på hemligheten som en sträng.
 * @throws Ett fel om hemligheten inte kan hittas eller hämtas.
 */
export async function getSecret(secretName: string): Promise<string> {
    // 1. Kontrollera om hemligheten redan finns i cachen.
    if (secretCache.has(secretName)) {
        return secretCache.get(secretName)!;
    }

    // Detta är namnet på ditt Google Cloud-projekt.
    // Det är hårdkodat här eftersom det är konstant för denna applikation.
    const projectId = 'byggpilot-v2';

    try {
        // 2. Om inte i cachen, bygg den fullständiga sökvägen till hemligheten.
        const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

        // 3. Anropa Secret Manager för att hämta hemlighetens värde.
        const [version] = await client.accessSecretVersion({
            name: secretPath,
        });

        const payload = version.payload?.data?.toString();
        if (!payload) {
            throw new Error(`Payload för hemligheten ${secretName} är tom.`);
        }

        // 4. Spara hemligheten i cachen för framtida bruk.
        secretCache.set(secretName, payload);

        // 5. Returnera hemligheten.
        return payload;

    } catch (error) {
        console.error(`[Secret Manager Error] Kunde inte hämta hemligheten "${secretName}":`, error);
        // Kasta om felet så att anropande kod vet att något gick fel.
        throw new Error(`Misslyckades att hämta kritisk konfiguration: ${secretName}`);
    }
}
