
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

// =================================================================================
// ONBOARDING-SIDA V1.1 - KORRIGERAD PROPS
// LÖSNING: Den felaktiga `user`-propen har tagits bort från anropet till
// `OnboardingFlow` för att matcha den nya, mer robusta implementationen.
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
            <OnboardingFlow />
        </main>
    );
}
