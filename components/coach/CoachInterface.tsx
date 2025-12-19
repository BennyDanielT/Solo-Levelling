"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Send, Upload, X, Trash2, ChevronLeft, Sparkles, Menu } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          {/* Left Section - Logo & Back Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              title="Back to Dashboard"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Life Coach
              </h1>
            </div>
          </div>

          {/* Right Section - Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 overflow-hidden`}
        >
          {/* New Chat Button */}
          <button
            onClick={createNewThread}
            className="m-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg hover:from-blue-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg font-medium text-sm"
          >
            <Plus size={18} />
            <span>New chat</span>
          </button>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-2">
            {threads.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">
                No conversations yet
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread._id}
                  onClick={() => loadThread(thread._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                    currentThread?._id === thread._id
                      ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                  title={thread.title}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1 text-sm font-medium">
                      {thread.title}
                    </span>
                    {currentThread?._id === thread._id && (
                      <button
                        onClick={(e) => deleteThread(thread._id, e)}
                        className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1 truncate">
                    {new Date(thread.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 text-sm">
            <p className="text-slate-600 dark:text-slate-400">Signed in as</p>
            <p className="font-medium text-slate-900 dark:text-white truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentThread ? (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <div className="flex justify-center mb-4">
                        <Sparkles className="w-12 h-12 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome back!
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Start a conversation with your AI coach. Ask about goals, progress, or get personalized advice.
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setInput("What should I focus on today?")}
                          className="p-3 text-left border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <p className="font-medium text-slate-900 dark:text-white">⚡ What should I focus on?</p>
                        </button>
                        <button
                          onClick={() => setInput("Review my progress on my goals")}
                          className="p-3 text-left border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <p className="font-medium text-slate-900 dark:text-white">📊 Review my progress</p>
                        </button>
                      </div>
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
                        className={`max-w-2xl px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-br-none shadow-lg"
                            : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none shadow-md border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed">
                          {message.content}
                        </p>
                        {message.timestamp && (
                          <p className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-700 px-6 py-4 rounded-2xl rounded-bl-none shadow-md border border-slate-200 dark:border-slate-600">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-6">
                {/* File Upload Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-3 flex gap-2 flex-wrap">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-sm"
                      >
                        <span className="text-slate-700 dark:text-slate-300">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))
                          }
                          className="hover:text-red-500 text-slate-500 dark:text-slate-400"
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
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    <Upload size={20} />
                  </label>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Ask your coach something..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="flex items-center justify-center px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl hover:from-blue-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
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
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                Create your first conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
