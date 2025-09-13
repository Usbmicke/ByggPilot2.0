
import Chat from '@/app/components/Chat';

export default function ChatPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ByggPilot AI</h1>
      <p className="mb-6 text-gray-600">En central plats för att hantera dina projekt, skapa offerter och genomföra riskanalyser.</p>
      <Chat />
    </main>
  );
}
