/**
 * data/queries/chat.ts
 * DAL for chat_sessions and chat_messages.
 * Handles creating sessions, appending messages, and loading history.
 */
import { db } from "@/lib/db";

export interface ChatMessageRecord {
  id: string;
  role: string;
  content: string;
  created_at: Date | null;
}

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * Gets the existing chat session for a user, or creates a new one.
 * Anonymous sessions (no user_id) always create a new session.
 */
export async function getOrCreateSession(userId?: string): Promise<string> {
  if (!userId) {
    // Anonymous: create a fresh session every time widget opens
    const session = await db.chat_sessions.create({
      data: {},
      select: { id: true },
    });
    return session.id;
  }

  // Authenticated: reuse the most recent session (within 24h) or create new
  const existing = await db.chat_sessions.findFirst({
    where: {
      user_id: userId,
      updated_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { updated_at: "desc" },
    select: { id: true },
  });

  if (existing) return existing.id;

  const newSession = await db.chat_sessions.create({
    data: { user_id: userId },
    select: { id: true },
  });
  return newSession.id;
}

// ─── Message Persistence ─────────────────────────────────────────────────────

/** Saves a single message to the session. */
export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  await db.chat_messages.create({
    data: { session_id: sessionId, role, content },
  });

  // Bump session updated_at so "within 24h" logic stays fresh
  await db.chat_sessions.update({
    where: { id: sessionId },
    data: { updated_at: new Date() },
  });
}

/** Returns the last N messages for a session (ordered oldest → newest). */
export async function getSessionHistory(
  sessionId: string,
  limit = 20
): Promise<ChatMessageRecord[]> {
  const messages = await db.chat_messages.findMany({
    where: { session_id: sessionId },
    orderBy: { created_at: "asc" },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      created_at: true,
    },
  });
  return messages;
}

/** Clears all messages in a session (used by "Clear chat" button). */
export async function clearSession(sessionId: string): Promise<void> {
  await db.chat_messages.deleteMany({ where: { session_id: sessionId } });
}
