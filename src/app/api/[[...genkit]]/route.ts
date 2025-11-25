// src/app/api/[[...genkit]]/route.ts
/**
 * ===================================================================================
 * 🔥 GENKIT PROXY (CORRECTED & FINAL) 🔥
 * ===================================================================================
 * This final version correctly rewrites the path by removing the initial 'genkit' 
 * segment before forwarding the request to the Genkit backend.
 * ===================================================================================
 */

const GENKIT_API_HOST = process.env.GENKIT_API_HOST || 'http://127.0.0.1:3400';

async function handler(
  request: Request,
  { params }: { params: Promise<{ genkit: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.genkit;

  // THE CRITICAL FIX: The incoming path is /api/genkit/flows/... 
  // `pathSegments` becomes ['genkit', 'flows', '...'].
  // We must remove the first 'genkit' segment to create the correct path for the Genkit server.
  if (pathSegments[0] === 'genkit') {
    pathSegments.shift(); // Removes the first element
  }

  const correctPath = pathSegments.join('/');
  const targetUrl = `${GENKIT_API_HOST}/${correctPath}`;

  console.log(`[PROXY] Forwarding to: ${targetUrl}`);

  try {
    const newRequest = new Request(targetUrl, request);
    const response = await fetch(newRequest);

    // If Genkit responds with an error, it might not be JSON. 
    // We will still forward the response, but log a warning.
    const contentType = response.headers.get('content-type') || 'not specified';
    if (!contentType.includes('application/json') && response.status >= 400) {
        console.warn(`[PROXY] Warning: Genkit responded with status ${response.status} and non-JSON content-type: ${contentType}`);
    }

    return response;

  } catch (error) {
    console.error(`[PROXY] FATAL: Could not connect to Genkit at ${targetUrl}. Is the Genkit server running?`, error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Proxy Error: Could not connect to the Genkit backend server.',
        details: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 502, // Bad Gateway
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
};
