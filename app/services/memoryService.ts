
import { promises as fs } from 'fs';
import path from 'path';

// Definiera sökvägen till minnesfilen. Vi placerar den i en 'memory'-katalog för ordning.
const memoryDirectory = path.join(process.cwd(), 'memory');
const memoryFilePath = path.join(memoryDirectory, 'ByggPilot_Memory.md');

/**
 * Säkerställer att minneskatalogen existerar.
 */
async function ensureMemoryDirectoryExists() {
  try {
    await fs.access(memoryDirectory);
  } catch {
    await fs.mkdir(memoryDirectory, { recursive: true });
  }
}

/**
 * Läser hela innehållet från minnesfilen.
 * Detta blir AI:ns kontext.
 * @returns {Promise<string>} Innehållet i minnesfilen.
 */
export async function getMemory(): Promise<string> {
  await ensureMemoryDirectoryExists();
  try {
    const content = await fs.readFile(memoryFilePath, 'utf-8');
    return content;
  } catch (error) {
    // Om filen inte finns, är minnet tomt. Detta är inte ett fel.
    return "";
  }
}

/**
 * Lägger till ny information i minnesfilen.
 * @param {string} textToSave - Informationen som ska sparas.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function saveToMemory(textToSave: string): Promise<{success: boolean, message: string}> {
  await ensureMemoryDirectoryExists();
  const timestamp = new Date().toLocaleString('sv-SE');
  const formattedContent = `\n--- Uppdatering ${timestamp} ---\n${textToSave}\n`;

  try {
    await fs.appendFile(memoryFilePath, formattedContent);
    console.log(`Minnet uppdaterades: "${textToSave}"`);
    return { success: true, message: `Jag har nu sparat följande i minnet: '${textToSave}'` };
  } catch (error: any) {
    console.error("Kunde inte spara till minnet:", error);
    return { success: false, message: "Jag kunde tyvärr inte spara informationen just nu." };
  }
}
