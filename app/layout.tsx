import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solo Leveling Dashboard',
  description:
    'Track your goals and unlock companions in this Solo Leveling themed dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <div className='min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700'>
          {children}
        </div>
      </body>
    </html>
  );
}
