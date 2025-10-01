
import { NextRequest, NextResponse } from 'next/server';
import { type CoreMessage } from 'ai';

// FINAL VERSION with role mapping

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    // Format the conversation history, mapping 'assistant' to 'model' as required by the Gemini API.
    const formattedHistory = messages.map(message => ({
      // THE FIX: Conditionally change the role name.
      role: message.role === 'assistant' ? 'model' : message.role,
      parts: [{ text: message.content as string }],
    }));

    const payload = {
      contents: formattedHistory,
    };

    const modelName = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google API Error (After Role Fix):', errorData);
      throw new Error(errorData.error.message || 'An error occurred with the Google API.');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Jag fick ett oväntat svar från AI:n, försök igen.";

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('Internal API Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
