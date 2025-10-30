
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Hämta nyckel och IV från miljövariabler.
// Dessa måste vara 32 bytes (256 bitar) respektive 16 bytes (128 bitar).
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_STRING = process.env.ENCRYPTION_IV;

if (!ENCRYPTION_KEY || !IV_STRING) {
    throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be set in the environment variables.');
}

if (Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex-encoded string.');
}

if (Buffer.from(IV_STRING, 'hex').length !== 16) {
    throw new Error('ENCRYPTION_IV must be a 16-byte hex-encoded string.');
}

// Konvertera hex-strängarna till Buffers för crypto-modulen
const key = Buffer.from(ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(IV_STRING, 'hex');

/**
 * Krypterar en textsträng.
 * @param text Strängen som ska krypteras.
 * @returns En hex-kodad sträng som representerar den krypterade datan.
 */
export function encrypt(text: string): string {
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
export function decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
