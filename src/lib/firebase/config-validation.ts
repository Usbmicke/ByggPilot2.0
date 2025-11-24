
// =======================================================================
//  Firebase Klient-konfiguration & Validering
// =======================================================================
// Denna fil är den enda källan till sanning för Firebase-konfigurationen
// på klientsidan. Den importerar råa miljövariabler och validerar dem.
// Om en variabel saknas eller är ogiltig, kastas ett tydligt fel
// omedelbart, vilket förhindrar tysta fel i produktion eller utveckling.

// Definiera en typ för vår konfiguration för typsäkerhet.
type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

// Hämta råa värden från process.env
const rawConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validera konfigurationen
const validateConfig = (config: Partial<FirebaseClientConfig>): FirebaseClientConfig => {
  const requiredKeys: Array<keyof FirebaseClientConfig> = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ];

  for (const key of requiredKeys) {
    if (!config[key]) {
      throw new Error(`[FATAL] Firebase-konfiguration saknas: NEXT_PUBLIC_FIREBASE_${key.toUpperCase()} är inte satt i .env.local`);
    }
  }
  // measurementId är valfritt, så vi kollar det separat.
  if (!config.measurementId) {
    console.warn('[VARNING] Firebase-konfiguration: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID är inte satt. Analytics kommer inte att fungera.');
  }

  return config as FirebaseClientConfig;
};

// Exportera en garanterat giltig konfiguration.
// Hela applikationen kommer att krascha vid start om en kritisk variabel saknas.
export const validatedFirebaseConfig = validateConfig(rawConfig);
