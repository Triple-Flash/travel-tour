"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  MapPin,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";

const SUGGESTIONS = [
  "Chúng ta có bao nhiêu tour?",
  "Gợi ý tour cho gia đình",
  "Tour Bali giá bao nhiêu?",
  "Điểm đến nào đang hot nhất?",
];

function makeWelcomeMessage(id: string): UIMessage {
  return {
    id,
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Xin chào! Tôi là **Aria** 👋, trợ lý du lịch AI của TravelTour.\n\nTôi có thể giúp bạn khám phá các tour hấp dẫn, tư vấn điểm đến phù hợp, hoặc hỗ trợ mọi thắc mắc về đặt tour.\n\nBạn đang có kế hoạch du lịch đến đâu?",
      },
    ],
  } as UIMessage;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Build transport with sessionId in body — recreated when sessionId changes
  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: sessionId ? { sessionId } : {},
  });

  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
    setMessages,
  } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  // ── Load session & history on first open ─────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/chat/session");
      const data = await res.json() as {
        sessionId: string;
        history: { id: string; role: string; content: string }[];
      };

      setSessionId(data.sessionId);
      setHistoryLoaded(true);

      if (data.history && data.history.length > 0) {
        const historical: UIMessage[] = data.history.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
        }));
        setMessages([makeWelcomeMessage("welcome"), ...historical]);
      } else {
        setMessages([makeWelcomeMessage("welcome")]);
      }
    } catch {
      setMessages([makeWelcomeMessage("welcome")]);
      setHistoryLoaded(true);
    }
  }, [historyLoaded, setMessages]);

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadHistory();
    }
  }, [isOpen, historyLoaded, loadHistory]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ── Focus input ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    await sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }

  async function handleSuggestion(text: string) {
    if (isLoading) return;
    await sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }

  async function handleClear() {
    if (sessionId) {
      await fetch("/api/chat/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setHistoryLoaded(false);
      setSessionId(undefined);
    }
    setMessages([makeWelcomeMessage(`welcome-${Date.now()}`)]);
  }

  const hasUserMessages = messages.some((m) => m.role === "user");
  const hasHistory = messages.length > 1;

  return (
    <div
      className={cn(
        "chat-widget",
        isOpen ? "chat-widget--open" : "chat-widget--closed"
      )}
      role="dialog"
      aria-label="Aria — Trợ lý AI TravelTour"
      aria-modal="true"
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="chat-header">
        <div className="chat-header__identity">
          <div className="chat-header__avatar">
            <Bot size={18} />
            <span className="chat-header__online-dot" aria-hidden="true" />
          </div>
          <div>
            <p className="chat-header__name">Aria</p>
            <p className="chat-header__status">
              <MapPin size={10} />
              Tư vấn viên TravelTour · Trực tuyến
            </p>
          </div>
        </div>

        <div className="chat-header__actions">
          {hasHistory && !isLoading && sessionId && (
            <div className="chat-history-badge" title="Lịch sử chat đã được lưu">
              <History size={12} />
            </div>
          )}
          {hasUserMessages && !isLoading && (
            <button
              onClick={handleClear}
              className="chat-icon-btn"
              aria-label="Xóa cuộc trò chuyện"
              title="Xóa chat"
            >
              <RotateCcw size={15} />
            </button>
          )}
          {isLoading && (
            <button
              onClick={stop}
              className="chat-icon-btn"
              aria-label="Dừng tạo phản hồi"
              title="Dừng"
            >
              <span className="chat-stop-icon" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onClose}
            className="chat-icon-btn"
            aria-label="Đóng chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="chat-msg-row chat-msg-row--assistant">
            <div className="chat-avatar chat-avatar--aria" aria-hidden="true">
              <Bot size={14} />
            </div>
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="chat-error">
            <p>Đã xảy ra lỗi. Vui lòng thử lại.</p>
            <button onClick={() => regenerate()} className="chat-error__retry">
              Thử lại
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestion chips ─────────────────────────────────────── */}
      {!hasUserMessages && (
        <div className="chat-suggestions" aria-label="Câu hỏi gợi ý">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="chat-chip"
              disabled={isLoading}
            >
              <Sparkles size={11} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Hỏi về tour, điểm đến, đặt chỗ..."
          className="chat-input"
          disabled={isLoading}
          aria-label="Nhập tin nhắn"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="chat-send-btn"
          aria-label="Gửi tin nhắn"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
