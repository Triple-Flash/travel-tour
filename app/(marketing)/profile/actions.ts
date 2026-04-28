"use server";

import { revalidatePath } from "next/cache";
import { updateMyProfile } from "@/data/mutations/users";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import type { UpdateUserInput } from "@/data/dto/users";
import type { UserProfile } from "@/data/queries/users";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateProfileAction(
  input: UpdateUserInput
): Promise<ActionResult<UserProfile>> {
  try {
    const updated = await updateMyProfile(input);
    revalidatePath("/profile");
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Vui long dang nhap de tiep tuc.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  console.error("[MarketingProfileAction]", err);
  return "Da xay ra loi khong mong muon. Vui long thu lai.";
}
