"use client";

import type { UIMessage } from "ai";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: UIMessage;
}

/** Extract plain text from a UIMessage's parts array */
function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
}

/** Render assistant markdown-like text: bold, bullet points */
function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const content = trimmed.slice(2);
      return (
        <li key={i} className="chat-bullet">
          {renderInline(content)}
        </li>
      );
    }

    if (trimmed === "") return <span key={i} className="chat-spacer" />;

    return (
      <p key={i} className="chat-para">
        {renderInline(trimmed)}
      </p>
    );
  });
}

/** Bold (**text**) and inline code (`code`) */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="chat-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  if (!isUser && !isAssistant) return null;

  const text = getTextContent(message);

  return (
    <div
      className={cn(
        "chat-msg-row",
        isUser ? "chat-msg-row--user" : "chat-msg-row--assistant"
      )}
    >
      {/* Aria avatar */}
      {isAssistant && (
        <div className="chat-avatar chat-avatar--aria" aria-hidden="true">
          <Bot size={14} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "chat-bubble",
          isUser ? "chat-bubble--user" : "chat-bubble--assistant"
        )}
      >
        {isUser ? (
          <p className="chat-para">{text}</p>
        ) : (
          <div className="chat-content">{renderContent(text)}</div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="chat-avatar chat-avatar--user" aria-hidden="true">
          <User size={14} />
        </div>
      )}
    </div>
  );
}
