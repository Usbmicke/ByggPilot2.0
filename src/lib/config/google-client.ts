
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

export const googleClient = auth.getClient();
