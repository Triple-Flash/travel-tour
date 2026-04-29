/**
 * app/api/chat/route.ts
 * Aria — AI Tư vấn Du lịch TravelTour
 * - Trả lời hoàn toàn bằng tiếng Việt
 * - Inject dữ liệu thực (tours, destinations) vào system prompt
 * - Lưu lịch sử chat vào DB theo từng khách hàng
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { getSession } from "@/lib/auth";
import { buildChatContext } from "@/lib/chat-context";
import { getOrCreateSession, saveMessage } from "@/data/queries/chat";

export const maxDuration = 60;

function buildSystemPrompt(
  context: Awaited<ReturnType<typeof buildChatContext>>,
  userName?: string
): string {
  const greeting = userName ? `Khách hàng hiện tại: **${userName}**\n` : "";

  return `Bạn là **Aria**, trợ lý tư vấn du lịch AI thông minh của TravelTour — công ty du lịch cao cấp tại Việt Nam.

${greeting}
---

## NGUYÊN TẮC QUAN TRỌNG

1. **LUÔN trả lời bằng tiếng Việt** — không được dùng tiếng Anh trừ tên riêng địa danh.
2. **Dựa trên dữ liệu thực** — chỉ đề cập tour và điểm đến có trong danh sách bên dưới.
3. **Thân thiện, nhiệt tình** — như một người tư vấn du lịch giàu kinh nghiệm.
4. **Ngắn gọn, rõ ràng** — 2–4 câu với câu hỏi đơn giản, chi tiết hơn với câu phức tạp.
5. **Luôn kết thúc** bằng gợi ý hoặc câu hỏi tiếp theo khi phù hợp.

---

## DỮ LIỆU THỰC TẾ CỦA TRAVELTOUR

### 📊 Tổng quan
${context.statsText}

### 🗺️ Điểm đến (${context.destinationCount} điểm đến)
${context.destinationsText}

### 🧳 Danh sách Tour (${context.tourCount} tour)
${context.toursText}

---

## KHẢ NĂNG CỦA BẠN

- Tư vấn và so sánh các tour du lịch
- Giải thích chi tiết lịch trình, dịch vụ bao gồm, giá cả
- Hỗ trợ quy trình đặt tour và thanh toán
- Trả lời câu hỏi về điểm đến, kinh nghiệm du lịch, thời tiết
- Hỗ trợ quản lý đặt chỗ (kiểm tra trạng thái, hủy, thay đổi)
- Gợi ý tour phù hợp dựa trên sở thích và ngân sách

## THÔNG TIN TRAVELTOUR

- Hơn 50.000 khách hàng hài lòng
- Tour trọn gói: bao gồm lưu trú, ăn uống, hướng dẫn viên và di chuyển
- Đặt tour trực tuyến 24/7, thanh toán an toàn qua PayOS
- Hỗ trợ khách hàng qua chat, email và điện thoại

---

Khi không biết thông tin cụ thể nào đó, hãy hướng dẫn khách liên hệ bộ phận hỗ trợ hoặc xem thêm trên website.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extract session ID passed from client (for history persistence)
    const clientSessionId: string | undefined = body.sessionId;

    const uiMessages: UIMessage[] = body.messages ?? [];

    // ── Auth & personalization ────────────────────────────────────────────────
    const session = await getSession();

    // ── Build DB context (real tours/destinations data) ───────────────────────
    const context = await buildChatContext();

    // ── System prompt (Vietnamese + real data) ────────────────────────────────
    const systemPrompt = buildSystemPrompt(context, session?.full_name);

    // ── Chat history persistence ──────────────────────────────────────────────
    let sessionId = clientSessionId;
    if (!sessionId) {
      sessionId = await getOrCreateSession(session?.id);
    }

    // Save the latest user message
    const lastUserMsg = [...uiMessages].reverse().find((m) => m.role === "user");
    if (lastUserMsg && sessionId) {
      const userText = lastUserMsg.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");
      if (userText) {
        await saveMessage(sessionId, "user", userText);
      }
    }

    // ── Gemini call ───────────────────────────────────────────────────────────
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY ?? "",
    });

    const modelMessages = await convertToModelMessages(uiMessages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        // Save assistant response to DB after streaming completes
        if (sessionId && text) {
          await saveMessage(sessionId, "assistant", text);
        }
      },
    });

    // Return session ID in headers so client can persist it
    const response = result.toUIMessageStreamResponse();
    const headers = new Headers(response.headers);
    if (sessionId) headers.set("X-Chat-Session-Id", sessionId);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (err) {
    console.error("[chat/route] ERROR:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
