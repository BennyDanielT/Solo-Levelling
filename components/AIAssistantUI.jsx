"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus, Send, Trash2, Menu, Home } from "lucide-react"
import Link from "next/link"

export default function AIAssistantUI() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  useEffect(() => {
    if (session?.user) {
      loadConversations()
    }
  }, [session])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/threads")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.threads || [])
        if (data.threads && data.threads.length > 0) {
          setActiveConversation(data.threads[0])
          setMessages(data.threads[0].messages || [])
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Conversation ${new Date().toLocaleDateString()}` }),
      })
      if (response.ok) {
        const newThread = await response.json()
        setConversations([newThread, ...conversations])
        setActiveConversation(newThread)
        setMessages([])
        setInput("")
      }
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Auto-create conversation if none exists
    let currentConversation = activeConversation
    if (!currentConversation) {
      try {
        const response = await fetch("/api/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: `Chat ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '').replace(/ /g, '-')}` }),
        })
        if (response.ok) {
          const newThread = await response.json()
          setConversations([newThread, ...conversations])
          setActiveConversation(newThread)
          currentConversation = newThread
        } else {
          console.error("Failed to auto-create conversation")
          return
        }
      } catch (error) {
        console.error("Failed to auto-create conversation:", error)
        return
      }
    }

    const userMessage = { role: "user", content: input.trim() }
    const currentInput = input.trim()
    
    // Optimistically add user message
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      setIsLoading(true)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: currentConversation._id,
          message: currentInput,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add assistant reply to messages
        if (data.reply) {
          const assistantMessage = { role: "assistant", content: data.reply }
          setMessages(prev => [...prev, assistantMessage])
          setConversations(prevConvs =>
            prevConvs.map(c =>
              c._id === currentConversation._id
                ? { ...c, messages: [...(c.messages || []), userMessage, assistantMessage] }
                : c
            )
          )
        }
      } else {
        // Remove optimistic message on error
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Chat error:", errorData)
        setMessages(prev => prev.slice(0, -1))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-900`}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 font-medium transition-opacity"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => {
                setActiveConversation(conv)
                setMessages(conv.messages || [])
              }}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
                activeConversation?._id === conv._id
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <p className="truncate text-sm font-medium">{conv.title || "Untitled"}</p>
              <p className="text-xs opacity-75">
                {new Date(conv.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '').replace(/ /g, '-')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Back to Dashboard"
            >
              <Home size={20} />
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
          <h1 className="flex-1 text-center font-semibold text-zinc-900 dark:text-white">
            {activeConversation?.title || "AI Coach"}
          </h1>
          {activeConversation && (
            <button
              onClick={async () => {
                try {
                  await fetch(`/api/threads/${activeConversation._id}`, { method: "DELETE" })
                  const newConversations = conversations.filter((c) => c._id !== activeConversation._id)
                  setConversations(newConversations)
                  if (newConversations.length > 0) {
                    setActiveConversation(newConversations[0])
                  } else {
                    setActiveConversation(null)
                    setMessages([])
                  }
                } catch (error) {
                  console.error("Failed to delete conversation:", error)
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-zinc-500 dark:text-zinc-400">No messages yet</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  {activeConversation ? "Start typing to begin" : "Type a message below to start a new chat"}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                <p className="text-sm text-zinc-500">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeConversation ? "Type a message..." : "Start typing to begin a new chat..."}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
