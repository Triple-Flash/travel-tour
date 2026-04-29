"use server";

/**
 * app/(auth)/login/actions.ts
 * Server Actions for authentication flows.
 * Calls Supabase auth through lib/supabase — NOT through the DAL (auth is not a DB domain).
 */
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase";

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createServerClient();
  
  // Robust URL resolution for Vercel/Local
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? "http://localhost:3000";
  siteUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  const origin = siteUrl.replace(/\/$/, ""); // Remove trailing slash

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect("/login?error=oauth_error");
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
