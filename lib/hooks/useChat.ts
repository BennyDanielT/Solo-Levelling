"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  reply: string;
  thread_id: string;
  events: Array<{ type: string; [key: string]: unknown }>;
  metadata: Record<string, unknown>;
}

interface UseChatOptions {
  apiEndpoint?: string;
}

/**
 * useChat Hook
 * Manages chat state and communication with the FastAPI backend.
 * 
 * Usage:
 * const { messages, input, setInput, sendMessage, isLoading, error } = useChat();
 */
export function useChat(options: UseChatOptions = {}) {
  const { apiEndpoint = "/api/chat" } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Send a message to the backend and update local state
   */
  const sendMessage = useCallback(
    async (messageContent?: string) => {
      const messageText = messageContent || input;

      if (!messageText.trim()) {
        return;
      }

      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        // Prepare abort controller for potential cancellation
        abortControllerRef.current = new AbortController();

        // Get auth token
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Send request to backend
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({ message: messageText }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: ChatResponse = await response.json();

        // Add assistant message to local state
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setThreadId(data.thread_id);

        // Optionally emit events (goal created, metric logged, etc)
        if (data.events && data.events.length > 0) {
          logger.info("[CHAT] Events from response:", data.events);
        }

        return data;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          logger.info("[CHAT] Request cancelled");
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
          logger.error("[CHAT] Error:", errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, apiEndpoint]
  );

  /**
   * Clear chat history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setError(null);
  }, []);

  /**
   * Cancel ongoing request
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    threadId,
    clearMessages,
    cancel,
  };
}

// Simple logger for client-side debugging
const logger = {
  info: (...args: unknown[]) => console.log("[CHAT]", ...args),
  error: (...args: unknown[]) => console.error("[CHAT]", ...args),
  warn: (...args: unknown[]) => console.warn("[CHAT]", ...args),
};
