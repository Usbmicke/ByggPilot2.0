import { MODELS } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';

// This is the primary endpoint for the chat functionality.
// It will be powered by Genkit and the Tiered Model Architecture.
export async function POST(req: NextRequest) {
  try {
    // For now, we'll just log the model configuration to confirm it's being read.
    console.log('Accessed /api/chat endpoint.');
    console.log('Default Tier Model:', MODELS.DEFAULT_TIER);
    console.log('Heavy Tier Model:', MODELS.HEAVY_TIER);

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'No message found';

    // This is a temporary placeholder response.
    // In the next step, this will be replaced by the Genkit flow.
    const responseText = `This is a placeholder response from /api/chat. You sent: "${lastMessage}". The Genkit orchestrator is not yet implemented.`;

    return new Response(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
