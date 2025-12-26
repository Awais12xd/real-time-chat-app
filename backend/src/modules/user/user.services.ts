// src/modules/user/user.services.ts
import { clerkClient } from "../../config/clerk.js";
import { repoUpdateUserProfile, upsertUserFromClerkProfile } from "./user.repository.js";
import { UserProfile } from "./user.types.js";

async function fetchClerkProfile(clerkUserId: string) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || null;
  const primary = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId) ?? clerkUser.emailAddresses[0];
  const email = primary?.emailAddress ?? null;

  const avatarUrl = clerkUser.imageUrl ?? null;

  return { fullName, email, avatarUrl };
}

export async function getUserFromClerk(clerkUserId: string): Promise<UserProfile> {
  const { fullName, email, avatarUrl } = await fetchClerkProfile(clerkUserId);
  const user = await upsertUserFromClerkProfile({
    clerkUserId,
    displayName: fullName,
    avatarUrl,
  });

  return { user, clerkEmail: email, clerkFullName: fullName };
}

export async function updateUserProfile(params: {
  clerkUserId: string, displayName: string | null, avatarUrl: string | null, bio?: string | null, handle?: string | null
}): Promise<UserProfile> {
  const { clerkUserId, displayName, bio, handle, avatarUrl } = params;

   // 1️⃣ Update Clerk (identity data)
  // if (displayName || avatarUrl) {
  //   await clerkClient.users.updateUser(clerkUserId, {
  //     firstName: displayName ?? undefined,
  //   });
  // }

  const updatedUser = await repoUpdateUserProfile({
    clerkUserId, displayName, bio, handle, avatarUrl
  })

  const { fullName, email } = await fetchClerkProfile(clerkUserId)

  return {
    user: updatedUser,
    clerkFullName: fullName,
    clerkEmail: email
  }
}
