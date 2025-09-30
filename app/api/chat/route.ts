
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Content } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/app/ai/prompts";
import { ChatMessage } from "@/app/types";

// Konfigurera Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mappa om vår interna ChatMessage-roll till Geminis roll
const roleMap: Record<ChatMessage['role'], 'user' | 'model'> = {
    user: 'user',
    assistant: 'model',
    system: 'user' // Gemini har inte en 'system'-roll, vi behandlar den som en del av user/model-historiken
};

// Säkerhetsinställningar
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Formatera historiken för Gemini API
const buildFormattedHistory = (messages: ChatMessage[]): Content[] => {
    // Filtrera bort system-meddelanden då de hanteras av `systemInstruction`
    return messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
            role: roleMap[m.role],
            parts: [{ text: m.content }],
        }));
};


export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required and must be a non-empty array" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured in .env.local");
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
    });

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const history = buildFormattedHistory(messages.slice(0, -1));

    const chat = model.startChat({
        history,
        safetySettings,
    });
    
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const responseText = response.text();

    return new Response(responseText, {
      headers: { 'Content-Type': 'text/plain' },
    });
    
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { 
        error: "An internal server error occurred.",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
