import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, { ok: boolean; message: string }> = {};

  // ── 1. Supabase connection check ────────────────────────────────────────
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    results.supabase = { ok: true, message: "Supabase connected ✓" };
  } catch (err) {
    results.supabase = {
      ok: false,
      message: `Supabase error: ${(err as Error).message}`,
    };
  }

  // ── 2. Prisma / PostgreSQL connection check ──────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.prisma = { ok: true, message: "Prisma (PostgreSQL) connected ✓" };
  } catch (err) {
    results.prisma = {
      ok: false,
      message: `Prisma error: ${(err as Error).message}`,
    };
  }

  const allOk = Object.values(results).every((r) => r.ok);

  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks: results },
    { status: allOk ? 200 : 503 }
  );
}
