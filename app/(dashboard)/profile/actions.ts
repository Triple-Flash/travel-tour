"use server";

/**
 * app/(dashboard)/profile/actions.ts
 * Server Actions for user profile management.
 */
import { revalidatePath } from "next/cache";
import { updateMyProfile } from "@/data/mutations/users";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import type { UpdateUserInput } from "@/data/dto/users";
import type { ActionResult } from "@/app/(dashboard)/bookings/actions";
import type { UserProfile } from "@/data/queries/users";

export async function updateProfileAction(
  input: UpdateUserInput
): Promise<ActionResult<UserProfile>> {
  try {
    const updated = await updateMyProfile(input);
    revalidatePath("/dashboard/profile");
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthError) return { success: false, error: "Please sign in." };
    if (err instanceof ValidationError) return { success: false, error: err.message };
    if (err instanceof NotFoundError) return { success: false, error: err.message };
    console.error("[ProfileAction]", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
