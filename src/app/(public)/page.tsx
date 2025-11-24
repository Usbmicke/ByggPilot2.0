
import Image from 'next/image';
import { AuthForm } from '@/app/_components/auth/AuthForm';

/**
 * Landningssidan för ByggPilot.
 * Denna sida är nu en ren presentationskomponent som endast visar inloggningsformuläret.
 * All omdirigeringslogik för redan inloggade användare hanteras nu exklusivt
 * av server-sidan via middleware, vilket är säkrare och effektivare.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-8 p-4 w-full max-w-sm">
        <Image
          src="/images/byggpilotlogga1.png"
          alt="ByggPilot Logotyp"
          width={120}
          height={120}
          className="rounded-2xl shadow-lg"
          priority
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold">ByggPilot</h1>
          <p className="text-neutral-400 mt-2">Logga in för att fortsätta</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
