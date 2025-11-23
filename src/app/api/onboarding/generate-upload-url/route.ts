
import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '@/app/_lib/dal/dal';
// BORTTAGET: import { Storage } from '@google-cloud/storage';
import { storage } from '@/app/_lib/config/firebase-admin'; // KORRIGERAD: Importerar den nu korrekta centrala instansen
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// BORTTAGET: const storage = new Storage();

// Använder den befintliga Firebase-bucketen som är konfigurerad i firebase-admin
const bucket = storage.bucket(); 

// Zod-schema för att validera inkommande filinformation
const FileInfoSchema = z.object({
  fileName: z.string().min(1, "Filnamn krävs."),
  fileType: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, "Endast bildfiler (jpg, png, gif, webp) är tillåtna."),
});

export async function POST(request: NextRequest) {
  console.log("[API /generate-upload-url] Mottog begäran.");

  try {
    // 1. Verifiera sessionen för att säkerställa att användaren är inloggad
    const session = await verifySession(request.cookies.get('__session')?.value);
    console.log(`[API] Session verifierad för userId: ${session.userId}`);

    // 2. Validera request body
    const body = await request.json();
    const validation = FileInfoSchema.safeParse(body);

    if (!validation.success) {
      console.error("[API] Valideringsfel:", validation.error);
      return NextResponse.json({ error: 'Ogiltig filinformation.', details: validation.error.flatten() }, { status: 400 });
    }

    const { fileName, fileType } = validation.data;

    // 3. Skapa en säker och unik sökväg för filen
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const path = `logos/${session.companyId}/${uniqueFileName}`;

    // 4. Konfigurera signerad URL
    const options = {
      version: 'v4' as const, 
      action: 'write' as const, 
      expires: Date.now() + 15 * 60 * 1000, // 15 minuter
      contentType: fileType,
    };

    // 5. Generera den signerade URL:en
    const [signedUrl] = await bucket
      .file(path)
      .getSignedUrl(options);

    console.log(`[API] Genererade signerad URL för sökvägen: ${path}`);

    // 6. Skicka tillbaka URL:en till klienten
    return NextResponse.json(
        { 
            success: true, 
            signedUrl,
            publicUrl: bucket.file(path).publicUrl() 
        }, 
        { status: 200 }
    );

  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
        console.error("[API] Obehörig åtkomst:", error.message);
        return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
    }

    console.error(`[API] Internt serverfel: ${error.message}`, error);
    if (error.code) {
      console.error(`[GCS Error] Code: ${error.code}, Message: ${error.message}`);
    }

    return NextResponse.json({ error: 'Kunde inte generera uppladdnings-URL' }, { status: 500 });
  }
}
