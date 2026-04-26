/**
 * data/mutations/users.ts
 * Write operations for the `users` domain.
 * Always validates input with the matching DTO schema before writing.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import { UpdateUserSchema, type UpdateUserInput } from "@/data/dto/users";
import type { UserProfile } from "@/data/queries/users";

/**
 * Updates the current user's profile (full_name, phone_number).
 * Upserts the record so it works whether or not the row already exists.
 */
export async function updateMyProfile(input: UpdateUserInput): Promise<UserProfile> {
  const user = await requireAuth();

  // Validate input
  const parsed = UpdateUserSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const updated = await db.users.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.full_name !== undefined && { full_name: parsed.data.full_name }),
      ...(parsed.data.phone_number !== undefined && {
        phone_number: parsed.data.phone_number,
      }),
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      phone_number: true,
      created_at: true,
    },
  });

  if (!updated) throw new NotFoundError("User", user.id);

  return {
    id: updated.id,
    full_name: updated.full_name,
    email: updated.email,
    role: updated.role ?? "customer",
    phone_number: updated.phone_number ?? null,
    created_at: updated.created_at ?? null,
  };
}

/**
 * Syncs a user from Supabase Auth into the public.users table.
 * Designed to be called from the OAuth callback.
 */
export async function syncUserFromAuth(): Promise<void> {
  const { createServerClient } = await import("@/lib/supabase");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split("@")[0];

  try {
    await db.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        full_name: fullName,
        password_hash: "OAUTH_GOOGLE",
        role: "customer",
      },
    });
  } catch (err) {
    console.error("[syncUserFromAuth] Failed to sync user:", err);
  }
}
