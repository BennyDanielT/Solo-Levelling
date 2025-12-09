'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { ToastProvider } from '@/components/dashboard/ToastSystem';
import { FloatingQuickPanel } from '@/components/dashboard/FloatingQuickPanel';
import AddGoalModal from '@/components/AddGoalModal';
import SessionProvider from '@/components/SessionProvider';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);

  const handleAddGoal = async (title: string, description: string, weight: number, difficulty: string) => {
    // This will be called when user submits the modal
    // You can add your goal creation logic here or pass it to a context
    console.log('New goal:', { title, description, weight, difficulty });
    setIsAddGoalOpen(false);
    // Optionally reload goals or update state
  };

  return (
    <html lang='en' suppressHydrationWarning>
      <body className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'>
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider>
              <main>{children}</main>
            </ToastProvider>
            <FloatingQuickPanel onAddGoal={() => setIsAddGoalOpen(true)} />
            <AddGoalModal
              isOpen={isAddGoalOpen}
              onClose={() => setIsAddGoalOpen(false)}
              onAdd={handleAddGoal}
              existingGoals={existingGoals}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
