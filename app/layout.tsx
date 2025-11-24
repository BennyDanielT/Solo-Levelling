import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { ToastProvider } from '@/components/dashboard/ToastSystem';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Productivity Hub - Goal Tracking Dashboard',
  description:
    'Modern productivity dashboard for goal tracking, achievements, smart reminders, and personal growth analytics',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎯</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'>
        <ThemeProvider>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
