'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { ToastProvider, useToast } from '@/components/dashboard/ToastSystem';
import { FloatingQuickPanel } from '@/components/dashboard/FloatingQuickPanel';
import AddGoalModal from '@/components/AddGoalModal';
import SessionProvider from '@/components/SessionProvider';
import { useState, useCallback } from 'react';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);
  const { addToast } = useToast();

  const handleAddGoal = useCallback(async (title: string, description: string, weight: number, difficulty: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          weight,
          priority: difficulty,
          category: 'personal',
          status: 'active',
        }),
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Goal Created!',
          message: `"${title}" has been added to your goals.`,
        });
        setIsAddGoalOpen(false);
        // Trigger a page refresh to show the new goal
        window.dispatchEvent(new CustomEvent('goalCreated'));
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'Failed to create goal',
          message: error.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create goal. Please try again.',
      });
    }
  }, [addToast]);

  return (
    <>
      <main>{children}</main>
      <FloatingQuickPanel onAddGoal={() => setIsAddGoalOpen(true)} />
      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAdd={handleAddGoal}
        existingGoals={existingGoals}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'>
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>
              <LayoutContent>{children}</LayoutContent>
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
