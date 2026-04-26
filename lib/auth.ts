/**
 * lib/auth.ts
 * Auth helpers used by every DAL query/mutation that is user-scoped.
 *
 * getSession()   → returns the current session or null (never throws).
 * requireAuth()  → returns the session user; throws AuthError if unauthenticated.
 */
import { createServerClient } from "./supabase";

// ─── Typed error ─────────────────────────────────────────────────────────────

export class AuthError extends Error {
  readonly code = "UNAUTHORIZED";
  constructor(message = "You must be signed in to perform this action.") {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Session shape exposed to app layer ──────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  role: string; // from Supabase JWT app_metadata.role or default "customer"
  full_name: string;
  avatar_url?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the currently signed-in user or null.
 * Safe to call in any Server Component; never throws.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) return null;

    const { db } = await import("./db");
    const dbUser = await db.users.findUnique({
      where: { email: user.email },
      select: { role: true, full_name: true },
    });

    return {
      id: user.id,
      email: user.email,
      role:
        dbUser?.role ??
        (user.app_metadata?.role as string | undefined) ??
        (user.user_metadata?.role as string | undefined) ??
        "customer",
      full_name:
        dbUser?.full_name ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email.split("@")[0],
      avatar_url:
        (user.user_metadata?.avatar_url as string | undefined) ??
        (user.user_metadata?.picture as string | undefined),
    };  
  } catch {
    return null;
  }
}

/**
 * Returns the authenticated user or throws AuthError.
 * Always call this at the top of any user-scoped DAL function.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError();
  return user;
}
