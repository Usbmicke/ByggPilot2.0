
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase/client'; // Importera den konfigurerade Firebase-appen

const storage = getStorage(app);

/**
 * Laddar upp en fil till Firebase Storage och returnerar dess download URL.
 * @param file Filobjektet som ska laddas upp.
 * @param path Sökvägen i Storage där filen ska sparas (t.ex. 'chat-attachments').
 * @returns En promise som resolverar med filens publika URL.
 */
export const uploadFile = async (file: File, path: string = 'chat-attachments'): Promise<string> => {
  if (!file) {
    throw new Error('Ingen fil att ladda upp.');
  }

  // Skapa en unik referens för filen
  const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);

  // Ladda upp filen
  const snapshot = await uploadBytes(fileRef, file);

  // Hämta den publika URL:en
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
