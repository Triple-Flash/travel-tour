/**
 * data/queries/users.ts
 * Pure read functions for the `users` domain.
 * All functions that return user-scoped data call requireAuth() first.
 */
import { db } from "@/lib/db";
import { requireAuth, type SessionUser } from "@/lib/auth";
import { NotFoundError } from "@/data/errors";

// ─── Plain TS types (never expose Prisma model instances) ────────────────────

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone_number: string | null;
  created_at: Date | null;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns the currently authenticated user's profile from the DB. */
export async function getMyProfile(): Promise<UserProfile> {
  const session: SessionUser = await requireAuth();

  const user = await db.users.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      phone_number: true,
      created_at: true,
    },
  });

  if (!user) throw new NotFoundError("User", session.id);

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role ?? "customer",
    phone_number: user.phone_number ?? null,
    created_at: user.created_at ?? null,
  };
}

/** Returns any user's profile by ID (admin helper). */
export async function getUserById(id: string): Promise<UserProfile> {
  const user = await db.users.findUnique({
    where: { id },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      phone_number: true,
      created_at: true,
    },
  });

  if (!user) throw new NotFoundError("User", id);

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role ?? "customer",
    phone_number: user.phone_number ?? null,
    created_at: user.created_at ?? null,
  };
}
