"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import { createInitialFolderStructure } from "@/app/actions/driveActions";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { firestoreAdmin } from "@/lib/config/firebase-admin";
import { logger } from "@/lib/logger";

const adapter = FirestoreAdapter(firestoreAdmin);

async function getUserFromDb(userId: string) {
    const user = await adapter.getUser(userId);
    if (!user) {
        throw new Error("User not found in database.");
    }
    return user;
}

async function updateUserInDb(userId: string, data: any) {
    // This is a simplified example. You'd likely have a more specific method
    // on your adapter or DAL to update only specific fields.
    const user = await getUserFromDb(userId);
    const updatedUser = { ...user, ...data };
    // The adapter doesn't have a partial update method, so we read and then overwrite.
    // In a real scenario, you'd add a dedicated updateUser method to your DAL.
    await adapter.updateUser(updatedUser);
    return updatedUser;
}

export async function completeOnboardingStep(step: number, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) {
    logger.error("[Onboarding Action] Access Denied: Invalid session.", { step });
    return { success: false, error: "Access Denied: Invalid session." };
  }

  const userId = session.user.id;

  try {
    switch (step) {
      case 1: // Save Company Profile
        logger.info(`[Onboarding Step 1] Updating company profile for user ${userId}`);
        const { companyName } = data;
        if (!companyName || typeof companyName !== 'string') {
          return { success: false, error: "Invalid company name." };
        }
        await updateUserInDb(userId, { companyName });
        return { success: true, data: { companyName } };

      case 2: // Create Drive Structure
        logger.info(`[Onboarding Step 2] Creating Drive structure for user ${userId}`);
        const user = await getUserFromDb(userId);
        const name = user.companyName;
        if (!name) {
             return { success: false, error: "Company name not set." };
        }
        const { rootFolderId, rootFolderUrl } = await createInitialFolderStructure(session.accessToken, name);
        await updateUserInDb(userId, { 
            driveRootFolderId: rootFolderId,
            driveRootFolderUrl: rootFolderUrl,
        });
        logger.info(`[Onboarding Step 2] Drive structure created. Root folder ID: ${rootFolderId}`);
        return { success: true, data: { rootFolderId } };

      case 4: // Mark Onboarding Complete
        logger.info(`[Onboarding Step 4] Marking onboarding as complete for user ${userId}`);
        await updateUserInDb(userId, { onboardingComplete: true });
        return { success: true };

      default:
        logger.warn("[Onboarding Action] Invalid step called.", { userId, step });
        return { success: false, error: "Invalid step." };
    }
  } catch (e) {
    const error = e as Error;
    logger.error({
      message: `[Onboarding Action] Error at step ${step}`,
      userId: userId,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
}
