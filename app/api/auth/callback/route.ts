import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Where to redirect after login (defaults to /dashboard)
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { syncUserFromAuth } = await import("@/data/mutations/users");
      await syncUserFromAuth();
      
      const { getSession } = await import("@/lib/auth");
      const sessionUser = await getSession();
      
      const redirectPath = sessionUser?.role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Auth error — redirect to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
