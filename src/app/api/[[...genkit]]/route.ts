'''// src/app/api/[[...genkit]]/route.ts
/**
 * ===================================================================================
 * 🔥 GENKIT PROXY (GOLD STANDARD v2025.11) 🔥
 * ===================================================================================
 * This route acts as a secure bridge between the Next.js frontend and the
 * Genkit AI backend server.
 *
 * It captures all requests made to `/api/genkit/...` and forwards them,
 * including headers (like Authorization for the Bearer Token) and body,
 * to the Genkit server.
 *
 * The `duplex: 'half'` option is critical for enabling server-side streaming.
 * ===================================================================================
 */

const GENKIT_API_HOST = process.env.GENKIT_API_HOST || 'http://127.0.0.1:4001';

async function handler(
  request: Request,
  { params }: { params: { genkit: string[] } }
) {
  const targetUrl = `${GENKIT_API_HOST}/${params.genkit.join('/')}`;

  // Forward the request to the Genkit server, including the body for streaming.
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    // @ts-ignore - 'duplex' is required for streaming but not yet in all TS types.
    duplex: 'half',
  });

  // Return the response from the Genkit server back to the client.
  return response;
}

// Export the handler for all common HTTP methods.
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
};
'''