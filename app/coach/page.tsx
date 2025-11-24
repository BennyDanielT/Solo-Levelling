'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  threadId?: string;
  runId?: string;
}

export default function CoachPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your productivity coach powered by Azure AI. I'm here to help you improve your productivity, time management, and personal growth. What would you like to discuss today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [status]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    console.log('[CoachPage] Sending message:', input);

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('[CoachPage] Calling /api/coach');
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      console.log('[CoachPage] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CoachPage] API error:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      console.log('[CoachPage] API Success:', data);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.responseText,
        timestamp: new Date(),
        threadId: data.threadId,
        runId: data.runId,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[CoachPage] Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${
          (error as Error).message
        }. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white text-lg'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700'>
      <Navigation />
      <div className='pt-20 pb-24'>
        <div className='max-w-4xl mx-auto p-4'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Sparkles className='text-gold-400 w-8 h-8' />
              <h1 className='text-4xl font-bold gradient-text'>
                Productivity Coach
              </h1>
            </div>
            <p className='text-gray-300 text-lg'>
              Get AI-powered guidance on productivity, time management, and
              personal growth
            </p>
          </motion.div>

          <div className='glass-effect rounded-xl p-6 h-[calc(100vh-280px)] flex flex-col'>
            <div className='flex-1 overflow-y-auto mb-4 space-y-4'>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white'
                          : 'bg-white/10 text-gray-100 border border-white/20'
                      }`}
                    >
                      <p className='whitespace-pre-wrap'>{message.content}</p>
                      <p className='text-xs opacity-70 mt-2'>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='flex justify-start'
                >
                  <div className='bg-white/10 text-gray-100 border border-white/20 rounded-lg p-4'>
                    <Loader2 className='w-5 h-5 animate-spin' />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='flex gap-2'>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Ask for productivity tips, guidance, or feedback...'
                className='flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none'
                rows={2}
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className='bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <Send className='w-5 h-5' />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
