
import {NextRequest, NextResponse} from "next/server";
import {Message, streamText} from "ai";
import {google} from "@ai-sdk/google";
import {getPineconeClient} from "@/lib/pinecone";
import {auth} from "@/lib/auth";
import {adminDb} from "@/lib/admin";

export async function POST(req: NextRequest) {
  const {
    messages,
    chatId
  }: { messages: Message[]; chatId: string } = await req.json();
  const user = await auth();

  if (!user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const latestMessage = messages[messages.length - 1].content;

  const pineconeClient = await getPineconeClient();
  const pineconeIndex = await pineconeClient.index("ai-pdf-chat");

  const vectorStore = await pineconeClient.vector_store({
    index: pineconeIndex,
  });

  const searchResult = await vectorStore.search(latestMessage, {
    k: 5,
  });

  let context = searchResult.map((item) => item.text).join("\n\n");
  context = context.slice(0, 4000);

  const augmentedMessages: Message[] = [
    ...messages.slice(0, -1),
    {
      role: "system",
      content:
        `You are a helpful AI assistant. You are chatting with a user about a PDF document.
        You will be provided with the user's message and the most relevant context from the PDF.
        Your task is to answer the user's question based on the provided context.
        If the context is not sufficient to answer the question, you can ask the user for more information.
        Do not make up information that is not present in the context.
        The context is:
        ${context}`,
    },
    messages[messages.length - 1],
  ];

  try {
    const result = await streamText({
      model: google("models/gemini-1.5-flash-latest"),
      messages: augmentedMessages,
    });

    const stream = result.toAIStream({
      onStart: async () => {
        // This callback is called when the stream starts.
        // You can use this to save the prompt to your database.
        await adminDb.collection("chats").doc(chatId).collection("messages").add({
          role: "assistant",
          content: augmentedMessages.map((m) => m.content).join("\n\n"),
          createdAt: new Date(),
        });
      },
      onToken: async (token: string) => {
        // This callback is called for each token in the stream.
        // You can use this to save the response to your database.
      },
      onCompletion: async (completion: string) => {
        // This callback is called when the stream completes.
        // You can use this to save the final response to your database.
        await adminDb.collection("chats").doc(chatId).collection("messages").add({
          role: "assistant",
          content: completion,
          createdAt: new Date(),
        });
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {error: "Something went wrong, please try again."},
      {status: 500}
    );
  }
}
