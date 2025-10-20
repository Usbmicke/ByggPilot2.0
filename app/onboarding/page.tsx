
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

// =================================================================================
// ONBOARDING-SIDA V1.0 - GULDSTANDARD
// ARKITEKTUR: Denna sida agerar som en "container". Den hanterar serverside-logik
// som att hämta användardata och omdirigera redan onboardade användare.
// Själva flödet delegeras till en ren klient-komponent (`OnboardingFlow`).
// =================================================================================

export default async function OnboardingPage() {
    const session = await getServerSession(authOptions);

    // Skydd: Om användaren av någon anledning redan är onboardad, skicka till dashboard.
    if (session?.user?.onboardingComplete) {
        redirect("/dashboard");
    }

    // Skydd: Om ingen session finns, skicka till inloggning.
    if (!session?.user) {
        redirect("/");
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <OnboardingFlow user={session.user} />
        </main>
    );
}
