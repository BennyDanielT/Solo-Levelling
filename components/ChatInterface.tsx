"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "./Message";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useChat } from "@/lib/hooks/useChat";

export default function ChatInterface() {
  const {
    messages,
    input,
    setInput,
    handleSubmit: handleChatSubmit,
    isLoading,
    error,
    clearMessages,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await handleChatSubmit(e as any);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Life-Hacker Coach</h1>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 px-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-16 h-16 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Welcome to your AI Life Coach
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              I'm here to help you level up your life! Ask me about setting goals,
              improving habits, or get personalized advice based on your progress.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => setInput("Help me set a fitness goal to run 5km")}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <p className="font-medium">🏃 Fitness Goal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help me create a running plan
                </p>
              </button>
              <button
                onClick={() => setInput("How can I improve my productivity?")}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <p className="font-medium">⚡ Productivity</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tips for better time management
                </p>
              </button>
              <button
                onClick={() => setInput("Review my current goals")}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <p className="font-medium">🎯 Goal Review</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyze my progress
                </p>
              </button>
              <button
                onClick={() => setInput("I need motivation to stay consistent")}
                className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <p className="font-medium">💪 Motivation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stay on track with my goals
                </p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message: ChatMessage) => (
              <Message
                key={message.id}
                content={message.content}
                role={message.role as "user" | "assistant"}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your goals..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
