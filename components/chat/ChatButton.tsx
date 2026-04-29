"use client";

import { useState, useEffect } from "react";
import { Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "./ChatWidget";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  function handleOpen() {
    setIsOpen(true);
    setHasUnread(false);
  }

  function handleClose() {
    setIsOpen(false);
  }

  if (!mounted) return null;

  return (
    <>
      {/* Floating trigger button */}
      <div className="chat-fab-wrapper" aria-label="Mở trợ lý du lịch AI">
        {/* Tooltip */}
        {!isOpen && (
          <div className="chat-fab-tooltip" aria-hidden="true">
            Chat với Aria — Tư vấn du lịch AI ✈️
          </div>
        )}

        <button
          onClick={isOpen ? handleClose : handleOpen}
          className={cn("chat-fab", isOpen && "chat-fab--active")}
          aria-label={isOpen ? "Close chat" : "Open AI travel assistant"}
          aria-expanded={isOpen}
        >
          {/* Pulse ring */}
          {!isOpen && hasUnread && (
            <span className="chat-fab-pulse" aria-hidden="true" />
          )}

          {/* Unread badge */}
          {!isOpen && hasUnread && (
            <span className="chat-fab-badge" aria-label="1 new message">
              1
            </span>
          )}

          <span
            className={cn(
              "chat-fab-icon",
              isOpen ? "chat-fab-icon--close" : "chat-fab-icon--open"
            )}
            aria-hidden="true"
          >
            {isOpen ? <X size={22} /> : <Bot size={22} />}
          </span>
        </button>
      </div>

      {/* Chat panel */}
      <ChatWidget isOpen={isOpen} onClose={handleClose} />

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="chat-backdrop"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
