
import crypto from 'crypto';
import { getSecret } from '@/lib/config/secrets';

const ALGORITHM = 'aes-256-cbc';

// Vi definierar en funktion för att hämta och validera nycklarna asynkront.
async function getCryptoKeys() {
    // Anropa vår nya funktion för att hämta hemligheterna från Secret Manager.
    const encryptionKeyHex = await getSecret('ENCRYPTION_KEY');
    const ivHex = await getSecret('ENCRYPTION_IV');

    const key = Buffer.from(encryptionKeyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');

    // Validering för att säkerställa att nycklarna har rätt längd.
    if (key.length !== 32) {
        throw new Error('Hämtad ENCRYPTION_KEY måste vara 32 bytes.');
    }
    if (iv.length !== 16) {
        throw new Error('Hämtad ENCRYPTION_IV måste vara 16 bytes.');
    }

    return { key, iv };
}

/**
 * Krypterar en textsträng.
 * @param text Strängen som ska krypteras.
 * @returns En hex-kodad sträng som representerar den krypterade datan.
 */
export async function encrypt(text: string): Promise<string> {
    const { key, iv } = await getCryptoKeys();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Dekrypterar en hex-kodad sträng.
 * @param encryptedText Den hex-kodade strängen som ska dekrypteras.
 * @returns Den ursprungliga textsträngen.
 */
export async function decrypt(encryptedText: string): Promise<string> {
    const { key, iv } = await getCryptoKeys();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
