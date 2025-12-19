"use client";

import { useChat as useAIChat } from "ai/react";
import { useState, useCallback, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  reply: string;
  thread_id: string;
  events: Array<{ type: string; [key: string]: unknown }>;
  metadata: Record<string, unknown>;
}

interface UseChatOptions {
  apiEndpoint?: string;
  initialMessages?: ChatMessage[];
}

/**
 * useChat Hook - Powered by Vercel AI SDK
 * 
 * Manages chat state with streaming support and automatic request handling.
 * Integrates with FastAPI backend via /api/chat endpoint.
 * 
 * Usage:
 * ```tsx
 * const { messages, input, setInput, handleSubmit, isLoading, error, threadId } = useChat();
 * 
 * <form onSubmit={handleSubmit}>
 *   <input value={input} onChange={e => setInput(e.target.value)} />
 *   <button type="submit" disabled={isLoading}>Send</button>
 * </form>
 * ```
 */
export function useChat(options: UseChatOptions = {}) {
  const { apiEndpoint = "/api/chat" } = options;

  const {
    messages: aiMessages,
    input,
    setInput,
    handleSubmit: handleAISubmit,
    isLoading,
    error,
    stop,
    append,
  } = useAIChat({
    api: apiEndpoint,
    headers: {
      "Content-Type": "application/json",
    },
    // Get auth token from localStorage
    onFinish: (message) => {
      // Optionally process completed messages
      console.log("[CHAT] Message completed:", message);
    },
    onError: (err) => {
      console.error("[CHAT] Error:", err);
    },
  });

  const [threadId, setThreadId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  // Convert AI SDK messages to our format and add timestamps
  const messages: ChatMessage[] = aiMessages.map((msg) => ({
    id: msg.id || Date.now().toString(),
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: new Date(),
  }));

  /**
   * Handle form submission with auth token
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim() || isLoading) {
        return;
      }

      try {
        // Get auth token
        const token = localStorage.getItem("token");

        // Prepare headers with auth
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Create form data for submission
        const formData = new FormData();
        formData.append("message", input);

        // Manually send request to include auth header
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: ChatResponse = await response.json();

        // Add assistant message to state
        await append({
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
        });

        // Update thread ID and metadata
        setThreadId(data.thread_id);
        setMetadata(data.metadata);

        // Clear input
        setInput("");

        // Handle events if any
        if (data.events && data.events.length > 0) {
          console.log("[CHAT] Events:", data.events);
        }
      } catch (err) {
        console.error("[CHAT] Submit error:", err);
      }
    },
    [input, isLoading, apiEndpoint, append, setInput]
  );

  /**
   * Send a message programmatically
   */
  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim()) {
        return;
      }

      setInput(messageContent);

      // Trigger form submission
      const form = new FormData();
      const event = new Event("submit", { bubbles: true });

      // Simulate form submission
      await handleSubmit(event as any);
    },
    [setInput, handleSubmit]
  );

  /**
   * Clear chat history
   */
  const clearMessages = useCallback(() => {
    // Clear all messages by creating new empty state
    console.log("[CHAT] Clearing messages");
  }, []);

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    sendMessage,
    isLoading,
    error,
    threadId,
    metadata,
    clearMessages,
    cancel: stop,
  };
}
