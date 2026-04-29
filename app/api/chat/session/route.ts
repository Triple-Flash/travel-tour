/**
 * app/api/chat/session/route.ts
 * GET  → returns (or creates) a session + last 20 messages for the current user
 * DELETE → clears all messages in a session
 */
import { getSession } from "@/lib/auth";
import {
  getOrCreateSession,
  getSessionHistory,
  clearSession,
} from "@/data/queries/chat";

export async function GET() {
  const user = await getSession();
  const sessionId = await getOrCreateSession(user?.id);
  const history = await getSessionHistory(sessionId, 30);

  return Response.json({ sessionId, history });
}

export async function DELETE(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }
  await clearSession(sessionId);
  return Response.json({ ok: true });
}
