'''// src/lib/genkit/flows.ts
'use client';

import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/client'; // Assuming you have this client config

const auth = getAuth(app);

/**
 * ===================================================================================
 * 🔥 CLIENT-SIDE GENKIT CALLER (GOLD STANDARD v2025.11) 🔥
 * ===================================================================================
 * This function is the client's gateway to the Genkit backend.
 * It follows the "Zero Trust" model by performing these steps:
 *
 * 1.  **Get ID Token:** Retrieves the current user's Firebase ID Token.
 *     This token is a short-lived, secure credential.
 * 2.  **Construct Proxy URL:** Builds the correct URL to hit our Next.js proxy.
 * 3.  **Make Secure Fetch:** Calls the proxy with the ID Token in the
 *     `Authorization: Bearer <token>` header.
 * 4.  **Return Response:** Returns the result from the Genkit flow.
 * ===================================================================================
 */

// The specific flow we want to call
const FLOW_NAME = 'onboardingFlow'; // This matches the flow name in your Genkit backend

export async function createGoogleDriveStructure(payload: any): Promise<any> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    console.log('Requesting ID Token from Firebase...');
    const idToken = await auth.currentUser.getIdToken();
    console.log('ID Token received. Calling Genkit proxy...');

    const proxyUrl = `/api/genkit/flows/${FLOW_NAME}`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ data: payload }), // Ensure payload is nested under 'data'
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Genkit proxy returned an error:', response.status, errorBody);
      throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
    }

    console.log('Genkit proxy call successful.');
    return await response.json();
  } catch (error) {
    console.error('Error in createGoogleDriveStructure:', error);
    throw error;
  }
}
'''