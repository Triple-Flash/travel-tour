/**
 * lib/supabase.ts
 * Canonical Supabase client exports.
 * - createServerClient() → for Server Components, Server Actions, API routes
 * - createBrowserClient() → for Client Components
 */
export { createClient as createServerClient } from "./supabase/server";
export { createClient as createBrowserClient } from "./supabase/client";
export { createServiceClient } from "./supabase/server";
