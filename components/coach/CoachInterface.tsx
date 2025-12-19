"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Send, Upload, X, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface Thread {
  _id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  file_references?: string[];
}

export default function CoachInterface() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Load threads on mount
  useEffect(() => {
    if (session?.user) {
      loadThreads();
    }
  }, [session]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadThreads = async () => {
    try {
      const res = await fetch("/api/threads", {
        headers: {
          Authorization: `Bearer ${session?.user?.email}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
        // Load first thread by default
        if (data.data?.length > 0) {
          loadThread(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load threads:", error);
    }
  };

  const loadThread = async (threadId: string) => {
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.email}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentThread(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load thread:", error);
    }
  };

  const createNewThread = async () => {
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.email}`,
        },
        body: JSON.stringify({
          title: `Chat - ${new Date().toLocaleString()}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newThread = data.data;
        setThreads([newThread, ...threads]);
        setCurrentThread(newThread);
        setMessages([]);
        setInput("");
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const deleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.user?.email}`,
        },
      });

      if (res.ok) {
        setThreads(threads.filter((t) => t._id !== threadId));
        if (currentThread?._id === threadId) {
          setCurrentThread(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentThread) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsLoading(true);

    try {
      // Add user message to thread
      await fetch(`/api/threads/${currentThread._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          sender: "user",
        }),
      });

      // Stream response from SSE endpoint via POST
      const response = await fetch(`/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          threadId: currentThread._id,
        }),
      });

      if (!response.ok || !response.body) {
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                assistantResponse += data.content;
                // Update last message or add new one
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[updated.length - 1]?.role === "assistant") {
                    updated[updated.length - 1].content = assistantResponse;
                  } else {
                    updated.push({
                      role: "assistant",
                      content: assistantResponse,
                      timestamp: new Date().toISOString(),
                    });
                  }
                  return updated;
                });
              } else if (data.type === "complete") {
                // Save assistant message to thread
                await fetch(`/api/threads/${currentThread._id}/messages`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message: assistantResponse,
                    sender: "assistant",
                  }),
                });
                setIsLoading(false);
              } else if (data.type === "error") {
                console.error("Stream error:", data.error);
                setIsLoading(false);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* New Chat Button */}
        <button
          onClick={createNewThread}
          className="m-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus size={20} />
          <span>New chat</span>
        </button>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto px-2">
          {threads.map((thread) => (
            <button
              key={thread._id}
              onClick={() => loadThread(thread._id)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 truncate transition-colors ${
                currentThread?._id === thread._id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={thread.title}
            >
              <div className="flex items-center justify-between">
                <span className="truncate flex-1">{thread.title}</span>
                {currentThread?._id === thread._id && (
                  <button
                    onClick={(e) => deleteThread(thread._id, e)}
                    className="ml-2 p-1 hover:bg-red-500 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentThread ? (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Start a conversation
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Ask me anything about your goals, stocks, or news.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              {/* File Upload Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() =>
                          setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
                        }
                        className="hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="flex gap-3">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex items-center justify-center">
                  <Upload size={20} className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                </label>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Message Solo Levelling Coach..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />

                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={createNewThread}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create a new conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
