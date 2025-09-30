
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/app/ai/prompts";

// Korrigerad för att matcha .env.local-konfigurationen
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Korrigerad för att matcha .env.local-konfigurationen
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured in .env.local");
    }

    // Välj Gemini-modellen och applicera system-prompten
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
    });

    // Skapa chatten och skicka meddelandet
    const chat = model.startChat();
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    try {
      // Försök att tolka svaret som JSON
      const parsedResponse = JSON.parse(responseText);
      return NextResponse.json(parsedResponse);
    } catch (e) {
      console.error("AI response was not valid JSON:", responseText);
      // Om AI:n inte svarar med giltig JSON, skicka ett standardfel-objekt
      // Detta förhindrar att klienten kraschar om den får ett icke-JSON-svar.
      return NextResponse.json({
          text: "Ett internt fel uppstod när jag försökte tolka svaret från AI:n. Svaret var inte giltig JSON. Försök igen.",
          actions: []
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        // Skicka ett mer informativt felobjekt till klienten
        text: "Ett allvarligt internt serverfel inträffade. Kontrollera serverloggarna.",
        actions: [] 
      },
      { status: 500 }
    );
  }
}
